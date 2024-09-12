import { loadScene } from "./scenes/loadScene";
import { mainScene } from "./scenes/mainScene";
import { hideAlert } from "./utils/alert";
import { WIDTH, HEIGHT } from "./constants";
import { appScale } from "./states";
import { $alertContainer, $app, $loadScene, $mainScene } from "./elements";
import "./utils/input";

import "../styles/basic.css";
import "../styles/keyframes.css";
import "../styles/alert.css";
import "../styles/loading.css";
import "../styles/main.css";
import "../styles/modal.css";

async function main() {
	$alertContainer.onclick = hideAlert;

	$app.style.width = `${WIDTH}px`;
	$app.style.height = `${HEIGHT}px`;

	resizeApp();

	$loadScene.classList.add("active");
	await loadScene();
	$loadScene.classList.remove("active");
	$mainScene.classList.add("active");

	mainScene();
}

function resizeApp() {
	appScale.v = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
	$app.style.scale = appScale.v;
}

window.onresize = resizeApp;
window.onload = main;
