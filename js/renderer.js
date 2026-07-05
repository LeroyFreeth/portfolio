export function initWebGPU(canvasId) {
    console.log("Initializing WebGPU Subsystem...");
    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext("webgpu");
    return { canvas, context };
}
