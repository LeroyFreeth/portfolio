export class ColorConversion {
	static hex_to_arr(rgb: number): number[] {
		const arr = new Array(3)
		arr[0] = (rgb >> 16) & 0xFF
		arr[1] = (rgb >> 8) & 0xFF
		arr[2] = rgb & 0xFF
		return arr
	}

	static arr_to_hex(arr: number[]) {
		let hex_rgb = 0
		hex_rgb |= (arr[0] & 0xFF) << 16
		hex_rgb |= (arr[1] & 0xFF) << 8
		hex_rgb |= (arr[2] & 0xFF)
	}

	static hex_scale(hex_color: number, s: number) {
		const r = (hex_color >> 16) & 0xFF
		const g = (hex_color >> 8) & 0xFF
		const b = hex_color & 0xFF

		const newR = Math.round(r + s)
		const newG = Math.round(g + s)
		const newB = Math.round(b + s)

		return (newR << 16) | (newG << 8) | newB
	}

	static hex_greyify(hex_color: number, n: number) {
		const r = (hex_color >> 16) & 0xFF
		const g = (hex_color >> 8) & 0xFF
		const b = hex_color & 0xFF

		const gray = r + g + b / 3

		const newR = Math.round(r + n * (gray - r))
		const newG = Math.round(g + n * (gray - g))
		const newB = Math.round(b + n * (gray - b))

		return (newR << 16) | (newG << 8) | newB
	}

	static hex_desaturate(hex_color: number, s: number) {
		const r = (hex_color >> 16) & 0xFF
		const g = (hex_color >> 8) & 0xFF
		const b = hex_color & 0xFF

		const gray = 0.299 * r + 0.587 * g + 0.114 * b

		const newR = Math.round(r + s * (gray - r))
		const newG = Math.round(g + s * (gray - g))
		const newB = Math.round(b + s * (gray - b))

		return (newR << 16) | (newG << 8) | newB
	}
}



