import { ClipData as Clip } from "./clip"
import { EASE_TYPE, ease } from "./easings"


enum OUT_OF_BOUNDS_TYPE {
    RESET = 0,
    HOLD = 1,
    LOOP = 2,
}

class TrackClip {

    clip_data: Clip
    start: number
    //end: number
    pre: OUT_OF_BOUNDS_TYPE
    post: OUT_OF_BOUNDS_TYPE

    constructor(clip_data: Clip, at: number, pre: OUT_OF_BOUNDS_TYPE, post: OUT_OF_BOUNDS_TYPE) {
        this.clip_data = clip_data
        this.start = at
        this.pre = pre
        this.post = post
    }

    get_value(time: number): number {
        let n = 0
        if (time < this.start) {
            switch (this.pre) {
                case OUT_OF_BOUNDS_TYPE.RESET: return 0
                case OUT_OF_BOUNDS_TYPE.HOLD: break
                case OUT_OF_BOUNDS_TYPE.LOOP:
                    n = (this.start + time) % this.clip_data.duration
                    break
            }
        } else if (time > (this.clip_data.duration + this.start)) {
            switch (this.post) {
                case OUT_OF_BOUNDS_TYPE.RESET: return 0
                case OUT_OF_BOUNDS_TYPE.HOLD:
                    n = 1
                    break
                case OUT_OF_BOUNDS_TYPE.LOOP:
                    n = time % this.clip_data.duration
                    break
            }
        } else {
            n = (time - this.start) / this.clip_data.duration
        }
        n = ease(this.clip_data.easing, n)
        return this.clip_data.start_value + n * (this.clip_data.end_value - this.clip_data.start_value)
    }

    static create_track_clip(start: number, duration: number, start_value: number, end_value: number, easing: EASE_TYPE, pre: OUT_OF_BOUNDS_TYPE, post: OUT_OF_BOUNDS_TYPE): TrackClip {
        const clip = new Clip(start_value, end_value, duration, easing)
        return new TrackClip(clip, start, pre, post)
    }
}

class Track {
    _id: string
    _track_clip_data_arr: TrackClip[]
    _enabled: boolean
    _track_value: number

    get track_clip_data_arr(): TrackClip[] { return this._track_clip_data_arr }
    get id(): string { return this._id }
    get enabled(): boolean { return this.enabled }
    get track_value(): number { return this._track_value }

    constructor(id: string, track_clip_arr: TrackClip[] = []) {
        this._id = id
        this._track_clip_data_arr = []
        for (const track_clip of track_clip_arr) this.add_track_clip(track_clip)
        this._enabled = true
        this._track_value = 0
    }

    add_track_clip(track_clip: TrackClip): void {
        const clip_end = track_clip.start + track_clip.clip_data.duration
        for (const other_track_clip of this._track_clip_data_arr) {
            const other_clip_end = other_track_clip.start + other_track_clip.clip_data.duration
            if ((track_clip.start <= other_track_clip.start || track_clip.start >= other_clip_end) && (clip_end <= other_track_clip.start || other_clip_end)) continue
            console.warn("Clip invalid - Overlaps with other clip")
            return
        }
        this._track_clip_data_arr.push(track_clip)
        this._track_clip_data_arr.sort((a, b) => { return a.start - b.start })
    }

    remove_track_clip(track_clip: TrackClip): void {
        const index = this._track_clip_data_arr.indexOf(track_clip)
        if (index < 0) return
        this._track_clip_data_arr.splice(index, 1)
    }

    update_track_value(time: number) {
        if (!this._enabled) return
        let track_value = 0
        // Find clips
        const l = this._track_clip_data_arr.length;
        for (let i = 0; i < l; i++) {
            const clip = this._track_clip_data_arr[i]
            if (clip.clip_data.duration === 0) continue
            const clip_end = clip.start + clip.clip_data.duration
            if (time > clip_end) {
                if (i + 1 < l) continue
                track_value = clip.get_value(time)
                break
            } else if (time >= clip.start && time <= clip_end) {
                track_value = clip.get_value(time)
                break
            } else if (time < clip.start) {
                // Solve for pre, check for previous clip
                // if (i > 0) {
                //     const previous_clip = this.track_clip_data_arr[i - 1]
                //     const previous_clip_end = previous_clip.start + previous_clip.clip_data.duration
                //     const lerp_value = (time - clip.start) / (clip.start - previous_clip_end)
                //     track_value = previous_clip.get_value(time) * lerp_value + clip.get_value(time) * (1.0 - lerp_value)

                // } else
                    track_value = clip.get_value(time)
                break
            }
        }
        this._track_value = track_value
    }
}

export { OUT_OF_BOUNDS_TYPE, Track, TrackClip }