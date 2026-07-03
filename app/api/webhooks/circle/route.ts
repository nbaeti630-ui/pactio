import { NextResponse } from "next/server"

// Webhook Circle sudah tidak dipakai di Pactio.
// Auto-release / refund kini ditangani engine reactive internal
// (lib/rialo/reactive) begitu kondisi tercapai -- tanpa webhook eksternal.
// Endpoint dibiarkan inert supaya tidak ada integrasi lama yang error.

export async function POST() {
	return NextResponse.json(
		{
			received: true,
			note: "Circle webhook disabled; Pactio uses the Rialo reactive engine",
		},
		{ status: 200 },
	)
}

export async function HEAD() {
	return NextResponse.json({}, { status: 200 })
}
