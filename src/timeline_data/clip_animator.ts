import type { EASE_TYPE } from "../timeline/easings"
import { ease } from "../timeline/easings"

enum ClipStride {
	START = 0,
	DIFF = 1,
	TIME = 2,
	DURATION = 3,
	EASE = 4,
	STRIDE = 5,
}

export interface IAnimator {
	play: () => void
	pause: () => void
	stop: () => void
	tick: (delta: number) => void
}

export type AnimClipFloat = {
	id: string,
	target: object,
	key: string | number,
	start: number,
	end: number,
	duration_ms: number,
	ease: EASE_TYPE,
}

export type AnimClipVector3 = {
id: string,
target: object,
keys: string[],


}

// Have to rethink my support for this
export type AnimClipArray = {
	id: string,
	target: object,
	key: string[] | number[],
	start: number[],
	end: number[],
	duration_ms: number,
	ease: EASE_TYPE,
}


type PropertySetter = (value: number) => void
function create_setter(obj: Record<string | number, number>, key: string | number): PropertySetter {
	return (value: number) => { (obj[key] as number) = value }
}

function is_anim_clip(obj: unknown): obj is AnimClipFloat | AnimClipArray {
	if (!obj || typeof obj !== 'object') return false

	const key = obj as Record<string, unknown>

	return (
		typeof key.id === 'string' &&
		typeof key.target === 'object' &&
		key.target !== null &&
		typeof key.duration_ms === 'number' &&
		'ease' in key &&
		'start' in key &&
		'end' in key &&
		'key' in key
	)
}

function is_anim_clip_array(clip: AnimClipFloat | AnimClipArray): clip is AnimClipArray {
	return Array.isArray(clip.start) && Array.isArray(clip.end) && Array.isArray(clip.key) && clip.start.length === clip.key.length && clip.start.length === clip.end.length;
}

function anim_clip_float_to_anim_clip_array(clip: AnimClipFloat): AnimClipArray {
	return {
		id: clip.id,
		target: clip.target,
		key: [clip.key],
		start: [clip.start],
		end: [clip.end],
		duration_ms: clip.duration_ms,
		ease: clip.ease
	} as AnimClipArray
}

export class ClipAnimator implements IAnimator {
	setter_arr: PropertySetter[]
	id_arr: string[]
	buffer: Float32Array
	length: number
	capacity: number

	is_playing: boolean
	constructor(size: number) {
		this.is_playing = false
		this.length = 0
		this.capacity = size
		this.buffer = new Float32Array(size * 5)
		this.setter_arr = new Array(size)
		this.id_arr = new Array(size)
	}

	add(clip: AnimClipFloat) {

		if (!is_anim_clip(clip)) {
			console.warn(`Could not add clip - Not an animation clip`)
			return
		}
		const idx = this.length
		this.buffer[idx + ClipStride.START] = clip.start
		this.buffer[idx + ClipStride.DIFF] = clip.end - clip.start
		this.buffer[idx + ClipStride.TIME] = 0
		this.buffer[idx + ClipStride.DURATION] = clip.duration_ms * 0.001
		this.buffer[idx + ClipStride.EASE] = Math.round(clip.ease)
		this.setter_arr[idx] = create_setter(clip.target as Record<string, number>, clip.key)
		this.id_arr[this.length] = clip.id
		++this.length
	}

	re_add(clip: AnimClipFloat) {
		const idx = this.id_arr.indexOf(clip.id)
		if (this.length === 0 || idx < 0) {
			console.warn(`Cannot readd clip for id ${clip.id} - Clip not found`)
			return
		}
		if (this.length >= this.capacity) {
			console.warn(`Could not readd clip for id ${clip.id} - Buffer at max capacity`)
			return
		}
		this._swap(idx, this.length++)
	}

	remove(clip: AnimClipFloat) {
		const idx = this.id_arr.indexOf(clip.id)
		if (this.length === 0 || idx < 0) {
			console.warn(`Cannot remove clip for id ${clip.id} - Clip not found`)
			return
		}
		this._swap(idx, Math.max(0, --this.length))
	}

	play() {
		this.is_playing = true
	}

	pause() {

		this.is_playing = false
	}
	stop() {
		this.is_playing = false
		this._reset_anims()
	}


	tick(delta: number) {
		for (let i = 0; i < this.length; ++i) {
			const c = i * ClipStride.STRIDE
			const ease_id: EASE_TYPE = Math.round(this.buffer[c + ClipStride.EASE]) as EASE_TYPE
			this.buffer[c + ClipStride.TIME] += delta
			const n = Math.min(1, Math.max(0, this.buffer[c + ClipStride.TIME] / this.buffer[c + ClipStride.DURATION]))
			const result: number = this.buffer[c + ClipStride.START] + (this.buffer[c + ClipStride.DIFF] * ease(ease_id, n))
			this.setter_arr[i](result)
		}
	}

	_reset_anims() {
		for (let i = 0; i < this.length; ++i) 	this.buffer[i + ClipStride.TIME] = 0
		this.tick(0)
	}

	edit_clip(id: string, start: number, end: number, duration_ms: number) {
		const idx = this.id_arr.indexOf(id)
		if (idx < 0) {
			console.warn(`Cannot edit clip for id ${id} - Clip not found`)
			return
		}
		const c = idx * ClipStride.STRIDE
		this.buffer[c + ClipStride.START] = start
		this.buffer[c + ClipStride.DIFF] = end - start
		this.buffer[c + ClipStride.DURATION] = duration_ms
	}
	reset_clip(clip: AnimClipFloat) {
		const id = clip.id
		const idx = this.id_arr.indexOf(id)
		if (idx < 0) {
			console.warn(`Cannot reset clip for id ${id} - Clip not found`)
			return
		}
		const c = idx * ClipStride.STRIDE
		this.buffer[c + ClipStride.TIME] = 0
	}

	_swap(a: number, b: number) {
		const temp_setter = this.setter_arr[a]
		this.setter_arr[a] = this.setter_arr[b]
		this.setter_arr[b] = temp_setter

		const temp_id = this.id_arr[a]
		this.id_arr[a] = this.id_arr[b]
		this.id_arr[b] = temp_id

		a = a * ClipStride.STRIDE
		b = b * ClipStride.STRIDE
		for (let i = 0; i < ClipStride.STRIDE; ++i) {
			const temp = this.buffer[a + i]
			this.buffer[a + i] = this.buffer[b + i]
			this.buffer[b + i] = temp
		}
	}


}

