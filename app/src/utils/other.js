import {
	playerBalance,
	playerComputedBalance,
	playerDebt,
	playerExpense,
	playerIncome,
	playerLastUpdate,
} from "../states";

import { $tokenAmount } from "../elements";

import { CLOCK_MULT, ONE_DAY_SEC, THIRTEEN_HOURS_SEC } from "../constants";
import { floor } from "./math";

export const assets = {
	c1: new Image(),
	c2: new Image(),
	m1: new Image(),
	m2: new Image(),
	m3: new Image(),
};

// format number
const numberFormatter = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 3,
});

export function formatNum(x) {
	return numberFormatter.format(x);
}

// balance calculation
export function updateTokenAmount() {
	const multNow = floor((Date.now() * CLOCK_MULT) / 1000);
	const multLast = playerLastUpdate.v * CLOCK_MULT;

	const days0 = floor(multLast / ONE_DAY_SEC);
	const days1 = floor(multNow / ONE_DAY_SEC);
	const hours0 = multLast % ONE_DAY_SEC;
	const hours1 = multNow % ONE_DAY_SEC;

	const timeDiff = multNow - multLast;
	let paymentCount = days1 - days0;
	if (hours1 >= THIRTEEN_HOURS_SEC && hours0 < THIRTEEN_HOURS_SEC)
		paymentCount++;

	const income = playerIncome.v * timeDiff;
	const expense = playerExpense.v * paymentCount * ONE_DAY_SEC;

	playerComputedBalance.v = playerBalance.v - playerDebt.v + income - expense;
	$tokenAmount.innerText = formatNum(playerComputedBalance.v);
}
