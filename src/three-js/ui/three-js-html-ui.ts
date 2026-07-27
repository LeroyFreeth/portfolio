import * as THREE from 'three'
import type { ITickable } from '../level'

const three_js_html_ui = 'three-js-ui'

/**
 * This mirrors the html elements for their respective sizes on the canvas.
 * This can be used to create backgrounds for the html elements within the three js scene
 * 
 * In order to fully sync the elements and 3d objects, ensure the canvas size is identical to the window size 
 * 
 */
class ThreeJsHtmlUi implements ITickable {
	element: Element
	camera: THREE.PerspectiveCamera
	depth: number
	z: number
	mesh: THREE.Mesh

	_size: THREE.Vector3
	_position: THREE.Vector3

	set position(value: THREE.Vector3) { this._position = value }

	get ticking(): boolean {
		return true
	}

	set scale(scale: number) {
		this.mesh.scale.set(
			this._size.x * scale,
			this._size.y * scale,
			this._size.z * scale,
		)
	}

	constructor(z:number, element: Element, camera: THREE.PerspectiveCamera, depth: number, scene: THREE.Scene, material: THREE.Material, parent_to_camera: boolean) {
		this.element = element
		this.camera = camera
		this.depth = depth
		this._size = new THREE.Vector3()
		this.z = z 
		this._position = new THREE.Vector3(0, 0, -this.z / 2)

		const geometry = z > 0 ? new THREE.BoxGeometry(1, 1, this.z) : new THREE.PlaneGeometry(1,1)
		const plane = new THREE.Mesh(geometry, material)

		scene.add(plane)

		plane.position.copy(this.camera.position)
		if (parent_to_camera) this.camera.add(plane)

		this.mesh = plane

		this.update_transform()
	}

	tick(): void {
		this.update_transform()
	}

	get frustum_height() { return 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.depth }


	update_transform() {
		// This is recalculated for every element
		// This is due to this usecase relying on seperate depth values
		const frustum_height = this.frustum_height
		const aspect = window.innerWidth / window.innerHeight;
		const frustum_width = frustum_height * aspect;

		const z_depth = this.mesh.parent === this.camera
			? -this.depth
			: this.camera.position.z - this.depth

		const rect = this.element.getBoundingClientRect()



		const normalized_x_position = (rect.left + (0.5 * rect.width)) / window.innerWidth - 0.5
		const normalized_y_position = ((rect.top + (0.5 * rect.height)) / (window.innerHeight) - 0.5)

		const x = normalized_x_position * frustum_width + this._position.x
		const y = -normalized_y_position * frustum_height + this._position.y

		const style = window.getComputedStyle(this.element)
		const material = this.mesh.material
		if ('opacity' in material && typeof material.opacity === 'number')
			material.opacity = Number.parseFloat(style.opacity)

		// 1 Pixel offset, due to some rendering artifacts
		const padding = 1
		this.mesh.scale.set(
			((rect.width + padding) / window.innerWidth) * frustum_width,
			((rect.height + padding) / window.innerHeight) * frustum_height,
			((rect.width + padding) / window.innerWidth) * frustum_width		)
		this.mesh.position.set(
			this.mesh.position.x + (x - this.mesh.position.x),
			this.mesh.position.y + (y - this.mesh.position.y),
			z_depth - this.mesh.scale.z/2*this.z - 0.0001,
		)
		// this.mesh.rotation.y += 0.1


	}


	static get_ui_elements() {
		return document.getElementsByClassName(three_js_html_ui)
	}
}

export { ThreeJsHtmlUi }
