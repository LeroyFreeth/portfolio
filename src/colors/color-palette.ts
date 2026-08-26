export class ColorPaletteUtils {

	static set_target(palette: number[], from: number[], to: number[], dest: number[]) {
		const l = palette.length
		for (let i = 0; i < l; i++) {
			from[i] = dest[i]
			to[i] = palette[i]
		}
	}
	static lerp(from: number[], to: number[], dest: number[], t: number) {
		for (let i = 0; i < from.length; i++) {
			const current = from[i]
			const target = to[i]
			const cur_r = current >> 16 & 0xFF
			const cur_g = current >> 8 & 0xFF
			const cur_b = current >> 0 & 0xFF
			const r = (cur_r + ((((target >> 16 & 0xFF) - cur_r)) * t)) << 16
			const g = (cur_g + ((((target >> 8 & 0xFF) - cur_g)) * t)) << 8
			const b = (cur_b + ((((target >> 0 & 0xFF) - cur_b)) * t)) << 0
			dest[i] = r | g | b
		}
	}
}

