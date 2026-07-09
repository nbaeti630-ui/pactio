import type { EscrowAgreementWithDetails } from "@/types/escrow"
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"
import { rialoContractSdk, rialoDeveloperSdk } from "@/lib/rialo/client"

const RIALO_BLOCKCHAIN = process.env.RIALO_BLOCKCHAIN || "RIALO-DEVNET-SIM"

interface CreateEscrowRequest {
	agreement: EscrowAgreementWithDetails
	agentAddress: string
	amountUSDC: number
}

async function waitForTransactionStatus(id: string) {
	let attempts = 0
	const maxAttempts = 10

	while (attempts < maxAttempts) {
		const response = await rialoDeveloperSdk.getTransaction({ id })

		if (!response.data) {
			throw new Error("No data returned from transaction status check")
		}

		const status = response.data.transaction?.state
		if (status === "COMPLETE") return response.data
		if (status === "FAILED") {
			throw new Error(
				"Transaction failed: " +
					(response.data.transaction?.errorReason || "Unknown error"),
			)
		}

		await new Promise((resolve) => setTimeout(resolve, 300))
		attempts++
	}

	throw new Error("Transaction status check timeout")
}

export async function POST(req: NextRequest) {
	try {
		const supabase = createSupabaseServerClient()
		const body: CreateEscrowRequest = await req.json()

		if (
			!body.agreement.depositor_wallet?.wallet_address ||
			!body.agreement.beneficiary_wallet?.wallet_address ||
			!body.agentAddress ||
			!body.amountUSDC
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			)
		}

		const addressRegex = /^0x[a-fA-F0-9]{40}$/
		if (
			!addressRegex.test(body.agreement.depositor_wallet?.wallet_address) ||
			!addressRegex.test(body.agreement.beneficiary_wallet?.wallet_address) ||
			!addressRegex.test(body.agentAddress)
		) {
			return NextResponse.json(
				{ error: "Invalid wallet address format" },
				{ status: 400 },
			)
		}

		// Deploy "Rialo escrow program" (simulasi). Dana dianggap terkunci.
		const createResponse = await rialoContractSdk.deployContract({
			name:
				"Pactio Escrow " + body.agreement.beneficiary_wallet?.wallet_address,
			description: "Reactive escrow for agreement " + body.agreement.id,
			walletId: process.env.NEXT_PUBLIC_AGENT_WALLET_ID,
			blockchain: RIALO_BLOCKCHAIN,
			constructorParameters: [
				body.agentAddress,
				body.agreement.depositor_wallet?.wallet_address,
				body.agreement.beneficiary_wallet?.wallet_address,
			],
		})

		if (!createResponse.data) {
			throw new Error("No data returned from escrow deployment")
		}

		// Simpan id kontrak & pindah status ke PENDING (funds locked).
		// Catatan: kolom DB masih pakai nama circle_* (rename = langkah cleanup nanti).
		const { error: agreementError } = await supabase
			.from("escrow_agreements")
			.update({
				circle_contract_id: createResponse.data.contractId,
				status: "OPEN",
			})
			.eq("id", body.agreement.id)

		if (agreementError) {
			throw new Error("Failed to update escrow contract ID")
		}

		const { error: transactionError } = await supabase
			.from("transactions")
			.update({ circle_transaction_id: createResponse.data.transactionId })
			.eq("id", body.agreement.transaction_id)

		if (transactionError) {
			throw new Error("Failed to update escrow transaction ID")
		}

		return NextResponse.json(
			{
				success: true,
				id: createResponse.data.contractId,
				transactionId: createResponse.data.transactionId,
				status: "OPEN",
				message: "Rialo escrow program deployed (simulated); funds locked",
				addresses: {
					depositor: body.agreement.depositor_wallet?.wallet_address,
					beneficiary: body.agreement.beneficiary_wallet?.wallet_address,
					agent: body.agentAddress,
				},
			},
			{ status: 201 },
		)
	} catch (error: any) {
		console.error("Error creating escrow:", error)
		return NextResponse.json(
			{ error: "Failed to create escrow contract", details: error.message },
			{ status: 500 },
		)
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)
		const id = searchParams.get("id")

		if (!id) {
			return NextResponse.json(
				{ error: "Transaction ID is required" },
				{ status: 400 },
			)
		}

		const transactionStatus = await waitForTransactionStatus(id)

		return NextResponse.json(
			{
				success: true,
				status: transactionStatus.transaction?.state,
				transaction: transactionStatus,
			},
			{ status: 200 },
		)
	} catch (error: any) {
		console.error("Error checking transaction status:", error)
		return NextResponse.json(
			{ error: "Failed to get transaction status", details: error.message },
			{ status: 500 },
		)
	}
}
