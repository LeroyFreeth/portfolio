import { EASE_TYPE, ease } from "../math/easings"

export type AnimationClip<T> = {
	start: T
	end: T
	duration_ms: number
	ease: EASE_TYPE
}

export enum OutOfBounds {
	HOLD = 0,
	RESET = 1,
	LOOP = 2,
	BOUNCE = 3,
}

const nill_clip: AnimationClip<number> = { start: 0, end: 0, duration_ms: 0, ease: EASE_TYPE.LINEAR } as AnimationClip<number>
const nill_lerp = (start: number, end: number, t: number) => {
	end; t;
	return start
}
const nill_post = OutOfBounds.HOLD

// Can fetch the value
// However, since you provide the lerp function, you can immediately write the lerp result to the target object
export class Animator {
	clips: AnimationClip<any>[]
	lerp_fn_arr: ((start: any, end: any, t: number) => any)[]
	times: number[]
	playings: boolean[]
	values: any[]
	speeds: number[]
	posts: OutOfBounds[]
	constructor() {
		this.clips = []
		this.lerp_fn_arr = []
		this.times = []
		this.playings = []
		this.values = []
		this.speeds = []
		this.posts = []

		this.add<number>(nill_clip, nill_lerp, nill_post)
	}

	add<T>(clip: AnimationClip<T>, lerp: ((a: T, b: T, t: number) => T), post: OutOfBounds) {
		this.clips.push(clip)
		this.lerp_fn_arr.push(lerp)
		this.times.push(0)
		this.playings.push(true)
		this.values.push(0)
		this.speeds.push(1)
		this.posts.push(post)
	}

	get_idx(clip: AnimationClip<any>) {
		for (let i = 0; i < this.clips.length; ++i) {
			if (clip === this.clips[i]) return i
		}
		console.warn('Could not find clip - Using dummy clip instead')
		return 0
	}

	play_for_idx(idx: number) { this.playings[idx] = true }
	play_from_start_for_idx(idx: number) {
		this.times[idx] = 0
		this.playings[idx] = true
	}
	pause_for_idx(idx: number) { this.playings[idx] = false }
	rewind_for_idx(idx: number) { this.times[idx] = 0 }
	stop_for_idx(idx: number) {
		this.times[idx] = 0
		this.playings[idx] = false
	}
	set_speed_for_idx(idx: number, speed: number) { this.speeds[idx] = speed }
	get_value_for_idx(idx: number) { return this.values[idx] }

	play(clip: AnimationClip<any>) { this.playings[this.get_idx(clip)] = true }
	play_from_start(clip: AnimationClip<any>) {
		const idx = this.get_idx(clip)
		this.times[idx] = 0
		this.playings[idx] = true
	}
	pause(clip: AnimationClip<any>) { this.playings[this.get_idx(clip)] = false }
	rewind(clip: AnimationClip<any>) { this.times[this.get_idx(clip)] = 0 }
	stop(clip: AnimationClip<any>) {
		const idx = this.get_idx(clip)
		this.times[idx] = 0
		this.playings[idx] = false
	}
	set_speed(clip: AnimationClip<any>, speed: number) { this.speeds[this.get_idx(clip)] = speed }
	get_value(clip: AnimationClip<any>): any { return this.values[this.get_idx(clip)] }

	tick(delta_ms: number) {
		for (let i = 1; i < this.playings.length; ++i) {
			if (!this.playings[i]) continue

			const clip = this.clips[i]
			const dur = clip.duration_ms
			this.times[i] = this.times[i] + (delta_ms * this.speeds[i])
			const n = this.times[i] / dur
			let clip_time = 0
			switch (this.posts[i]) {
				case OutOfBounds.HOLD:
					clip_time = Math.max(0, Math.min(n, 1))
					this.times[i] = clip_time * dur
					break
				case OutOfBounds.RESET:
					clip_time = Math.max(0, n - Math.floor(n))
					this.times[i] = 0
					break
				case OutOfBounds.LOOP:
					clip_time = n % 1.0
					this.times[i] %= dur
					break
				case OutOfBounds.BOUNCE:
					const m = n % 2
					clip_time = m < 1 ? n : 2 - n
					break

			}
			const t = ease(clip.ease, clip_time)
			this.values[i] = this.lerp_fn_arr[i](clip.start, clip.end, t)
		}
	}

}


