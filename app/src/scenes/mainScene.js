import { renderObjects, renderTiles, searchMachine } from "../utils/render";
import { clamp } from "../utils/math";
import { WIDTH, HEIGHT, MAX_OFFSET_X, MAX_OFFSET_Y } from "../constants";
import {
	appScale,
	cameraOffsetX,
	cameraOffsetY,
	mousePressed,
	mouseX,
	mouseY,
	playerMachineCount,
} from "../states";
import {
	$app,
	$bgCanvas,
	$fgCanvas,
	$modal,
	$modalContainer,
	$returnBtn,
} from "../elements";
import { enableTokenDeposit } from "../features/tokenDeposit";
import { enableTokenWithdraw } from "../features/tokenWithdraw";
import { enableMachineStaking } from "../features/machineStaking";
import { enableWalletConnector } from "../features/walletConnector";
import { updatePlayerData } from "../web3/logicContract";
import { updateClock } from "../utils/clock";
import { updateTokenAmount } from "../utils/other";
import { enableMachineStore } from "../features/machineStore";
import { hideModal } from "../utils/modal";
import { zzfx } from "../libs/zzfxm";

const PAN_SPEED = 10;

const bgCtx = $bgCanvas.getContext("2d");
const fgCtx = $fgCanvas.getContext("2d");

let prevMouseX = null;
let prevMouseY = null;

export async function mainScene() {
	updatePlayerData().then(() => searchMachine(6, 3));

	// intervals
	setInterval(() => {
		updateTokenAmount();
		if (playerMachineCount.v > 0) {
			zzfx(...[0.3,,1675,,.06,.24,1,1.82,,,837,.06])
		}
	}, 1000);

	setInterval(() => {
		updateClock();
	}, 1000);

	// return to 0, 0 action
	$returnBtn.onclick = (e) => {
		e.stopPropagation();
		resetCameraOffset(500, 48);
	};

	$modalContainer.onclick = (e) => e.stopPropagation();
	$modal.onclick = hideModal;

	enableTokenDeposit();
	enableTokenWithdraw();
	enableMachineStaking();
	enableMachineStore();
	enableWalletConnector();

	$app.addEventListener("mousemove", updateBackground);
	window.addEventListener("mouseup", () => {
		prevMouseX = null;
		prevMouseY = null;
	});

	// config canvas
	bgCtx.imageSmoothingEnabled = false;
	fgCtx.imageSmoothingEnabled = false;

	updateBackground();
	updateForeground();
}

function updateForeground() {
	const ctx = fgCtx;

	renderObjects(ctx);
	requestAnimationFrame(updateForeground);
}

export function updateBackground(e) {
	if (e && e.target !== $fgCanvas) return;

	const ctx = bgCtx;

	// update map panning if mouse dragged
	if (mousePressed.v) {
		if (prevMouseX && prevMouseY) {
			cameraOffsetX.v +=
				((prevMouseX - mouseX.v) / window.innerWidth) * PAN_SPEED;
			cameraOffsetY.v +=
				((prevMouseY - mouseY.v) / window.innerWidth) * PAN_SPEED;
		}

		cameraOffsetX.v = clamp(cameraOffsetX.v, 0, MAX_OFFSET_X);
		cameraOffsetY.v = clamp(cameraOffsetY.v, 0, MAX_OFFSET_Y);

		prevMouseX = mouseX.v;
		prevMouseY = mouseY.v;
	}

	// get canvas position
	const top = (window.innerHeight - HEIGHT * appScale.v) / 2;
	const left = (window.innerWidth - WIDTH * appScale.v) / 2;

	renderTiles(ctx, mouseX.v - left, mouseY.v - top);
}

// make offset to (0, 0)
export function resetCameraOffset(duration, steps) {
	const speedX = -cameraOffsetX.v / steps;
	const speedY = -cameraOffsetY.v / steps;

	let i = 0;
	const interval = setInterval(() => {
		if (i === steps) return clearInterval(interval);

		cameraOffsetX.v += speedX;
		cameraOffsetY.v += speedY;
		i++;
		updateBackground();
	}, duration / steps);
}
