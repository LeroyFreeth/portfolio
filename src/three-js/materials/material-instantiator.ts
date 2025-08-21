import * as THREE from 'three'
import circleFs from './shaders/portfolio-fs.glsl?raw'
import genericVs from './shaders/generic-vs.glsl?raw'

function PortfolioMaterial(): THREE.ShaderMaterial {
    const material = new THREE.ShaderMaterial({
        uniforms: {
            _circle_radius_a: { value: 0 },
            _circle_position_offset: { value: new THREE.Vector2(0, 0) },

            _texture_a: { value: null },
            _texture_b: { value: null },
        
            _texture_offset: { value: new THREE.Vector2(0, 0) },

            _texture_a_resolution: { value: new THREE.Vector2() },
            _texture_a_ui_resolution: {value: new THREE.Vector2() },

            _texture_resolution_b: {value: new THREE.Vector2() },
            _window_resolution: { value: new THREE.Vector2() },

            _progress: { value: 0.0 },
            _set_texture_time: { value: 0.0 },
            _time: { value: 0.0 },

            _color: { value: new THREE.Color(0xff00ff) },

            _pointer_position: { value: new THREE.Vector2() },
            _pointer_start_time: { value: 0.0 },

            _mesh_aspect: { value: 0.0 },
        },
        fragmentShader: circleFs,
        vertexShader: genericVs,
        transparent: true,
        alphaTest: 0.5
    })

    material.uniforms._window_resolution.value.x = window.innerWidth
    material.uniforms._window_resolution.value.y = window.innerHeight

    // Warning, ensure camera resolves aspect on resize first!
    window.addEventListener('resize', () => {
        material.uniforms._window_resolution.value.x = window.innerWidth
        material.uniforms._window_resolution.value.y = window.innerHeight
    })
    return material
}

export { PortfolioMaterial }