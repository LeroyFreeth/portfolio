import * as THREE from 'three';
let loader = new THREE.TextureLoader();

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// --- 2. INITIALIZE RENDER TARGETS ---
// These store the textures used during transitions
const renderTargetA = new THREE.WebGLRenderTarget(width, height);

// --- 3. BUILD SCENE A (Red World) ---
const sceneA = new THREE.Scene();
sceneA.background = new THREE.Color('#1a0505');
const cameraA = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
cameraA.position.z = 5;

const geoA = new THREE.BoxGeometry(3, 2, 2);
const matA = new THREE.MeshStandardMaterial({
    color: 0x00aaff,
    roughness: 0.1,
    metalness: 0.5,
});
const meshA = new THREE.Mesh(geoA, matA);
sceneA.add(meshA);

const lightA = new THREE.DirectionalLight(0xffffff, 1);
lightA.position.set(1, 1, 1);
sceneA.add(lightA);

// --- 4. BUILD SCENE B (Blue World) ---
const sceneB = new THREE.Scene();
sceneB.background = new THREE.Color('#050a1a');
const cameraB = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
cameraB.position.z = 5;

const geoB = new THREE.BoxGeometry(2, 3, 2);
const matB = new THREE.MeshStandardMaterial({
    color: 0x00aaff,
    roughness: 0.1,
    metalness: 0.5,
});
const meshB = new THREE.Mesh(geoB, matB);
sceneB.add(meshB);

const lightB = new THREE.DirectionalLight(0xffffff, 1.5);
lightB.position.set(-1, 1, 1);
sceneB.add(lightB);
sceneB.add(new THREE.AmbientLight(0x333333));

const dmat = new THREE.MeshDepthMaterial();

function createTransitionQuad(incomingTexture) {
    const material = new THREE.ShaderMaterial({
        uniforms: {
            tIncoming: { value: incomingTexture },
            uProgress: { value: 0.0 },
        },
        vertexShader: `
		    varying vec2 vUv;
		    void main() {
			vUv = uv;
			gl_Position = vec4(position, 1.0);
		    }
		`,
        fragmentShader: `
		    uniform sampler2D tIncoming;
		    uniform float uProgress;
		    varying vec2 vUv;

		    void main() {
			// 1. Establish the zoom center (0.5, 0.5 is the middle of the screen)
			vec2 center = vec2(0.5, 0.5);
			
			// 2. Calculate the direction vector from the center to the current pixel
			vec2 dir = vUv - center;

			// 3. Define the maximum blur strength.
			// The blur peaks at 0.5 progress and winds back down to 0.0 at completion.
			float strength = sin(uProgress * 3.14159265) * 0.15;

			// 4. Multi-sample loop to create the motion blur effect
			vec4 colorAccumulator = vec4(0.0);
			const int samples = 12; // Higher numbers = smoother blur, lower = better performance

			for (int i = 0; i < samples; i++) {
			    // Calculate step scaling from 0.0 to 1.0 across the sample count
			    float scale = float(i) / float(samples - 1);
			    
			    // Offset the UV coordinates inward along the directional vector
			    vec2 sampleUv = vUv - dir * strength * scale;
			    
			    // Accumulate the pixel colors
			    colorAccumulator += texture2D(tIncoming, sampleUv);
			}
			
			// Average the colors out
			vec4 blurredOldColor = colorAccumulator / float(samples);

			// 5. Fade out the blurred old scene to reveal the native 3D scene sitting underneath
			// We use opacity mix instead of discard for a fluid cross-dissolve look
			float alpha = 1.0 - uProgress;

			// Stop drawing the quad completely when the transition rests at 1.0
			if (uProgress >= 1.0) {
			    discard;
			}

			gl_FragColor = vec4(blurredOldColor.rgb, alpha);
		    }
		`,
        depthTest: false,
        depthWrite: false,
        transparent: true, // Crucial for letting the alpha value fade into the background scene
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    return new THREE.Mesh(geometry, material);
}

// Scene A's quad samples Scene B's texture snapshot
const quadInA = createTransitionQuad(renderTargetA.texture);
sceneA.add(quadInA);

// Scene B's quad samples Scene A's texture snapshot
const quadInB = createTransitionQuad(renderTargetA.texture);
sceneB.add(quadInB);

// --- 6. STATE MANAGEMENT ---
let currentScene = 'A';
let isTransitioning = false;
let progress = 0.0;

export function triggerTransitionTo(sceneIndex: number) {
    const charArr = ['A', 'B'];
    const targetScene = charArr[sceneIndex];
    if (targetScene === currentScene) return;

    // scene.overrideMaterial = dmat
    // rend.setRenderTarget(outputRt)
    // rend.render(scene, camera)
    // rend.setRenderTarget(null)
    // scene.overrideMaterial = null

    if (targetScene === 'B') {
        if (!isTransitioning) quadInA.visible = false;
        // renderer.setRenderTarget(depthRenderTarget);
        // renderer.render(sceneA, cameraA);
        // quadMaterial.uniforms.tDepth.value = depthRenderTarget.depthTexture;

        renderer.setRenderTarget(renderTargetA);
        renderer.render(sceneA, cameraA);

        // Pass 2: Show Scene B with active blend quad sitting on top
        quadInB.visible = true;
        renderer.setRenderTarget(null);
    } else {
        // Pass 1: Freeze Scene B to texture (Hide its overlay quad first)
        if (!isTransitioning) quadInB.visible = false;

        // renderer.setRenderTarget(depthRenderTarget);
        // renderer.render(sceneB, cameraB);
        // quadMaterial.uniforms.tDepth.value = depthRenderTarget.depthTexture;

        renderer.setRenderTarget(renderTargetA);
        renderer.render(sceneB, cameraB);

        // Pass 2: Show Scene A with active blend quad sitting on top
        quadInA.visible = true;
        renderer.setRenderTarget(null);
    }

    progress = 0.0;
    currentScene = targetScene;
    isTransitioning = true;
    console.log(`Transitioning to ${targetScene}`);
}

// --- 7. ANIMATION AND RENDER LOOP ---
export function animateScene(deltaTime: number) {
    // Keep the objects inside scenes animating independently
    // meshA.rotation.x += 0.01;
    // meshA.rotation.y += 0.01;
    // meshB.rotation.y += 0.015;
    // meshB.rotation.z += 0.005;

    if (isTransitioning) {
        // Increment speed of transition clock
        progress = Math.min(1.0, progress + 0.015);

        if (currentScene === 'B') {
            quadInB.material.uniforms.uProgress.value = progress;
            renderer.render(sceneB, cameraB);
        } else {
            quadInA.material.uniforms.uProgress.value = progress;
            renderer.render(sceneA, cameraA);
        }

        if (progress >= 1.0) {
            isTransitioning = false;
        }
    } else {
        // --- STANDBY STATIC STATE (No overhead render target passes) ---
        renderer.setRenderTarget(null);
        if (currentScene === 'A') {
            quadInA.visible = false;
            renderer.render(sceneA, cameraA);
        } else {
            quadInB.visible = false;
            renderer.render(sceneB, cameraB);
        }
    }
}

// --- 9. HANDLE WINDOW RESIZE ---
window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderer.setSize(w, h);

    cameraA.aspect = w / h;
    cameraA.updateProjectionMatrix();

    cameraB.aspect = w / h;
    cameraB.updateProjectionMatrix();

    renderTargetA.setSize(w, h);
});

export function updateScene(sceneIndex, projectIndex) {}

export function setContent(portfolioData: PortfolioData) {
    loader.load(portfolioData.contentArr[0].images[0], (texture) => {
        matA.map = texture;
        matB.map = texture;
        console.log('loaded...');
        matA.needsUpdate = true;
        matB.needsUpdate = true;
    });

    console.log(`Showing portfolio data for ${portfolioData.title} in scene`);
}
