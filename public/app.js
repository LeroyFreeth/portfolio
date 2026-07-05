// Define byte offsets matching 'struct EngineData' layout exactly
const ENGINE_STRUCT = {
    TOTAL_SIZE: 216,       // (1 float * 4) + (16 matrix floats * 4) + (1 uint32 * 4) + (36 vertices * 5 floats * 4 bytes)
    
    TIME_OFFSET: 0,        // 4 bytes
    MATRIX_OFFSET: 4,      // 16 floats * 4 bytes = 64 bytes
    VERTEX_COUNT: 68,      // 4 bytes
    VERTEX_POOL_START: 72  // 36 vertices * 5 floats each * 4 bytes = 720 bytes
};

async function init() {
    // 1. Initialize WebGPU
    if (!navigator.gpu) {
        alert("WebGPU is not supported by your browser configuration.");
        return;
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        alert("No physical GPU adapter found. Check Vulkan drivers.");
        return;
    }
    const device = await adapter.requestDevice();

    const canvas = document.getElementById("gpuCanvas");
    const context = canvas.getContext("webgpu");
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format: canvasFormat, alphaMode: "opaque" });

    // 2. Fetch and load the custom WGSL shader file
    const shaderResponse = await fetch("shaders/wgsl/cube.wgsl");
    const shaderSource = await shaderResponse.text();
    const shaderModule = device.createShaderModule({ code: shaderSource });

    // 3. Fetch and instantiate the standalone Wasm core
    const wasmResponse = await fetch("logic.wasm");
    const wasmBuffer = await wasmResponse.arrayBuffer();
    const wasmModule = await WebAssembly.instantiate(wasmBuffer, {});
    
    // Extract our platform abstraction hooks from the Wasm exports
    const { wasm_init, wasm_update, wasm_get_data_ptr, memory } = wasmModule.instance.exports;

    // Boot up our C engine logic
    wasm_init();
    const dataPtr = wasm_get_data_ptr();

    // 4. Create WebGPU Hardware Buffers
    // A Vertex Buffer: Holds positions (X, Y, Z) and UVs (U, V) for 36 vertices
    const gpuVertexBuffer = device.createBuffer({
        size: 36 * 5 * 4, // 36 vertices * 5 floats * 4 bytes = 720 bytes
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    // A Uniform Buffer: Holds our 4x4 matrix configuration
    const gpuUniformBuffer = device.createBuffer({
        size: 16 * 4, // 16 floats * 4 bytes = 64 bytes
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // 5. Construct the Render Pipeline
    const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
            module: shaderModule,
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
            module: shaderModule,
            entryPoint: 'fs_main',
            targets: [{ format: canvasFormat }]
        },
        primitive: { 
            topology: 'triangle-list',
            cullMode: 'back' // Cull back faces for performance
        },
        depthStencil: {
            // Enable depth testing so the 3D cube handles visual sorting correctly
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        }
    });

    // Generate depth texture wrapper matching canvas proportions
    const depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // 6. Connect our uniform buffer object to the WGSL layout binding group
    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: gpuUniformBuffer } }]
    });

    // Upload the initial static cube vertices once straight out of C memory
    const initialVertexView = new Float32Array(memory.buffer, dataPtr + ENGINE_STRUCT.VERTEX_POOL_START, 36 * 5);
    device.queue.writeBuffer(gpuVertexBuffer, 0, initialVertexView);

    let lastTime = performance.now();

    // 7. Core Execution Render Loop
    function frame() {
        const now = performance.now();
        const deltaTime = (now - lastTime) / 1000.0;
        lastTime = now;

        // Step A: Progress the cross-platform 3D matrix rotation mathematics inside C
        wasm_update(deltaTime);

        // Step B: Extract the dynamic MVP rotation matrix straight from the Wasm memory heap
        const matrixMemoryView = new Float32Array(
            memory.buffer, 
            dataPtr + ENGINE_STRUCT.MATRIX_OFFSET, 
            16
        );

        // Step C: Push the C calculated matrix updates over to WebGPU VRAM registers
        device.queue.writeBuffer(gpuUniformBuffer, 0, matrixMemoryView);

        // Step D: Record graphics pipeline instructions
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
        
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
                loadOp: "clear",
                storeOp: "store",
            }],
            depthStencilAttachment: {
                view: depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            }
        });

        renderPass.setPipeline(pipeline);
        renderPass.setBindGroup(0, bindGroup);
        renderPass.setVertexBuffer(0, gpuVertexBuffer);
        renderPass.draw(36); // Render our 36 C-defined vertices forming the cube
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

init();

