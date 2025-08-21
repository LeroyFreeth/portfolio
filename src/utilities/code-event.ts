class CodeEvent {
    /**
     * @private
     */
    _callbacks: { priority: number, func: (...args: any[]) => void }[] = []

    constructor() {
    }

    /**
     * @param handler
     * @param Higher priority will be called earlier
     */
    add_handler(handler: (...args: any[]) => void, priority: number = 0) {
        if (!handler) return

        for (let i = 0; i < this._callbacks.length; i++)
            if (this._callbacks[i].func === handler)
                return

        this._callbacks.push({ priority: priority, func: handler })
        this._callbacks.sort((a, b) => {
            return b.priority - a.priority
        })
    }

    /**
     * @param {} handler
     */
    remove_handler(handler: (...args: any[]) => void) {
        for (let i = 0; i < this._callbacks.length; i++)
            if (this._callbacks[i].func === handler)
                this._callbacks.splice(i, 1)
    }

    /**
     * @param args
     */
    fire(...args: any[]) {
        for (let i = 0; i < this._callbacks.length; i++)
            this._callbacks[i].func(...args)
    }
}

export { CodeEvent }