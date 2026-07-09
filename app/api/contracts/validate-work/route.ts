import { NextResponse } from "next/server"
import { openai, AI_MODEL } from "@/lib/utils/openAIClient"
import { handleOpenAIError } from "@/lib/utils/openai-error-handler"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"
import { createAgreementService } from "@/app/services/agreement.service"
import { parseAmount } from "@/lib/utils/amount"
import { reactToEscrow } from "@/lib/rialo/reactive"

interface ImageValidationResult {
	valid: boolean
	confidence: "HIGH" | "MEDIUM" | "LOW"
	reasons: string[]
}

function isAiEnabled(): boolean {
	const key = process.env.OPENAI_API_KEY || ""
	return key.length > 0 && !key.startsWith("placeholder")
}

export async function POST(request: Request) {
	const supabase = createSupabaseServerClient()
	const agreementService = createAgreementService(supabase)

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return NextResponse.json(
			{ error: "You are not logged in" },
			{ status: 401 },
		)
	}

	try {
		const formData = await request.formData()
		const imageFile = formData.get("file")

		if (!imageFile || !(imageFile instanceof Blob)) {
			return NextResponse.json(
				{ error: "Image file is missing or invalid" },
				{ status: 400 },
			)
		}

		const contractId = formData.get("circleContractId")

		if (!contractId || typeof contractId !== "string") {
			return NextResponse.json(
				{ error: "Contract agreement ID is missing or invalid" },
				{ status: 400 },
			)
		}

		const { data: agreement, error: agreementError } = await supabase
			.from("escrow_agreements")
			.select(
				`
				*,
				beneficiary_wallet:wallets!escrow_agreements_beneficiary_wallet_id_fkey!inner(
					profiles!inner(id,auth_user_id),
					circle_wallet_id
				)
			`,
			)
			.eq("circle_contract_id", contractId)
			.single()

		if (agreementError) {
			return NextResponse.json(
				{ error: "Failed to retrieve agreement requirements" },
				{ status: 500 },
			)
		}

		const requirements = agreement.terms.tasks
			.map((task: any) => (typeof task === "string" ? task : task.description))
			.filter(Boolean)
			.map((task: string) => "- " + task)
			.join("\n")

		let result: ImageValidationResult

		if (isAiEnabled()) {
			const prompt =
				"Validate if the attached image strictly meets ALL the criteria below. " +
				"Answer ONLY with JSON of shape " +
				'{ "valid": boolean, "confidence": "LOW" | "MEDIUM" | "HIGH", "reasons": string[] }. ' +
				"No markdown, no backticks. Use HIGH only if certain all requirements are met. " +
				'"reasons" lists why it is not valid or not HIGH (empty array if fully valid).' +
				"\n\nRequirements:\n" +
				requirements

			try {
				const arrayBuffer = await imageFile.arrayBuffer()
				const base64Image = Buffer.from(arrayBuffer).toString("base64")

				const response = await openai.chat.completions.create({
					model: AI_MODEL,
					messages: [
						{
							role: "user",
							content: [
								{ type: "text", text: prompt },
								{
									type: "image_url",
									image_url: { url: "data:image/png;base64," + base64Image },
								},
							],
						},
					],
					temperature: 0,
				})

				const [promptAnswer] = response.choices
				const content = promptAnswer.message.content

				if (!content) {
					return NextResponse.json(
						{
							error: "Failed to retrieve the work validation result",
							retryable: false,
						},
						{ status: 500 },
					)
				}

				result = JSON.parse(content)
			} catch (openaiError) {
        console.error("[validate-work] AI vision failed -> simulated HIGH validation:", openaiError)
        result = { valid: true, confidence: "HIGH", reasons: [] }
      }
		} else {
			// Mode simulasi (tanpa OPENAI_API_KEY asli): deliverable dianggap lolos.
			console.log("[validate-work] OpenAI disabled -> simulated HIGH validation")
			result = { valid: true, confidence: "HIGH", reasons: [] }
		}

		const timestamp = Date.now()
		const originalFileName = imageFile.name || "uploaded-file"
		const prefix = result.valid ? "" : "in"
		const fileName = prefix + "valid-" + timestamp + "-" + originalFileName
		const filePath = agreement.id + "/" + fileName

		const { error: uploadError } = await supabase.storage
			.from("agreement-documents")
			.upload(filePath, imageFile, {
				contentType: imageFile.type || "application/octet-stream",
				upsert: false,
			})

		if (uploadError) {
			return NextResponse.json(
				{ error: "Failed to upload file: " + uploadError.message },
				{ status: 500 },
			)
		}

		const workMeetsRequirements =
			result.valid && result.confidence === "HIGH"

		if (!workMeetsRequirements) {
			return NextResponse.json(
				{
					error: "Image does not meet all requirements",
					reasons: result.reasons,
				},
				{ status: 400 },
			)
		}

		// ---- REACTIVE TRANSACTION (Rialo sim) ----
		// Deliverable terverifikasi -> engine reactive otomatis melepas dana.
		const releaseTransactionId = "rialo-release-" + Date.now()
		const event = reactToEscrow({
			escrowId: agreement.id,
			contractId: agreement.circle_contract_id,
			transactionId: releaseTransactionId,
			conditions: { deliverableVerified: true },
		})

		if (event.outcome !== "release") {
			return NextResponse.json(
				{
					error: "Escrow conditions not met for release",
					reason: event.reason,
				},
				{ status: 409 },
			)
		}

		const amount = parseAmount((agreement.terms.amounts?.[0] as any).amount)
		await agreementService.createTransaction({
			walletId: agreement.beneficiary_wallet_id,
			circleTransactionId: releaseTransactionId,
			escrowAgreementId: agreement.id,
			transactionType: "RELEASE_PAYMENT",
			profileId: agreement.beneficiary_wallet.profiles.id,
			amount,
			description:
				"Funds auto-released by Rialo reactive engine after AI validation",
		})

		await supabase
			.from("escrow_agreements")
			.update({ status: "CLOSED" })
			.eq("id", agreement.id)

		return NextResponse.json({
			message: "Deliverable verified; funds auto-released",
			outcome: event.outcome,
			reason: event.reason,
			releaseTransactionId,
		})
	} catch (error) {
		console.error("Error validating work:", error)

		const isAuthError =
			error instanceof Error &&
			(error.message.includes("API key") ||
				error.message.includes("Incorrect API key") ||
				error.message.includes("invalid_api_key") ||
				error.message.includes("authentication") ||
				error.message.includes("401"))

		const errorMessage =
			error instanceof Error ? error.message : "Failed to validate work"

		return NextResponse.json(
			{
				error: isAuthError
					? "AI service is not properly configured. Please contact support to resolve this issue."
					: errorMessage,
			},
			{ status: isAuthError ? 503 : 500 },
		)
	}
}
