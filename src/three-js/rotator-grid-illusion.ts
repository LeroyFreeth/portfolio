import * as THREE from 'three'
import view_vs from './materials/shaders/generic-vs.glsl?raw'
import illusion_fs from './materials/shaders/illusion_box.glsl?raw'
import loading from '/images/uv_grid_opengl.jpg'

// TODO: Replace with ImageBitLoader
// Optimize image assets
const texture_loader = new THREE.TextureLoader()
let loading_texture: null | THREE.Texture = null
texture_loader.load(loading, (texture) => {
	loading_texture = texture
})

const loaded_textures = new Array()
const loaded_urls = new Array()

const texture_mappings = [
	[3, 1, 2, 5, 0, 4],
	[0, 2, 3, 5, 1, 4],
	[1, 3, 0, 5, 2, 4],
	[2, 0, 1, 5, 3, 4],
]

export class RotatorGridIllusion {

	target: THREE.Mesh

	active_textures: THREE.Texture[]
	target_textures: THREE.Texture[] | null[]
	rotation_matrices: Float32Array
	material: THREE.ShaderMaterial

	constructor(target: THREE.Mesh) {
		this.active_textures = new Array(6)
		this.target_textures = new Array(6)
		this.rotation_matrices = new Float32Array(54);
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				uTextures: { value: this.active_textures },
				uRotations: { value: this.rotation_matrices },
				uWidths: { value: new Array(6).fill(1) },
				uHeights: { value: new Array(6).fill(1) },
				uUvOffset: { value: new THREE.Vector2(0, 0) },
				uColor: { value: new THREE.Color(1, 0, 0) },
				uColorLerp: { value: 0 },
				uZoom: { value: 1 },
				uTime: { value: 0 },
			},
			vertexShader: view_vs,
			fragmentShader: illusion_fs,
		})
		this.target = target
		this.target.material = this.material
	}
	update_target_textures_y(top_url: string, bottom_url: string, x_urls: string[], y: number, apply: boolean) {
		// Not supporting 4+ images per portfolio yet. Do not seem the need right now
		const urls: string[] = [top_url, bottom_url]
		urls.push(...x_urls)
		// 6 faces, varying abount of textures
		const l = Math.max(urls.length, 6)
		for (let i = 0; i < l; ++i) {
			const target_texture_idx = texture_mappings[y][i]
			const url_idx = i >= 2 ? 2 + ((i - 2) % x_urls.length) : i
			const texture_idx = loaded_urls.indexOf(urls[url_idx])
			if (texture_idx >= 0) {
				this.target_textures[target_texture_idx] = loaded_textures[texture_idx]
				if (apply) this.update(new Array(6).fill(false), 0, y)
			} else {
				this.target_textures[target_texture_idx] = null
				texture_loader.load(urls[url_idx], (texture) => {
					this.target_textures[target_texture_idx] = texture
					loaded_textures.push(texture)
					loaded_urls.push(urls[url_idx])
					if (apply) this.update(new Array(6).fill(false), 0, y)
				})
			}
		}
	}

	preload(urls: string[], renderer: THREE.WebGLRenderer | null) {
		for (let i = 0; i < urls.length; ++i) {
			texture_loader.load(urls[i], (texture) => {
				loaded_textures.push(texture)
				loaded_urls.push(urls[i])
				if (renderer) renderer.initTexture(texture)
			})
		}
	}

	update(facing_direction_arr: boolean[], x: number, y: number) {
		x; // Hack
		const l = facing_direction_arr.length
		for (let i = 0; i < l; ++i) {
			if (facing_direction_arr[i]) continue
			if (i < 4)
				this.update_face_matrix(i, Number(y === i) * Math.PI)
			else {
				this.update_face_matrix(i, y * ((-i + 4) + 0.5) * -Math.PI)
			}

			const target_texture = this.target_textures[i]
			if (this.active_textures[i] && this.active_textures[i] === target_texture) continue
			if (!target_texture) {
				if (!loading_texture) continue
				this.material.uniforms.uTextures.value[i] = loading_texture
				this.material.uniforms.uWidths.value[i] = loading_texture.width
				this.material.uniforms.uHeights.value[i] = loading_texture.height
			}
			else {
				this.material.uniforms.uTextures.value[i] = target_texture
				this.material.uniforms.uWidths.value[i] = target_texture.width
				this.material.uniforms.uHeights.value[i] = target_texture.height
			}
		}
	}

	update_face_matrix(face_index: number, radian_angle: number) {
		const c = Math.cos(radian_angle)
		const s = Math.sin(radian_angle)
		const offset = face_index * 9

		const rotation_matrices = this.rotation_matrices
		rotation_matrices[offset + 0] = c
		rotation_matrices[offset + 1] = s
		rotation_matrices[offset + 2] = 0

		rotation_matrices[offset + 3] = -s
		rotation_matrices[offset + 4] = c
		rotation_matrices[offset + 5] = 0

		rotation_matrices[offset + 6] = 0.5 - 0.5 * c + 0.5 * s
		rotation_matrices[offset + 7] = 0.5 - 0.5 * s - 0.5 * c
		rotation_matrices[offset + 8] = 1
	}

}

