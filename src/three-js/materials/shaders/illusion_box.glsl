varying vec3 vLocalPos;
uniform sampler2D uTextures[6];
uniform mat3 uRotations[6];
uniform float uWidths[6];
uniform float uHeights[6];
uniform vec3 uColor;
uniform float uColorLerp;
uniform vec3 uScale;
uniform vec2 uUvOffset;
uniform float uZoom;
uniform float uTime;

vec2 rotate_uv(vec2 uv, int faceIndex) {
        vec3 transformed = uRotations[faceIndex] * vec3(uv, 1.0);
        return transformed.xy;
}

vec2 get_uvs_for_face_idx(int idx, vec2 face_uv) {
        face_uv = rotate_uv(face_uv, idx);

        float aspect_check = step(uWidths[idx], uHeights[idx]);
        float aspect = (uWidths[idx] / uHeights[idx]);
        vec2 vertical_aspect_uv = (vec2(face_uv.x / aspect, face_uv.y) + vec2(-0.5 * (1.0 / aspect) + 0.5, 0.0));
        vec2 horizontal_aspect_uv = (vec2(face_uv.x, face_uv.y * aspect) + vec2(0.0, -0.5 * aspect + 0.5));
        return aspect_check * vertical_aspect_uv + (1.0 - aspect_check) * horizontal_aspect_uv;
}

float get_mask(vec2 uv) {
        float x_mask = step(1.0, uv.x) + 1.0 - step(0.0, uv.x);
        float y_mask = 1.0 - step(0.0, uv.y) + step(1.0, uv.y);
        return (1.0 - 0.9 * min(x_mask + y_mask, 1.0));
}

void main() {
        vec3 dir = vLocalPos;
        vec3 absDir = abs(dir);
        vec4 result = vec4(1.0, 0.0, 0.0, 1.0);
        vec2 uv = vec2(0.0);
	vec3 color = vec3(.0);
        float mask = 0.;

        float isX = step(absDir.y, absDir.x) * step(absDir.z, absDir.x);
        float isY = step(absDir.x, absDir.y) * step(absDir.z, absDir.y);
        float isZ = 1.0 - isX - isY;

        float isPositive = step(0.0, dot(dir, vec3(isX, isY, isZ)));
        float denomX = max(absDir.x, 0.0001);
        float denomY = max(absDir.y, 0.0001);
        float denomZ = max(absDir.z, 0.0001);

        float zoom = uZoom;
        float pan = (zoom - 1.0) / -2.0;
        vec2 panning = vec2(pan);

        int faceIdx = 0;

        if (isX > 0.5) faceIdx = (isPositive > 0.5) ? 5 : 4; // 5 = +X, 4 = -X
        if (isY > 0.5) faceIdx = (isPositive > 0.5) ? 3 : 1; // 3 = +Y, 1 = -Y
        if (isZ > 0.5) faceIdx = (isPositive > 0.5) ? 2 : 0; // 2 = +Z, 0 = -Z

        if (faceIdx == 0) {
                // NZ;
                uv = get_uvs_for_face_idx(0, (vec2(dir.x, -dir.y) / denomZ * 0.5 + 0.5) * zoom + panning);
		uv += uUvOffset;
                mask = get_mask(uv);
                result = mix(vec4(uColor, 1.), texture2D(uTextures[0], fract(uv)), mask);
        }
        else if (faceIdx == 1) {
                // NY
                uv = get_uvs_for_face_idx(1, (vec2(dir.x, dir.z) / denomY * 0.5 + 0.5) * zoom + panning);
		uv += uUvOffset;
                mask = get_mask(uv);
                result = mix(vec4(uColor, 1.), texture2D(uTextures[1], fract(uv)), mask);
        }
        else if (faceIdx == 2) {
                // vec2 uvPZ =
                uv = get_uvs_for_face_idx(2, (vec2(dir.x, dir.y) / denomZ * 0.5 + 0.5) * zoom + panning);
		uv += uUvOffset;
                mask = get_mask(uv);
                result = mix(vec4(uColor, 1.), texture2D(uTextures[2], fract(uv)), mask);
        }
        else if (faceIdx == 3) {
                // vec2 uvPY =
                uv = get_uvs_for_face_idx(3, (vec2(dir.x, -dir.z) / denomY * 0.5 + 0.5) * zoom + panning);
		uv += uUvOffset;
                mask = get_mask(uv);
                result = mix(vec4(uColor, 1.), texture2D(uTextures[3], fract(uv)), mask);
        }
        else if (faceIdx == 4) {
                // vec2 uvNX =
                uv = get_uvs_for_face_idx(4, (vec2(dir.z, dir.y) / denomX * 0.5 + 0.5) * zoom + panning);
		uv += uUvOffset;
                mask = get_mask(uv);
                result = mix(vec4(uColor, 1.), texture2D(uTextures[4], fract(uv)), mask);
        }
        else if (faceIdx == 5) {
                // vec2 uvPX =
                uv = get_uvs_for_face_idx(5, (vec2(-dir.z, dir.y) / denomX * 0.5 + 0.5) * zoom + panning);
		uv += uUvOffset;
                mask = get_mask(uv);
                result = mix(vec4(uColor, 1.), texture2D(uTextures[5], fract(uv)), mask);
        }
        gl_FragColor = mix(result, vec4(uColor, 1.), uColorLerp);
}
