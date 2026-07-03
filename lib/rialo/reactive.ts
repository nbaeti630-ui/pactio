/**
 * Rialo reactive engine (Fase 1 simulation).
 *
 * Meniru "Reactive Transactions" Rialo: aksi on-chain yang otomatis jalan
 * saat kondisi tercapai -- tanpa webhook/oracle eksternal yang rapuh.
 * Dipakai buat auto-release / auto-refund escrow.
 */

import { setSimTxState } from "./client"

export type EscrowConditions = {
	deliverableVerified?: boolean // hasil AI validate-work
	depositReceived?: boolean
	deadline?: string // ISO string; kalau lewat & belum verified => refund
	manualCancel?: boolean // depositor batalkan sebelum penyerahan
}

export type ReactiveOutcome = "release" | "refund" | "hold"

export type ReactiveEvent = {
	escrowId: string
	transactionId?: string
	contractId?: string
	outcome: ReactiveOutcome
	reason: string
	at: string
}

type Listener = (event: ReactiveEvent) => void

const listeners = new Set<Listener>()

// Subscribe ke event reactive (mis. buat log / update realtime di UI nanti).
export function onReactiveEvent(listener: Listener): () => void {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}

function emit(event: ReactiveEvent): void {
	for (const listener of listeners) {
		try {
			listener(event)
		} catch (err) {
			console.error("Reactive listener error:", err)
		}
	}
}

/**
 * Inti "reactive": evaluasi kondisi -> tentukan aksi.
 * Urutan prioritas meniru trigger native (cek paling menentukan dulu).
 */
export function evaluateEscrow(
	conditions: EscrowConditions,
	now: Date = new Date(),
): { outcome: ReactiveOutcome; reason: string } {
	if (conditions.manualCancel) {
		return {
			outcome: "refund",
			reason: "Dibatalkan depositor sebelum penyerahan",
		}
	}

	if (conditions.deliverableVerified) {
		return {
			outcome: "release",
			reason: "Deliverable lolos verifikasi -> dana dilepas otomatis",
		}
	}

	if (conditions.deadline) {
		const deadline = new Date(conditions.deadline)
		const valid = !Number.isNaN(deadline.getTime())
		if (valid && now.getTime() > deadline.getTime()) {
			return {
				outcome: "refund",
				reason: "Deadline lewat tanpa deliverable terverifikasi -> refund",
			}
		}
	}

	return {
		outcome: "hold",
		reason: "Kondisi belum terpenuhi; escrow tetap terkunci",
	}
}

/**
 * Jalankan reaksi: evaluasi + (kalau menentukan) tandai transaksi selesai
 * di client simulasi + broadcast event. Return event yang terjadi.
 */
export function reactToEscrow(input: {
	escrowId: string
	transactionId?: string
	contractId?: string
	conditions: EscrowConditions
	now?: Date
}): ReactiveEvent {
	const result = evaluateEscrow(input.conditions, input.now)

	if (result.outcome !== "hold" && input.transactionId) {
		setSimTxState(input.transactionId, "COMPLETE")
	}

	const event: ReactiveEvent = {
		escrowId: input.escrowId,
		transactionId: input.transactionId,
		contractId: input.contractId,
		outcome: result.outcome,
		reason: result.reason,
		at: new Date().toISOString(),
	}

	emit(event)
	return event
}
