export async function initWebGPU(canvasId, shaderUrl) {
    if (!navigator.gpu) throw new Error("WebGPU unsupported");
    
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext("webgpu");
    const format = navigator.gpu.getPreferredCanvasFormat();
    
    context.configure({ device, format, alphaMode: "opaque" });

    // Load external shader file
    const shaderResponse = await fetch(shaderUrl);
    const shaderCode = await shaderResponse.text();
    const shaderModule = device.createShaderModule({ code: shaderCode });

    return { device, context, format, canvas, shaderModule };
}
