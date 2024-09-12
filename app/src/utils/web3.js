import { account, client } from "../states";
import { showAlert } from "./alert";
import { CLIENT_ID } from "../constants";
import { thirdweb } from "../libs/externals";

export function connectThirdweb() {
	client.v = thirdweb.createThirdwebClient({ clientId: CLIENT_ID });
}

export async function getContract(address) {
	return thirdweb.getContract({
		client: client.v,
		chain: thirdweb.defineChain(43113),
		address,
	});
}

export async function readContract(contract, method, params) {
	if (!account.v) return;

	return await thirdweb.readContract({
		contract,
		method,
		params,
	});
}

export async function callContract(contract, method, params) {
	if (!account.v) return;

	try {
		const transaction = await thirdweb.prepareContractCall({
			contract,
			method,
			params,
		});

		const { transactionHash } = await thirdweb.sendTransaction({
			account: account.v,
			transaction,
		});

		return thirdweb.waitForReceipt({
			client: client.v,
			chain: thirdweb.defineChain(43113),
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
