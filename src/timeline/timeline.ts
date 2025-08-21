import { type Track } from "./track";

enum CLIP_DATA_ID {
    START_TIME = 0,
    DURATION = 1,
    EASE_TYPE = 2,
    START_VALUE = 3,
    DIFF_VALUE = 4,
    BLEND_VALUE = 5,

    // Currently disabled. Allows clip values to be stored within the array. 
    // Requires an additional loop to add all the individual clip values
    // Remains commented, as it is preparing the code for multithreading (which this version won't be)
    // Eventually might run on webgpu compute shader if sending bottleneck isn't too large
    // CLIP_VALUE = 6,
}
const CLIP_ELEMENT_COUNT = Object.keys(CLIP_DATA_ID).length / 2

// const BLEND_WIDTH = 1
// const FROM_BLEND_VALUE = (1 << BLEND_WIDTH) - 1
// const TO_BLEND_VALUE = (FROM_BLEND_VALUE << BLEND_WIDTH)

class Timeline {
    _track_id_arr: string[]
    _clip_data_arr: number[]
    _track_index_arr: number[]
    _track_value_arr: number[]

    _bindings: ((x: number) => void)[][]

    _track_arr: Track[]

    constructor() {
        this._track_id_arr = []
        this._clip_data_arr = []
        this._track_index_arr = []
        this._track_value_arr = []
        this._bindings = []
        this._track_arr = []
    }

    /**
     * Once a track is integrated, it cannot be removed
     * @param track
     * @param id 
     * @returns 
     */
    public integrate_track(track: Track): void {
        if (this._track_id_arr.includes(track.id)) {
            console.warn(`Track already exists - ${track._id}`)
            return
        }

        const track_index = this._track_id_arr.length

        this._track_id_arr.push(track.id)
        this._track_value_arr.push(0)
        this._track_index_arr.push(0)

        // TODO: None intergrated tracks shouldn't be added to this.
        // Just a temporary inclusion for dynamic timelines
        this._track_arr.push(track)

        // var previous_post = OUT_OF_BOUNDS_TYPE.HOLD
        // var previous_end_time = 0
        for (let i = 0; i < track._track_clip_data_arr.length; i++) {

            const track_clip_data = track._track_clip_data_arr[i]
            const clip_data = track_clip_data.clip_data

            // var blend_delta = track_clip_data.start - previous_end_time
            // if (blend_delta > 0) {
                // TODO: Implement this correctly. Due to switching for dynamic timelines for reasons, this got shelfed.
                // However, timelines aren't dynamic anymore. So this should be reinstated.

                
                // Have to add a clip here for blending the 2 different clip states
                // const blend_with_previous = previous_post != OUT_OF_BOUNDS_TYPE.IGNORE
                // const blend_with_current = track_clip_data.pre != OUT_OF_BOUNDS_TYPE.IGNORE

                // const delta = Number(blend_with_previous) ^ Number(blend_with_current)

                // const previous_blend_value = FROM_BLEND_VALUE | (delta * TO_BLEND_VALUE)
                // const current_blend_value = TO_BLEND_VALUE | (delta * FROM_BLEND_VALUE)

                // console.log(`Prev: ${blend_with_previous}, cur: ${blend_with_current} -> ${delta} --> ${(delta * FROM_BLEND_VALUE)}`)
                // console.log(`Prev blend value: ${previous_blend_value}`)
                // console.log(`Current blend value: ${current_blend_value}`)

                // if (blend_with_previous) {
                //     var previous_track_clip_data = track._track_clip_data_arr[i - 1]
                //     const previous_clip_data = previous_track_clip_data.clip_data

                //     switch (previous_track_clip_data.post) {
                //         case OUT_OF_BOUNDS_TYPE.HOLD:
                //             // this.clip_data_arr.concat([blend_start, blend_delta, previous_clip_data.easing, previous_clip_data.end_value, 0, previous_blend_value, 0])
                //             this._clip_data_arr = this._clip_data_arr.concat([previous_end_time, blend_delta, previous_clip_data.easing, previous_clip_data.end_value, 0, previous_blend_value])
                //             console.log(this._clip_data_arr)
                //             break
                //         case OUT_OF_BOUNDS_TYPE.LOOP:
                //             // this.clip_data_arr.concat([blend_start, blend_delta, previous_clip_data.easing, previous_clip_data.start_value, previous_clip_data.end_value - previous_clip_data.start_value, previous_blend_value, 0])
                //             this._clip_data_arr = this._clip_data_arr.concat([previous_end_time, blend_delta, previous_clip_data.easing, previous_clip_data.start_value, previous_clip_data.end_value - previous_clip_data.start_value, previous_blend_value])
                //             break
                //         case OUT_OF_BOUNDS_TYPE.RESET:
                //             // this.clip_data_arr.concat([blend_start, blend_delta, previous_clip_data.easing, previous_clip_data.start_value, 0, previous_blend_value, 0])
                //             this._clip_data_arr = this._clip_data_arr.concat([previous_end_time, blend_delta, previous_clip_data.easing, previous_clip_data.start_value, 0, previous_blend_value])
                //             break
                //     }
                //     this._track_index_arr[track_index] += CLIP_ELEMENT_COUNT
                // }

                // if (blend_with_current) {                   
                //     switch (track_clip_data.pre) {
                //         case OUT_OF_BOUNDS_TYPE.HOLD:
                //             // Technically can make easing linear
                //             // this.clip_data_arr.concat([blend_start, blend_delta, clip_data.easing, clip_data.end_value, 0, current_blend_value, 0])
                //             this._clip_data_arr = this._clip_data_arr.concat([previous_end_time, blend_delta, clip_data.easing, clip_data.start_value, 0, current_blend_value])
                //             break
                //         case OUT_OF_BOUNDS_TYPE.LOOP:
                //             // this.clip_data_arr.concat([blend_start, blend_delta, clip_data.easing, clip_data.start_value, clip_data.end_value - clip_data.start_value, current_blend_value, 0])
                //             this._clip_data_arr = this._clip_data_arr.concat([previous_end_time, blend_delta, clip_data.easing, clip_data.start_value, clip_data.end_value - clip_data.start_value, current_blend_value])
                //             break
                //         case OUT_OF_BOUNDS_TYPE.RESET:
                //             // this.clip_data_arr.concat([blend_start, blend_delta, clip_data.easing, clip_data.start_value, 0, current_blend_value, 0])
                //             this._clip_data_arr = this._clip_data_arr.concat([previous_end_time, blend_delta, clip_data.easing, clip_data.start_value, 0, current_blend_value])
                //             break
                //     }
                //     this._track_index_arr[track_index] += CLIP_ELEMENT_COUNT
                // }
            // }
            // this.clip_data_arr.concat([track_clip_data.start, clip_data.duration, clip_data.easing, clip_data.start_value, clip_data.end_value, (BLEND_NORMALIZER << BLEND_WIDTH) | BLEND_NORMALIZER, 0])
            this._clip_data_arr = this._clip_data_arr.concat([track_clip_data.start, clip_data.duration, clip_data.easing, clip_data.start_value, clip_data.end_value - clip_data.start_value, 1 << 1 | 1])
            this._track_index_arr[track_index] += CLIP_ELEMENT_COUNT

            // previous_post = track_clip_data.post
            // previous_end_time = track_clip_data.start + track_clip_data.clip_data.duration

            // console.log("Track added - ", track._id, ' - ', this._clip_data_arr)
        }
    }

    public process_integrated(): void {
        // Reset all values to 0
        for (let i = 0; i < this._track_value_arr.length; i++) this._track_value_arr[i] = 0

        // const clip_arr = this._clip_data_arr
        // let track_index = 0
        // for (let i = 0; i < this._clip_data_arr.length; i += CLIP_ELEMENT_COUNT) {
        //     if (i >= this._track_index_arr[track_index]) track_index += 1

        //     const duration = clip_arr[i + CLIP_DATA_ID.DURATION]
        //     let n = (time - clip_arr[i]) / duration
        //     const isWithinClip = n >= 0 && n <= 1
        //     if (!isWithinClip) continue

        //     var ease_n_blended = ease(clip_arr[i + CLIP_DATA_ID.EASE_TYPE], n)
        //     var value = clip_arr[i + CLIP_DATA_ID.START_VALUE] + ease_n_blended * clip_arr[i + CLIP_DATA_ID.DIFF_VALUE]
        //     const blend_value = clip_arr[i + CLIP_DATA_ID.BLEND_VALUE]
        //     const blend_from = (blend_value & FROM_BLEND_VALUE) / FROM_BLEND_VALUE
        //     const blend_to = ((blend_value >> BLEND_WIDTH) & FROM_BLEND_VALUE) / FROM_BLEND_VALUE
        //     value *= ((1 - n) * blend_from) + ((n) * blend_to)

        //     this._track_value_arr[track_index] += value
        // }
    }

    public process(time: number): void {
        for (let i = 0; i < this._track_arr.length; i++) {
            this._track_arr[i].update_track_value(time)
            this._track_value_arr[i] = this._track_arr[i].track_value
        }
    }

    public bind_to_track(id: string, target: any, property: string): void {
        const index = this._track_id_arr.indexOf(id)
        if (index < 0) {
            console.warn(`Track could not be found for id - ${id}`)
            return
        }
        if (!this._bindings[index]) this._bindings[index] = []
        if (property in target) {
            this._bindings[index].push((value) => {
                target[property] = value
            })
        }
    }


    public update_bindings(): void {
        let i = 0
        for (const key in this._bindings) {
            const bindings = this._bindings[key];
            for (const binding of bindings) binding(this._track_value_arr[i])
            i += 1
        }
    }


    public calc_duration(): number {
        var duration = 0
        for (let i = 0; i < this._clip_data_arr.length; i += CLIP_ELEMENT_COUNT) {
            // console.log(`Clip start: ${this._clip_data_arr[i + CLIP_DATA_ID.START_TIME]} for i ${i}, iterating in steps of ${Object.keys(CLIP_DATA_ID)}`)
            duration = Math.max(duration, this._clip_data_arr[i + CLIP_DATA_ID.START_TIME] + this._clip_data_arr[i + CLIP_DATA_ID.DURATION])
        }
        return duration
    }
}

export { Timeline }