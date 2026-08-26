export class Tween {
	static linear(t: number, b: number, c: number, d: number) {
		return c * t / d + b;
	}

	static quadIn(t: number, b: number, c: number, d: number) {
		t /= d;
		return c * t * t + b;
	}

	static quadOut(t: number, b: number, c: number, d: number) {
		t /= d;
		return -c * t * (t - 2) + b;
	}

	static quadInOut(t: number, b: number, c: number, d: number) {
		t /= d / 2;
		if (t < 1) {
			return c / 2 * t * t + b;
		}
		t--;
		return -c / 2 * (t * (t - 2) - 1) + b;
	}

	static cubeIn(t: number, b: number, c: number, d: number) {
		t /= d;
		return c * t * t * t + b;
	}

	static cubeOut(t: number, b: number, c: number, d: number) {
		t /= d;
		t--;
		return c * (t * t * t + 1) + b;
	}

	static cubeInOut(t: number, b: number, c: number, d: number) {
		t /= d / 2;
		if (t < 1) {
			return c / 2 * t * t * t + b;
		}
		t -= 2;
		return c / 2 * (t * t * t + 2) + b;
	}

	static quartIn(t: number, b: number, c: number, d: number) {
		t /= d;
		return c * t * t * t * t + b;
	}

	static quartOut(t: number, b: number, c: number, d: number) {
		t /= d;
		t--;
		return -c * (t * t * t * t - 1) + b;
	}

	static quartInOut(t: number, b: number, c: number, d: number) {
		t /= d / 2;
		if (t < 1) {
			return c / 2 * t * t * t * t + b;
		}
		t -= 2;
		return -c / 2 * (t * t * t * t - 2) + b;
	}

	static quintIn(t: number, b: number, c: number, d: number) {
		t /= d;
		return c * t * t * t * t * t + b;
	}

	static quintOut(t: number, b: number, c: number, d: number) {
		t /= d;
		t--;
		return c * (t * t * t * t * t + 1) + b;
	}

	static quintInOut(t: number, b: number, c: number, d: number) {
		t /= d / 2;
		if (t < 1) {
			return c / 2 * t * t * t * t * t + b;
		}
		t -= 2;
		return c / 2 * (t * t * t * t * t + 2) + b;
	}

	static sineIn(t: number, b: number, c: number, d: number) {
		return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
	}

	static sineOut(t: number, b: number, c: number, d: number) {
		return c * Math.sin(t / d * (Math.PI / 2)) + b;
	}

	static sineInOut(t: number, b: number, c: number, d: number) {
		return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
	}

	static expoIn(t: number, b: number, c: number, d: number) {
		return c * Math.pow(2, 10 * (t / d - 1)) + b;
	}

	static expoOut(t: number, b: number, c: number, d: number) {
		return c * (-Math.pow(2, -10 * t / d) + 1) + b;
	}

	static expoInOut(t: number, b: number, c: number, d: number) {
		t /= d / 2;
		if (t < 1) {
			return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
		}
		t--;
		return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
	}

	static circIn(t: number, b: number, c: number, d: number) {
		t /= d;
		return -c * (Math.sqrt(1 - t * t) - 1) + b;
	}

	static circOut(t: number, b: number, c: number, d: number) {
		t /= d;
		t--;
		return c * Math.sqrt(1 - t * t) + b;
	}

	static circInOut(t: number, b: number, c: number, d: number) {
		t /= d / 2;
		if (t < 1) {
			return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
		}
		t -= 2;
		return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
	}
}
