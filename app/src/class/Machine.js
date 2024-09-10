import { TILE_SIZE } from "../constants";
import { cameraOffsetX, cameraOffsetY } from "../states";
import { assets } from "../utils/other";

export const MACHINE_FRAMES = 9;
const SIZE = 150;
const FRAME_SIZE = 32;

class Machine {
	constructor(ix, iy, id) {
		this.id = id;
		this.ix = ix;
		this.iy = iy;
		// biome-ignore lint: shorter code
		this.img = assets["m" + id];
		this.frameI = Math.floor(Math.random() * MACHINE_FRAMES);
	}

	render(ctx) {
		ctx.drawImage(
			this.img,
			0 + this.frameI * FRAME_SIZE,
			0,
			FRAME_SIZE,
			FRAME_SIZE,
			Math.round((this.ix - cameraOffsetX.v) * TILE_SIZE) +
				(TILE_SIZE - SIZE) / 2,
			Math.round((this.iy - cameraOffsetY.v) * TILE_SIZE) + TILE_SIZE - SIZE,
			SIZE,
			SIZE,
		);
	}
}

export default Machine;
