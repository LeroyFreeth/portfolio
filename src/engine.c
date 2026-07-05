
#include "engine.h"

EngineData g_engine = {0};

// Static definitions for a standard 3D Cube mapping layout (Positions & UVs)
static const Vertex cube_vertices[36] = {
    // Front Face (Z = 0.5)
    {-0.5f,-0.5f, 0.5f, 0.0f, 0.0f}, { 0.5f,-0.5f, 0.5f, 1.0f, 0.0f}, { 0.5f, 0.5f, 0.5f, 1.0f, 1.0f},
    {-0.5f,-0.5f, 0.5f, 0.0f, 0.0f}, { 0.5f, 0.5f, 0.5f, 1.0f, 1.0f}, {-0.5f, 0.5f, 0.5f, 0.0f, 1.0f},
    // Back Face (Z = -0.5)
    {-0.5f,-0.5f,-0.5f, 1.0f, 0.0f}, {-0.5f, 0.5f,-0.5f, 1.0f, 1.0f}, { 0.5f, 0.5f,-0.5f, 0.0f, 1.0f},
    {-0.5f,-0.5f,-0.5f, 1.0f, 0.0f}, { 0.5f, 0.5f,-0.5f, 0.0f, 1.0f}, { 0.5f,-0.5f,-0.5f, 0.0f, 0.0f},
    // Top Face (Y = 0.5)
    {-0.5f, 0.5f,-0.5f, 0.0f, 1.0f}, {-0.5f, 0.5f, 0.5f, 0.0f, 0.0f}, { 0.5f, 0.5f, 0.5f, 1.0f, 0.0f},
    {-0.5f, 0.5f,-0.5f, 0.0f, 1.0f}, { 0.5f, 0.5f, 0.5f, 1.0f, 0.0f}, { 0.5f, 0.5f,-0.5f, 1.0f, 1.0f},
    // Bottom Face (Y = -0.5)
    {-0.5f,-0.5f,-0.5f, 0.0f, 0.0f}, { 0.5f,-0.5f,-0.5f, 1.0f, 0.0f}, { 0.5f,-0.5f, 0.5f, 1.0f, 1.0f},
    {-0.5f,-0.5f,-0.5f, 0.0f, 0.0f}, { 0.5f,-0.5f, 0.5f, 1.0f, 1.0f}, {-0.5f,-0.5f, 0.5f, 0.0f, 1.0f},
    // Right Face (X = 0.5)
    { 0.5f,-0.5f,-0.5f, 1.0f, 0.0f}, { 0.5f, 0.5f,-0.5f, 1.0f, 1.0f}, { 0.5f, 0.5f, 0.5f, 0.0f, 1.0f},
    { 0.5f,-0.5f,-0.5f, 1.0f, 0.0f}, { 0.5f, 0.5f, 0.5f, 0.0f, 1.0f}, { 0.5f,-0.5f, 0.5f, 0.0f, 0.0f},
    // Left Face (X = -0.5)
    {-0.5f,-0.5f,-0.5f, 0.0f, 0.0f}, {-0.5f,-0.5f, 0.5f, 1.0f, 0.0f}, {-0.5f, 0.5f, 0.5f, 1.0f, 1.0f},
    {-0.5f,-0.5f,-0.5f, 0.0f, 0.0f}, {-0.5f, 0.5f, 0.5f, 1.0f, 1.0f}, {-0.5f, 0.5f,-0.5f, 0.0f, 1.0f}
};

void engine_init(void) {
    g_engine.time = 0.0f;
    g_engine.vertex_count = 36;
    
    for(int i = 0; i < 36; i++) {
        g_engine.vertex_pool[i] = cube_vertices[i];
    }
}

// Custom floating-point modulo function to bound variables safely
static float float_mod(float a, float b) {
    if (b == 0.0f) return 0.0f;
    int quotient = (int)(a / b);
    float result = a - ((float)quotient * b);
    if (result < 0.0f) result += b;
    return result;
}

// High-precision Bhaskara I approximation for sine (Accurate across all timeline ranges)
static float robust_sin(float x) {
    x = float_mod(x, 6.2831853f);
    int sign = 1;
    if (x > 3.14159265f) {
        x -= 3.14159265f;
        sign = -1;
    }
    float pi = 3.14159265f;
    float num = 16.0f * x * (pi - x);
    float den = 5.0f * pi * pi - 4.0f * x * (pi - x);
    return (float)sign * (num / den);
}

static float robust_cos(float x) {
    return robust_sin(x + 1.57079632f);
}

// Multiplies two 4x4 matrices together (Column-Major)
static void mat4_multiply(float* out, const float* a, const float* b) {
    float res[16];
    for (int col = 0; col < 4; col++) {
        for (int row = 0; row < 4; row++) {
            res[col * 4 + row] = 
                a[0 * 4 + row] * b[col * 4 + 0] +
                a[1 * 4 + row] * b[col * 4 + 1] +
                a[2 * 4 + row] * b[col * 4 + 2] +
                a[3 * 4 + row] * b[col * 4 + 3];
        }
    }
    for (int i = 0; i < 16; i++) out[i] = res[i];
}

void engine_tick(float delta_time) {
    g_engine.time += delta_time;

    // 1. Calculate rotation components over time
    float angle_y = g_engine.time * 0.6f; // Y-axis spin pace
    float angle_x = g_engine.time * 0.3f; // X-axis tilt pace
    
    float s_y = robust_sin(angle_y);
    float c_y = robust_cos(angle_y);
    float s_x = robust_sin(angle_x);
    float c_x = robust_cos(angle_x);

    // 2. Build Model Rotation Matrix (Y-Axis Spin)
    float rot_y[16] = {0};
    rot_y[0] = c_y;  rot_y[2] = -s_y;
    rot_y[5] = 1.0f;
    rot_y[8] = s_y;  rot_y[10] = c_y;
    rot_y[15] = 1.0f;

    // 3. Build Model Rotation Matrix (X-Axis Tilt)
    float rot_x[16] = {0};
    rot_x[0] = 1.0f;
    rot_x[5] = c_x;  rot_x[6] = s_x;
    rot_x[9] = -s_x; rot_x[10] = c_x;
    rot_x[15] = 1.0f;

    // 4. Combine rotations: model = rot_x * rot_y
    float model[16];
    mat4_multiply(model, rot_x, rot_y);

    // 5. Generate View Matrix (Camera translated back on Z by -2.5 units)
    float view[16] = {0};
    view[0] = 1.0f; view[5] = 1.0f; view[10] = 1.0f; view[15] = 1.0f;
    view[14] = -2.5f;

    // 6. Generate Perspective Projection Matrix (FOV=45, Aspect=800/600, Near=0.1, Far=100)
    float proj[16] = {0};
    float fov_rad = 1.0f / 0.41421356f; // 1 / tan(45/2)
    float aspect = 800.0f / 600.0f;
    float near_plane = 0.1f;
    float far_plane = 100.0f;

    proj[0] = fov_rad / aspect;
    proj[5] = fov_rad;
    proj[10] = far_plane / (near_plane - far_plane);
    proj[11] = -1.0f;
    proj[14] = (near_plane * far_plane) / (near_plane - far_plane);

    // 7. Chain matrices together: MVP = Proj * View * Model
    float view_model[16];
    mat4_multiply(view_model, view, model);
    mat4_multiply(g_engine.mvp_matrix, proj, view_model);
}

