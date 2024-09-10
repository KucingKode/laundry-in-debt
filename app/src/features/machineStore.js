import {
	$machinesModal,
	$modal,
	$storeBtn,
	buys,
	cards,
	sells,
} from "../elements";
import { machineBids, machineAsks } from "../states";
import { showModal } from "../utils/modal";
import { buy, getSellPrices, sell } from "../web3/logicContract";

export function enableMachineStore() {
	$storeBtn.onclick = async () => {
		$machinesModal.classList.add("store");
		$machinesModal.classList.remove("install");
		cards.map((e) => {
			e.style.display = "flex";
		});

		// update price

		showModal(
			"Wallow's Store",
			"Buy and Sell Machines and Power-Ups",
			$machinesModal,
		);
	};

	buys.map((e, i) => {
		e.onclick = () => buyMachine(i);
	});

	sells.map((e, i) => {
		e.onclick = () => sellMachine(i);
	});
}

async function buyMachine(i) {
	await buy(i + 1, machineBids.v[i]);
	getSellPrices();
	$modal.click();
}

async function sellMachine(i) {
	await sell(i + 1, machineAsks.v[i]);
	getSellPrices();
	$modal.click();
}
