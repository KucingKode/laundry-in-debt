import { getContract } from "https://cdn.jsdelivr.net/npm/thirdweb@5.52.0/+esm";
import { DECIMALS, DECIMALS_BI, LOGIC_CONTRACT_ADDRESS, ONE_DAY } from "../constants";
import { callContract, chain, readContract } from "../utils/web3";
import { requestMachineApproval } from "./machineContract";
import { getTokenAllowance, requestTokenApproval } from "./tokenContract";
import {
	$tokenAmount,
	$tokenExpense,
	$tokenIncome,
	sellLabels,
} from "../elements";
import { formatNum, updateTokenAmount } from "../utils/other";
import {
	account,
	client,
	machineAsks,
	machineBids,
	playerBalance,
	playerDebt,
	playerExpense,
	playerIncome,
	playerLastUpdate,
	playerMachineCount,
} from "../states";
import { clamp } from "../utils/math";

const GET_MACHINE_METHOD =
	"function getMachine(address, uint64) view returns (uint16)";

const GET_PLAYER_DATA_METHOD =
	"function players(address) view returns (bool, uint256, uint256, uint256, uint256, uint256, uint256)";

const DEPOSIT_METHOD = "function deposit(uint256)";

const WITHDRAW_METHOD = "function withdraw(uint256)";

const STAKE_METHOD = "function stakeMachine(uint16, uint64)";

const UNSTAKE_METHOD = "function unstakeMachine(uint64)";

const BUY_METHOD = "function buyMachine(uint16, uint256)";

const SELL_METHOD = "function sellMachine(uint16, uint256)";

const CREATE_PLAYER_METHOD = "function createPlayer()";

const GET_MARKET_ITEM_METHOD =
	"function marketItems(uint16) view returns (bool, uint256, uint256, uint32)";

let contract;

export function initLogicContract() {
	contract = getContract({
		client: client.v,
		chain,
		address: LOGIC_CONTRACT_ADDRESS,
	});
}

// ---- readers ------
export async function getMachine(pair) {
	const data = await readContract(contract, GET_MACHINE_METHOD, [
		account.v.address,
		pair,
	]);

	return Number(data);
}

export function getPlayerData() {
	return readContract(contract, GET_PLAYER_DATA_METHOD, [account.v.address]);
}

export function getSellPrices() {
	let n = 0;
	return new Promise((resolve) => {
		const getPriceFactor = async (id) => {
			const i = id - 1;
			const priceFactor = (
				await readContract(contract, GET_MARKET_ITEM_METHOD, [id])
			)[2];

			// calculate ask price
			let marginedPriceFactor = priceFactor - DECIMALS_BI * 3n / 100n;
			if (marginedPriceFactor < 0n) marginedPriceFactor = 0n;
			machineAsks.v[i] = machineBids.v[i] * marginedPriceFactor / DECIMALS_BI;

			sellLabels[i].innerText = formatNum(Number(machineAsks.v[i]) / DECIMALS);

			++n === machineBids.v.length && resolve();
		};

		getPriceFactor(1);
		getPriceFactor(2);
		getPriceFactor(3);
	});
}

// --------- writers --------
export function createAccount() {
	return callContract(contract, CREATE_PLAYER_METHOD, []);
}

export async function deposit(amount) {
	const amountbi = BigInt(amount) * DECIMALS_BI;
	if ((await getTokenAllowance()) < amountbi)
		await requestTokenApproval(amount);
	return callContract(contract, DEPOSIT_METHOD, [amountbi]);
}

export const withdraw = (amount) =>
	callContract(contract, WITHDRAW_METHOD, [BigInt(amount) * DECIMALS_BI]);

export async function stake(id, pair) {
	await requestMachineApproval();
	return callContract(contract, STAKE_METHOD, [id, pair]);
}

export const unstake = (pair) => {
	return callContract(contract, UNSTAKE_METHOD, [pair]);
};

export async function buy(id, bid) {
	return callContract(contract, BUY_METHOD, [id, bid]);
}

export async function sell(id, ask) {
	await requestMachineApproval();
	return callContract(contract, SELL_METHOD, [id, ask]);
}

// ------ other ----------
export async function updatePlayerData() {
	if (!account.v) return;

	const data = await getPlayerData();

	playerDebt.v = Number(data[1]) / DECIMALS;
	playerBalance.v = Number(data[2]) / DECIMALS;
	playerExpense.v = Number(data[3]) / DECIMALS;
	playerIncome.v = Number(data[4]) / DECIMALS;
	playerLastUpdate.v = Number(data[5]);
	playerMachineCount.v = data[6];

	updateTokenAmount();
	$tokenIncome.innerText = formatNum(playerIncome.v);
	$tokenExpense.innerText = formatNum((playerExpense.v * ONE_DAY) / 1000);
}
