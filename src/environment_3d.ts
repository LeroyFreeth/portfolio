import * as THREE from 'three'
import { DomTo3DConversions } from './three-js/space_conversion'
import { RectCacheUtils, } from './utilities/rect-cache.ts'
import { RotatorPointer } from './three-js/rotator-pointer.ts'
import { RotatorGrid } from './three-js/rotator-grid.ts'
import { RotatorGridIllusion } from './three-js/rotator-grid-illusion.ts'
import { EASE_TYPE } from './math/easings.ts'
import { Animator, OutOfBounds, type AnimationClip } from './animator/animator.ts'
import { CodeEventSingle } from './utilities/code-event.ts'
import { Pointers } from './utilities/pointers.ts'

/* -----------------------------------------------------------------------------
	§§ 1. MODES/FLAGS 
----------------------------------------------------------------------------- */

enum EnvironmentFlags {
	NONE = 0,
	ROTATE_FOR_POINTER = 1,
	ALLOW_ZOOM = 2,
	ALLOW_PANNING = 4,
}
let environment_flags = EnvironmentFlags.ROTATE_FOR_POINTER | EnvironmentFlags.ALLOW_ZOOM

/* -----------------------------------------------------------------------------
	§§ 2. DOM ELEMENTS 
----------------------------------------------------------------------------- */

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const focus = document.getElementById('focus') as HTMLElement
let target_element: HTMLElement = canvas


/* -----------------------------------------------------------------------------
	§§ 3. Controls 
----------------------------------------------------------------------------- */

// Get the bounding box or radius of your object
// Cache before initiating pointers to ensure the cache_rects are updated
focus.addEventListener('wheel', () => { cache_rects() })
const pointers = new Pointers(focus, 3, true)

let zoom = 1
let target_zoom = 1
let panning = new THREE.Vector2()
const target_panning = new THREE.Vector2()
const delta_position = new THREE.Vector2()

/* -----------------------------------------------------------------------------
	§§ 4. SCENE SETUP AND RESIZING 
----------------------------------------------------------------------------- */

// Setup camera
const camera = new THREE.PerspectiveCamera(20, 1, 0.5, 100)
camera.position.set(0, 0, 0)
// camera.quaternion.setFromEuler(new THREE.Euler(0, Math.PI, 0))
camera.near = 0.01

// Setup renderer
const renderer_clear_color = new THREE.Color(1, 1, 0)
export const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
	stencil: false,
	alpha: false,

})
renderer.shadowMap.enabled = false
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(renderer_clear_color)

const render_ratio = 1
const target_rect = RectCacheUtils.create()
const canvas_rect = RectCacheUtils.create()


function cache_rects() {
	RectCacheUtils.cache(target_element.getBoundingClientRect(), target_rect)
	RectCacheUtils.cache(canvas.getBoundingClientRect(), canvas_rect)
}

function update_renderer_for_size() {
	cache_rects()
	const width = canvas_rect.width
	const height = canvas_rect.height
	renderer.setSize(width * render_ratio, height * render_ratio, false)
	camera.aspect = width / height
	camera.updateProjectionMatrix()
}

window.addEventListener('resize', () => {
	update_renderer_for_size()
	Environment3d.box_to_element(target_element, true)
})
focus.addEventListener('animationend', () => {
	update_renderer_for_size()
	Environment3d.box_to_element(target_element, true)
})
update_renderer_for_size()

// Create scene
const scene = new THREE.Scene()
scene.add(camera)

/* -----------------------------------------------------------------------------
	§§ 5. BOX 
----------------------------------------------------------------------------- */

const box_geo_size: THREE.Vector3 = new THREE.Vector3()
const box_size = 1
const box_geo = new THREE.BoxGeometry(box_size, box_size, box_size)
const box = new THREE.Mesh(box_geo)
const box_bounding_box: THREE.Box3 = new THREE.Box3().setFromObject(box)
box_bounding_box.getSize(box_geo_size)
scene.add(box)

box.position.set(0, 0, 0)
box.quaternion.copy(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI * 0.24, 0.12 * Math.PI)))

/* -----------------------------------------------------------------------------
	§§ 6. ROTATIONS 
----------------------------------------------------------------------------- */

// Sets up rotations and illusion controls
const pointer_rotator = new RotatorPointer(camera, box, canvas, new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0))
const rotator_grid = new RotatorGrid(box, camera.position)
const target_rotation = rotator_grid.update_target_rotation()
const illusion = new RotatorGridIllusion(box)
const illusion_material = box.material as THREE.ShaderMaterial
const on_box_row_changed = new CodeEventSingle<number>()

/* -----------------------------------------------------------------------------
	§§ 7. ANIMATIONS 
----------------------------------------------------------------------------- */

// Create all animation clips
const clip_box_position = { start: box.position.clone(), end: box.position.clone(), duration_ms: 500, ease: EASE_TYPE.IN_OUT_QUAD } as AnimationClip<THREE.Vector3>
const lerp_box_position = (start: THREE.Vector3, end: THREE.Vector3, t: number) => { return box.position.lerpVectors(start, end, t) }

const clip_box_scale = { start: box.scale.clone(), end: box.scale.clone(), duration_ms: 500, ease: EASE_TYPE.IN_OUT_QUAD } as AnimationClip<THREE.Vector3>
const lerp_box_scale = (start: THREE.Vector3, end: THREE.Vector3, t: number) => { return box.scale.lerpVectors(start, end, t) }

// Note that we immediately use the target rotation of the rotator_grid as our clip end
const clip_box_rotation = { start: box.quaternion.clone(), end: target_rotation, duration_ms: 500, ease: EASE_TYPE.LINEAR } as AnimationClip<THREE.Quaternion>
const lerp_box_rotation = (start: THREE.Quaternion, end: THREE.Quaternion, t: number) => {
	start; // Little hack
	return box.quaternion.slerp(end, t)
}

const clip_color_lerp = { start: 0, end: 1, duration_ms: 500, ease: EASE_TYPE.LINEAR } as AnimationClip<number>
const lerp_color_lerp = (start: number, end: number, t: number) => {
	const value = start + (end - start) * t
	illusion_material.uniforms.uColorLerp.value = value
	return value
}



// Add animation clips to animator 
const animator = new Animator()
animator.add<THREE.Vector3>(clip_box_position, lerp_box_position, OutOfBounds.HOLD)
animator.add<THREE.Vector3>(clip_box_scale, lerp_box_scale, OutOfBounds.HOLD)
animator.add<THREE.Quaternion>(clip_box_rotation, lerp_box_rotation, OutOfBounds.HOLD)
animator.add<number>(clip_color_lerp, lerp_color_lerp, OutOfBounds.HOLD)

const clip_idx_box_rotation = animator.get_idx(clip_box_rotation)
const clip_idx_color_lerp = animator.get_idx(clip_color_lerp)
// Internal time
let time = 0

const panning_padding = 0.2


/* -----------------------------------------------------------------------------
	§§ 8. EXPORTS/FUNCTIONS 
----------------------------------------------------------------------------- */

// Exported functions as static in a class for easy to recognize signatures 
export class Environment3d {
	// Getters
	static get_renderer(): THREE.WebGLRenderer { return renderer }
	static get_illusion(): RotatorGridIllusion { return illusion }
	static get_on_box_row_changed(): CodeEventSingle<number> { return on_box_row_changed }

	/**
	 * @param {HTMLElement} element - Will animate box to match element position and size
	 */
	static box_to_element(element: HTMLElement, square: boolean) {
		RectCacheUtils.copy_from(element.getBoundingClientRect(), target_rect)
		target_element = element

		clip_box_position.start.copy(box.position)
		DomTo3DConversions.dom_rect_to_3d_position(target_rect, canvas_rect, box_geo_size, camera, clip_box_position.end)

		clip_box_scale.start.copy(box.scale)
		DomTo3DConversions.getAspectVectorScalar(target_rect, box_geo_size, clip_box_scale.end)

		if (square) {
			const end_scale = clip_box_scale.end
			const smallest = Math.min(end_scale.x, Math.min(end_scale.y, end_scale.z))
			end_scale.set(smallest, smallest, smallest)
		}
		animator.rewind(clip_box_position)
		animator.rewind(clip_box_scale)
	}

	// Color setters
	static set_color_render_clear(hex_color: number) { renderer.setClearColor(renderer_clear_color.setHex(hex_color)) }
	static set_color_box(hex_color: number) { (illusion_material as THREE.ShaderMaterial).uniforms.uColor.value = new THREE.Color().setHex(hex_color).convertLinearToSRGB() }
	static lerp_color_box(activate: boolean) {
		animator.set_speed_for_idx(clip_idx_color_lerp, activate ? 1 : -1)
		animator.play_for_idx(clip_idx_color_lerp)
	}
	static reset_zoom_and_panning() {
		pointers.get_unique_input_data().zoom = 1
		target_panning.set(0, 0)
	}
	static reset_rotation() {
		// rotator_grid.rotate(0, 0)
	}

	// Environment tick
	static tick(delta_ms: number) {
		illusion_material.uniforms.uTime.value = time
		const pointers_data = pointers.get_pointers_data()

		// Rotation
		const first_pointer = pointers_data[0]
		const second_pointer = pointers_data[1]
		if ((environment_flags & EnvironmentFlags.ROTATE_FOR_POINTER) > 0) {
			if (first_pointer.state && !second_pointer.state) {
				delta_position.set(
					(first_pointer.cur_pos.x - first_pointer.prev_pos.x),
					(first_pointer.cur_pos.y - first_pointer.prev_pos.y)
				)
				pointer_rotator.update_target_data()
				pointer_rotator.rotate(delta_position)
				animator.pause_for_idx(clip_idx_box_rotation)

			}
			else animator.play_from_start_for_idx(clip_idx_box_rotation)
			const prev_y = rotator_grid.y
			rotator_grid._update_target_rotation()
			if (rotator_grid.y !== prev_y) {
				const diff = rotator_grid.y - prev_y
				on_box_row_changed.fire(diff)
				Environment3d.reset_zoom_and_panning()
			}
			illusion.update(rotator_grid.facing_direction_arr, rotator_grid.x, rotator_grid.axis_y)
		}

		// Panning
		if (second_pointer.state) {
			delta_position.set(
				(second_pointer.cur_pos.x - second_pointer.prev_pos.x) / (canvas_rect.width * panning_padding * 0.5),
				(second_pointer.cur_pos.y - second_pointer.prev_pos.y) / (canvas_rect.width * panning_padding * 0.5)
			)
			// if ((environment_flags & EnvironmentFlags.ALLOW_PANNING) > 0) {
			target_panning.set(panning.x - (delta_position.x * zoom), panning.y + (delta_position.y * zoom))
		}

		// Zooming
		target_zoom = Math.min(516, 98206303, Math.max(0.01152908526, pointers.get_unique_input_data().zoom))
		// Ensure clamping 
		pointers.get_unique_input_data().zoom = target_zoom


		// Double click - to reset zooming and panning
		if (first_pointer.state_changed && first_pointer.state && first_pointer.state_ms < 300) {
			Environment3d.reset_zoom_and_panning()
		}

		// Set final zoom and pannings
		zoom = zoom + (target_zoom - zoom) * 0.2
		illusion_material.uniforms.uZoom.value = zoom
		panning.add(target_panning.clone().sub(panning).multiplyScalar(0.2))
		illusion_material.uniforms.uUvOffset.value = panning

		// Animations
		animator.tick(delta_ms)
		pointer_rotator.update_target_data()
		pointer_rotator.update()

		pointers.update(delta_ms)
		// Rendering
		renderer.render(scene, camera)
	}
}



