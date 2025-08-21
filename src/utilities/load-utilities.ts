/** Do not mix loading with and without Ids */
class LoadDependencyHelper {
    _loadDependencyCount: number = 0
    _loadDepedencyIds: string[] = []
    _callback_arr: ((...args: any[]) => void)[]

    _has_loaded: boolean

    get loaded(): boolean { return this._has_loaded }

    constructor(loadDependencies: number | string[], callback: (...args: any[]) => void) {
        if (typeof(loadDependencies) == 'number')
            this._loadDependencyCount = loadDependencies
        else if (Array.isArray(loadDependencies) && loadDependencies.every(item => typeof item === "string")) {
            this._loadDependencyCount = loadDependencies.length
            this._loadDepedencyIds = loadDependencies
        }
        this._has_loaded = false
        this._callback_arr = [callback]
    }

    loadedDependency(id: string | null = null) {
        if (this._has_loaded) return
        if (this._loadDependencyCount <= 0) return
        if (this._loadDepedencyIds.length > 0) {
            if (typeof(id) != 'string') return
            const index = this._loadDepedencyIds.indexOf(id)
            this._loadDepedencyIds.splice(index, 1)
        }
        this._loadDependencyCount -= 1
        if (this._loadDependencyCount > 0) return
        for(const callback of this._callback_arr) callback()
        this._has_loaded = true
    }

    add_callback_on_loaded(callback: (...args: any[]) => void) {
        this._callback_arr.push(callback)
    }
}

export { LoadDependencyHelper }