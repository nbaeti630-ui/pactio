import { type NextRequest, NextResponse } from "next/server"

// On/off-ramp Circle dinonaktifkan di Fase 1 (mode simulasi Rialo).
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()

		if (!body.wallet_address) {
			return NextResponse.json(
				{ error: "Missing wallet_address" },
				{ status: 400 },
			)
		}

		return NextResponse.json(
			{
				error: "On-ramp (buy USDC) is not available in Rialo simulation mode",
				simulated: true,
			},
			{ status: 501 },
		)
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error while requesting buy url" },
			{ status: 500 },
		)
	}
}
