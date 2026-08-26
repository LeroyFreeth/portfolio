export class CodeEventSingle<T> {
	/**
	 * @private
	 */
	_callbacks: ((arg: T) => void)[] = []

	constructor() {
	}

	/**
	 * @param handler
	 */
	addListener(handler: (arg: T) => void) {
		if (!handler) return
		for (let i = 0; i < this._callbacks.length; i++)
			if (this._callbacks[i] === handler)
				return
		this._callbacks.push(handler)
	}

	/**
	 * @param {} handler
	 */
	removeListener(handler: (arg: T[]) => void) {
		for (let i = 0; i < this._callbacks.length; i++)
			if (this._callbacks[i] === handler)
				this._callbacks.splice(i, 1)
	}

	/**
	 * @param args
	 */
	fire(arg: T) {
		for (let i = 0; i < this._callbacks.length; i++)
			this._callbacks[i](arg)
	}
}

export class CodeEventDuo<X, Y> {
	/**
	 * @private
	 */
	_callbacks: ((x: X, y: Y) => void)[] = []

	constructor() {
	}

	/**
	 * @param handler
	 */
	addListener(handler: (x: X, y: Y) => void) {
		if (!handler) return
		for (let i = 0; i < this._callbacks.length; i++)
			if (this._callbacks[i] === handler)
				return
		this._callbacks.push(handler)
	}

	/**
	 * @param {} handler
	 */
	removeListener(handler: (x: X, y: Y[]) => void) {
		for (let i = 0; i < this._callbacks.length; i++)
			if (this._callbacks[i] === handler)
				this._callbacks.splice(i, 1)
	}

	/**
	 * @param args
	 */
	fire(x: X, y: Y) {
		for (let i = 0; i < this._callbacks.length; i++)
			this._callbacks[i](x, y)
	}
}


// Works with any amount of arguments, but have to track their types yourself
export class CodeEvent {
	/**
	 * @private
	 */
	_callbacks: ((...args: any[]) => void)[] = []

	constructor() {
	}

	/**
	 * @param handler
	 */
	addListener(handler: (...args: any[]) => void) {
		if (!handler) return
		for (let i = 0; i < this._callbacks.length; i++)
			if (this._callbacks[i] === handler)
				return
		this._callbacks.push(handler)
	}

	/**
	 * @param {} handler
	 */
	removeListener(handler: (...args: any[]) => void) {
		for (let i = 0; i < this._callbacks.length; i++)
			if (this._callbacks[i] === handler)
				this._callbacks.splice(i, 1)
	}

	/**
	 * @param args
	 */
	fire(...args: any[]) {
		for (let i = 0; i < this._callbacks.length; i++)
			this._callbacks[i](...args)
	}
}
