export type EvenBundleData = {
	element: HTMLElement | Window | Document,
	event_type: string,
	callback: (e: Event | any) => void
}

// Stores the listener data in an array to easily add and remove an array of event listeners
export class EventBundler {

	event_data: EvenBundleData[]
	enabled: boolean
	constructor(event_data: EvenBundleData[]) {
		this.event_data = event_data
		this.enabled = false
	}

	set_enabled(enable: boolean) {
		if (this.enabled === enable) return
		if (enable) {
			for (const event of this.event_data)
				event.element.addEventListener(event.event_type, event.callback)
		}
		else {
			for (const event of this.event_data)
				event.element.removeEventListener(event.event_type, event.callback)
		}
		this.enabled = enable

	}
}
