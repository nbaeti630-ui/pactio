import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"
import { rialoContractSdk as circleContractSdk } from "@/lib/rialo/client"
import { reactToEscrow } from "@/lib/rialo/reactive"
import { createAgreementService } from "@/app/services/agreement.service"
import { parseAmount } from "@/lib/utils/amount"

interface DepositRequest {
	circleContractId: string
}

export async function POST(req: NextRequest) {
	try {
		const supabase = createSupabaseServerClient()
		const agreementService = createAgreementService(supabase)
		const body: DepositRequest = await req.json()

		if (!body.circleContractId) {
			return NextResponse.json(
				{ error: "Missing required circleContractId" },
				{ status: 400 },
			)
		}

		const { data: contractTransaction, error: contractTransactionError } =
			await supabase
				.from("escrow_agreements")
				.select(
					`*,
					beneficiary_wallet:wallets!escrow_agreements_beneficiary_wallet_id_fkey (
						id,
						wallet_address,
						circle_wallet_id
					)
					`,
				)
				.eq("circle_contract_id", body.circleContractId)
				.single()

		if (contractTransactionError) {
			return NextResponse.json({
				error: "Could not find a contract with such depositor wallet ID",
			})
		}

		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return NextResponse.json(
				{ error: "User is not authenticated" },
				{ status: 401 },
			)
		}

		const { data: userId, error: userIdError } = await supabase
			.from("profiles")
			.select("id")
			.eq("auth_user_id", user?.id)
			.single()

		if (userIdError) {
			return NextResponse.json(
				{ error: "Could not retrieve the currently logged in user id" },
				{ status: 500 },
			)
		}

		const { data: depositorWallet, error: depositorWalletError } = await supabase
			.from("wallets")
			.select()
			.eq("profile_id", userId.id)
			.single()

		if (depositorWalletError) {
			return NextResponse.json(
				{ error: "Could not find a profile linked to the given wallet ID" },
				{ status: 500 },
			)
		}

		const contractData = await circleContractSdk.getContract({
			id: contractTransaction.circle_contract_id,
		})

		const contractAddress = contractData.data?.contract.contractAddress
		if (!contractAddress) {
			return NextResponse.json(
				{ error: "Could not retrieve contract address" },
				{ status: 500 },
			)
		}

		const parsedAmount = parseAmount(contractTransaction.terms.amounts?.[0].amount)

		// Reactive engine: refund otomatis (kondisi pembatalan).
		const refundTransactionId = "rialo-refund-" + Date.now()
		const event = reactToEscrow({
			escrowId: contractTransaction.id,
			contractId: contractTransaction.circle_contract_id,
			transactionId: refundTransactionId,
			conditions: { manualCancel: true },
		})

		await agreementService.createTransaction({
			walletId: contractTransaction.beneficiary_wallet.id,
			circleTransactionId: refundTransactionId,
			escrowAgreementId: contractTransaction.id,
			transactionType: "DEPOSIT_REFUND",
			profileId: depositorWallet.profile_id,
			amount: Number(parsedAmount),
			description: "Request for deposit refund",
		})

		await supabase
			.from("escrow_agreements")
			.update({ status: "CLOSED" })
			.eq("circle_contract_id", contractData.data.contract.id)

		return NextResponse.json(
			{
				success: true,
				transactionId: refundTransactionId,
				status: "CLOSED",
				outcome: event.outcome,
				message: "Funds refunded by Rialo reactive engine (simulated)",
			},
			{ status: 201 },
		)
	} catch (error: any) {
		console.error("Error during deposit refund:", error)
		return NextResponse.json(
			{ error: "Failed to initiate deposit refund", details: error.message },
			{ status: 500 },
		)
	}
}
