export enum PointerType {
	UNKNOWN = 0,
	MOUSE = 1,
	TOUCH = 2,
	AXIS = 3,
}

export interface Vector2 {
	x: number,
	y: number,
}

export interface PointerData {
	type: PointerType
	state_changed: boolean
	// true === down
	state: boolean
	state_ms: number
	cur_pos: Vector2
	prev_pos: Vector2
}

function pointer_data_create() {
	return {
		type: PointerType.UNKNOWN,
		state_changed: false,
		state: false,
		state_ms: 0,
		cur_pos: { x: 0, y: 0 } as Vector2,
		prev_pos: { x: 0, y: 0 } as Vector2,
	}
}

export interface UniqueInputData {
	zoom: number
	hold_first_touch: boolean
	// angle: number
	// swipe: Vector2
	// swipe_id: number // Increments every swipe, to validate swipe 'versions'
}

const wheel_zoom_amount = 1.25

// Touch and mouse support. Can also add some simple gestures.
export class Pointers {

	target: HTMLElement

	_target_states: boolean[]
	_pointer_arr: PointerData[]
	_unique_input_data: UniqueInputData

	_initial_duo_touch_zoom: number
	_initial_duo_touch_distance: number
	_initial_duo_touch_angle: number

	_enabled: boolean

	get_pointers_data(): PointerData[] { return this._pointer_arr }
	get_unique_input_data(): UniqueInputData { return this._unique_input_data }

	constructor(element: HTMLElement, max_pointers: number, start_enabled: boolean) {
		this.target = element
		this._target_states = new Array(max_pointers).fill(false)
		this._pointer_arr = new Array(max_pointers)
		for (let i = 0; i < max_pointers; ++i) this._pointer_arr[i] = pointer_data_create()

		this._unique_input_data = {
			zoom: 1,
			// angle: 0,
			// swipe: { x: 0, y: 0 },
			// swipe_id: 0,
			hold_first_touch: false,
		}

		this._initial_duo_touch_zoom = 1
		this._initial_duo_touch_distance = 1
		this._initial_duo_touch_angle = 0
		this._enabled = !start_enabled
		this.set_enabled(start_enabled)
	}

	reset_pointers() {
		for (let i = 0; i < this._pointer_arr.length; ++i) {
			const pointer = this._pointer_arr[i]
			pointer.type = PointerType.UNKNOWN
			pointer.state_changed = false
			pointer.state = false
			pointer.state_ms = 0
			pointer.cur_pos.x = pointer.cur_pos.y = 0
			pointer.prev_pos.x = pointer.prev_pos.y = 0
		}
	}

	set_enabled(enable: boolean) {
		if (this._enabled === enable) return
		this._enabled = enable
		if (enable) {
			this.target.addEventListener('mousedown', this._on_mouse_down)
			window.addEventListener('mousemove', this._on_mouse_move)
			window.addEventListener('mouseup', this._on_mouse_up)
			window.addEventListener('mouseout', this._on_mouse_up)
			this.target.addEventListener('wheel', this._on_wheel)

			this.target.addEventListener('touchstart', this._on_touch_down)
			window.addEventListener('touchmove', this._on_touch_move)
			window.addEventListener('touchend', this._on_touch_up)
		}
		else {
			this.target.removeEventListener('mousedown', this._on_mouse_down)
			window.removeEventListener('mousemove', this._on_mouse_move)
			window.removeEventListener('mouseup', this._on_mouse_up)
			window.removeEventListener('mouseout', this._on_mouse_up)
			window.removeEventListener('wheel', this._on_wheel)

			this.target.removeEventListener('touchstart', this._on_touch_down)
			window.removeEventListener('touchmove', this._on_touch_move)
			window.removeEventListener('touchend', this._on_touch_up)
		}
	}
	_on_mouse_down = (e: MouseEvent) => {
		this._target_states[e.button] = true
		const mouse_pointer = this._pointer_arr[e.button]
		mouse_pointer.type = PointerType.MOUSE
		const l = this._pointer_arr.length
		for (let i = 0; i < l; ++i) {
			const pointer = this._pointer_arr[i]
			pointer.prev_pos.x = e.clientX
			pointer.prev_pos.y = e.clientY
		}
	}
	_on_mouse_move = (e: MouseEvent) => {
		const l = this._pointer_arr.length
		for (let i = 0; i < l; ++i) {
			const pointer = this._pointer_arr[i]
			pointer.cur_pos.x = e.clientX
			pointer.cur_pos.y = e.clientY
		}
	}
	_on_mouse_up = (e: MouseEvent) => {
		this._target_states[e.button] = false
	}

	_on_wheel = (e: WheelEvent) => {
		this._unique_input_data.zoom *= Math.sign(e.deltaY) > 0 ? wheel_zoom_amount : 1 / wheel_zoom_amount
	}
	_on_touch_down = (e: TouchEvent) => {
		const l = Math.min(e.touches.length, this._pointer_arr.length)
		for (let i = 0; i < l; ++i) {
			this._target_states[i] = true
			const pointer = this._pointer_arr[i]
			pointer.type = PointerType.TOUCH
			pointer.prev_pos.x = e.touches[i].clientX
			pointer.prev_pos.y = e.touches[i].clientY
			pointer.cur_pos.x = e.touches[i].clientX
			pointer.cur_pos.y = e.touches[i].clientY
			console.log(pointer.prev_pos, pointer.cur_pos)
		}

		if (l >= 2) {
			this._initial_duo_touch_zoom = this._unique_input_data.zoom
			this._initial_duo_touch_distance = Pointers.get_pinch_distance_for_touch(e.touches[0], e.touches[1])
		}
	}
	_on_touch_move = (e: TouchEvent) => {
		e.preventDefault()
		const l = Math.min(e.touches.length, this._pointer_arr.length)
		for (let i = 0; i < l; ++i) {
			const pointer = this._pointer_arr[i]
			pointer.cur_pos.x = e.touches[i].clientX
			pointer.cur_pos.y = e.touches[i].clientY

			console.log(pointer.prev_pos, pointer.cur_pos)
		}

		if (l >= 2) {
			const dist = Pointers.get_pinch_distance_for_touch(e.touches[0], e.touches[1])
			this._unique_input_data.zoom = this._initial_duo_touch_zoom * (this._initial_duo_touch_distance / dist)
		}
	}
	_on_touch_up = (e: TouchEvent) => {
		const l = Math.min(e.touches.length, this._pointer_arr.length)
		for (let i = l; i < this._pointer_arr.length; ++i) {
			this._target_states[i] = false
		}
	}

	update(delta_ms: number) {
		for (let i = 0; i < this._pointer_arr.length; ++i) {
			const pointer = this._pointer_arr[i]

			if (this._target_states[i] !== pointer.state) {
				pointer.state = this._target_states[i]
				pointer.state_changed = true
			}
			else if (pointer.state_changed) {
				pointer.state_changed = false
				// State_ms gets updated after a state change check. This gives the opportunity to read the last states duration
				pointer.state_ms = 0
			}

			pointer.prev_pos.x = pointer.cur_pos.x
			pointer.prev_pos.y = pointer.cur_pos.y
			pointer.state_ms += delta_ms
		}
		// Can implement default hold behaviours here
	}

	static get_pinch_distance_for_touch(a: Touch, b: Touch): number {
		return Math.hypot(
			a.clientX - b.clientX,
			a.clientY - b.clientY,
		)
	}
	static get_angle_for_duo_touch(a: Touch, b: Touch): number {
		return Math.atan2(
			b.clientY - a.clientY,
			b.clientX - a.clientX
		)

	}
}
