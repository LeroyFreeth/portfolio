export class Pool<T> {
	items: T[]
	capacity: number
	length: number
	dummy: T
	constructor(item_constructor: (() => T), capacity: number) {
		this.items = new Array(capacity)
		for (let i = 0; i < capacity; ++i) {
			this.items[i] = item_constructor()
		}
		this.dummy = item_constructor()
		this.capacity = capacity
		this.length = 0
	}

	claim(): T {
		if (this.length >= this.capacity) {
			console.error('Claim failed - Full pool capacity utilized - Returning dummy')
			return this.dummy
		}
		return this.items[this.length++]
	}

	free(item: T) {
		if (!item) return
		const idx = this.items.indexOf(item)
		if (idx < 0 || idx > this.length) {
			console.error('Idx out of range - ', idx)
			return
		}
		const t = this.items[idx]
		this.items[idx] = this.items[--this.length]
		this.items[this.length] = t
	}
}

