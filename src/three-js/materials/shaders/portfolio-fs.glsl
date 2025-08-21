/**
  Specialized shader made for the portfolio.
  Allows to display specific items with some minor pointer interactions
 */

uniform vec3 _color;

uniform float _mesh_aspect;

uniform float _circle_radius_b;
uniform float _circle_radius_a;
uniform vec2 _circle_position_offset;



uniform sampler2D _texture_a;
uniform vec2 _texture_a_ui_resolution;
uniform vec2 _texture_a_resolution;

uniform vec2 _texture_offset;
uniform vec2 _window_resolution;

uniform float _progress;
uniform float _transition_start_time;

uniform float _time;
uniform float _set_texture_time;

uniform vec2 _pointer_position;

varying vec2 v_uv;

void main() {
  vec2 v_coords = v_uv - 0.5;

  vec2 end_position_offset = vec2(-0.2, 0);
 
  float time_progress = clamp(0.0, 1.0, (_time - _set_texture_time) / 1.0);
  //float ease_step = step(time_progress, 0.5);
  //float time_eased_progress = ease_step * 2.0 * time_progress * time_progress + (1.0 - ease_step) * (1.0 - pow(-2.0 * time_progress + 2.0, 2.0) / 2.0);
  float time_eased_progress = 1.0 - (1.0 - time_progress) * (1.0 - time_progress);
  float progress_combined = (_progress * 0.8 + time_eased_progress * 0.2);

  // Animation multipliers
  float pulse = (1.0 - ((sin((_time - _set_texture_time) * 2.0) + 1.0)));
  float circle_a_radius_anim = _circle_radius_a + (3.0 - _circle_radius_a) * progress_combined - (1.0 - _progress) * pulse * 0.2;
  float circle_b_radius_anim = _circle_radius_a + (3.0 - _circle_radius_a) * _progress;
  vec2 texture_resolution_anim = mix(_texture_a_ui_resolution, _texture_a_resolution, _progress);
  vec2 circle_offset_anim = _circle_position_offset - _circle_position_offset * _progress - end_position_offset * _progress;
  vec2 texture_offset_anim = _texture_offset + ((_texture_a_resolution / _window_resolution) * 0.5 - _texture_offset) * _progress - end_position_offset * _progress; //_texture_offset + (scale ) * progress;

    // Setup circle dist 
  float texture_edge_step =  step(_texture_a_resolution.y, _texture_a_resolution.x);
  float circle_scale = texture_edge_step * (_window_resolution.x / _texture_a_resolution.x) + (1.0 - texture_edge_step) * (_window_resolution.y / _texture_a_resolution.y);
  vec2 uv_circle = (v_coords + circle_offset_anim) * 2.0;
  vec2 dist_uv = vec2(uv_circle.x * (_window_resolution.x / _window_resolution.y), uv_circle.y) * circle_scale;

  // Calc circle radius
  float dist = distance(dist_uv, vec2(0.0, 0.0));
  float radius_a = dist / circle_a_radius_anim;
  float circle_a = (1.0 - (radius_a * step(0.0, progress_combined))) * 0.6;

    // Calc circle radius
  float radius_b = dist / circle_b_radius_anim;
  float circle_b = clamp(((1.0 - radius_b) / fwidth(radius_b)) , 0.0, 1.0);

  v_coords += texture_offset_anim ;
  vec2 uv_texture = v_coords * (_window_resolution / texture_resolution_anim);
  
  
  float x_mask = step(01.0, uv_texture.x ) + 1.0 - step(0.0, uv_texture.x);
  float y_mask = 1.0 - step(0.0, uv_texture.y) + step(1.0, uv_texture.y);
  float texture_mask = 1.0 - min(x_mask + y_mask, 1.0);

  vec4 texture_a = texture2D(_texture_a, fract(uv_texture));
  float mask = clamp(mix(circle_b + circle_a, circle_a + texture_mask, _progress), 0.0, 1.0);

  float pointer_distance = clamp(distance(v_uv, _pointer_position) * 8.0, 0.0, 1.0);
  float pointer_value = (1.0 - pointer_distance - (1.0 - pulse) * 0.2) * 0.2;


  gl_FragColor = vec4(texture_a.rgb, min(mask + pointer_value, 1.0));
}