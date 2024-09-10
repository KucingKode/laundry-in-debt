import { $alertContainer, $alertMsg } from "../elements";

export function showAlert(msg, isPermanent) {
	$alertMsg.innerHTML = msg;
	$alertContainer.classList.add("active");
	!isPermanent && setTimeout(hideAlert, 5000);
}

export function hideAlert() {
	$alertContainer.classList.remove("active");
}
