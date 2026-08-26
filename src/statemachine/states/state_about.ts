import { Environment3d } from "../../environment_3d";
import { State, type ISwitchStateContext } from "../statemachine";

export class StateAbout extends State {
	elements: HTMLElement[]
	constructor() {
		super()
		const focus = document.getElementsByClassName('focus')[0] as HTMLElement
		const info = document.getElementById('info') as HTMLElement
		this.elements = [focus, info]
		for (let i = 0; i < this.elements.length; ++i) {
			if (!this.elements[i]) {
				console.error('Missing an element')
			}
		}
	}



	enter(context: ISwitchStateContext, on_complete: () => void): void {
		this.elements_view(true)
		Environment3d.box_to_element(this.elements[0], true)
		Environment3d.lerp_color_box(false)

		window.scrollTo(0, 0)
		super.enter(context, on_complete)
	}

	exit(context: ISwitchStateContext, on_complete: () => void): void {
		this.elements_view(false)
		Environment3d.lerp_color_box(true)
		super.exit(context, on_complete)
	}

	elements_view(show: boolean) {
		if (show)
			this.elements[1].classList.remove('out')
		else
			this.elements[1].classList.add('out')
	}

	reset(): void {

		this.elements_view(false)
	}
}
