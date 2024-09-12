import {
	$dpBtn,
	$dpInput,
	$dpInputInfo,
	$dpModal,
	$dpSendBtn,
	$modal,
} from "../elements";
import { showModal } from "../utils/modal";
import { formatNum } from "../utils/other";
import { deposit, updatePlayerData } from "../web3/logicContract";
import { getTokenBalance } from "../web3/tokenContract";

export function enableTokenDeposit() {
	$dpBtn.onclick = async () => {
		showModal(
			"Deposit Sanitized Coin (SANC)",
			"Move SANC to your laundromat",
			$dpModal,
		);

		const walletBalance = await getTokenBalance();
		$dpInput.value = 0;
		$dpInputInfo.innerText = `Max Amount: ${formatNum(walletBalance)} SANC`;
	};

	$dpSendBtn.onclick = async (e) => {
		e.stopPropagation();
		const amount = +$dpInput.value;
		$dpInput.value = 0;
		await deposit(amount);
		$modal.click();

		await updatePlayerData();
	};
}
