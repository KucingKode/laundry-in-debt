import Machine from "../class/Machine";
import {
	$fgCanvas,
	$modal,
	$machinesModal,
	uninstalls,
	installs,
	cards,
} from "../elements";
import { activeTileX, activeTileY, machines } from "../states";
import { getPair } from "../utils/math";
import { stake, unstake } from "../web3/logicContract";
import { showModal } from "../utils/modal";
import { getMachineAmounts } from "../web3/machineContract";

export function enableMachineStaking() {
	$fgCanvas.ondblclick = async () => {
		let prevX = activeTileX.v;
		let prevY = activeTileY.v;

		$machinesModal.classList.add("install");
		$machinesModal.classList.remove("store");

		activeTileX.v = prevX;
		activeTileY.v = prevY;

		const machineAmounts = await getMachineAmounts();
		const pair = getPair(activeTileX.v, activeTileY.v);

		for (let i = 0; i < 3; i++) {
			const isInstalled = machines[pair] && machines[pair].id === i + 1;
			cards[i].style.display =
				machineAmounts[i] || isInstalled ? "flex" : "none";
			installs[i].style.display = isInstalled ? "none" : "flex";
			uninstalls[i].style.display = isInstalled ? "flex" : "none";
		}

		showModal(
			"Install or Remove Machine at Laundromat",
			"Installed machine on this tile will be returned to you",
			$machinesModal,
		);
	};

	installs.map((e, i) => {
		e.onclick = () => installMachine(i + 1);
	});

	uninstalls.map((e) => {
		e.onclick = uninstallMachine;
	});
}

async function installMachine(id) {
	const pair = getPair(activeTileX.v, activeTileY.v);

	const isSuccess = await stake(id, pair);
	if (!isSuccess) return;

	machines[pair] = new Machine(activeTileX.v, activeTileY.v, id);
	$modal.click();
}

async function uninstallMachine() {
	const pair = getPair(activeTileX.v, activeTileY.v);
	if (!machines[pair]) return;

	const isSuccess = await unstake(pair);
	if (!isSuccess) return;

	delete machines[pair];
	$modal.click();
}
