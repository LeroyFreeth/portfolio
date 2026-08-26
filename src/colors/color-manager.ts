import { Environment3d } from '../environment_3d'
import { ColorPalette } from './color-palette'


export class ColorPaletteAnimator {

	from: number[]
	to: number[]
	current: number[]
	get_current_portfolio_data() {
	}

	constructor() {
		this.from = new Array(color_id_arr.length).fill(0)
		this.to = new Array(color_id_arr.length).fill(0)
		this.current = new Array(color_id_arr.length).fill(0)
	}

	set_color_palette(palette: number[]) {
		const l = this.current.length
		for (let i = 0; i < l; i++) {
		}
		Environment3d.set_hex_color_cube(this.current[3])
		Environment3d.set_hex_color_render_clear(this.current[4])
	}
}

