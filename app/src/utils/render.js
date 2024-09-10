import {
	MAX_CUSTOMER_COUNT,
	TILE_SIZE,
	CAMERA_HEIGHT,
	CAMERA_WIDTH,
	MAP_MARGIN,
	WIDTH,
	HEIGHT,
} from "../constants";
import Customer, { CUSTOMER_FRAMES } from "../class/Customer";
import Machine, { MACHINE_FRAMES } from "../class/Machine";
import {
	activeTileX,
	activeTileY,
	appScale,
	cameraOffsetX,
	cameraOffsetY,
	machines,
	playerMachineCount,
} from "../states";
import { getPair, randomInt } from "./math";
import { getMachine } from "../web3/logicContract";

const halfMapMargin = MAP_MARGIN / 2;
const tileCountX = Math.max(CAMERA_WIDTH / TILE_SIZE);
const tileCountY = Math.max(CAMERA_HEIGHT / TILE_SIZE);
const searchedPairs = new Set();

// ----- setup ---------
const customers = new Array(MAX_CUSTOMER_COUNT)
	.fill()
	.map(
		() =>
			new Customer(
				Math.round(Math.random() + 1),
				randomInt(tileCountX),
				randomInt(tileCountY),
				randomInt(40) + 40,
			),
	);

setInterval(() => {
	for (const customer of customers) {
		customer.frameI = ++customer.frameI % CUSTOMER_FRAMES;
	}

	for (const machine of Object.values(machines)) {
		machine.frameI = ++machine.frameI % MACHINE_FRAMES;
	}
}, 100);

// ------ methods ------

// render visible tiles
export function renderTiles(ctx, mouseX, mouseY) {
	let activeTile = [];

	// clean canvas
	ctx.fillStyle = "#F4F4F4";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	// draw visible tiles
	for (let x = -1; x < tileCountX + 2; x++) {
		for (let y = -1; y < tileCountY + 2; y++) {
			const posX = Math.round((x - (cameraOffsetX.v % 1)) * TILE_SIZE);
			const posY = Math.round((y - (cameraOffsetY.v % 1)) * TILE_SIZE);
			const ix = x + roundOffset(cameraOffsetX.v);
			const iy = y + roundOffset(cameraOffsetY.v);

			const isActive = renderTile(ctx, posX, posY, ix, iy, mouseX, mouseY);

			if (isActive) {
				activeTile = [posX, posY, ix, iy];
				activeTileX.v = ix;
				activeTileY.v = iy;
			}
		}
	}

	// render active tile outline
	if (activeTile.length) {
		ctx.strokeStyle = "#3C3C3C";
		ctx.lineWidth = 8;
		ctx.strokeRect(activeTile[0], activeTile[1], TILE_SIZE, TILE_SIZE);
		ctx.stroke();
	}
}

// render all objects
export async function renderObjects(ctx) {
	const l = Math.floor(cameraOffsetX.v - MAP_MARGIN);
	const r = Math.floor(cameraOffsetX.v + tileCountX + MAP_MARGIN);
	const t = Math.floor(cameraOffsetY.v - MAP_MARGIN);
	const b = Math.floor(cameraOffsetY.v + tileCountY + MAP_MARGIN);

	// reset invisible customer objects
	for (let i = 0; i < customers.length; i++) {
		const customer = customers[i];

		if (customer.ix < l) customer.ix0 = Math.floor(r - halfMapMargin);
		if (customer.ix > r) customer.ix0 = Math.floor(l + halfMapMargin);
		if (customer.iy < t) customer.iy0 = Math.floor(b - halfMapMargin);
		if (customer.iy > b) customer.iy0 = Math.floor(t + halfMapMargin);
	}

	// clean canvas
	ctx.clearRect(0, 0, WIDTH, HEIGHT);

	// render objects
	for (let y = t; y < b; y++) {
		for (const customer of customers) {
			if (customer.iy0 !== y) continue;

			customer.update();
			customer.render(ctx);
		}

		for (const machine of Object.values(machines)) {
			if (machine.iy !== y) continue;
			machine.render(ctx);
		}
	}
}

// render 1 tile
function renderTile(ctx, x, y, ix, iy, mouseX, mouseY) {
	searchMachine(ix, iy);

	const isEvenX = ix % 2 === 0;
	const isEvenY = iy % 2 === 0;

	const x0 = Math.ceil(x * appScale.v);
	const x1 = Math.ceil((x + TILE_SIZE) * appScale.v);
	const y0 = Math.ceil(y * appScale.v);
	const y1 = Math.ceil((y + TILE_SIZE) * appScale.v);

	const isActive = x0 < mouseX && x1 > mouseX && y0 < mouseY && y1 > mouseY;

	// draw tiles
	ctx.fillStyle =
		(isEvenX && isEvenY) || (!isEvenX && !isEvenY) ? "#D3DDE5" : "#F5F5F5";

	if (ix === 0 && iy === 0) {
		ctx.fillStyle = "#BCC6CF";
	}

	ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

	return isActive;
}

function roundOffset(offset) {
	return offset < 0 ? Math.ceil(offset) : Math.floor(offset);
}

// update machines list
export async function searchMachine(x, y) {
	if (x < 0 || y < 0) return;

	const pair = getPair(x, y);

	if (Object.values(machines).length >= playerMachineCount.v) return;
	if (searchedPairs.has(pair)) return;
	searchedPairs.add(pair);

	console.log("*");

	const data = await getMachine(pair);
	if (data) {
		machines[pair] = new Machine(x, y, data);
		console.log(x, y, pair, data, machines);
	}
}
