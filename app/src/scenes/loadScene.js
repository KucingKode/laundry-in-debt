import { showAlert } from "../utils/alert";
import { $loadingMsg } from "../elements";
import { assets } from "../utils/other";
import { connectThirdweb } from "../utils/web3";
import {
	createAccount,
	getPlayerData,
	getSellPrices,
	initLogicContract,
} from "../web3/logicContract";
import {
	getMachineApproval,
	initMachineContract,
	requestMachineApproval,
} from "../web3/machineContract";
import { initTokenContract } from "../web3/tokenContract";
import { connectWallet, existWallet, switchToAvax } from "../web3/wallet";
import { zzfxM, zzfxP } from "../libs/zzfxm";
import { bgm } from "../assets/zzfx";
import { fetchExternals } from "../libs/externals";

export async function loadScene() {
	const setMsg = (msg) => {
		$loadingMsg.innerHTML = msg;
	};

	setMsg("Please click your screen to start loading the game!");
	await waitUserClick();
	document.body.requestFullscreen();

	zzfxP(...zzfxM(...bgm));
	setInterval(() => {
		zzfxP(...zzfxM(...bgm));
	}, 8000);

	setMsg("Connecting to the outside world...");
	await loadAsssets();
	if (!(await fetchExternals())) {
		return showAlert("External libraries not loaded!", true);
	}

	if (!existWallet()) {
		return showAlert(
			"Ethereum wallet required. Please install metamask!",
			true,
		);
	}

	setMsg("Connecting to your account...");
	await connectWallet();

	setMsg("Switching to Avalanche chain");
	const isSwitchSuccess = await switchToAvax();
	if (!isSwitchSuccess) {
		return showAlert("Failed to switch chain to Avalanche!");
	}

	setMsg("Creating Thirdweb client...");
	connectThirdweb();

	// load contract
	await initLogicContract();
	await initTokenContract();
	await initMachineContract();

	setMsg("Checking NFT transfer approval...");
	if (!(await getMachineApproval())) {
		await requestMachineApproval();
	}

	setMsg("Opening your laundromat...");
	// create new account if no account data found
	const playerData = await getPlayerData();
	if (!playerData?.[0]) await createAccount();

	setMsg("Fetching machine catalog...");
	await getSellPrices();

	return;
}

function waitUserClick() {
	return new Promise((resolve) => {
		window.onclick = () => {
			resolve();
		};
	});
}

function loadAsssets() {
	return new Promise((resolve) => {
		let taskCount = 5;

		const onload = () => {
			taskCount--;
			if (taskCount === 0) resolve();
		};

		for (const key of Object.keys(assets)) {
			assets[key].onload = onload;
			assets[key].src = `./${key}.png`;
		}
	});
}
