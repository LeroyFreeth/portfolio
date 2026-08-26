export type RectCache = {
	height: number,
	width: number,
	x: number,
	y: number,
	bottom: number,
	left: number,
	right: number,
	top: number,
}

export class RectCacheUtils {
	static create(): RectCache {
		return {
			height: 0,
			width: 0,
			x: 0,
			y: 0,
			bottom: 0,
			left: 0,
			right: 0,
			top: 0,

		} as RectCache
	}

	static create_from(rect: DOMRect) {
		if (!rect) return RectCacheUtils.create()
		return {
			x: rect.x,
			y: rect.y,
			width: rect.width,
			height: rect.height,
			bottom: rect.bottom,
			left: rect.left,
			right: rect.right,
			top: rect.top,
		}
	}
	static copy_from(rect: RectCache, dest: RectCache) {
		dest.x = rect.x
		dest.y = rect.y
		dest.width = rect.width
		dest.height = rect.height
		dest.bottom = rect.bottom
		dest.left = rect.left
		dest.right = rect.right
		dest.top = rect.top

	}

	static cache(rect: DOMRect, dest: RectCache) {
		if (!rect) return
		dest.x = rect.x
		dest.y = rect.y
		dest.width = rect.width
		dest.height = rect.height
		dest.bottom = rect.bottom
		dest.left = rect.left
		dest.right = rect.right
		dest.top = rect.top
	}
}



