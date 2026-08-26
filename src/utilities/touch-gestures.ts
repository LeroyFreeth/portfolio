import { CodeEventDuo } from "./code-event"
import { EventBundler } from "./event-bundler"

export class TouchGestures {

	enabled: boolean
	event_bundler: EventBundler

	initial_dist: number
	initial_angle: number
	initial_point: { x: number, y: number }

	// New distance, Initial distance - Implementer can decide to normalize or anything of the sorts
	on_pinch_changed: CodeEventDuo<number, number>
	// New angle, Initial angle - Implementer can decide to normalize or anything of the sorts
	on_angle_changed: CodeEventDuo<number, number>
	constructor(el: HTMLElement) {
		this.enabled = true
		this.event_bundler = new EventBundler([
			{ element: el, event_type: 'touchdown', callback: this._touch_down },
			{ element: el, event_type: 'touchmove', callback: this._touch_move },
			{ element: el, event_type: 'touchend', callback: this._touch_up },
		])
		this.initial_dist = 1
		this.initial_angle = 0
		this.initial_point = { x: 0, y: 0 }
		this.on_pinch_changed = new CodeEventDuo()
		this.on_angle_changed = new CodeEventDuo()
	}
	set_enabled(enable: boolean) {
		this.event_bundler.set_enabled(enable)
	}


	_touch_down = (e: TouchEvent) => {
		if (e.touches.length === 1) {
			// Implement single touch gestures here
		} else if (e.touches.length === 2) {
			const a = e.touches[0]
			const b = e.touches[1]
			this.initial_dist = TouchGestures.get_pinch_distance_for_touch(a, b)
			this.initial_angle = TouchGestures.get_angle_for_duo_touch(a, b)
			this.initial_point = {
				x: (a.clientX + b.clientX) * 0.5,
				y: (a.clientY + b.clientY) * 0.5
			}
		}
	}

	_touch_move(e: TouchEvent) {
		if (e.touches.length === 1) {
			// Implement single touch gestures here
		} else if (e.touches.length === 2) {
			const dist = TouchGestures.get_pinch_distance_for_touch(e.touches[0], e.touches[1])
			this.on_pinch_changed.fire(dist, this.initial_dist)
			const angle = TouchGestures.get_angle_for_duo_touch(e.touches[0], e.touches[1])
			this.on_angle_changed.fire(angle, this.initial_angle)
		}

	}

	_touch_up = (e: TouchEvent) => {
		if (e.touches.length !== 1) return

	}
}


