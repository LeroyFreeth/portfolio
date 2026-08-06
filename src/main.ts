import * as THREE from 'three'

import { PortfolioMaterial } from './three-js/materials/material-instantiator'

import { Level } from './three-js/level';
import { ScrollTimelinePlayer } from './timeline/scroll-timeline-player';
import { LoadDependencyHelper } from './utilities/load-utilities';

import { PortfolioItemMenu, type PortfolioData } from './portfolio/portfolio-item-menu'
import { mouse_position } from './inputs/pointer-inputs';
import { ColorPaletteManager } from './utilities/color-palette-manager';

import { OUT_OF_BOUNDS_TYPE, Track, TrackClip } from './timeline/track';
import { EASE_TYPE } from './timeline/easings';
import { Timeline } from './timeline/timeline';
import { element_to_3d } from './three-js/space_conversion';

const style = window.getComputedStyle(document.body)

const color_id_arr = [
	'--color-a-hex',
	'--color-b-hex',
	'--color-c-hex',
	'--color-d-hex',
	'--color-e-hex',
]

interface IUi3dData {
	element: HTMLElement
	mesh: THREE.Mesh
}

const renderer_clear_color = new THREE.Color().setHex(Number.parseInt(style.getPropertyValue(color_id_arr[0]).replace('#', '0x')))

const target_watchers: THREE.Object3D[] = []

const clock = new THREE.Clock();
const canvas = document.getElementById('app') as HTMLCanvasElement
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
	stencil: false,

})

renderer.shadowMap.enabled = true
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(renderer_clear_color)

window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight)
})

// Setup color management
const color_palatte_manager = new ColorPaletteManager([
	color_id_arr[0],
	color_id_arr[1],
	color_id_arr[2],
	color_id_arr[3],
	color_id_arr[4],
], 5)

const mat_color_arr = [
	new THREE.MeshPhongMaterial({ color: style.getPropertyValue(color_id_arr[0]) }),
	new THREE.MeshPhongMaterial({ color: style.getPropertyValue(color_id_arr[1]) }),
	new THREE.MeshPhongMaterial({ color: style.getPropertyValue(color_id_arr[2]) }),
	new THREE.MeshPhongMaterial({ color: style.getPropertyValue(color_id_arr[3]) }),
	new THREE.MeshPhongMaterial({ color: style.getPropertyValue(color_id_arr[4]) }),

]

const ui_mat_color_arr = [
	new THREE.MeshBasicMaterial({ color: style.getPropertyValue(color_id_arr[0]) }),
	new THREE.MeshBasicMaterial({ color: style.getPropertyValue(color_id_arr[1]) }),
	new THREE.MeshBasicMaterial({ color: style.getPropertyValue(color_id_arr[2]) }),
	new THREE.MeshBasicMaterial({ color: style.getPropertyValue(color_id_arr[3]) }),
	new THREE.MeshBasicMaterial({ color: style.getPropertyValue(color_id_arr[4]) }),

]

color_palatte_manager.on_palette_changed.add_handler((palette: number[]) => {
	for (let i = 0; i < mat_color_arr.length; i++) {
		document.body.style.setProperty(color_id_arr[i], `#${palette[i].toString(16)}`)
		mat_color_arr[i].color.setHex(palette[i])
		ui_mat_color_arr[i].color.setHex(palette[i])
	}
	renderer.setClearColor(renderer_clear_color.setHex(palette[4]))
})

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.5, 100)
scene.add(camera)
camera.position.set(0, 0, 5);
camera.near = 0.01


const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
hemiLight.position.set(1, 1, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 5);
dirLight.position.set(0, 200, 100);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 180;
dirLight.shadow.camera.bottom = - 100;
dirLight.shadow.camera.left = - 120;
dirLight.shadow.camera.right = 120;
scene.add(dirLight);

const level = new Level(scene, camera)

//Setup ui material
const portfolio_mat = PortfolioMaterial()

// var portfolio_mat = [
// 	new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("https://i.imgur.com/8B1rYNY.png") }),
// 	new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("https://i.imgur.com/8w6LAV6.png") }),
// 	new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("https://i.imgur.com/aVCY4ne.png") }),
// 	new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("https://i.imgur.com/tYOW02D.png") }),
// 	new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("https://i.imgur.com/nVAIICM.png") }),
// 	new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("https://i.imgur.com/EDr3ed3.png") })
// ];

const portfolio = new PortfolioItemMenu(portfolio_mat, clock, () => {
	load_helper.loadedDependency('portfolio')
})

// Make the palette change when changing to a new portfolio piece
portfolio.on_portfolio_data_changed.add_handler((data: PortfolioData) => {
	color_palatte_manager.set_palette(data.color_palette, 1)
})

level.add_tickable(portfolio, true)

// Create timelines 
const portfolio_timeline = portfolio.timeline
const portfolio_timeline_player = portfolio.timeline_player
const scroll_timeline = new Timeline()
const scroll_timeline_player = new ScrollTimelinePlayer(scroll_timeline, 0.9)
level.add_tickable(portfolio_timeline_player, false)
level.add_tickable(scroll_timeline_player, false)


const raycastable_object_arr: THREE.Object3D[] = []

color_palatte_manager.on_palette_changed.add_handler((palette: number[]) => {
	for (let i = 0; i < mat_color_arr.length - 1; i++) {
		mat_color_arr[i].color.setHex(palette[i])
	}

})

// Create meshes
const box_geom = new THREE.BoxGeometry(0.1, 0.1, 0.1)
const box_mesh = new THREE.Mesh(box_geom, mat_color_arr[0])
box_mesh.position.copy(new THREE.Vector3(0.2, -0.1, 4.1))
scene.add(box_mesh)
raycastable_object_arr.push(box_mesh)

const cone_pivot = new THREE.Object3D()
cone_pivot.position.copy(new THREE.Vector3(0.45, -0.1, 2))
scene.add(cone_pivot)
target_watchers.push(cone_pivot)

const cone_geom = new THREE.ConeGeometry(0.1, 0.4)
const cone_mesh = new THREE.Mesh(cone_geom, mat_color_arr[2])
scene.add(cone_mesh)
cone_mesh.rotation.x = Math.PI * 0.5
cone_pivot.add(cone_mesh)

const sphere_geom = new THREE.SphereGeometry(0.05)
const sphere_mesh = new THREE.Mesh(sphere_geom, mat_color_arr[1])
sphere_mesh.position.copy(new THREE.Vector3(0.15, -0.1, 3.8))
scene.add(sphere_mesh)
raycastable_object_arr.push(sphere_mesh)

const torus_geom = new THREE.TorusGeometry(0.06, 0.02)
const torus_mesh = new THREE.Mesh(torus_geom, mat_color_arr[3])
torus_mesh.position.copy(new THREE.Vector3(0.16, -0.15, 3.3))
scene.add(torus_mesh)
target_watchers.push(torus_mesh)
raycastable_object_arr.push(torus_mesh)

// Animations
const cone_translate_y_track_clip = TrackClip.create_track_clip(0, 1, cone_pivot.position.y, cone_pivot.position.y + .8, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
const cone_translate_y_track = new Track('cone_translate_y_track', [cone_translate_y_track_clip])
scroll_timeline.integrate_track(cone_translate_y_track)
scroll_timeline.bind_to_track(cone_translate_y_track.id, cone_pivot.position, 'y')

const sphere_translate_x_track_clip = TrackClip.create_track_clip(0, 1, sphere_mesh.position.x, sphere_mesh.position.x - 0.05, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
const sphere_translate_x_track = new Track('sphere_translate_x_track', [sphere_translate_x_track_clip])
portfolio_timeline.integrate_track(sphere_translate_x_track)
portfolio_timeline.bind_to_track(sphere_translate_x_track.id, sphere_mesh.position, 'x')


const torus_translate_x_track_clip = TrackClip.create_track_clip(0, 1, torus_mesh.position.x, torus_mesh.position.x + 0.05, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
const torus_translate_x_track = new Track('torus_translate_x_track', [torus_translate_x_track_clip])
portfolio_timeline.integrate_track(torus_translate_x_track)
portfolio_timeline.bind_to_track(torus_translate_x_track.id, torus_mesh.position, 'x')

const torus_translate_z_track_clip = TrackClip.create_track_clip(0, 1, torus_mesh.position.z, torus_mesh.position.z - 1.3, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
const torus_translate_z_track = new Track('torus_translate_z_track', [torus_translate_z_track_clip])
scroll_timeline.integrate_track(torus_translate_z_track)
scroll_timeline.bind_to_track(torus_translate_z_track.id, torus_mesh.position, 'z')

const camera_position_y_track_clip = TrackClip.create_track_clip(0, 1, 0, -Math.PI * 0.1, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
const camera_position_y_track = new Track('camera_position_y_track', [camera_position_y_track_clip])
scroll_timeline.integrate_track(camera_position_y_track)
scroll_timeline.bind_to_track(camera_position_y_track.id, camera.position, 'y')

const camera_rotate_x_track_clip = TrackClip.create_track_clip(0, 1, 0, Math.PI * 0.1, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
const camera_rotate_x_track = new Track('camera_rotate_y_track', [camera_rotate_x_track_clip])
scroll_timeline.integrate_track(camera_rotate_x_track)
scroll_timeline.bind_to_track(camera_rotate_x_track.id, camera.rotation, 'x')

const camera_rotate_y_track_clip = TrackClip.create_track_clip(0, 1, 0, Math.PI * 0.01, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
const camera_rotate_y_track = new Track('camera_rotate_y_track', [camera_rotate_y_track_clip])
portfolio_timeline.integrate_track(camera_rotate_y_track)
portfolio_timeline.bind_to_track(camera_rotate_y_track.id, camera.rotation, 'y')

// const camera_rotate_y_track_clip = TrackClip.create_track_clip(0, 1, 0, Math.PI * 0.1, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
// const camera_rotate_y_track = new Track('camera_rotate_y_track', [camera_rotate_y_track_clip])
// scroll_timeline.integrate_track(camera_rotate_y_track)
// scroll_timeline.bind_to_track(camera_rotate_y_track.id, camera.rotation, 'x')

// Start level after loading is done
const load_helper = new LoadDependencyHelper(['portfolio'], () => {
	// TODO: Some fixes on page loading. Still have to debug exactly what.
	portfolio.open_for_hash()
})

// Setup raycaster
const raycaster = new THREE.Raycaster()
const target = new THREE.Object3D()
target.position.copy(camera.position)


// Three Js ui - HTML background elements actually rendered within the scene

let ui3dData_arr: IUi3dData[] = [
	{

		element: document.getElementById('app') as HTMLElement,
		mesh: new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), portfolio_mat)
	},
	{

		element: document.getElementById('top-portfolio-info') as HTMLElement,
		mesh: new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat_color_arr[1])
	},
	{

		element: document.getElementById('about') as HTMLElement,
		mesh: new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat_color_arr[3])
	},

]
for (let i = 0; i < ui3dData_arr.length; i++) {
	const mesh = ui3dData_arr[i].mesh
	scene.add(mesh)
	mesh.position.set(0, 0, -1 - (ui3dData_arr.length - 1 - i))
	camera.add(mesh)
	if (i === 0) {
		raycastable_object_arr.push(mesh)
	} else {
		mesh.scale.set(1, 1, 0.01)
	}
}
const ui_portfolio_object = ui3dData_arr[0].mesh

const track_rotate_y_clip = TrackClip.create_track_clip(0, 1, 0, Math.PI * 0.1, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
const track_rotate_y = new Track('track_rotate_y', [track_rotate_y_clip])
portfolio_timeline.integrate_track(track_rotate_y)
portfolio_timeline.bind_to_track(track_rotate_y.id, ui_portfolio_object.rotation, 'y')
const track_rotate_z_clip = TrackClip.create_track_clip(0, 1, 0, Math.PI * 0.01, EASE_TYPE.IN_OUT_QUAD, OUT_OF_BOUNDS_TYPE.HOLD, OUT_OF_BOUNDS_TYPE.HOLD)
const track_rotate_z = new Track('track_rotate_z', [track_rotate_z_clip])
portfolio_timeline.integrate_track(track_rotate_z)
portfolio_timeline.bind_to_track(track_rotate_z.id, ui_portfolio_object.rotation, 'z')

scroll_timeline_player.update_duration()

// Quick version to raycast some objects
const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI * 0.001, 0))
const pointer_plane = new THREE.Plane()
const plane_intersect_point = new THREE.Vector3()
const camera_forward = new THREE.Vector3()

function raycast_scene() {
	raycaster.setFromCamera(mouse_position, camera)
	const intersect = raycaster.intersectObject(ui_portfolio_object)
	if (intersect) {
		if (intersect.length > 0) {
			portfolio_mat.uniforms._pointer_position.value = intersect[0].uv
			portfolio_mat.uniforms._pointer_start_time.value = clock.getElapsedTime()
		}
	}

	const intersects = raycaster.intersectObjects(raycastable_object_arr)
	if (intersects.length > 0)
		target.position.addScaledVector(intersects[0].point.sub(target.position), 0.01)
	else {
		camera.getWorldDirection(camera_forward)
		pointer_plane.normal = camera_forward.setScalar(-1)
		raycaster.ray.intersectPlane(pointer_plane, plane_intersect_point)
		plane_intersect_point.z = 4
		target.position.addScaledVector(plane_intersect_point.sub(target.position), 0.01)
	}
	for (let i = 0; i < target_watchers.length; i++) {
		const watcher = target_watchers[i]
		const world_position = new THREE.Vector3()
		const target_world_position = new THREE.Vector3()
		watcher.getWorldPosition(world_position)
		target.getWorldPosition(target_world_position)
		const dir = target_world_position.sub(world_position).normalize()
		watcher.lookAt(world_position.add(dir))
	}
}

const fps = 120
const desired_delta = 1 / fps
let prev_elapsed_time = 0;
// Game loop
function tick() {
	const elapsed_time = performance.now()
	requestAnimationFrame(tick)

	const delta = (elapsed_time - prev_elapsed_time) / 1000
	if (delta < desired_delta) {
		return
	}
	prev_elapsed_time = elapsed_time

	level.tick(delta)

	for (let i = 0; i < ui3dData_arr.length; i++) {
		const ui3dData = ui3dData_arr[i]
		const mesh = ui3dData.mesh
		element_to_3d(ui3dData.element, mesh.position, mesh.scale, camera, i > 0)
	}
	box_mesh.quaternion.multiply(rot)
	raycast_scene()

	renderer.render(scene, camera);
}

level.start()
tick()
