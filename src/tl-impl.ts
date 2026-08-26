
import { TL } from './timeline_data/timeline';
import type { ITrack } from './timeline_data/timeline';
import { randInt } from 'three/src/math/MathUtils.js';

export function test() {

	const clip_duration = 2000

	const now = performance.now()
	const clip_count = 2
	const max_value_count = 5
	const track_clip_slots = []
	const tracks: ITrack[] = []
	const start_value_count = 2
	const start_value = 8
	for (let i = 0; i < clip_count; i++) {
		const startTime = 1337
		const d = i + start_value_count//randInt(1, max_value_count)
		const arrStart = new Array(d)
		const arrEnd = new Array(d)
		for (let j = 0; j < d; j++) {
			arrStart[j] = i + start_value + j
			arrEnd[j] = i + start_value + (i + j + 1) //randInt(10, 50) 
		}
		const clip = TL.track_clip_create(startTime, { duration: clip_duration, easingId: 0, valuesStart: arrStart, valuesEnd: arrEnd })

		let found_slot = false
		let track_idx = d - 1
		while (!found_slot) {
			for (let j = track_clip_slots.length; j <= track_idx; j++) {
				track_clip_slots.push(new Array(randInt(3, 5)))
				tracks.push(TL.track_create([]))
			}
			for (let j = 1; j < track_clip_slots[track_idx].length; j++) {
				if (track_clip_slots[track_idx][j]) continue
				track_clip_slots[track_idx][j] = clip
				TL.track_add(tracks[track_idx], clip)
				found_slot = true
				break
			}
			track_idx += max_value_count
		}
	}

	console.log(tracks)

	const tl_instance = TL.timeline_instance_create(tracks)
	console.log('Setup timeline: ', performance.now() - now)

	let last_time = performance.now()
	let tl_time = 0
	const loop = () => {
		requestAnimationFrame(loop)
		const now = performance.now()
		const delta = now - last_time
		last_time = now

		if (tl_time < 1) {
			const result = tl_instance.slicesClipResults[0].arr
			console.log(tl_instance.buffer)
			TL.timeline_set_time(tl_instance, tl_time)
		}
		tl_time += delta
	}
	loop()
} 
