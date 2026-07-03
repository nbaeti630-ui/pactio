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

		const response = await circleDeveloperSdk.getWalletTokenBalance({
			id: walletId,
			includeAll: true,
		})

		const balance = response.data?.tokenBalances?.find(
			(entry) => entry.token.symbol === "USDC",
		)?.amount

		return NextResponse.json({ balance: balance || "0" })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request format" },
				{ status: 400 },
			)
		}
		console.error("Error fetching balance from wallet:", error)
		return NextResponse.json(
			{ error: "Internal server error while fetching balance" },
			{ status: 500 },
		)
	}
}
