import { EASE_TYPE, ease } from "../timeline/easings";



enum OUT_OF_BOUNDS_TYPE {
	RESET = 0,
	HOLD = 1,
	LOOP = 2,
}

class AnimClip<T> {
	start: T
	end: T
	ease: EASE_TYPE
	duration_ms: number
	constructor(start: T, end: T, ease: EASE_TYPE, duration_ms: number) {
		this.start = start
		this.end = end
		this.ease = ease
		this.duration_ms = duration_ms
	}
}

class TrackClip<T> {
	id: string
	start_ms: number
	end_ms: number
	duration_ms: number
	start: T
	end: T
	ease: EASE_TYPE

	post: OUT_OF_BOUNDS_TYPE
	_is_generated: boolean
	_diff: T

	constructor(id: string, clip: AnimClip<T>, start_ms: number, post: OUT_OF_BOUNDS_TYPE) {
		this.id = id
		this.start_ms = start_ms
		this.end_ms = start_ms + clip.duration_ms
		this.duration_ms = clip.duration_ms
		this.start = structuredClone(clip.start)
		this.end = structuredClone(clip.end)
		this._diff = structuredClone(clip.end)
		this.ease = clip.ease
		this.post = post
		this._is_generated = false
	}
}


class Track<T> {
	id: string
	clips: TrackClip<T>[]
	duration_ms: number

	bindings: ((value: T) => void)[]
	constructor(id: string, clips: TrackClip<T>[]) {
		this.id = id
		this.clips = clips
		this.duration_ms = 0
		this.bindings = []

	}
	add(clip: TrackClip<T>) {
	}
	remove(clip: TrackClip<T>) {

	}
	bind(target: object, key: string) {
		this.bindings.push(this._create_setter(target as Record<string, T>, key))
	}

	_create_setter(obj: Record<string, T>, key: string): ((value: T) => void) {
		return (value: T) => { (obj[key] as T) = value }
	}

	lerp(a, b, t): T { return a }
}

class Timeline {
	tracks: Track<any>[]
	constructor(tracks: Track<any>[]) {
		this.tracks = tracks
		this.compile()
	}

	compile() {
		// Add  pre and post stuff eventually
		for (let i = 0; i < this.tracks.length; ++i) {
			const track = this.tracks[i]
			track.clips.sort((a, b) => { return a.start_ms - b.start_ms })
			for (let j = 1; j < track.clips.length; ++j) {
				const last_clip = track.clips[j - 1]
				const clip = track.clips[j]
				const last_end_ms = last_clip.start_ms + last_clip.duration_ms
				if (last_end_ms < clip.start_ms) {
					console.warn(`Track ${track.id} has overlapping clips - ${last_clip.id}, ${clip.id}`)
				}
			}
		}
	}

	set_time(time: number) {
		const l = this.tracks.length
		for (let i = 0; i < l; ++i) {
			const track = this.tracks[i]
			const clip_count = track.clips.length
			for (let j = 0; j < clip_count; ++j) {
				const clip = track.clips[j]
				if (time < clip.start_ms) continue
				if (clip.start_ms >= time && clip.end_ms <= time) {
					const n = (time - clip.start_ms) / clip.duration_ms
					track.lerp(clip.start, clip.end, ease(clip.ease, n))
				} else if (time > clip.end_ms) {
					if ((j + 1) < clip_count && track.clips[j + 1].start_ms >= time) continue
					// TODO: Implement post
				}
			}
		}
	}
}

