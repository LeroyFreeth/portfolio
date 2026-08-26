import * as THREE from 'three'
import type { RectCache } from '../utilities/rect-cache'

export class DomTo3DConversions {
	static dom_rect_to_3d_position(
		rect: RectCache,
		canvas_rect: RectCache,
		geoSize: THREE.Vector3,
		camera: THREE.PerspectiveCamera,
		destPosition: THREE.Vector3,
	) {

		const ndc_width = rect.width / canvas_rect.width
		const ndc_height = rect.height / canvas_rect.height

		const m = camera.projectionMatrix.elements
		const m11 = m[0] // Horizontal: 1 / tan(fov_x / 2)
		const m22 = m[5] // Vertical: 1 / tan(fov_y / 2)

		const front_z_from_width = geoSize.x / (2 * (1 / m11) * ndc_width)
		const front_z_from_height = geoSize.y / (2 * (1 / m22) * ndc_height)

		const front_target_z = Math.min(front_z_from_width, front_z_from_height)
		const center_target_z = front_target_z + (geoSize.z * 0.5)

		const frustum_width = (2 * front_target_z) / m11
		const frustum_height = (2 * front_target_z) / m22

		const normalized_x = ((rect.left + rect.width * 0.5) - canvas_rect.left) / canvas_rect.width - 0.5
		const normalized_y = ((rect.top + rect.height * 0.5) - canvas_rect.top) / canvas_rect.height - 0.5

		destPosition.set(
			normalized_x * frustum_width,
			-normalized_y * frustum_height,
			-center_target_z
		)
		destPosition.applyQuaternion(camera.quaternion).add(camera.position)
	}


	static moveObjectToDistance(
		object: THREE.Object3D,
		geoSize: THREE.Vector3,
		camera: THREE.PerspectiveCamera,
		targetDistance: number
	) {
		const referenceGeoDimension = Math.max(geoSize.x, geoSize.y)

		const m = camera.projectionMatrix.elements
		const m22 = m[5]

		const worldPosition = new THREE.Vector3()
		object.getWorldPosition(worldPosition)

		const localOffset = worldPosition.clone().sub(camera.position)
		const cameraInverseQ = camera.quaternion.clone().invert()
		const cameraSpacePos = localOffset.applyQuaternion(cameraInverseQ)
		const currentDistance = -cameraSpacePos.z

		if (Math.abs(currentDistance) < 0.0001) return

		const frustumHeightAtCurrentDepth = (2 * currentDistance) / m22
		const visualRatioY = referenceGeoDimension / frustumHeightAtCurrentDepth

		const scaleFactor = targetDistance / currentDistance
		const targetCameraSpacePos = new THREE.Vector3(
			cameraSpacePos.x * scaleFactor,
			cameraSpacePos.y * scaleFactor,
			-targetDistance
		)

		const frustumHeightAtTargetDepth = (2 * targetDistance) / m22
		const requiredWorldDimension = visualRatioY * frustumHeightAtTargetDepth
		const targetScale = requiredWorldDimension / referenceGeoDimension

		const newWorldPosition = targetCameraSpacePos
			.applyQuaternion(camera.quaternion)
			.add(camera.position)

		if (object.parent) {
			object.parent.worldToLocal(newWorldPosition)
			object.position.copy(newWorldPosition)
		} else {
			object.position.copy(newWorldPosition)
		}

		object.scale.set(targetScale, targetScale, targetScale)
	}

	static getAspectVectorScalar(rect: RectCache, geoSize: THREE.Vector3, destAspect: THREE.Vector3) {
		const elAspect = rect.width / rect.height
		const meshAspect = geoSize.x / geoSize.y
		const ratio = elAspect / meshAspect

		if (ratio > 1) destAspect.set(1, 1 / ratio, 1)
		else destAspect.set(ratio, 1, 1)
	}
}

