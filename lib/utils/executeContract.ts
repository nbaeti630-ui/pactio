import { rialoDeveloperSdk } from "@/lib/rialo/client"

type FeeLevel = "LOW" | "MEDIUM" | "HIGH"

type ContractExecutionOptions = {
	walletId: string
	contractAddress: string
	abiFunctionSignature: string
	abiParameters: (string | number | boolean)[]
	feeLevel?: FeeLevel
}

export const executeContract = async ({
	walletId,
	contractAddress,
	abiFunctionSignature,
	abiParameters,
	feeLevel = "MEDIUM",
}: ContractExecutionOptions) => {
	try {
		const response =
			await rialoDeveloperSdk.createContractExecutionTransaction({
				walletId,
				contractAddress,
				abiFunctionSignature,
				abiParameters,
				fee: {
					type: "level",
					config: {
						feeLevel,
					},
				},
			})

		if (!response.data?.id) {
			throw new Error("No transaction ID was returned")
		}

		return {
			transactionId: response.data.id,
			status: response.data.state,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error"
		throw new Error("Failed to execute contract: " + message)
	}
}
