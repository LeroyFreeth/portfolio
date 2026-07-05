export async function loadWasmEngine(wasmUrl) {
    const response = await fetch(wasmUrl);
    const buffer = await response.arrayBuffer();
    const wasmModule = await WebAssembly.instantiate(buffer, {});
    
    // Return both the exported C functions and the raw linear memory heap
    return {
        exports: wasmModule.instance.exports,
        rawMemory: wasmModule.instance.exports.memory
    };
}

// Helper utility to read a 4x4 matrix straight from Wasm memory offsets
export function getMatrixView(memory, pointerAddress) {
    return new Float32Array(memory.buffer, pointerAddress, 16);
}

// Helper utility to read the 36 cube vertices straight from Wasm memory offsets
export function getVertexPoolView(memory, pointerAddress) {
    return new Float32Array(memory.buffer, pointerAddress, 36 * 5); // 36 vertices * 5 floats
}
