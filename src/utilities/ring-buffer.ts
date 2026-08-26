
export class RingBuffer {
	arr: any[]
	idx: number
	constructor(size: number) {
		this.arr = new Array(size)
		this.idx = 0
	}
	set(idx: number, item: any) {
		const l = this.arr.length
		this.arr[((this.idx - idx) + l) % l] = item
	}

	get(idx: number) {
		const l = this.arr.length
		if (idx >= l) return null
		idx = ((this.idx - idx) + l) % l
		return this.arr[idx]
	}
	length() { return this.arr.length }
	push(item: any) {
		this.arr[this.idx] = item
		this.idx = (this.idx + 1) % this.arr.length
	}
	includes(item: any) {
		return arr.includes(item)
	}
	
}
