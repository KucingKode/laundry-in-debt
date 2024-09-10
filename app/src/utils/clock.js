import { CLOCK_MULT, ONE_DAY_SEC } from "../constants";
import { $clockCountdown, $clockTime } from "../elements";
import { floor } from "./math";

export function updateClock() {
	const multNow = floor(Date.now() * CLOCK_MULT / 1000);
	const hours = floor((multNow % ONE_DAY_SEC) / 3600);
	const minutes = floor((multNow % 3600) / 60);

	if (hours === 13 && minutes === 0) zzfx(...[,0,1600,.13,.52,.61,1,1.1,,,,,,.1,,.14])

	$clockTime.innerText = `${hours < 10 ? "0" : ""}${hours}:${
		minutes < 10 ? "0" : ""
	}${minutes}`;

	const cdHours = (hours >= 13 ? 37 - hours : 13 - hours) - 1;
	const cdMinutes = (60 - minutes) % 60;
	$clockCountdown.innerText = `${cdHours < 10 ? "0" : ""}${cdHours}:${
		cdMinutes < 10 ? "0" : ""
	}${cdMinutes}`;
}
