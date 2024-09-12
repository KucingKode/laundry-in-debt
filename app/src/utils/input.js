import { clickSfx } from "../assets/zzfx";
import { $app } from "../elements";
import { zzfx } from "../libs/zzfxm";
import { pointerPressed, pointerX, pointerY } from "../states";

$app.addEventListener("pointermove", (e) => {
	pointerX.v = e.pageX;
	pointerY.v = e.pageY;
});

window.addEventListener("pointerdown", () => {
	pointerPressed.v = true;
	zzfx(...clickSfx);
});

window.addEventListener("pointerup", () => {
	pointerPressed.v = false;
});
