
varying vec2 v_uv;

uniform vec3 _color;
uniform float _lerp;
uniform vec2 _window_resolution;
uniform vec2 _texture_a_resolution;
uniform float _angle;
uniform float _zoom;
uniform float _time;

uniform sampler2D _texture_a;
uniform sampler2D _texture_b;
 uniform samplerCube uEnvMap;

vec2 rotate_uv(vec2 uv, float angle, vec2 pivot) {
        float s = sin(angle);
        float c = cos(angle);
        mat2 rot = mat2(c, -s, s, c);
        return rot * (uv - pivot) + pivot;
}

void main()
{
        vec2 rotated_uv = rotate_uv(v_uv, _angle, vec2(0.5));
        float aspect_check = step(_texture_a_resolution.x, _texture_a_resolution.y);
        float aspect =(_texture_a_resolution.x / _texture_a_resolution.y);
        vec2 vertical_aspect_uv = (vec2(rotated_uv.x / aspect, rotated_uv.y) + vec2(-0.5 * (1.0 / aspect) + 0.5, 0.0));
        vec2 horizontal_aspect_uv = (vec2(rotated_uv.x, rotated_uv.y * aspect) + vec2(0.0, -0.5 * aspect + 0.5));
        vec2 uv = aspect_check * vertical_aspect_uv + (1.0 - aspect_check) * horizontal_aspect_uv;
        // vec2 uv = vertical_aspect_uv;

        float zoom = _zoom + ((sin(_time * 2.0) + 1.0) * 0.5 * 0.05);
        float panning = (zoom - 1.0) / -2.0;
        uv = uv * zoom + vec2(panning, panning);

        float x_mask = step(1.0, uv.x) + 1.0 - step(0.0, uv.x);
        float y_mask = 1.0 - step(0.0, uv.y) + step(1.0, uv.y);
        float texture_mask = (1.0 - _lerp) * (1.0 - min(x_mask + y_mask, 1.0));

        vec4 texture_a = texture2D(_texture_a, fract(uv))* texture_mask;
        vec4 texture_b = texture2D(_texture_b, fract(uv))* texture_mask;

        vec4 color = vec4((1.0 - texture_mask) * _color, 1.0);
        gl_FragColor = texture_a + color;
}
