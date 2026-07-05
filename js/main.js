
import { loadWasmEngine, getMatrixView, getVertexPoolView } from "./wasm_bridge.js";
import { initWebGPU } from "./webgpu_driver.js";

const ENGINE_OFFSETS = {
    MATRIX_OFFSET: 4,
    VERTEX_POOL_OFFSET: 72
};

async function bootEngine() {
    console.log("Booting Cross-Platform Web Frontend...");

    // 1. Initialize Subsystems concurrently using our modules
    const gpu = await initWebGPU("gpuCanvas", "shaders/wgsl/cube.wgsl");
    const wasm = await loadWasmEngine("logic.wasm");

    // 2. Initialize the platform abstraction C memory pointers
    wasm.exports.wasm_init();
    const dataPtr = wasm.exports.wasm_get_data_ptr();

    // 3. Create WebGPU Buffers 
    const vertexBuffer = gpu.device.createBuffer({
        size: 36 * 5 * 4,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    const uniformBuffer = gpu.device.createBuffer({
        size: 16 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // 4. Construct the Render Pipeline Layout
    const pipeline = gpu.device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: gpu.shaderModule,
            entryPoint: 'vs_main',
            buffers: [{
                arrayStride: 20, // 5 floats * 4 bytes = 20 bytes per vertex attribute row
                attributes: [
                    { shaderLocation: 0, offset: 0,  format: 'float32x3' }, // position (X, Y, Z)
                    { shaderLocation: 1, offset: 12, format: 'float32x2' }  // uv (U, V)
                ]
            }]
        },
        fragment: {
            module: gpu.shaderModule,
            entryPoint: 'fs_main',
            targets: [{ format: gpu.format }]
        },
        primitive: { 
            topology: 'triangle-list',
            cullMode: 'back'
        },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        }
    });

    // CRITICAL FIX: Explicitly allocate the depth hardware texture wrapper here
    const depthTexture = gpu.device.createTexture({
        size: [gpu.canvas.width, gpu.canvas.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // Connect our uniform buffer object to the WGSL layout binding group
    const bindGroup = gpu.device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
    });

    // Upload static cube vertices once from C memory into the vertex buffer
    const initialVertices = getVertexPoolView(wasm.rawMemory, dataPtr + ENGINE_OFFSETS.VERTEX_POOL_OFFSET);
    gpu.device.queue.writeBuffer(vertexBuffer, 0, initialVertices);

    let lastTime = performance.now();

    // 5. Clean Unified Render Frame Loop
    function frame() {
        const now = performance.now();
        const deltaTime = (now - lastTime) / 1000.0;
        lastTime = now;

        // Step 1: Advance the 3D cube rotation math inside pure C Wasm code
        wasm.exports.wasm_update(deltaTime);

        // Step 2: Grab the live matrix array straight out of Wasm memory view
        const liveMatrix = getMatrixView(wasm.rawMemory, dataPtr + ENGINE_OFFSETS.MATRIX_OFFSET);

        // Step 3: Stream it directly to your graphics card
        gpu.device.queue.writeBuffer(uniformBuffer, 0, liveMatrix);

        // Step 4: WebGPU Clear and Draw Pass calls
        const commandEncoder = gpu.device.createCommandEncoder();
        const textureView = gpu.context.getCurrentTexture().createView();
        
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
                loadOp: "clear", storeOp: "store"
            }],
            depthStencilAttachment: {
                view: depthTexture.createView(), // Now cleanly defined in parent scope!
                depthClearValue: 1.0, depthLoadOp: 'clear', depthStoreOp: 'store'
            }
        });

        renderPass.setPipeline(pipeline);
        renderPass.setBindGroup(0, bindGroup);
        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.draw(36);
        renderPass.end();

        gpu.device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

// Run the application bootstrap execution
bootEngine();

