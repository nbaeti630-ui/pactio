import { type NextRequest, NextResponse } from "next/server"
import { rialoDeveloperSdk as circleDeveloperSdk } from "@/lib/rialo/client"

export async function GET(
	_: NextRequest,
	{ params }: { params: { id: string } },
): Promise<NextResponse> {
	try {
		const response = await circleDeveloperSdk.getTransaction({ id: params.id })

		if (!response.data || response.data.transaction === undefined) {
			return NextResponse.json(
				{ error: "Transaction not found" },
				{ status: 404 },
			)
		}

		const t = response.data.transaction
		const transaction = {
			id: t.id,
			amounts: t.amounts,
			state: t.state,
			createDate: t.createDate,
			blockchain: t.blockchain,
			transactionType: t.transactionType,
			updateDate: t.updateDate,
		}

		return NextResponse.json({ transaction })
	} catch (error) {
		console.error("Error fetching transaction:", error)
		return NextResponse.json(
			{ error: "Internal server error while fetching transaction" },
			{ status: 500 },
		)
	}
}
