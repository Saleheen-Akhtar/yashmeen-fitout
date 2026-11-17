import * as THREE from "three";
import type { Canvas2DHitPlate, HelixSlot } from "./types";
export const DESKTOP_PLATE_SIZES: [number, number][] = [
  [1.92, 1.36], // architectural landscape
  [1.38, 1.58], // editorial portrait
  [1.56, 1.52], // museum square
  [2.04, 1.30], // wide panoramic
  [1.44, 1.62], // tall print
];

export const MOBILE_PLATE_SIZES: [number, number][] = [
  [1.58, 1.16],
  [1.16, 1.38],
  [1.30, 1.30],
  [1.66, 1.10],
  [1.22, 1.42],
];

export const VERTEX_SHADER = `
  uniform float uHover;
  uniform float uBend;
  uniform float uScalePulse;
  varying vec2 vUv;
  varying float vCurvatureEdge;

  void main() {
    vUv = uv;
    vec3 pos = position;
    // Slight sculptural outward swell when hovered + delicate inertia flex
    pos.z += uHover * 0.24;
    pos.xy *= (1.0 + uHover * 0.045) * uScalePulse;
    pos.z += sin(uv.x * 3.14159265) * uBend * (uv.y - 0.5) * 0.16;
    vCurvatureEdge = abs(uv.x - 0.5) * 2.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const FRAGMENT_SHADER = `
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform float uLoadMix;
  uniform vec2 uUvScale;
  uniform float uOpacity;
  uniform float uHover;
  uniform vec3 uFogColor;
  uniform float uFogAmount;
  varying vec2 vUv;
  varying float vCurvatureEdge;

  void main() {
    vec2 centeredUv = (vUv - 0.5) * uUvScale + 0.5;
    vec3 stonePlaceholder = vec3(0.902, 0.886, 0.855);

    vec3 photoRgb = stonePlaceholder;
    if (uHasMap > 0.5) {
      vec4 texel = texture2D(uMap, clamp(centeredUv, 0.002, 0.998));
      photoRgb = mix(stonePlaceholder, texel.rgb, uLoadMix);
    }

    // Subtle hover radiance boost & soft warm architectural atmosphere
    photoRgb *= mix(1.0, 1.06, uHover);
    vec3 finalRgb = mix(photoRgb, uFogColor, clamp(uFogAmount, 0.0, 1.0));

    // Crisp anti-aliased frameless edge (zero border lines)
    float edgeX = smoothstep(0.0, 0.004, vUv.x) * smoothstep(1.0, 0.996, vUv.x);
    float edgeY = smoothstep(0.0, 0.004, vUv.y) * smoothstep(1.0, 0.996, vUv.y);
    float alpha = uOpacity * edgeX * edgeY;

    if (alpha < 0.008) discard;
    gl_FragColor = vec4(finalRgb, alpha);
  }
`;

export function mod(n: number, span: number) {
  return ((n % span) + span) % span;
}

export function wrapSigned(val: number, span: number) {
  return mod(val + span / 2, span) - span / 2;
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function getTextureDimensions(
  tex: THREE.Texture | undefined,
): { width: number; height: number } | null {
  const img = tex?.image as { width?: number; height?: number } | undefined;
  if (!img || typeof img.width !== 'number' || typeof img.height !== 'number' || img.width <= 0) {
    return null;
  }
  return { width: img.width, height: img.height };
}

export function detectWebGLSupport(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('canvas');
    const gl =
      probe.getContext('webgl2') ||
      probe.getContext('webgl') ||
      probe.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export function hitTestCanvas2D(
  plates: Canvas2DHitPlate[],
  localX: number,
  localY: number,
): HelixSlot | null {
  for (let i = plates.length - 1; i >= 0; i--) {
    const p = plates[i];
    if (localX < p.minX || localX > p.maxX || localY < p.minY || localY > p.maxY) {
      continue;
    }
    const pts = p.pts;
    for (let s = 0; s < pts.length - 1; s++) {
      const a = pts[s];
      const b = pts[s + 1];
      const xLeft = Math.min(a.sxTop, a.sxBot);
      const xRight = Math.max(b.sxTop, b.sxBot);
      if (localX >= xLeft && localX <= xRight) {
        const span = Math.max(0.001, xRight - xLeft);
        const t = clamp((localX - xLeft) / span, 0, 1);
        const topY = a.syTop + (b.syTop - a.syTop) * t;
        const botY = a.syBot + (b.syBot - a.syBot) * t;
        if (localY >= Math.min(topY, botY) && localY <= Math.max(topY, botY)) {
          return p.slot;
        }
      }
    }
  }
  return null;
}

export function createCurvedPlateGeometry(width: number, height: number, radius: number) {
  const geom = new THREE.PlaneGeometry(width, height, 24, 12);
  const posAttr = geom.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const lx = posAttr.getX(i);
    const phi = lx / radius;
    const cx = Math.sin(phi) * radius;
    const cz = (Math.cos(phi) - 1.0) * radius;
    posAttr.setX(i, cx);
    posAttr.setZ(i, cz);
  }
  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
  geom.computeBoundingBox();
  geom.computeBoundingSphere();
  return geom;
}
