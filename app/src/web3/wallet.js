import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { account, playerAddress, provider } from "../states";
import { alignTxToEthers } from "../utils/web3";
import { CHAIN_ID, CHAIN_NAME, EXPLORER_URL, RPC_URL } from "../constants";

export function existWallet() {
	return !!window.ethereum;
}

export async function connectWallet() {
	// connect to player's wallet
	provider.v = new ethers.BrowserProvider(window.ethereum);
	await provider.v.send("eth_requestAccounts", []);

	// get details
	const signer = await provider.v.getSigner();
	const address = signer.address;

	playerAddress.v = address;

	// create web3 account
	// code from thirdweb/adapters/ethers6.ts
	account.v = {
		address,
		signMessage: async ({ message }) => {
			return signer.signMessage(
				typeof message === "string" ? message : message.raw,
			);
		},
		signTransaction: async (tx) => {
			return signer.signTransaction(alignTxToEthers(tx));
		},
		sendTransaction: async (tx) => {
			const transactionHash = (
				await signer.sendTransaction(alignTxToEthers(tx))
			).hash;

			return {
				transactionHash,
			};
		},
		signTypedData: async (data) => {
			return await signer.signTypedData(data.domain, data.types, data.message);
		},
	};
}

export async function switchToAvax() {
	try {
		await window.ethereum.request({
			method: "wallet_addEthereumChain",
			params: [
				{
					chainId: CHAIN_ID,
					rpcUrls: [RPC_URL],
					chainName: CHAIN_NAME,
					nativeCurrency: {
						name: "Avalanche",
						symbol: "AVAX",
						decimals: 18,
					},
					blockExplorerUrls: [EXPLORER_URL],
				},
			],
		});
	} catch (err) {
		console.log(err);
		return err.code === -32603;
	}

	return true;
}
