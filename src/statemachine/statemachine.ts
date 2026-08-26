import { CodeEventDuo } from "../utilities/code-event"
import { RingBuffer } from "../utilities/ring-buffer"

export const enum TransitionDirection {
	NONE = 0,
	ENTER = 1,
	EXIT = 2,
}

export interface ISwitchStateContext {
	exiting: State | null,
	entering: State,
	meta: object,
}

let debug = true

export class State {
	statemachine: Statemachine | null
	is_init: boolean
	constructor(debug_mode: boolean = false) {
		this.is_init = false
		this.statemachine = null
		debug = debug_mode
	}

	validate(): boolean {
		// Check if ready for init
		return true
	}

	statemachine_set(statemachine: Statemachine) { this.statemachine = statemachine }

	init() {
		if (this.is_init) return
		if (!this.validate()) return
		this.is_init = true
	}

	enter(context: ISwitchStateContext, on_complete: () => void) { on_complete() }
	exit(context: ISwitchStateContext, on_complete: () => void) { on_complete() }
	reset() { }
}

export class Statemachine {
	states: State[]
	current_idx: number
	is_switching_state: boolean
	history: RingBuffer
	is_init: boolean
	on_state_changed: CodeEventDuo<State, State>
	constructor(states: State[]) {
		this.states = states
		this.current_idx = -1
		this.is_switching_state = false
		this.history = new RingBuffer(10)
		this.is_init = false
		this.on_state_changed = new CodeEventDuo<State, State>()
	}

	validate() {
		let is_invalid = false
		for (let i = 0; i < this.states.length; i++) {
			const state = this.states[i]
			const is_state = state instanceof State && state !== undefined && state !== null
			if (is_state) {
				is_invalid = !state.validate() || is_invalid
			}
			else {
				console.warn(`Could not validate state for index ${i}`)
				is_invalid = true
			}

		}
		return !is_invalid
	}

	// Expected to be initialized first
	init() {
		if (this.is_init) return
		const is_valid = this.validate()
		if (!is_valid) {
			console.error(`Could not initialize statemachine ${this.constructor.name} due to validation errors.`)
			return
		}

		for (const state of this.states) {
			state.init()
			state.statemachine_set(this)
		}
		this.reset()
		this.is_init = true
		this.switch_state_for_idx(0, false)
	}

	switch_to_previous_state() {
		/* TODO (Leroy):
			Implement ring buffer
		 */
		// this.switch_state_for_idx(this.history.pop())
	}

	switch_state_for_delta_idx(delta_idx: number) {
		const l = this.states.length
		const idx = (this.current_idx + l + (delta_idx % l)) % l
		this.switch_state_for_idx(idx, delta_idx === 0)
	}

	switch_state_for_idx(idx: number, allow_same_idx: boolean) {
		if (this.is_switching_state) {
			if (debug) console.warn('Already switching states')
			return
		}
		if (idx < 0 || idx > this.states.length) {
			if (debug) console.warn(`No state found for idx ${idx}`)
			return
		}
		if (!allow_same_idx && idx === this.current_idx) {
			if (debug) console.warn(`Already in state for idx ${idx}`)
			return
		}
		this.is_switching_state = true

		const exiting_state = this.current_idx < 0 ? null : this.states[this.current_idx]
		const entering_state = this.states[idx]
		const context: ISwitchStateContext = {
			exiting: exiting_state,
			entering: entering_state,
			meta: {}
		}
		const on_enter_complete = () => {
			if (debug) console.log('Entered state ', this.current_idx)
		}
		if (!exiting_state) {
			if (debug) console.log('Now entering state ', idx)
			this.is_switching_state = false
			this.current_idx = idx
			entering_state.enter(context, on_enter_complete)
			this.on_state_changed.fire(entering_state, entering_state)
		}
		else {
			const on_exit_complete = () => {
				if (debug) console.log('Exited state ', this.current_idx, ' and now entering state ', idx)
				this.is_switching_state = false
				this.history.push(this.current_idx)
				this.current_idx = idx
				entering_state.enter(context, on_enter_complete)
				this.on_state_changed.fire(exiting_state, entering_state)
			}
			if (debug) console.log('Now exiting state ', this.current_idx)
			exiting_state.exit(context, on_exit_complete)
		}



	}

	switch_state(state: State, allow_same_state: boolean) { this.switch_state_for_idx(this.states.indexOf(state), allow_same_state) }


	get_state_idx(state: State) { return this.states.indexOf(state) }


	get_state() { return this.states[this.current_idx] }
	reset() {
		for (const state of this.states) {
			state.reset()
		}
		this.switch_state_for_idx(0, true)
	}
}
