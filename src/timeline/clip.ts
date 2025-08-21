import type { EASE_TYPE } from "./easings"

class Clip {
    start_value: number
    end_value: number
    easing: EASE_TYPE
    duration: number

    constructor(start_value: number, end_value: number, duration: number, easing: EASE_TYPE) {
        this.start_value = start_value
        this.end_value=  end_value
        this.duration = duration
        this.easing = easing
    }
}

export { Clip as ClipData }