import { type NextRequest, NextResponse } from "next/server"
import { rialoDeveloperSdk as circleDeveloperSdk } from "@/lib/rialo/client"
import { z } from "zod"

const WalletIdSchema = z.object({
	walletId: z.string().uuid(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const body = await req.json()
		const parseResult = WalletIdSchema.safeParse(body)

		if (!parseResult.success) {
			return NextResponse.json(
				{ error: "Invalid walletId format" },
				{ status: 400 },
			)
		}

		const { walletId } = parseResult.data

		const response = await circleDeveloperSdk.listTransactions({
			walletIds: [walletId],
			includeAll: true,
		})

		if (
			!response.data?.transactions ||
			response.data.transactions.length === 0
		) {
			return NextResponse.json({ transactions: [] })
		}

		return NextResponse.json({
			transactions: response.data.transactions.map((tx: any) => ({
				id: tx.id,
				amount: tx.amounts || [],
				status: tx.state,
				transactionType: tx.transactionType,
				createDate: tx.createDate,
			})),
		})
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request format" },
				{ status: 400 },
			)
		}
		console.error("Error fetching transactions from wallet:", error)
		return NextResponse.json(
			{ error: "Internal server error while fetching transactions" },
			{ status: 500 },
		)
	}
}
