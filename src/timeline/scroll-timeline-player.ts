
import type { ITickable } from "../three-js/level";
import type { Timeline } from "./timeline";

class ScrollTimelinePlayer implements ITickable {

    private _timeline: Timeline
    private _duration: number

    private _smoothness: number
    private _current_value: number

    private _enabled: boolean

    get ticking(): boolean { return this._enabled }

    get normalized_scroll() { return this._current_value }

    private get get_normalized_scroll(): number {
        const max_scroll = document.documentElement.scrollHeight - (window.innerHeight)
        return max_scroll > 0 ? window.scrollY / max_scroll : 1
    }

    set enabled(enable: boolean) {
        this._enabled = enable
    }

    constructor(timeline: Timeline, dampen: number) {
        this._timeline = timeline
        this._duration = timeline.calc_duration()

        this._smoothness = Math.max(Math.min(1 - dampen, 1), 0.01)
        this._current_value = 0
        this._enabled = true
    }

    public tick() {
        if (!this._enabled) return

        const n = this.get_normalized_scroll
        const diff = n - this._current_value
        this._current_value += diff * this._smoothness
        this._timeline.process(this._current_value * this._duration)
        this._timeline.update_bindings()
    }

    update_duration() {
        this._duration = this._duration = this._timeline.calc_duration()
    }

    static get_normalized_scroll_for_y(y: number, header_height: number) {
        const scroll = (y + (window.scrollY + header_height) - window.innerHeight) / ((document.documentElement.scrollHeight) - window.innerHeight)
        return scroll
    }

    static get_normalized_scroll_for_screen_height() {
        return window.innerHeight / (document.documentElement.scrollHeight - window.innerHeight)
    }
}

export { ScrollTimelinePlayer }