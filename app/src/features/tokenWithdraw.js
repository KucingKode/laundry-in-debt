import {
	$modal,
	$wdBtn,
	$wdInput,
	$wdInputInfo,
	$wdModal,
	$wdSendBtn,
} from "../elements";
import { playerComputedBalance } from "../states";
import { showModal } from "../utils/modal";
import { formatNum } from "../utils/other";
import { updatePlayerData, withdraw } from "../web3/logicContract";

export function enableTokenWithdraw() {
	$wdBtn.onclick = async () => {
		showModal(
			"Withdraw Sanitized Coin (SANC)",
			"Transfer SANC from your laundromat to your wallet",
			$wdModal,
		);

		await updatePlayerData();
		$wdInput.value = 0;
		$wdInputInfo.innerText = `Max Amount: ${formatNum(
			playerComputedBalance.v,
		)} SANC`;
	};

	$wdSendBtn.onclick = async (e) => {
		e.stopPropagation();
		const amount = +$wdInput.value;
		$wdInput.value = 0;
		await withdraw(amount);
		$modal.click();

		await updatePlayerData();
	};
}
