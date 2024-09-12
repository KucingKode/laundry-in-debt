import {
	DECIMALS,
	DECIMALS_BI,
	LOGIC_CONTRACT_ADDRESS,
	ONE_DAY,
} from "../constants";
import { callContract, getContract, readContract } from "../utils/web3";
import { requestMachineApproval } from "./machineContract";
import { getTokenAllowance, requestTokenApproval } from "./tokenContract";
import { $tokenExpense, $tokenIncome, sellLabels } from "../elements";
import { formatNum, updateTokenAmount } from "../utils/other";
import {
	account,
	machineAsks,
	machineBids,
	playerBalance,
	playerDebt,
	playerExpense,
	playerIncome,
	playerLastUpdate,
	playerMachineCount,
} from "../states";
import { bigInt, number } from "../utils/math";
import { zzfx } from "../libs/zzfxm";
import { machineSfx } from "../assets/zzfx";

const GET_MACHINE_METHOD =
	"function getMachine(address,uint64) view returns (uint32)";

const GET_PLAYER_DATA_METHOD =
	"function players(address) view returns (bool,uint256,uint256,uint256,uint256,uint256,uint256)";

const DEPOSIT_METHOD = "function deposit(uint256)";

const WITHDRAW_METHOD = "function withdraw(uint256)";

const STAKE_METHOD = "function stakeMachine(uint32,uint64)";

const UNSTAKE_METHOD = "function unstakeMachine(uint64)";

const BUY_METHOD = "function buyMachine(uint32,uint256)";

const SELL_METHOD = "function sellMachine(uint32,uint256)";

const CREATE_PLAYER_METHOD = "function createPlayer()";

const GET_MARKET_ITEM_METHOD =
	"function marketItems(uint32) view returns (bool,uint256,uint256,uint32)";

let contract;

export async function initLogicContract() {
	contract = await getContract(LOGIC_CONTRACT_ADDRESS);
}

// ---- readers ------
export async function getMachine(pair) {
	const data = await readContract(contract, GET_MACHINE_METHOD, [
		account.v.address,
		pair,
	]);

	return number(data);
}

export function getPlayerData() {
	return readContract(contract, GET_PLAYER_DATA_METHOD, [account.v.address]);
}

export function getSellPrices() {
	let n = 0;
	return new Promise((resolve) => {
		const getPriceFactor = async (id) => {
			const i = id - 1;
			console.log(account);
			const priceFactor = (
				await readContract(contract, GET_MARKET_ITEM_METHOD, [id])
			)[2];

			// calculate ask price
			let marginedPriceFactor = priceFactor - (DECIMALS_BI * 3n) / 100n;
			if (marginedPriceFactor < 0n) marginedPriceFactor = 0n;
			machineAsks.v[i] = (machineBids.v[i] * marginedPriceFactor) / DECIMALS_BI;

			sellLabels[i].innerText = formatNum(number(machineAsks.v[i]) / DECIMALS);

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
	const amountbi = bigInt(amount) * DECIMALS_BI;
	if ((await getTokenAllowance()) < amountbi)
		await requestTokenApproval(amount);
	return callContract(contract, DEPOSIT_METHOD, [amountbi]);
}

export const withdraw = (amount) =>
	callContract(contract, WITHDRAW_METHOD, [bigInt(amount) * DECIMALS_BI]);

export async function stake(id, pair) {
	await requestMachineApproval();
	return callContract(contract, STAKE_METHOD, [id, pair]);
}

export const unstake = (pair) => {
	return callContract(contract, UNSTAKE_METHOD, [pair]);
};

export async function buy(id, bid) {
	const receipt = await callContract(contract, BUY_METHOD, [id, bid]);
	receipt && zzfx(...machineSfx);
	return receipt;
}

export async function sell(id, ask) {
	await requestMachineApproval();
	const receipt = await callContract(contract, SELL_METHOD, [id, ask]);
	receipt && zzfx(...machineSfx);
	return receipt;
}

// ------ other ----------
export async function updatePlayerData() {
	if (!account.v) return;

	const data = await getPlayerData();

	playerDebt.v = number(data[1]) / DECIMALS;
	playerBalance.v = number(data[2]) / DECIMALS;
	playerExpense.v = number(data[3]) / DECIMALS;
	playerIncome.v = number(data[4]) / DECIMALS;
	playerLastUpdate.v = number(data[5]);
	playerMachineCount.v = data[6];

	updateTokenAmount();
	$tokenIncome.innerText = formatNum(playerIncome.v);
	$tokenExpense.innerText = formatNum((playerExpense.v * ONE_DAY) / 1000);
}
