import { DECIMALS, LOGIC_CONTRACT_ADDRESS, TOKEN_ADDRESS } from "../constants";
import { callContract, getContract, readContract } from "../utils/web3";
import { account } from "../states";
import { number } from "../utils/math";

const READ_BALANCE_METHOD =
	"function balanceOf(address) view returns (uint256)";

const GET_ALLOWANCE_METHOD =
	"function allowance(address,address) view returns (uint256)";

const REQUEST_APPROVAL_METHOD =
	"function approve(address,uint256) returns (bool)";

let contract;

export async function initTokenContract() {
	contract = await getContract(TOKEN_ADDRESS);
}

// ----- readers ------
export async function getTokenBalance() {
	const data = await readContract(contract, READ_BALANCE_METHOD, [
		account.v.address,
	]);

	return number(data) / DECIMALS;
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
