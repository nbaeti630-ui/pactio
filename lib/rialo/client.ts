/**
 * Rialo simulation client (Fase 1).
 * Meniru bentuk SDK Circle (developer-controlled-wallets + smart-contract-platform)
 * supaya route bisa swap import 1:1. Semua lokal, tanpa panggilan jaringan.
 * Integrasi Rialo asli (ed25519 + rialo-cdk) = Fase 2.
 */

import crypto from "crypto"

const RIALO_NETWORK = "RIALO-DEVNET-SIM"

type WalletSet = { id: string; name: string; createDate: string }

type RialoWallet = {
	id: string
	address: string
	blockchain: string
	accountType: string
	custodyType: string
	walletSetId: string
	state: string
}

type TxRecord = {
	state: string
	errorReason?: string
	transactionType?: string
	amounts?: string[]
	createDate?: string
	updateDate?: string
	blockchain?: string
}

const txStore = new Map<string, TxRecord>()

function sha(input: string): string {
	return crypto.createHash("sha256").update(input).digest("hex")
}

function makeId(prefix: string, seed: string): string {
	const h = sha(prefix + ":" + seed)
	return (
		h.slice(0, 8) +
		"-" +
		h.slice(8, 12) +
		"-" +
		h.slice(12, 16) +
		"-" +
		h.slice(16, 20) +
		"-" +
		h.slice(20, 32)
	)
}

function makeAddress(seed: string): string {
	return "0x" + sha("addr:" + seed).slice(0, 40)
}

function uniqueSeed(base: string): string {
	return base + ":" + Date.now() + ":" + Math.random().toString(36).slice(2)
}

function recordTx(id: string, rec: TxRecord): void {
	const now = new Date().toISOString()
	txStore.set(id, {
		state: rec.state,
		errorReason: rec.errorReason,
		transactionType: rec.transactionType,
		amounts: rec.amounts,
		createDate: rec.createDate || now,
		updateDate: rec.updateDate || now,
		blockchain: rec.blockchain || RIALO_NETWORK,
	})
}

// ---- Pengganti circleDeveloperSdk ----
export const rialoDeveloperSdk = {
	async createWalletSet(params: { name: string }) {
		const walletSet: WalletSet = {
			id: makeId("walletset", uniqueSeed(params.name)),
			name: params.name,
			createDate: new Date().toISOString(),
		}
		return { data: { walletSet } }
	},

	async createWallets(params: {
		accountType?: string
		blockchains?: string[]
		count?: number
		walletSetId: string
	}) {
		const count = params.count && params.count > 0 ? params.count : 1
		const blockchain =
			params.blockchains && params.blockchains.length > 0
				? params.blockchains[0]
				: RIALO_NETWORK
		const wallets: RialoWallet[] = []
		for (let i = 0; i < count; i++) {
			const seed = uniqueSeed(params.walletSetId + ":" + i)
			wallets.push({
				id: makeId("wallet", seed),
				address: makeAddress(seed),
				blockchain,
				accountType: params.accountType || "SCA",
				custodyType: "DEVELOPER",
				walletSetId: params.walletSetId,
				state: "LIVE",
			})
		}
		return { data: { wallets } }
	},

	async getTransaction(params: { id: string }) {
		const rec = txStore.get(params.id)
		const now = new Date().toISOString()
		const transaction = {
			id: params.id,
			state: rec?.state || "COMPLETE",
			errorReason: rec?.errorReason,
			amounts: rec?.amounts || [],
			transactionType: rec?.transactionType || "CONTRACT_EXECUTION",
			blockchain: rec?.blockchain || RIALO_NETWORK,
			createDate: rec?.createDate || now,
			updateDate: rec?.updateDate || now,
		}
		return { data: { transaction } }
	},

	async getWalletTokenBalance(params: { id: string; includeAll?: boolean }) {
		return {
			data: {
				tokenBalances: [
					{
						token: { symbol: "USDC", name: "USD Coin", decimals: 6 },
						amount: "1000",
					},
				],
			},
		}
	},

	async listTransactions(params: {
		walletIds?: string[]
		includeAll?: boolean
	}) {
		// Riwayat asli disimpan di Supabase; sisi "chain" tidak menyimpan apa pun.
		return { data: { transactions: [] as any[] } }
	},

	async createContractExecutionTransaction(params: {
		walletId?: string
		contractAddress?: string
		abiFunctionSignature?: string
		abiParameters?: unknown[]
		fee?: unknown
	}) {
		const id = makeId("tx", uniqueSeed(params.abiFunctionSignature || "exec"))
		recordTx(id, { state: "COMPLETE", transactionType: "CONTRACT_EXECUTION" })
		return { data: { id, state: "COMPLETE" } }
	},
}

// ---- Pengganti circleContractSdk ----
export const rialoContractSdk = {
	async deployContract(params: {
		name: string
		description?: string
		walletId?: string
		blockchain?: string
		constructorParameters?: unknown[]
		abiJson?: string
		bytecode?: string
		fee?: unknown
	}) {
		const seed = uniqueSeed(params.name)
		const contractId = makeId("contract", seed)
		const transactionId = makeId("tx", seed)
		const contractAddress = makeAddress("contract:" + contractId)
		recordTx(transactionId, {
			state: "COMPLETE",
			transactionType: "DEPLOY_CONTRACT",
		})
		return { data: { contractId, transactionId, contractAddress } }
	},

	async getContract(params: { id: string }) {
		const contractAddress = makeAddress("contract:" + params.id)
		return {
			data: {
				contract: {
					id: params.id,
					contractAddress,
					name: "Pactio Escrow (simulated)",
					blockchain: RIALO_NETWORK,
				},
			},
		}
	},
}

export function setSimTxState(id: string, state: string, errorReason?: string) {
	const existing = txStore.get(id) || { state }
	txStore.set(id, {
		...existing,
		state,
		errorReason,
		updateDate: new Date().toISOString(),
	})
}
