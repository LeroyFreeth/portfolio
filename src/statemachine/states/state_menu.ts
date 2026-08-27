import { State, type ISwitchStateContext } from "../statemachine"
import { CodeEventDuo } from "../../utilities/code-event"
import type { RectCache } from "../../utilities/rect-cache"
import { EventBundler } from "../../utilities/event-bundler"

export type GridData = {
	img_url: string
	span_x: number,
	span_y: number,
}

export class StateGridMenu extends State {
	container: HTMLElement
	grid_data_arr: GridData[]
	items: HTMLElement[]
	hovering_item: boolean
	idx: number
	grid: HTMLElement
	event_bundler: EventBundler

	on_item_changed: CodeEventDuo<number, HTMLElement>
	image_cache: string[]
	rect_cache: RectCache[]

	constructor(container: HTMLElement, grid_data_arr: GridData[]) {
		super()
		this.container = container

		this.grid_data_arr = grid_data_arr
		const l = grid_data_arr.length
		this.items = new Array(l) as HTMLImageElement[]
		this.image_cache = new Array(l)
		this.hovering_item = false
		this.idx = 0
		this.statemachine = null
		const grids = document.getElementsByClassName('o-grid')

		this.grid = grids[0] as HTMLElement
		this.grid.classList.add('o-grid__animate')
		this.on_item_changed = new CodeEventDuo()

		this.event_bundler = new EventBundler([
			{ element: window, event_type: 'mouseover', callback: this._set_idx_for_mouse },
			{ element: window, event_type: 'touchmove', callback: this._set_idx_for_touch },
			{ element: window, event_type: 'touchstart', callback: this._set_idx_for_touch },
			{ element: window, event_type: 'scroll', callback: this._set_idx_for_scroll },
			{ element: window, event_type: 'wheel', callback: this._set_idx_for_scroll },


		])
		this.rect_cache = new Array(l)
	}

	get_cached_rect() {
		return this.rect_cache[this.idx]
	}

	static grid_create() {
		const grid = document.createElement("div")
		grid.classList.add("o-grid")
		return grid
	}

	static grid_item_create(width: number = 1, height: number = 1) {
		const item = document.createElement("div")
		item.classList.add("o-grid__item")
		item.style.gridColumn = `span ${width}`
		item.style.gridRow = `span ${height}`
		item.style.paddingTop = `${100 / width}%`

		const content = document.createElement("div")
		content.classList.add("o-grid__content")
		content.classList.add("o-grid__animate")
		item.appendChild(content)
		return item
	}

	init() {
		this.items[0] = this.container
		this.rect_cache[0] = this.container.getBoundingClientRect()

		const grid = this.grid
		for (let i = 1; i < this.grid_data_arr.length; i++) {
			const grid_data = this.grid_data_arr[i]

			const x = grid_data.span_x
			const y = grid_data.span_y
			const item = StateGridMenu.grid_item_create(x, y)

			const content = item.children[0]
			const img = document.createElement("img")
			img.classList.add("o-grid__img")
			img.style.pointerEvents = 'none'
			content.appendChild(img)
			grid.appendChild(item)

			const cb = (local_url: string) => {
				this.image_cache[i] = local_url
				item.style.backgroundImage = local_url
				img.src = local_url
				// item.style.backgroundImage = `url(${local_url})`
				// item.style.objectFit = 'cover'
			}
			this.cache_img(grid_data.img_url, cb)
			this.items[i] = content as HTMLElement
			this.rect_cache[i] = content.getBoundingClientRect()
		}
	}

	async cache_img(url: string, cached_cb: (local_url: string) => void) {
		const response = await fetch(url)
		const blob = await response.blob()
		const local_url = URL.createObjectURL(blob)
		cached_cb(local_url)
	}


	set_idx(idx: number, broadcast: boolean) {
		if (broadcast) {
			this.on_item_changed.fire(idx, this.items[idx])
			return
		}
		// This function listens to its own broadcast. So first broadcast it, then resolve on listen
		if (idx > 0) {
			for (let i = 0; i < this.items.length; ++i) {
				const item = this.items[idx]
				if (i === idx) {
					item.classList.add('o-grid__selected')
				}
				else {
					item.classList.remove('o-grid__selected')
				}
			}
		}
		this.idx = idx
	}

	_set_idx_for_pointer(clientX: number, clientY: number) {
		const el = document.elementFromPoint(clientX, clientY)
		if (!el) return
		let idx = 0
		for (let i = 1; i < this.items.length; i++) {
			if (this.items[i] !== el) continue
			idx = i
			break
		}
		this.hovering_item = idx > 0
		this.set_idx(idx, true)
	}

	_set_idx_for_mouse = (e: MouseEvent) => {
		this._set_idx_for_pointer(e.clientX, e.clientY)
	}

	_set_idx_for_touch = (e: TouchEvent) => {
		for (let i = 0; i < this.items.length; ++i) {
			this.rect_cache[i] = this.items[i].getBoundingClientRect()
		}
		if (e.touches[0]) {
			this._set_idx_for_pointer(e.touches[0].clientX, e.touches[0].clientY)
		}
	}
	_set_idx_for_scroll = () => {

		this.cach_bounding_rects()
		this.set_idx(this.idx, true)
		return
	}
	_click_item = () => {
		this.statemachine?.switch_state_for_delta_idx(1)
	}

	cach_bounding_rects() {
		for (let i = 0; i < this.items.length; ++i) {
			this.rect_cache[i] = this.items[i].getBoundingClientRect()
		}
	}


	enter(context: ISwitchStateContext, on_complete: () => void): void {
		this.grid.style.overflow = "auto"
		this.grid.classList.remove("o-grid__collapse")

		this.event_bundler.set_enabled(true)

		for (let i = 1; i < this.items.length; i++) {
			const item = this.items[i]
			item.classList.add("o-grid__animate")
			item.classList.remove("o-grid__remove")
			if (i === this.idx) {
			} else {
				item.style.transform = `translate(${0}px,${0}px)`
			}
			item.addEventListener("click", this._click_item)
		}

		this.cach_bounding_rects()
		super.enter(context, on_complete)
	}

	exit(context: ISwitchStateContext, on_complete: () => void): void {
		this.image_cache = []
		this.event_bundler.set_enabled(false)

		for (let i = 1; i < this.items.length; i++) {
			this.items[i].classList.add("o-grid__remove")
		}
		this.grid.style.overflow = "hidden"
		this.grid.classList.add("o-grid__collapse")
		super.exit(context, on_complete)
	}

	reset() {
		for (let i = 1; i < this.items.length; i++) {
			const item = this.items[i]
			item.classList.remove("o-grid__animate")
			item.classList.add("o-grid__remove")
		}
		this.exit({} as ISwitchStateContext, () => { })
	}
}
