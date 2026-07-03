import { type NextRequest, NextResponse } from "next/server"

// Faucet USDC disimulasikan di Fase 1 (mode Rialo devnet-sim).
// Saldo dummy sudah tersedia otomatis, jadi endpoint ini hanya
// mengonfirmasi permintaan tanpa memanggil layanan eksternal.
export async function POST(req: NextRequest) {
	try {
		const body = await req.json()

		if (!body.walletAddress) {
			return NextResponse.json(
				{ error: "walletAddress is required" },
				{ status: 400 },
			)
		}

		return NextResponse.json({
			message: "Funds requested successfully (simulated)",
			simulated: true,
		})
	} catch (error) {
		console.error("Failed to request USDC via faucet", error)
		return NextResponse.json(
			{ error: "Failed to request USDC via faucet" },
			{ status: 500 },
		)
	}
}
