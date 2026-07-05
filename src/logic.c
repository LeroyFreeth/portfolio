

float float_fmod(float a, float b) {
    if (b == 0.0f) return 0.0f; // Prevent division by zero
    int quotient = (int)(a / b);
    return a - ((float)quotient * b);
}

// -------------------------------------------------------------------------------
// INPUT STATE
// -------------------------------------------------------------------------------
struct InputState {
  unsigned int click_event_flag; // 0 = Idle, 1 = Button was clicked!
  unsigned int click_counter;    // Keeps track of total clicks processed
};
static struct InputState input_state = {0, 0.0f};

static int click_total = 0;

WASM_EXPORT
void update_game_logic(float delta_time) {
  total_time += delta_time;

  // Slow down shifting speed
  float offset = (total_time * 0.5f);

  // Animate the top vertex's UV mapping coordinates subtly over time
  // to prove that WebGPU is live-streaming data straight out of C memory!
  triangle_vertices[0].uv[0] = float_fmod(0.5f + offset, 1.0f);

  if (input_state.click_event_flag > 0) {
    input_state.click_counter += 1;
    input_state.click_event_flag = 0;

    triangle_vertices[0].position[0] = input_state.click_counter % 2;
  }
}
