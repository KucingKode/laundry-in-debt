import { $app } from "../elements";
import { zzfx } from "../libs/zzfxm";
import { mousePressed, mouseX, mouseY } from "../states";

$app.addEventListener("mousemove", (e) => {
	mouseX.v = e.pageX;
	mouseY.v = e.pageY;
});

window.addEventListener("mousedown", () => {
	mousePressed.v = true;
	zzfx(...[,,539,0,.04,.29,1,1.92,,,567,.02,.02,,,,.04])
});

window.addEventListener("mouseup", () => {
	mousePressed.v = false;
});
