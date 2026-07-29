import * as THREE from 'three'

export function element_to_3d(element: HTMLElement, position: THREE.Vector3, scale: THREE.Vector3, camera: THREE.PerspectiveCamera, add_padding: boolean) {

	const frustum_height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * -(position.z + scale.z/2)

	const aspect = window.innerWidth / window.innerHeight;

	const frustum_width = frustum_height * aspect;
	const rect = element.getBoundingClientRect()
	const normalized_x_position = (rect.left + (0.5 * rect.width)) / window.innerWidth - 0.5
	const normalized_y_position = ((rect.top + (0.5 * rect.height)) / (window.innerHeight) - 0.5)
	const x = normalized_x_position * frustum_width //+ mesh.position.x
	const y = -normalized_y_position * frustum_height //+ mesh.position.y
	const padding = add_padding ? 1.008 : 1 
	const scale_width = ((rect.width * padding) / window.innerWidth) * frustum_width
	const scale_height = ((rect.height * padding) / window.innerHeight) * frustum_height

	scale.set(scale_width, scale_height, scale.z)
	position.set(x, y, position.z)
}
