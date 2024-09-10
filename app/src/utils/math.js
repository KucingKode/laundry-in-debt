export function clamp(value, min, max) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

export function getPair(x, y) {
	return x >= y ? x * x + x + y : x + y * y;
}

export function randomInt(max) {
	return Math.floor(Math.random() * max);
}

export const floor = Math.floor
