import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"
import {
	rialoContractSdk as circleContractSdk,
	rialoDeveloperSdk as circleDeveloperSdk,
} from "@/lib/rialo/client"
import { createAgreementService } from "@/app/services/agreement.service"
import { convertUSDCToContractAmount, parseAmount } from "@/lib/utils/amount"

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
						wallet_address
					),
					transactions:transactions!escrow_agreements_transaction_id_fkey (
						amount,
						currency,
						status,
						circle_contract_address
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

		const contractAmount = Number(
			convertUSDCToContractAmount(contractTransaction.transactions.amount),
		)

		const depositResponse =
			await circleDeveloperSdk.createContractExecutionTransaction({
				walletId: depositorWallet.circle_wallet_id,
				contractAddress,
				abiFunctionSignature: "pay(address,uint256,address)",
				abiParameters: [
					contractTransaction.beneficiary_wallet.wallet_address,
					contractAmount,
					depositorWallet.wallet_address,
				],
				fee: { type: "level", config: { feeLevel: "MEDIUM" } },
			})

		const amount = parseAmount(contractTransaction.terms.amounts?.[0].amount)
		await agreementService.createTransaction({
			walletId: depositorWallet.id,
			circleTransactionId: depositResponse.data?.id,
			escrowAgreementId: contractTransaction.id,
			transactionType: "DEPOSIT_PAYMENT",
			profileId: depositorWallet.profile_id,
			amount,
			description:
				contractTransaction.terms.amounts?.[0]?.for ||
				"Funds deposited by depositor",
		})

		await supabase
			.from("escrow_agreements")
			.update({ status: "LOCKED" })
			.eq("circle_contract_id", contractTransaction.circle_contract_id)

		return NextResponse.json(
			{
				success: true,
				transactionId: depositResponse.data?.id,
				status: depositResponse.data?.state,
				message: "Funds locked in Rialo escrow (simulated)",
			},
			{ status: 201 },
		)
	} catch (error: any) {
		console.error("Error during funds deposit initialization:", error)
		return NextResponse.json(
			{ error: "Failed to initiate funds deposit", details: error.message },
			{ status: 500 },
		)
	}
}
