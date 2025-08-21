import type { ITickable } from "../three-js/level"
import { Timeline } from "./timeline"
import { OUT_OF_BOUNDS_TYPE } from "./track"

class TimelinePlayer implements ITickable {

    _time: number
    _timeline: Timeline
    _speed: number
    _out_of_bounds: OUT_OF_BOUNDS_TYPE
    _reverse: boolean
    _duration: number
    _is_playing: boolean
    _elapsed_interval_time: number
    _on_complete: () => void

    get ticking(): boolean { return this._is_playing }

    //set on_complete(value: () => void) { this._on_complete = value }




    constructor(timeline: Timeline, out_of_bounds: OUT_OF_BOUNDS_TYPE) {
        this._time = 0
        this._timeline = timeline
        this._speed = 1
        this._reverse = false
        this._out_of_bounds = out_of_bounds
        this._duration = timeline.calc_duration()
        this._is_playing = false
        this._elapsed_interval_time = 0

        this._on_complete = () => {}
    }

    public tick(delta: number): void {
        if (!this._is_playing) return


        this._time = Math.max(Math.min(this._time + delta * this._speed, this._duration), 0)
        this._timeline.process(this._time)
        this._timeline.update_bindings()

        if ((this._time >= this._duration && !this._reverse) || (this._time <= 0 && this._reverse)) {
            switch (this._out_of_bounds) {
                case OUT_OF_BOUNDS_TYPE.HOLD:
                    this.pause()
                    this._on_complete()
                    break
                case OUT_OF_BOUNDS_TYPE.LOOP:
                    this._time = (this._time >= this._duration && !this._reverse) ? 0 : this._duration
                    break
                case OUT_OF_BOUNDS_TYPE.RESET:
                    this.stop()
                    this._on_complete()
                    break
            }
        }
    }

    set_reverse(enable: boolean) {
        if (this._reverse == enable) return
        this._speed = Math.abs(this._speed) * (enable ? -1 : 1)
        this._reverse = enable
    }

    set_speed(speed: number) {
        this._speed = speed
        this._reverse = Math.sign(speed) < 0
    }

    play(on_complete_cb: () => void = () => {}) {
        this._is_playing = true
        this._on_complete = on_complete_cb
    }

    pause() {
        this._is_playing = false
    }

    reset() {
        this._time = this._reverse ? this._duration : 0
        this._elapsed_interval_time = 0
        this._timeline.process(this._time)
    }

    stop() {
        this.pause()
        this.reset()
    }


}

export { TimelinePlayer }