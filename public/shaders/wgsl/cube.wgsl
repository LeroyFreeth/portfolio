struct Uniforms {
    transform: mat4x4f,
};
@group(0) @binding(0) var<uniform> mesh: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
};

@vertex
fn vs_main(@location(0) pos: vec3f, @location(1) uv: vec2f) -> VertexOutput {
    var out: VertexOutput;
    
    // Ensure the matrix multiplication matches your flat matrix orientation layout:
    out.position = mesh.transform * vec4f(pos, 1.0);
    out.uv = uv;
    return out;
}
@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    // Custom shader design: Use UV coords to render colors (Red=U, Green=V)
    return vec4f(in.uv, 0.5, 1.0);
}

