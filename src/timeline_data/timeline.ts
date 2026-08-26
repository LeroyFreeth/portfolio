import { Easing } from "./ease";

export const enum LerpType {
	Lerp = 0,
	LerpQuaternion = 1,
}
/* -----------------------------------------------------------------------------
	§§ 1. EASY CLIP/TRACK/TIMELINE INSTANTIATION 
----------------------------------------------------------------------------- */


export interface IClip {
	readonly values_start: number[];
	readonly values_end: number[];
	readonly duration_ms: number;
	readonly easing_idx: number;
}

export interface ITrackClip {
	id: number;
	startTime: number;
	clip: IClip;
}

export interface ITrack {
	id: number;
	clips: ITrackClip[];
}

export interface ITimeline {
	tracks: ITrack[];
}

/* -----------------------------------------------------------------------------
	§§ 2. MEMORY LAYOUT 
----------------------------------------------------------------------------- */

export enum ClipStride {
	START_TIME = 0,
	DURATION_MS = 1,
	EASE_ID = 2,
	TRACK_IDX = 3,
	VALUES_START = 4,
	VALUES_DIFF = 5,
}

export interface ITimelineLayout {
	// maxDims: number,
	maxDims: number,
	arrayBufferSize: number,
	totalClipCount: number,
	totalTrackCount: number,
	totalDimClipsArr: Int32Array,
	totalDimTracksArr: Int32Array,
	totalClipDataFloats: number,
	totalClipResultFloats: number,
	totalTrackResultFloats: number,
}

export interface ITimelineSlice {
	stride: number,
	length: number,
	arr: Float32Array,
}

export interface ITimelineViewerDims {

	// Flatten this into buffer perhaps, and create a data slice
	readonly slicesClipDimData: ITimelineSlice[];
	readonly slicesClipDimResults: ITimelineSlice[];
	readonly slicesTrackDimResults: ITimelineSlice[];
	readonly maxDims: number;
}

export interface ITimelineViewerClipResults {
	clipIdxToIds: Int32Array
	readonly slicesClipData: ITimelineSlice[]
	readonly slicesClipResults: ITimelineSlice[]

}

export interface ITimelineViewerTrackResults {
	trackIdxToIds: Int32Array
	readonly slicesTrackResults: ITimelineSlice[]
}

export interface ITimelineEditorClips {
	clipIdxToIds: Int32Array
	slicesClipData: ITimelineSlice[]
}

export interface ITimelineInstance {
	// These are the only values that change per instance
	buffer: Float32Array;


	// Flatten this into buffer perhaps, and create a data slice
	readonly slicesClipDimData: ITimelineSlice[];
	readonly slicesClipDimResults: ITimelineSlice[];
	readonly slicesTrackDimResults: ITimelineSlice[];
	readonly maxDims: number;

	// ViewerResult should probably have all the result values
	// Binder should have the ViewerResult
	// Editor should have the configs
	// Then we can argue whether clip results all need to be stored
	clipIdxToIds: Int32Array
	slicesClipData: ITimelineSlice[]
	readonly slicesClipResults: ITimelineSlice[]

	trackIdxToIds: Int32Array
	readonly slicesTrackResults: ITimelineSlice[]
}


/* -----------------------------------------------------------------------------
	§§ 3. TIMELINE FUNCTIONS 
----------------------------------------------------------------------------- */

let timeline_unique_id = 1;

export class TL {
	// track_clip_float_create(
	// Solves idling for ... infinite?
	private static increment_unique_id() {
		const id = timeline_unique_id++
		if (id === 0) timeline_unique_id++
		return timeline_unique_id

	}
	public static track_clip_create(startTime: number, clip: IClip): ITrackClip {
		return {
			id: TL.increment_unique_id(),
			startTime: startTime,
			clip: clip,
		};
	}

	public static track_create(clips: ITrackClip[]): ITrack {
		return {
			id: TL.increment_unique_id(),
			clips: clips,
		};
	}
	public static track_add(track: ITrack, clip: ITrackClip) {
		track.clips.push(clip)
	}

	public static timeline_create(tracks: ITrack[]) {

	}

	public static timeline_clean(timeline: ITimeline) {
		/* Remove invalid tracks */
		const ids: number[] = [];
		let slice_count = 0
		let l = timeline.tracks.length
		for (let i = 0; i < l; i++) {

			const track = timeline.tracks[i - slice_count]

			if (!track.clips || track.clips.length === 0) continue

			let trackInvalid = false
			let valueCount = track.clips[0].clip.values_start.length
			if (valueCount === 0) {
				for (let j = 0; j < track.clips.length; j++) {
					const trackClip = track.clips[j]
					if (ids.includes(trackClip.id)) {
						console.error(`Invalid trackClip - Already found id ${trackClip.id} on timeline.`);
						trackInvalid = true
					}
					else {
						ids.push(trackClip.id);
					}
					const clip = trackClip.clip
					const valuesStartCount = clip.values_start.length
					const valuesEndCount = clip.values_end.length
					if (valuesStartCount !== valuesEndCount || valuesStartCount !== valueCount || valuesEndCount !== valuesEndCount) {
						console.error(`Invalid track: ${track.id}. Expected valueCount of ${valueCount}, but got valueCounts of ${valuesStartCount} and ${valuesEndCount}`)
						trackInvalid = true
					}
				}
			}
			// Sort valid track clips to always start with their earliest clips
			if (ids.includes(track.id)) {
				console.error(`Invalid track - Already found id ${track.id} on timeline.`);
				trackInvalid = true;
			} else {
				ids.push(track.id);
			}
			if (trackInvalid) {
				console.warn(`Removing track for id ${track.id} due to errors`)
				timeline.tracks.splice(i - slice_count, 1)
				slice_count++
			}
		}
	}

	public static timeline_sort(timeline: ITimeline) {
		timeline.tracks.sort((a, b) => {
			if (!a.clips || a.clips.length === 0) return 1
			if (!b.clips || b.clips.length === 0) return -1
			return a.clips[0].clip.values_start.length - b.clips[0].clip.values_start.length
		})
		for (const track of timeline.tracks) {
			track.clips.sort((a, b) => {
				return a.startTime - b.startTime
			})
		}
	}

	// Stride layouts for configuration blocks: [Start, Dur, EasingId, StartVal_N, DiffVal_N, ]
	private static dims_to_stride(dim: number): number { return ClipStride.VALUES_START + (2 * dim); }
	private static stride_to_dims(stride: number): number { return (stride / 2) - ClipStride.VALUES_START }

	/* WARNING: Expects cleaned and sorted timelines. */
	public static timeline_layout_create(timelines: ITimeline[]): ITimelineLayout {
		let maxDims = 0
		for (const timeline of timelines) {
			for (const track of timeline.tracks) {
				const dim = track.clips[0]?.clip.values_start.length
				if (dim > maxDims) maxDims = dim
			}
		}

		const totalDimClipsArr = new Int32Array(maxDims);
		const totalDimTracksArr = new Int32Array(maxDims);

		for (let i = 0; i < timelines.length; i++) {
			const tl = timelines[i];
			const localDimClipCounts = new Int32Array(maxDims);
			const localDimTrackCounts = new Int32Array(maxDims);

			for (let j = 0; j < tl.tracks.length; j++) {
				const track = tl.tracks[j];
				const dimIdx = track.clips[0]?.clip.values_start.length - 1;
				localDimClipCounts[dimIdx] += track.clips.length;
				localDimTrackCounts[dimIdx] += 1;
			}
			for (let d = 0; d < maxDims; d++) {
				totalDimClipsArr[d] += localDimClipCounts[d];
				totalDimTracksArr[d] += localDimTrackCounts[d];
			}
		}

		let totalClipCount = 0
		let totalTrackCount = 0
		let totalClipDataFloats = 0;
		let totalClipResultFloats = 0;
		let totalTrackResultFloats = 0;
		for (let d = 0; d < maxDims; d++) {
			const clipCount = totalDimClipsArr[d];
			if (clipCount === 0) continue;

			const trackCount = totalDimTracksArr[d];
			const dim = d + 1;
			const stride = TL.dims_to_stride(dim);

			totalClipCount += clipCount
			totalTrackCount += trackCount
			totalClipDataFloats += clipCount * stride;
			totalClipResultFloats += clipCount * dim;
			totalTrackResultFloats += trackCount * dim + 1 // We are adding one nill value for track results, multi values can still write to that same value
		}

		return {
			maxDims,
			arrayBufferSize: (totalClipDataFloats + totalClipResultFloats + totalTrackResultFloats) * 4,
			totalClipCount,
			totalTrackCount,
			totalDimClipsArr,
			totalDimTracksArr,
			totalClipDataFloats,
			totalClipResultFloats,
			totalTrackResultFloats,
		};
	}

	public static timeline_instance_create_empty(layout: ITimelineLayout): ITimelineInstance {
		const buffer = new Float32Array(layout.arrayBufferSize / 4);

		let totalClipCount = layout.totalClipCount;
		let totalTrackCount = layout.totalTrackCount;

		const slicesClipData = new Array<ITimelineSlice>(totalClipCount);
		const slicesClipResults = new Array<ITimelineSlice>(totalClipCount);
		const slicesTrackResults = new Array<ITimelineSlice>(totalTrackCount);

		// Process timeline viewers - Separated by dims, to allow multithreading of separate or within dims
		const slicesClipDimData = new Array<ITimelineSlice>(layout.maxDims);
		const slicesClipDimResults = new Array<ITimelineSlice>(layout.maxDims);
		const slicesTrackDimResults = new Array<ITimelineSlice>(layout.maxDims);

		const trackBufferStart = layout.totalClipDataFloats + layout.totalClipResultFloats

		const clipDataBuffer = buffer.subarray(0, layout.totalClipDataFloats);
		const clipResultBuffer = buffer.subarray(layout.totalClipDataFloats, layout.totalClipDataFloats + layout.totalClipResultFloats);
		const trackResultBuffer = buffer.subarray(trackBufferStart, trackBufferStart + layout.totalTrackResultFloats)

		let clipDataCursorOffset = 0
		let clipResultCursorOffset = 0
		let trackResultCursorOffset = 1 // The nill offset
		let clip_idx = 0
		let track_idx = 0
		for (let d = 0; d < layout.maxDims; d++) {

			const trackCount = layout.totalDimTracksArr[d];
			const clipCount = layout.totalDimClipsArr[d];
			const dim = d + 1;
			const stride = TL.dims_to_stride(dim);


			// Create slices for tracks 
			for (let t = 0; t < trackCount; t++) {
				const startTrackResult = trackResultCursorOffset + (t * dim)
				slicesTrackResults[track_idx] = { stride: dim, length: dim, arr: trackResultBuffer.subarray(startTrackResult, startTrackResult + dim) };
				track_idx++
			}
			slicesClipDimData[d] = {
				stride: stride, length: clipCount * stride,
				arr: clipDataBuffer.subarray(clipDataCursorOffset, clipDataCursorOffset + clipCount * stride)
			}
			slicesClipDimResults[d] = {
				stride: dim, length: clipCount * dim,
				arr: clipResultBuffer.subarray(clipResultCursorOffset, clipResultCursorOffset + clipCount * dim)
			}
			slicesTrackDimResults[d] = {
				stride: dim, length: trackCount * dim,
				arr: trackResultBuffer.subarray(trackResultCursorOffset, trackResultCursorOffset + trackCount + dim)
			}

			if (trackCount === 0) {
				console.log('Skipping clips for empty track')
				continue
			}
			// Create slices for clips
			for (let c = 0; c < clipCount; c++) {
				// Clips need to be filtered for their stride
				const startClipData = clipDataCursorOffset + (c * stride)
				slicesClipData[clip_idx] = { stride: stride, length: stride, arr: clipDataBuffer.subarray(startClipData, startClipData + stride) };

				const startClipResult = clipResultCursorOffset + (c * stride)
				slicesClipResults[clip_idx] = { stride: dim, length: dim, arr: clipResultBuffer.subarray(startClipResult, startClipResult + dim) };
				clip_idx++
			}

			clipDataCursorOffset += clipCount * stride
			clipResultCursorOffset += clipCount * dim
			trackResultCursorOffset += trackCount * dim
		}
		return {
			buffer,

			clipIdxToIds: new Int32Array(totalClipCount),
			trackIdxToIds: new Int32Array(totalTrackCount),

			slicesClipDimData,
			slicesClipDimResults,
			slicesTrackDimResults,
			maxDims: layout.maxDims,

			slicesClipData,
			slicesClipResults,
			slicesTrackResults,
		};
	}

	public static timeline_instance_set(instance: ITimelineInstance, timeline: ITimeline) {
		let clipCursor = 0
		for (let t = 0; t < timeline.tracks.length; t++) {
			const track = timeline.tracks[t]
			const dims = track.clips[0]?.clip.values_start.length
			if (dims === 0) continue
			const stride = TL.dims_to_stride(dims)
			for (let c = 0; c < track.clips.length; c++) {
				const clip = track.clips[c]
				const start = clipCursor * stride
				instance.buffer[start + ClipStride.START_TIME] = clip.startTime
				instance.buffer[start + ClipStride.DURATION_MS] = clip.clip.duration_ms
				instance.buffer[start + ClipStride.EASE_ID] = clip.clip.easing_idx
				instance.buffer[start + ClipStride.TRACK_IDX] = t
				for (let i = 0; i < dims; i += 1) {
					const offset = start + i * 2
					// In the clip it is a SoA, in the timeline is an AoS to keep the start and diff close in cache
					const startValue = clip.clip.values_start[i]
					instance.buffer[offset + ClipStride.VALUES_START] = startValue
					instance.buffer[offset + ClipStride.VALUES_DIFF] = clip.clip.values_end[i] - startValue
				}
				instance.clipIdxToIds[clipCursor] = clip.id
				clipCursor++
			}
			// Leave first idx empty for nill
			instance.trackIdxToIds[t + 1] = track.id
		}
	}

	public static timeline_instance_create(tracks: ITrack[]): ITimelineInstance {
		// Serves as an example of the entire pipeline as well
		const timeline: ITimeline = { tracks: tracks }
		TL.timeline_clean(timeline)
		TL.timeline_sort(timeline)

		const layout = TL.timeline_layout_create([timeline])
		const instance = TL.timeline_instance_create_empty(layout)
		TL.timeline_instance_set(instance, timeline)
		return instance
	}

	public static timeline_set_time(instance: ITimelineInstance, time: number) {
		for (let d = 0; d < instance.maxDims; d++) {
			const configs = instance.slicesClipDimData[d]
			const dim = d + 1;
			const stride = configs.stride;
			const length = configs.length / stride;
			const config_arr: Float32Array = configs.arr

			const clip_result_arr = instance.slicesClipDimResults[d].arr
			console.log(clip_result_arr)
			const track_result_arr = instance.slicesTrackDimResults[d].arr

			console.log(length, ` for dim: `, dim)

			for (let c = 0; c < length; c += 1) {
				const start = c * stride
				// Avoids branches. Will simply write to nill track
				const isActive: number = 1//Number(elapsed >= 0 && elapsed <= duration_ms)
				const t = Easing.evaluate(config_arr[start + ClipStride.EASE_ID]
					, Math.max(0, Math.min(1, (time - config_arr[start + ClipStride.START_TIME]) / config_arr[start + ClipStride.DURATION_MS])));

				const clip_result_cursor = 0
				const track_result_cursor = 0
				TL.lerp(0, t, config_arr, start + ClipStride.VALUES_START, dim, clip_result_cursor, track_result_cursor)
				// Calculate result for every value

				// dim_results_cursor+= dim
			}
		}
	}
	public static get_clip_viewer_result(timeline: ITimeline, trackclip: ITrackClip) { }
	public static get_clip_editor(timeline: ITimeline, trackclip: ITrackClip) { }
	public static get_track_viewer_result(timeline: ITimeline, track: ITrack) { }

	// Here for custom lerp features, such as lerping quaternions
	static lerp(lerp_type: LerpType, t: number, arr: Float32Array, start: number, dim: number, clip_result_cursor: number, track_result_cursor: number) {
		switch (lerp_type) {
			case LerpType.Lerp:
				for (let i = 0; i < dim; i++) {

					const offset = start + i * 2
					const result = arr[offset + ClipStride.VALUES_START] + (arr[offset + ClipStride.VALUES_DIFF] * t)
					console.log(`VALUE for ${i}: `, offset, arr[offset + ClipStride.VALUES_START])
					// clip_result_arr[c * dim + i] = result
					arr[clip_result_cursor + i] = result
					arr[track_result_cursor + i] = result
					// Writes to nill if inactive
					// track_result_arr[(config_arr[start + ClipStride.TRACK_IDX] * dim + i + 1) * isActive] = result

				}

				break
			case LerpType.LerpQuaternion:

				break
		}

	}

}
