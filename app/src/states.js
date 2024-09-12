import { DECIMALS } from "./constants";
import { bigInt } from "./utils/math";

function createState(x) {
	return { v: x };
}

export const playerAddress = createState(null);
export const playerDebt = createState(0);
export const playerBalance = createState(0);
export const playerComputedBalance = createState(0);
export const playerIncome = createState(0);
export const playerExpense = createState(0);
export const playerLastUpdate = createState(0);
export const playerMachineCount = createState(0);
export const machines = {};

export const appScale = createState(0);
export const appX = createState(0);
export const appY = createState(0);

export const cameraOffsetX = createState(0);
export const cameraOffsetY = createState(0);

export const activeTileX = createState(0);
export const activeTileY = createState(0);

export const pointerX = createState(0);
export const pointerY = createState(0);
export const pointerPressed = createState(false);

export const machineBids = createState([
	bigInt(100 * DECIMALS),
	bigInt(300 * DECIMALS),
	bigInt(600 * DECIMALS),
]);
export const machineAsks = createState([]);

export const client = createState();
export const account = createState();
export const provider = createState();
