import { bigInt } from "./utils/math";

export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
export const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME;
export const CHAIN_ID = import.meta.env.VITE_CHAIN_ID;
export const EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL;
export const RPC_URL = import.meta.env.VITE_RPC_URL;

export const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
export const MACHINE_EDITION_ADDRESS = import.meta.env
	.VITE_MACHINE_EDITION_ADDRESS;
export const LOGIC_CONTRACT_ADDRESS = import.meta.env
	.VITE_LOGIC_CONTRACT_ADDRESS;

export const WIDTH = 1600;
export const HEIGHT = 900;
export const TILE_SIZE = 125;
export const MAX_CUSTOMER_COUNT = 20;
export const MAX_OFFSET = 4294967295;
export const DECIMALS = Math.pow(10, 18);
export const DECIMALS_BI = bigInt(DECIMALS);
export const CLOCK_MULT = 100;

export const CAMERA_WIDTH = 1600;
export const CAMERA_HEIGHT = 900;
export const MAP_MARGIN = 2;
export const MAP_MARGIN_DEV = 1;

export const ONE_DAY_SEC = 86400;
export const THIRTEEN_HOURS_SEC = 46800;
export const ONE_DAY = ONE_DAY_SEC * 1000;
