import * as THREE from 'three'

export class TextureLoadQueue {

	textures: THREE.Texture[]
	urls: string[]
	cursor: number

	load_queue: { url: string, cb: null | ((texture: THREE.Texture) => void) }[]
	min_wait_time: number
	last_load_start: number
	is_loading: boolean

	loader: THREE.ImageBitmapLoader

	constructor(size: number) {
		this.textures = new Array(size)
		this.urls = new Array(size)
		this.cursor = 0
		this.load_queue = []
		this.is_loading = false
		this.loader = new THREE.ImageBitmapLoader()
		this.loader.setOptions({ imageOrientation: 'flipY' }); // set options if needed
		this.last_load_start = Date.now()
		this.min_wait_time = 50 
	}

	load(url: string, priority: boolean, cb: null | ((texture: THREE.Texture) => void)) {
		const idx = this.urls.indexOf(url)
		if (idx >= 0) {
			if (cb) cb(this.textures[idx])
			return
		}

		if (priority) {
			const arr = [{ url: url, cb: cb }]
			this.load_queue = [...arr, ...this.load_queue]
		}
		else {
			this.load_queue.push({ url: url, cb: cb })
		}
		this._queue_load()
	}

	_queue_load() {
		if (this.is_loading) return
		if (this.load_queue.length === 0) return
		this.is_loading = true
		this._load_next()
	}

	_wait(time: number) {
		return new Promise((resolve) => {setTimeout(() => { resolve('resolved')}, time)})
	}

	async _load_next() {
		if (this.load_queue.length === 0) {
			this.is_loading = false
			return
		}
		
		const now = Date.now()
		const delta = now - this.last_load_start
		const wait_time = Math.max(0, this.min_wait_time - delta)
		await this._wait(wait_time)
		this.last_load_start = Date.now()
		
		const queued_element = this.load_queue.splice(0, 1)[0]
		const url = queued_element.url
		const imageBmp = await this.loader.loadAsync(url)
		const texture = new THREE.Texture(imageBmp)
		texture.needsUpdate = true
		// console.log('loaded')
		this.textures[this.cursor] = texture
		this.urls[this.cursor] = url
		this.cursor = (this.cursor + 1) % this.textures.length
		if (queued_element.cb) queued_element.cb(texture)


		this._load_next()

	}
}
