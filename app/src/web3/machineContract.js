import { getContract } from "https://cdn.jsdelivr.net/npm/thirdweb@5.52.0/+esm";
import { LOGIC_CONTRACT_ADDRESS, MACHINE_EDITION_ADDRESS } from "../constants";
import { callContract, chain, readContract } from "../utils/web3";
import { account, client } from "../states";

const GET_MACHINE_AMOUNTS_METHOD =
	"function balanceOfBatch(address[], uint256[]) view returns (uint256[])";

const CHECK_APPROVAL_METHOD =
	"function isApprovedForAll(address, address) view returns (bool)";

const REQUEST_APPROVAL_METHOD =
	"function setApprovalForAll(address, bool)";

let contract;
let isApproved;

export function initMachineContract() {
	contract = getContract({
		client: client.v,
		chain,
		address: MACHINE_EDITION_ADDRESS,
	});
}

// ---- readers ------
export async function getMachineApproval() {
	if (typeof isApproved === "boolean") return isApproved;

	isApproved = await readContract(contract, CHECK_APPROVAL_METHOD, [
		account.v.address,
		LOGIC_CONTRACT_ADDRESS,
	]);

	return isApproved;
}

export async function getMachineAmounts() {
	const data = await readContract(contract, GET_MACHINE_AMOUNTS_METHOD, [
		[account.v.address, account.v.address, account.v.address],
		[1, 2, 3],
	]);

	return data.map((n) => Number(n));
}

// -------- writers ---------
export async function requestMachineApproval() {
	if (isApproved) return true;
	const receipt = await callContract(contract, REQUEST_APPROVAL_METHOD, [
		LOGIC_CONTRACT_ADDRESS,
		true,
	]);
	if (receipt) isApproved = true;
	return receipt;
}
