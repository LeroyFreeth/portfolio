#include "../engine.h"

#define WASM_EXPORT __attribute__((visibility("default")))

WASM_EXPORT void wasm_init(void) { engine_init(); }
WASM_EXPORT void wasm_update(float dt) { engine_tick(dt); }
WASM_EXPORT void* wasm_get_data_ptr(void) { return &g_engine; }

