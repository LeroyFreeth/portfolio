import * as THREE from 'three'
import { type RectCache, RectCacheUtils } from '../utilities/rect-cache'

export class RotatorPointer {

	pointer_down: boolean
	angles: THREE.Vector2

	camera: THREE.PerspectiveCamera
	target: THREE.Object3D
	element: HTMLElement
	rect_cache: RectCache

	bounding_box: THREE.Box3
	target_geo_size: THREE.Vector3
	radius: number
	enabled: boolean

	up: THREE.Vector3
	right: THREE.Vector3

	width_visual: number
	height_visual: number
	width: number
	height: number


	get_pointer_down() { return this.pointer_down }

	constructor(camera: THREE.PerspectiveCamera, target: THREE.Object3D, element: HTMLElement, up: THREE.Vector3, right: THREE.Vector3) {
		this.camera = camera
		this.target = target
		this.element = element
		this.enabled = false

		this.rect_cache = RectCacheUtils.create_from(element.getBoundingClientRect())
		window.addEventListener('resize', () => {
			RectCacheUtils.cache(this.element.getBoundingClientRect(), this.rect_cache)
		})
		this.radius = 1

		this.pointer_down = false
		this.angles = new THREE.Vector2()

		this.bounding_box = new THREE.Box3()
		this.target_geo_size = new THREE.Vector3()
		this.width_visual = 1
		this.height_visual = 1
		this.width = 1
		this.height = 1
		this.update_target_data()

		this.up = up
		this.right = right
	}

	// Be sure to call this when the target transform changes
	update_target_data() {
		// Target considered size
		this.bounding_box.setFromObject(this.target)
		this.bounding_box.getSize(this.target_geo_size)
		this.radius = Math.max(Math.max(this.target_geo_size.x, this.target_geo_size.y), this.target_geo_size.z) / 10

		// Target distance from camera
		// const camera = this.camera
		// const distance = camera.position.distanceTo(this.target.position)
		// this.height_visual = 2 * Math.tan((camera.fov * Math.PI) / 360) * distance * devicePixelRatio
		// this.width_visual = this.height_visual * camera.aspect
	}

	rotate(delta: THREE.Vector2) {
		const edge = Math.max(this.rect_cache.width, this.rect_cache.height)
		const world_delta_x = (delta.x / edge)
		const world_delta_y = (delta.y / edge)

		this.angles.set(
			world_delta_x / this.radius,
			world_delta_y / this.radius 
		)
	}

	update() {
		this.target.rotateOnWorldAxis(this.up, this.angles.x)
		this.target.rotateOnWorldAxis(this.right, this.angles.y)
		// Dampen the rotation
		this.angles.multiplyScalar(0.90)
	}
}

