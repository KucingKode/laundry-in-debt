import {
	createThirdwebClient,
	defineChain,
	readContract as twReadContract,
	prepareContractCall,
	sendTransaction,
	waitForReceipt,
} from "https://cdn.jsdelivr.net/npm/thirdweb@5.52.0/+esm";

import { account, client } from "../states";
import { showAlert } from "./alert";
import { CLIENT_ID } from "../constants";

export const chain = defineChain(43113);

export function connectThirdweb() {
	client.v = createThirdwebClient({ clientId: CLIENT_ID });
}

export async function readContract(contract, method, params) {
	if (!account.v) return;

	return await twReadContract({
		contract,
		method,
		params,
	});
}

export async function callContract(contract, method, params) {
	if (!account.v) return;

	try {
		const transaction = await prepareContractCall({
			contract,
			method,
			params,
		});

		const { transactionHash } = await sendTransaction({
			account: account.v,
			transaction,
		});

		return waitForReceipt({
			client: client.v,
			chain,
			transactionHash,
		});
	} catch (err) {
		console.log(err.message);
		showAlert(err.message.length > 60 ? "Transaction failed" : err.message);
	}

	return;
}

// code from thirdweb/adapters/ethers6.ts
export function alignTxToEthers(tx) {
	const { type: viemType, ...rest } = tx;

	let type;
	switch (viemType) {
		case "legacy": {
			type = 0;
			break;
		}
		case "eip2930": {
			type = 1;
			break;
		}
		case "eip1559": {
			type = 2;
			break;
		}
		default: {
			type = null;
			break;
		}
	}

	return {
		...rest,
		type,
		accessList: tx.accessList,
	};
}
