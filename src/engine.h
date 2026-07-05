#ifndef ENGINE_H
#define ENGINE_H

// A 3D vertex with position and texture attributes
typedef struct {
    float x, y, z;
    float u, v;
} Vertex;

// The unified data map shared globally across pipelines
typedef struct {
    float time;
    float mvp_matrix[16]; // Model-View-Projection Matrix fed straight to Shaders
    unsigned int vertex_count;
    Vertex vertex_pool[36]; // 6 faces * 2 triangles * 3 vertices = 36 items
} EngineData;

extern EngineData g_engine;

void engine_init(void);
void engine_tick(float delta_time);

#endif

