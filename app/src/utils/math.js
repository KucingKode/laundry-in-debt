export function clamp(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

export function getPair(x, y) {
	return x >= y ? x * x + x + y : x + y * y;
}

export const random = Math.random;
export const floor = Math.floor;
export const ceil = Math.ceil;
export const round = Math.round;
export const bigInt = BigInt;
export const number = Number;

export function randomInt(max) {
	return floor(random() * max);
}
