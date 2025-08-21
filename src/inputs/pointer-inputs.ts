import * as THREE from 'three'

const pointer_position = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
    pointer_position.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer_position.y = (event.clientY / window.innerHeight) * -2 + 1
})

window.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    pointer_position.x = (touch.clientX / window.innerWidth) * 2 - 1
    pointer_position.y = (touch.clientY / window.innerHeight) * -2 + 1
});

export { pointer_position as mouse_position }