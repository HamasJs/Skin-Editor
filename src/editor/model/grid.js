// Custom implementation of the GridHelper made for custom width and height/ divisions x and y
import * as THREE from "three";

const DEFAULT_GRID_COLOR = new THREE.Color("#575757");

function createShaderMaterial(color = DEFAULT_GRID_COLOR, width, height, depth) {
  return new THREE.ShaderMaterial({
    extensions: {
      derivatives: true,
    },
    uniforms: {
      stroke: { value: color },
      thickness: { value: 1 },
      segments: { value: [width, height, depth] },
    },
    transparent: true,
    alphaTest: 1e-5,
    side: THREE.FrontSide,
    depthWrite: false,
    vertexShader: `
      varying float distToCamera;
      varying vec3 vNormal;
      varying vec2 UV;

      void main() {
        vNormal = normal;
        UV = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec2 UV;

      uniform vec3 stroke;
      uniform float thickness;
      uniform vec3 segments;

      vec2 getSegments(vec3 normal) {
        if (normal.x != 0.0) {
          return vec2(segments.z, segments.y);
        }
        if (normal.y != 0.0) {
          return vec2(segments.x, segments.z);
        }
        if (normal.z != 0.0) {
          return vec2(segments.x, segments.y);
        }
        
        return vec2(0.0);
      }

      // Grid Shader adapted from https://bgolus.medium.com/the-best-darn-grid-shader-yet-727f9278b9d8
      vec4 getGrid(vec2 uv) {
        float lineWidth = thickness;

        vec2 uvDeriv = fwidth(uv);
        vec2 drawWidth = uvDeriv * lineWidth;
        vec2 lineAA = uvDeriv * 1.5;
        vec2 gridUV = 1.0 - abs(fract(uv) * 2.0 - 1.0);
        vec2 grid2 = smoothstep(drawWidth + lineAA, drawWidth - lineAA, gridUV);
        float grid = mix(grid2.x, 1.0, grid2.y);

        return vec4(stroke, grid);
      }

      void main() {
        gl_FragColor = getGrid(UV * getSegments(vNormal));
      }
    `,
  })
}

function createSkinGridBox(width, height, depth, segWidth, segHeight, segDepth, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = createShaderMaterial(color, segWidth, segHeight, segDepth);

  return new THREE.Mesh(geometry, material);
}

export { createSkinGridBox };
