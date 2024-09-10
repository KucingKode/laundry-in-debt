import { getContract } from "https://cdn.jsdelivr.net/npm/thirdweb@5.52.0/+esm";
import { DECIMALS, LOGIC_CONTRACT_ADDRESS, TOKEN_ADDRESS } from "../constants";
import { callContract, chain, readContract } from "../utils/web3";
import { account, client } from "../states";

const READ_BALANCE_METHOD =
	"function balanceOf(address) view returns (uint256)";

const GET_ALLOWANCE_METHOD =
	"function allowance(address, address) view returns (uint256)";

const REQUEST_APPROVAL_METHOD =
	"function approve(address, uint256) returns (bool)";

let contract;

export function initTokenContract() {
	contract = getContract({
		client: client.v,
		chain,
		address: TOKEN_ADDRESS,
	});
}

// ----- readers ------
export async function getTokenBalance() {
	const data = await readContract(contract, READ_BALANCE_METHOD, [
		account.v.address,
	]);

	return Number(data) / DECIMALS;
}

export async function getTokenAllowance() {
	const data = await readContract(contract, GET_ALLOWANCE_METHOD, [
		account.v.address,
		LOGIC_CONTRACT_ADDRESS,
	]);
	return typeof data === "bigint" ? data : 0n;
}

// ---- writers -----
export async function requestTokenApproval(amount) {
	return callContract(contract, REQUEST_APPROVAL_METHOD, [
		LOGIC_CONTRACT_ADDRESS,
		amount,
	]);
}
