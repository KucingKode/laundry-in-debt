import { assets } from "../utils/other";
import { TILE_SIZE } from "../constants";
import { cameraOffsetX, cameraOffsetY } from "../states";
import { floor, random, round } from "../utils/math";

export const CUSTOMER_FRAMES = 4;
const SIZE = 50;
const FRAME_SIZE = 16;
const directions = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
];

class Customer {
	constructor(id, ix, iy, steps) {
		this.ix0 = ix;
		this.iy0 = iy;
		this.vx = 0;
		this.vy = 0;
		this.ix = 0;
		this.iy = 0;
		this.remSteps = 0;
		// biome-ignore lint: shorter code
		this.img = assets["c" + id];
		this.steps = steps;
		this.frameI = floor(random() * CUSTOMER_FRAMES);

		this.move();
		this.update();
	}

	move() {
		const directionI = floor(random() * directions.length);
		const direction = directions[directionI];

		this.vx = direction[0];
		this.vy = direction[1];
		this.remSteps = this.steps;
	}

	update() {
		if (this.remSteps === 1) {
			this.ix = this.ix0 + this.vx;
			this.iy = this.iy0 + this.vy;
			this.ix0 = this.ix;
			this.iy0 = this.iy;

			this.move();
		} else {
			this.ix = this.ix0 + this.vx * (1 - this.remSteps / this.steps);
			this.iy = this.iy0 + this.vy * (1 - this.remSteps / this.steps);
		}

		this.remSteps--;
	}

	render(ctx) {
		ctx.drawImage(
			this.img,
			0 + this.frameI * FRAME_SIZE,
			0,
			FRAME_SIZE,
			FRAME_SIZE,
			round((this.ix - cameraOffsetX.v) * TILE_SIZE) - SIZE / 2,
			round((this.iy - cameraOffsetY.v) * TILE_SIZE) - SIZE / 2,
			SIZE,
			SIZE,
		);
	}
}

export default Customer;
