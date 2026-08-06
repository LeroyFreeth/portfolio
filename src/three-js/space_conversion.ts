import * as THREE from 'three'

export function element_to_3d(
	element: HTMLElement,
	position: THREE.Vector3,
	scale: THREE.Vector3,
	camera: THREE.PerspectiveCamera,
	add_padding: boolean
) {
	const rect = element.getBoundingClientRect()

	const m = camera.projectionMatrix.elements
	const m11 = m[0] //	Horizontal fov scaling 
	const m22 = m[5] //	Vertical fov scaling 

	const depth = -(position.z + scale.z / 2)
	const frustum_width = (2 * depth) / m11
	const frustum_height = (2 * depth) / m22

	const normalized_x_position = (rect.left + (0.5 * rect.width)) / window.innerWidth - 0.5
	const normalized_y_position = ((rect.top + (0.5 * rect.height)) / window.innerHeight - 0.5)

	const x = normalized_x_position * frustum_width
	const y = -normalized_y_position * frustum_height

	const padding = add_padding ? 1.008 : 1
	const scale_width = ((rect.width * padding) / window.innerWidth) * frustum_width
	const scale_height = ((rect.height * padding) / window.innerHeight) * frustum_height

	scale.set(scale_width, scale_height, scale.z)
	position.set(x, y, position.z)
}


// Global matrix placeholders to prevent garbage collection inside the render loop
const VIEW_PROJECTION_MATRIX = new THREE.Matrix4()
const INV_VIEW_PROJECTION = new THREE.Matrix4()
const TEMP_VECTOR = new THREE.Vector3()

export function canvas_to_world_space(
	element: HTMLElement,
	position: THREE.Vector3,
	scale: THREE.Vector3,
	camera: THREE.PerspectiveCamera,
	add_padding: boolean
) {
	const rect = element.getBoundingClientRect()
	const padding = add_padding ? 1.008 : 1

	// 1. Calculate the target depth in View Space (Camera Space)
	// In Three.js, looking forward means moving along the negative Z-axis
	const view_space_z = (position.z + scale.z / 2)

	// 2. Generate the single Canvas-to-World transformation matrix
	// We multiply the Camera World Matrix by the Inverse Projection Matrix
	VIEW_PROJECTION_MATRIX.multiplyMatrices(camera.matrixWorld, INV_VIEW_PROJECTION.copy(camera.projectionMatrix).invert())

	// 3. Find the Center Position using pure matrix multiplication
	const ndc_x = ((rect.left + rect.width * 0.5) / window.innerWidth) * 2 - 1
	const ndc_y = -((rect.top + rect.height * 0.5) / window.innerHeight) * 2 + 1

	// Solve NDC Z by projecting our known View Space Z through the camera projection matrix
	const ndc_z = (camera.projectionMatrix.elements[10] * view_space_z + camera.projectionMatrix.elements[14]) /
		(camera.projectionMatrix.elements[11] * view_space_z)

	TEMP_VECTOR.set(ndc_x, ndc_y, ndc_z).applyMatrix4(VIEW_PROJECTION_MATRIX)
	const world_x = TEMP_VECTOR.x
	const world_y = TEMP_VECTOR.y

	// 4. Find the Edge Dimensions using the exact same matrix multiplication
	const ndc_width = ((rect.width * padding) / window.innerWidth) * 2
	const ndc_height = ((rect.height * padding) / window.innerHeight) * 2

	TEMP_VECTOR.set(ndc_x + ndc_width / 2, ndc_y + ndc_height / 2, ndc_z).applyMatrix4(VIEW_PROJECTION_MATRIX)

	// The scale is the absolute distance from the center to the edge multiplied by 2
	const scale_width = Math.abs(TEMP_VECTOR.x - world_x) * 2
	const scale_height = Math.abs(TEMP_VECTOR.y - world_y) * 2

	// 5. Update your vector references directly
	scale.set(scale_width, scale_height, scale.z)
	position.set(world_x, world_y, position.z)
}
