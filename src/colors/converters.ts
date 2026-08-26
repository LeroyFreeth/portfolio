export class ColorConversion {
	static hex_to_arr(rgb: number): number[] {
		const arr = new Array(3)
		arr[0] = (rgb >> 16) & 0xFF;
		arr[1] = (rgb >> 8) & 0xFF;
		arr[2] = rgb & 0xFF;
		return arr
	}

	static arr_to_hex(arr: number[]) {
		let hex_rgb = 0
		hex_rgb |= (arr[0] & 0xFF) << 16
		hex_rgb |= (arr[1] & 0xFF) << 8
		hex_rgb |= (arr[2] & 0xFF)
	}
}



