import { $walletAddress, $walletConnector } from "../elements";
import { playerAddress } from "../states";

export function enableWalletConnector() {
	$walletConnector.onclick = () => window.location.reload();

	// show connected wallet address
	$walletAddress.innerText = playerAddress.v
		? `${playerAddress.v.slice(0, 7)}...${playerAddress.v.slice(-6)}`
		: "Connect to wallet";
}
