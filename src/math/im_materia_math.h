
static float simple_sin(float x) {
    // Taylor series approximation for sin(x) around 0
    float x2 = x * x;
    return x * (1.0f - x2 * (1.0f / 6.0f - x2 * (1.0f / 120.0f)));
}
static float simple_cos(float x) {
    float x2 = x * x;
    return 1.0f - x2 * (0.5f - x2 * (1.0f / 24.0f - x2 * (1.0f / 720.0f)));
}

