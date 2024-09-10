import { $modal, $modalSubtitle, $modalTitle } from "../elements";
import { updatePlayerData } from "../web3/logicContract";

let prevActiveModal;

export function showModal(title, subtitle, body) {
	$modalTitle.innerHTML = title;
	$modalSubtitle.innerHTML = subtitle;
	$modal.classList.add("active");

	prevActiveModal?.classList.remove("active");
	body.classList.add("active");
	prevActiveModal = body;
}

export function hideModal() {
	updatePlayerData();
	$modal.classList.remove("active");
}
