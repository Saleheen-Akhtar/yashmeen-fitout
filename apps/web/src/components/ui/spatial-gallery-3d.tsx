'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  ArrowDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpatialGalleryItem {
  id: string;
  title: string;
  category: string;
  src: string;
  fallbackSrc: string;
  index: number;
}

export interface SpatialFilterOption {
  id: string;
  label: string;
}

interface SpatialGallery3DProps {
  items: SpatialGalleryItem[];
  filters: SpatialFilterOption[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  loading?: boolean;
  error?: string;
  onSelectItem: (item: SpatialGalleryItem) => void;
  isLightboxOpen?: boolean;
  onScrollToFooter?: () => void;
}

interface HelixSlot {
  slotKey: string;
  item: SpatialGalleryItem;
  width: number;
  height: number;
  baseTheta: number;
  baseY: number;
}

interface MeshEntry {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  material: THREE.ShaderMaterial;
  slot: HelixSlot;
  planeAspect: number;
  hoverLift: number;
  loadMix: number;
  hasTexture: boolean;
}

interface Canvas2DPlateEntry {
  slot: HelixSlot;
  planeAspect: number;
  image: HTMLImageElement | null;
  hoverLift: number;
  loadMix: number;
}

interface ProjectedStripPoint {
  sxTop: number;
  syTop: number;
  sxBot: number;
  syBot: number;
}

interface Canvas2DHitPlate {
  slot: HelixSlot;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  pts: ProjectedStripPoint[];
}

const DESKTOP_PLATE_SIZES: [number, number][] = [
  [1.92, 1.36], // architectural landscape
  [1.38, 1.58], // editorial portrait
  [1.56, 1.52], // museum square
  [2.04, 1.30], // wide panoramic
  [1.44, 1.62], // tall print
];

const MOBILE_PLATE_SIZES: [number, number][] = [
  [1.58, 1.16],
  [1.16, 1.38],
  [1.30, 1.30],
  [1.66, 1.10],
  [1.22, 1.42],
];

const VERTEX_SHADER = `
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

const FRAGMENT_SHADER = `
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

function mod(n: number, span: number) {
  return ((n % span) + span) % span;
}

function wrapSigned(val: number, span: number) {
  return mod(val + span / 2, span) - span / 2;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function getTextureDimensions(
  tex: THREE.Texture | undefined,
): { width: number; height: number } | null {
  const img = tex?.image as { width?: number; height?: number } | undefined;
  if (!img || typeof img.width !== 'number' || typeof img.height !== 'number' || img.width <= 0) {
    return null;
  }
  return { width: img.width, height: img.height };
}

function detectWebGLSupport(): boolean {
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

function hitTestCanvas2D(
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

function createCurvedPlateGeometry(width: number, height: number, radius: number) {
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

export function SpatialGallery3D({
  items,
  filters,
  activeFilter,
  onFilterChange,
  loading = false,
  error = '',
  onSelectItem,
  isLightboxOpen = false,
  onScrollToFooter,
}: SpatialGallery3DProps) {
  const stageRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  const [hasInteracted, setHasInteracted] = useState(false);
  const [rendererUnavailable, setRendererUnavailable] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<SpatialGalleryItem | null>(null);
  const [focusItem, setFocusItem] = useState<SpatialGalleryItem | null>(null);
  const [filterTransitioning, setFilterTransitioning] = useState(false);
  const [reducedMotion] = useState<boolean>(false);

  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440,
  );

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Helix architectural parameters adapting seamlessly between desktop & mobile
  const helixLayout = useMemo(() => {
    const isMobile = viewportWidth < 640;
    const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

    const radius = isMobile ? 4.75 : isTablet ? 5.65 : 6.2;
    const cols = isMobile ? 14 : isTablet ? 15 : 16;
    const ringPitch = isMobile ? 1.66 : 1.88;
    const defaultCamDist = isMobile ? 11.8 : isTablet ? 11.5 : 11.4;
    const minCamDist = isMobile ? 8.0 : 8.4;
    const maxCamDist = isMobile ? 16.0 : 16.0;

    if (items.length === 0) {
      return {
        slots: [] as HelixSlot[],
        radius,
        cols,
        ringPitch,
        spanY: ringPitch * 4,
        defaultCamDist,
        minCamDist,
        maxCamDist,
      };
    }

    // Pad evenly to integer rings so vertical wraps & columns remain flush at all category sizes
    const turns = Math.max(3, Math.ceil(items.length / cols));
    const poolCount = turns * cols;
    const totalHeight = turns * ringPitch;
    const angleStep = (Math.PI * 2) / cols;
    const yStep = ringPitch / cols;
    const sizePalette = isMobile ? MOBILE_PLATE_SIZES : DESKTOP_PLATE_SIZES;

    const slots: HelixSlot[] = Array.from({ length: poolCount }, (_, i) => {
      const item = items[i % items.length];
      const [width, height] = sizePalette[(i * 3 + Math.floor(i / cols)) % sizePalette.length];

      // Ascending spiral ribbon anchored cleanly at slot 0 center with zero seam
      const baseTheta = i * angleStep;
      const baseY = i * yStep;

      return {
        slotKey: `${item.id}-${i}`,
        item,
        width,
        height,
        baseTheta,
        baseY,
      };
    });

    return {
      slots,
      radius,
      cols,
      ringPitch,
      spanY: totalHeight,
      defaultCamDist,
      minCamDist,
      maxCamDist,
    };
  }, [items, viewportWidth]);

  // Camera state: infinite theta (horizontal 360 spin), infinite Y (helix travel), zoom radius Z
  const camRef = useRef({
    theta: 0,
    y: 0,
    dist: 11.6,
    tTheta: 0,
    ty: 0,
    tDist: 11.6,
    vTheta: 0,
    vy: 0,
    pointerX: 0,
    pointerY: 0,
    tiltX: 0,
    tiltY: 0,
  });

  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistRef = useRef<number | null>(null);
  const pointerNdcRef = useRef(new THREE.Vector2(99, 99));
  const hoverDirtyRef = useRef(false);
  const pointerActiveHoverRef = useRef(false);

  const dragRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    totalDist: 0,
  });

  const keysHeldRef = useRef<Set<string>>(new Set());
  const hudHoldRef = useRef<{ dTheta: number; dy: number; dDist: number } | null>(null);

  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    raycaster: THREE.Raycaster;
    group: THREE.Group;
    meshes: MeshEntry[];
  } | null>(null);

  const twoDRef = useRef<{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    scratchCanvas: HTMLCanvasElement;
    scratchCtx: CanvasRenderingContext2D;
    dpr: number;
    camera: THREE.PerspectiveCamera;
    width: number;
    height: number;
    plates: Canvas2DPlateEntry[];
    hitPlates: Canvas2DHitPlate[];
    vTmp: THREE.Vector3;
  } | null>(null);

  // Deduplicated texture/image pools keyed by URL so shared fallbacks/categories decode once
  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const loadingUrlsRef = useRef<Set<string>>(new Set());

  const layoutRef = useRef(helixLayout);
  layoutRef.current = helixLayout;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;
  const isLightboxOpenRef = useRef(isLightboxOpen);
  isLightboxOpenRef.current = isLightboxOpen;
  const hoveredIdRef = useRef<string | null>(null);
  const focusIdRef = useRef<string | null>(null);
  const rafIdRef = useRef<number>(0);

  const markInteracted = useCallback(() => {
    setHasInteracted((prev) => (prev ? prev : true));
  }, []);

  // Core Three.js / Canvas2D 3D-projected cylinder render + hover raycasting
  const renderScene = useRef<(isMoving: boolean, allowStateSync?: boolean) => void>(() => {});

  const stepFrame = useCallback(() => {
    const glCtx = threeRef.current;
    const d2Ctx = twoDRef.current;
    if (!glCtx && !d2Ctx) {
      rafIdRef.current = 0;
      return;
    }

    const c = camRef.current;
    const L = layoutRef.current;
    const keys = keysHeldRef.current;
    const reduced = reducedMotionRef.current;

    if (!isLightboxOpenRef.current) {
      const spinSpeed = 0.032;
      const climbSpeed = 0.085;
      const zoomSpeed = 0.14;
      let kdTheta = 0;
      let kdy = 0;
      let kdDist = 0;

      if (keys.has('ArrowLeft') || keys.has('KeyA')) kdTheta += spinSpeed;
      if (keys.has('ArrowRight') || keys.has('KeyD')) kdTheta -= spinSpeed;
      if (keys.has('ArrowUp') || keys.has('KeyW')) kdy += climbSpeed;
      if (keys.has('ArrowDown') || keys.has('KeyS')) kdy -= climbSpeed;
      if (keys.has('KeyE') || keys.has('Equal') || keys.has('NumpadAdd')) kdDist -= zoomSpeed;
      if (keys.has('KeyQ') || keys.has('Minus') || keys.has('NumpadSubtract')) kdDist += zoomSpeed;

      if (hudHoldRef.current) {
        kdTheta += hudHoldRef.current.dTheta;
        kdy += hudHoldRef.current.dy;
        kdDist += hudHoldRef.current.dDist;
      }

      if (kdTheta !== 0 || kdy !== 0 || kdDist !== 0) {
        markInteracted();
        c.tTheta += kdTheta;
        c.ty += kdy;
        c.tDist = clamp(c.tDist + kdDist, L.minCamDist, L.maxCamDist);
      }
    }

    if (!dragRef.current.active) {
      const decay = reduced ? 0.65 : 0.92;
      if (Math.abs(c.vTheta) > 0.00025) {
        c.tTheta += c.vTheta;
        c.vTheta *= decay;
      } else {
        c.vTheta = 0;
      }
      if (Math.abs(c.vy) > 0.0005) {
        c.ty += c.vy;
        c.vy *= decay;
      } else {
        c.vy = 0;
      }
    }

    const ease = reduced ? 0.35 : 0.13;
    c.theta += (c.tTheta - c.theta) * ease;
    c.y += (c.ty - c.y) * ease;
    c.dist += (c.tDist - c.dist) * ease;

    const targetTiltX = reduced ? 0 : c.pointerY * 0.14;
    const targetTiltY = reduced ? 0 : c.pointerX * 0.22;
    c.tiltX += (targetTiltX - c.tiltX) * (reduced ? 0.3 : 0.09);
    c.tiltY += (targetTiltY - c.tiltY) * (reduced ? 0.3 : 0.09);

    let hoverAnimating = false;
    if (glCtx) {
      for (let i = 0; i < glCtx.meshes.length; i++) {
        const m = glCtx.meshes[i];
        if (m.hasTexture && m.loadMix < 0.999) {
          hoverAnimating = true;
          break;
        }
      }
    } else if (d2Ctx) {
      for (let i = 0; i < d2Ctx.plates.length; i++) {
        const p = d2Ctx.plates[i];
        if (p.image && p.loadMix < 0.999) {
          hoverAnimating = true;
          break;
        }
      }
    }

    const hasInput =
      dragRef.current.active ||
      keys.size > 0 ||
      hudHoldRef.current !== null ||
      hoverDirtyRef.current;

    const remainingDelta =
      Math.abs(c.tTheta - c.theta) +
      Math.abs(c.ty - c.y) +
      Math.abs(c.tDist - c.dist) +
      Math.abs(c.vTheta) +
      Math.abs(c.vy) +
      Math.abs(targetTiltX - c.tiltX) +
      Math.abs(targetTiltY - c.tiltY);

    const stillMoving = hasInput || remainingDelta > 0.0008 || hoverAnimating;
    renderScene.current(stillMoving, true);

    if (glCtx) {
      for (let i = 0; i < glCtx.meshes.length; i++) {
        const m = glCtx.meshes[i];
        const targetHover = hoveredIdRef.current === m.slot.slotKey ? 1 : 0;
        if (Math.abs(targetHover - m.hoverLift) > 0.01) {
          hoverAnimating = true;
          break;
        }
      }
    } else if (d2Ctx) {
      for (let i = 0; i < d2Ctx.plates.length; i++) {
        const p = d2Ctx.plates[i];
        const targetHover = hoveredIdRef.current === p.slot.slotKey ? 1 : 0;
        if (Math.abs(targetHover - p.hoverLift) > 0.01) {
          hoverAnimating = true;
          break;
        }
      }
    }

    if (stillMoving || hoverAnimating) {
      rafIdRef.current = requestAnimationFrame(stepFrame);
    } else {
      c.theta = c.tTheta;
      c.y = c.ty;
      c.dist = c.tDist;
      c.tiltX = targetTiltX;
      c.tiltY = targetTiltY;
      renderScene.current(false, true);
      rafIdRef.current = 0;
    }
  }, [markInteracted]);

  const wake = useCallback(() => {
    if (!rafIdRef.current && (threeRef.current || twoDRef.current)) {
      rafIdRef.current = requestAnimationFrame(stepFrame);
    }
  }, [stepFrame]);

  renderScene.current = (isMoving: boolean, allowStateSync = true) => {
    const c = camRef.current;
    const L = layoutRef.current;
    const halfSpanY = Math.max(2.5, L.spanY / 2);
    const fadeEdgeY = halfSpanY * 0.62;
    const velocityBend = clamp((c.tTheta - c.theta) * 5.0 + (c.ty - c.y) * 0.45, -1.4, 1.4);
    const horizonCos = clamp(L.radius / Math.max(L.radius + 1.4, c.dist) - 0.08, 0.28, 0.54);

    // GPU WebGL Shader Cylinder Renderer
    const glCtx = threeRef.current;
    if (glCtx) {
      const { renderer, scene, camera, raycaster, meshes } = glCtx;
      camera.position.set(c.tiltY * 0.45, 0.22 - c.tiltX * 0.35, c.dist);
      camera.lookAt(c.tiltY * 0.12, 0.16, 0);

      let centerBestScore = -Infinity;
      let centerBestItem: SpatialGalleryItem | null = null;

      for (let i = 0; i < meshes.length; i++) {
        const entry = meshes[i];
        const { mesh, material, slot } = entry;

        const relTheta = wrapSigned(slot.baseTheta + c.theta, Math.PI * 2);
        const relY = wrapSigned(slot.baseY - c.y, L.spanY);

        const cosTheta = Math.cos(relTheta);
        const absTheta = Math.abs(relTheta);

        const sideFade = clamp((cosTheta - horizonCos) / 0.36, 0, 1);
        const vertFade =
          Math.abs(relY) > fadeEdgeY
            ? clamp((halfSpanY - Math.abs(relY)) / (halfSpanY - fadeEdgeY), 0, 1)
            : 1;
        const alpha = sideFade * vertFade;

        if (alpha < 0.012) {
          mesh.visible = false;
          continue;
        }

        mesh.visible = true;
        mesh.position.set(
          Math.sin(relTheta) * L.radius,
          relY,
          Math.cos(relTheta) * L.radius,
        );
        mesh.rotation.y = relTheta;

        const focusScore = cosTheta * 2.0 - Math.abs(relY) * 0.55 - absTheta * 0.7;
        if (alpha > 0.7 && focusScore > centerBestScore) {
          centerBestScore = focusScore;
          centerBestItem = slot.item;
        }

        if (entry.hasTexture && entry.loadMix < 1) {
          entry.loadMix = Math.min(1, entry.loadMix + (isMoving ? 0.14 : 0.25));
        }

        const targetHover = hoveredIdRef.current === slot.slotKey ? 1 : 0;
        entry.hoverLift += (targetHover - entry.hoverLift) * 0.16;

        const fogAmount = clamp(
          (1.0 - cosTheta) * 0.92 + (Math.abs(relY) / (halfSpanY * 1.45)) * 0.35,
          0,
          0.82,
        );

        material.uniforms.uOpacity.value = alpha;
        material.uniforms.uHover.value = entry.hoverLift;
        material.uniforms.uBend.value = velocityBend;
        material.uniforms.uLoadMix.value = entry.loadMix;
        material.uniforms.uFogAmount.value = fogAmount;
      }

      if (allowStateSync) {
        if (centerBestItem && focusIdRef.current !== centerBestItem.id) {
          focusIdRef.current = centerBestItem.id;
          setFocusItem(centerBestItem);
        } else if (!centerBestItem && focusIdRef.current !== null) {
          focusIdRef.current = null;
          setFocusItem(null);
        }

        if (
          hoverDirtyRef.current &&
          pointerActiveHoverRef.current &&
          !dragRef.current.active &&
          !isLightboxOpenRef.current
        ) {
          hoverDirtyRef.current = false;
          raycaster.setFromCamera(pointerNdcRef.current, camera);
          const visibleObjects = meshes.filter((m) => m.mesh.visible).map((m) => m.mesh);
          const hits = raycaster.intersectObjects(visibleObjects, false);

          if (hits.length > 0) {
            const hitMesh = hits[0].object;
            const found = meshes.find((m) => m.mesh === hitMesh);
            if (found && hoveredIdRef.current !== found.slot.slotKey) {
              hoveredIdRef.current = found.slot.slotKey;
              setHoveredItem(found.slot.item);
              if (stageRef.current) stageRef.current.style.cursor = 'pointer';
            }
          } else if (hoveredIdRef.current !== null) {
            hoveredIdRef.current = null;
            setHoveredItem(null);
            if (stageRef.current) stageRef.current.style.cursor = '';
          }
        }
      }

      renderer.render(scene, camera);
      return;
    }

    // 3D Perspective-Projected Canvas2D Curved Cylinder Engine (universal non-WebGL fallback)
    const d2Ctx = twoDRef.current;
    if (!d2Ctx) return;

    const { ctx, scratchCanvas, scratchCtx, dpr, camera, width, height, plates, vTmp } = d2Ctx;
    ctx.clearRect(0, 0, width, height);

    camera.position.set(c.tiltY * 0.45, 0.22 - c.tiltX * 0.35, c.dist);
    camera.lookAt(c.tiltY * 0.12, 0.16, 0);
    camera.updateMatrixWorld();

    let centerBestScore = -Infinity;
    let centerBestItem: SpatialGalleryItem | null = null;

    const visibleList: Array<{
      entry: Canvas2DPlateEntry;
      relTheta: number;
      relY: number;
      cosTheta: number;
      alpha: number;
      fogAmount: number;
    }> = [];

    for (let i = 0; i < plates.length; i++) {
      const entry = plates[i];
      const relTheta = wrapSigned(entry.slot.baseTheta + c.theta, Math.PI * 2);
      const relY = wrapSigned(entry.slot.baseY - c.y, L.spanY);
      const cosTheta = Math.cos(relTheta);
      const absTheta = Math.abs(relTheta);

      const sideFade = clamp((cosTheta - horizonCos) / 0.36, 0, 1);
      const vertFade =
        Math.abs(relY) > fadeEdgeY
          ? clamp((halfSpanY - Math.abs(relY)) / (halfSpanY - fadeEdgeY), 0, 1)
          : 1;
      const alpha = sideFade * vertFade;

      if (alpha < 0.012) continue;

      const focusScore = cosTheta * 2.0 - Math.abs(relY) * 0.55 - absTheta * 0.7;
      if (alpha > 0.7 && focusScore > centerBestScore) {
        centerBestScore = focusScore;
        centerBestItem = entry.slot.item;
      }

      if (entry.image && entry.loadMix < 1) {
        entry.loadMix = Math.min(1, entry.loadMix + (isMoving ? 0.14 : 0.25));
      }

      const targetHover = hoveredIdRef.current === entry.slot.slotKey ? 1 : 0;
      entry.hoverLift += (targetHover - entry.hoverLift) * 0.16;

      const fogAmount =
        clamp(
          (1.0 - cosTheta) * 0.92 + (Math.abs(relY) / (halfSpanY * 1.45)) * 0.35,
          0,
          0.82,
        ) *
        (1 - entry.hoverLift * 0.65);

      visibleList.push({ entry, relTheta, relY, cosTheta, alpha, fogAmount });
    }

    // Painter's back-to-front draw order along cylinder depth + hover lift
    visibleList.sort((a, b) => a.cosTheta + a.entry.hoverLift * 0.12 - (b.cosTheta + b.entry.hoverLift * 0.12));

    const SEGMENTS = 16;
    const hitPlates: Canvas2DHitPlate[] = [];

    for (let i = 0; i < visibleList.length; i++) {
      const { entry, relTheta, relY, alpha, fogAmount } = visibleList[i];
      const { slot, image, hoverLift, loadMix, planeAspect } = entry;

      const hoverScale = 1 + hoverLift * 0.045;
      const halfH = (slot.height * 0.5) * hoverScale;
      const pts: ProjectedStripPoint[] = new Array(SEGMENTS + 1);

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      let valid = true;

      for (let s = 0; s <= SEGMENTS; s++) {
        const u = s / SEGMENTS;
        const lx = (u - 0.5) * slot.width * hoverScale;
        const phi = lx / L.radius;
        const theta = relTheta + phi;
        const r = L.radius + hoverLift * 0.24 + Math.sin(u * Math.PI) * velocityBend * 0.035;
        const wx = Math.sin(theta) * r;
        const wz = Math.cos(theta) * r;

        vTmp.set(wx, relY + halfH, wz).project(camera);
        if (vTmp.z >= 1) {
          valid = false;
          break;
        }
        const sxTop = (vTmp.x * 0.5 + 0.5) * width;
        const syTop = (-vTmp.y * 0.5 + 0.5) * height;

        vTmp.set(wx, relY - halfH, wz).project(camera);
        if (vTmp.z >= 1) {
          valid = false;
          break;
        }
        const sxBot = (vTmp.x * 0.5 + 0.5) * width;
        const syBot = (-vTmp.y * 0.5 + 0.5) * height;

        pts[s] = { sxTop, syTop, sxBot, syBot };
        minX = Math.min(minX, sxTop, sxBot);
        maxX = Math.max(maxX, sxTop, sxBot);
        minY = Math.min(minY, syTop, syBot);
        maxY = Math.max(maxY, syTop, syBot);
      }

      if (!valid || maxX < -40 || minX > width + 40 || maxY < -40 || minY > height + 40) {
        continue;
      }
      if (pts[SEGMENTS].sxTop <= pts[0].sxTop + 1.5) continue;

      const boxMinX = Math.floor(minX) - 1;
      const boxMinY = Math.floor(minY) - 1;
      const boxW = Math.max(2, Math.ceil(maxX) - boxMinX + 1);
      const boxH = Math.max(2, Math.ceil(maxY) - boxMinY + 1);
      const devW = Math.max(2, Math.ceil(boxW * dpr));
      const devH = Math.max(2, Math.ceil(boxH * dpr));

      if (scratchCanvas.width < devW || scratchCanvas.height < devH) {
        scratchCanvas.width = Math.max(scratchCanvas.width, devW);
        scratchCanvas.height = Math.max(scratchCanvas.height, devH);
      }

      scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      scratchCtx.clearRect(0, 0, devW, devH);
      scratchCtx.setTransform(dpr, 0, 0, dpr, -boxMinX * dpr, -boxMinY * dpr);

      scratchCtx.save();
      scratchCtx.beginPath();
      scratchCtx.moveTo(pts[0].sxTop, pts[0].syTop);
      for (let s = 1; s <= SEGMENTS; s++) scratchCtx.lineTo(pts[s].sxTop, pts[s].syTop);
      for (let s = SEGMENTS; s >= 0; s--) scratchCtx.lineTo(pts[s].sxBot, pts[s].syBot);
      scratchCtx.closePath();
      scratchCtx.clip();

      if (image && image.complete && image.naturalWidth > 0 && loadMix > 0.01) {
        const iw = image.naturalWidth;
        const ih = image.naturalHeight;
        const imgAspect = iw / Math.max(1, ih);
        let cropX = 0;
        let cropY = 0;
        let cropW = iw;
        let cropH = ih;

        if (imgAspect > planeAspect) {
          cropW = ih * planeAspect;
          cropX = (iw - cropW) * 0.5;
        } else {
          cropH = iw / planeAspect;
          cropY = (ih - cropH) * 0.5;
        }

        // Compose photo strips at full opacity inside offscreen scratch plate -> zero vertical seams at any DPR
        scratchCtx.globalAlpha = 1;
        const srcSliceW = cropW / SEGMENTS;

        for (let k = 0; k < SEGMENTS; k++) {
          const p0 = pts[k];
          const p1 = pts[k + 1];
          const x0 = Math.min(p0.sxTop, p0.sxBot);
          const x1 = Math.max(p1.sxTop, p1.sxBot);
          const sw = x1 - x0;
          if (sw <= 0.1) continue;

          const topY = Math.min(p0.syTop, p1.syTop) - 1;
          const botY = Math.max(p0.syBot, p1.syBot) + 1;

          scratchCtx.drawImage(
            image,
            cropX + k * srcSliceW,
            cropY,
            srcSliceW + 0.6,
            cropH,
            x0 - 0.3,
            topY,
            sw + 0.85,
            botY - topY,
          );
        }

        if (loadMix < 0.995) {
          scratchCtx.globalAlpha = 1 - loadMix;
          scratchCtx.fillStyle = '#e6e2da';
          scratchCtx.fillRect(boxMinX, boxMinY, boxW, boxH);
        }
      } else {
        scratchCtx.globalAlpha = 1;
        scratchCtx.fillStyle = '#e6e2da';
        scratchCtx.fillRect(boxMinX, boxMinY, boxW, boxH);
      }

      if (fogAmount > 0.01) {
        scratchCtx.globalAlpha = fogAmount;
        scratchCtx.fillStyle = '#f5f3ef';
        scratchCtx.fillRect(boxMinX, boxMinY, boxW, boxH);
      }

      scratchCtx.restore();

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(scratchCanvas, 0, 0, devW, devH, boxMinX, boxMinY, devW / dpr, devH / dpr);
      ctx.restore();

      hitPlates.push({ slot, minX, maxX, minY, maxY, pts });
    }

    d2Ctx.hitPlates = hitPlates;

    if (allowStateSync) {
      if (centerBestItem && focusIdRef.current !== centerBestItem.id) {
        focusIdRef.current = centerBestItem.id;
        setFocusItem(centerBestItem);
      } else if (!centerBestItem && focusIdRef.current !== null) {
        focusIdRef.current = null;
        setFocusItem(null);
      }

      if (
        hoverDirtyRef.current &&
        pointerActiveHoverRef.current &&
        !dragRef.current.active &&
        !isLightboxOpenRef.current
      ) {
        hoverDirtyRef.current = false;
        const px = (pointerNdcRef.current.x * 0.5 + 0.5) * width;
        const py = (-pointerNdcRef.current.y * 0.5 + 0.5) * height;
        const hitSlot = hitTestCanvas2D(hitPlates, px, py);

        if (hitSlot && hoveredIdRef.current !== hitSlot.slotKey) {
          hoveredIdRef.current = hitSlot.slotKey;
          setHoveredItem(hitSlot.item);
          if (stageRef.current) stageRef.current.style.cursor = 'pointer';
        } else if (!hitSlot && hoveredIdRef.current !== null) {
          hoveredIdRef.current = null;
          setHoveredItem(null);
          if (stageRef.current) stageRef.current.style.cursor = '';
        }
      }
    }
  };

  // Initialize GPU WebGL renderer cleanly; transparently fall back to 3D Canvas2D when WebGL is disabled
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    const isMobileInit = window.innerWidth < 640;
    const initFov = isMobileInit ? 50 : 42;
    camRef.current.dist = layoutRef.current.defaultCamDist;
    camRef.current.tDist = layoutRef.current.defaultCamDist;

    let glRenderer: THREE.WebGLRenderer | null = null;
    if (detectWebGLSupport()) {
      try {
        glRenderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch {
        glRenderer = null;
      }
    }

    if (glRenderer) {
      glRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      glRenderer.outputColorSpace = THREE.SRGBColorSpace;
      glRenderer.setClearColor(0xf5f3ef, 0);
      glRenderer.setSize(w, h, false);
      glRenderer.domElement.style.width = '100%';
      glRenderer.domElement.style.height = '100%';
      glRenderer.domElement.style.display = 'block';
      host.appendChild(glRenderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(initFov, w / h, 0.1, 60);
      camera.position.set(0, 0.08, camRef.current.dist);

      const group = new THREE.Group();
      scene.add(group);
      const raycaster = new THREE.Raycaster();

      threeRef.current = {
        renderer: glRenderer,
        scene,
        camera,
        raycaster,
        group,
        meshes: [],
      };
    } else {
      const canvas = document.createElement('canvas');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ctx = canvas.getContext('2d');
      const scratchCanvas = document.createElement('canvas');
      const scratchCtx = scratchCanvas.getContext('2d');
      if (!ctx || !scratchCtx) {
        setRendererUnavailable(true);
        return;
      }

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      host.appendChild(canvas);

      const camera = new THREE.PerspectiveCamera(initFov, w / h, 0.1, 60);
      camera.position.set(0, 0.08, camRef.current.dist);

      twoDRef.current = {
        canvas,
        ctx,
        scratchCanvas,
        scratchCtx,
        dpr,
        camera,
        width: w,
        height: h,
        plates: [],
        hitPlates: [],
        vTmp: new THREE.Vector3(),
      };
    }

    const onResize = () => {
      const target = canvasHostRef.current;
      if (!target) return;
      const rw = Math.max(1, target.clientWidth);
      const rh = Math.max(1, target.clientHeight);
      const fov = window.innerWidth < 640 ? 50 : 42;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (threeRef.current) {
        const active = threeRef.current;
        active.camera.fov = fov;
        active.camera.aspect = rw / rh;
        active.camera.updateProjectionMatrix();
        active.renderer.setPixelRatio(dpr);
        active.renderer.setSize(rw, rh, false);
      } else if (twoDRef.current) {
        const active = twoDRef.current;
        active.camera.fov = fov;
        active.camera.aspect = rw / rh;
        active.camera.updateProjectionMatrix();
        active.dpr = dpr;
        active.width = rw;
        active.height = rh;
        active.canvas.width = Math.round(rw * dpr);
        active.canvas.height = Math.round(rh * dpr);
        active.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      renderScene.current(false, false);
    };

    window.addEventListener('resize', onResize, { passive: true });
    const textureCache = textureCacheRef.current;
    const imgCache = imgCacheRef.current;

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
      if (threeRef.current) {
        threeRef.current.meshes.forEach((m) => {
          m.material.dispose();
        });
        threeRef.current.renderer.dispose();
        if (threeRef.current.renderer.domElement.parentNode === host) {
          host.removeChild(threeRef.current.renderer.domElement);
        }
        threeRef.current = null;
      }
      if (twoDRef.current) {
        if (twoDRef.current.canvas.parentNode === host) {
          host.removeChild(twoDRef.current.canvas);
        }
        twoDRef.current = null;
      }
      const uniqueTex = new Set(textureCache.values());
      uniqueTex.forEach((tex) => tex.dispose());
      textureCache.clear();
      imgCache.clear();
    };
  }, []);

  // Build / rebuild curved helix plates whenever filtered items or viewport radius changes
  useEffect(() => {
    const glCtx = threeRef.current;
    const d2Ctx = twoDRef.current;
    if (!glCtx && !d2Ctx) return;

    hoveredIdRef.current = null;
    let cancelled = false;
    loadingUrlsRef.current.clear();

    if (glCtx) {
      const prevGeoms = new Set<THREE.BufferGeometry>();
      glCtx.meshes.forEach((entry) => {
        prevGeoms.add(entry.mesh.geometry);
        glCtx.group.remove(entry.mesh);
        entry.material.dispose();
      });
      prevGeoms.forEach((g) => g.dispose());
      glCtx.meshes = [];

      const geomCache = new Map<string, THREE.BufferGeometry>();
      const fogColor = new THREE.Color(0xf5f3ef);

      const entries: MeshEntry[] = helixLayout.slots.map((slot) => {
        const sizeKey = `${slot.width}x${slot.height}x${helixLayout.radius}`;
        let geom = geomCache.get(sizeKey);
        if (!geom) {
          geom = createCurvedPlateGeometry(slot.width, slot.height, helixLayout.radius);
          geomCache.set(sizeKey, geom);
        }

        const planeAspect = slot.width / slot.height;
        const resolvedUrl = slot.item.src || slot.item.fallbackSrc;
        const cachedTex = textureCacheRef.current.get(resolvedUrl);
        const dims = getTextureDimensions(cachedTex);

        let uvScaleX = 1;
        let uvScaleY = 1;
        if (dims) {
          const imgAspect = dims.width / Math.max(1, dims.height);
          if (imgAspect > planeAspect) {
            uvScaleX = planeAspect / imgAspect;
          } else {
            uvScaleY = imgAspect / planeAspect;
          }
        }

        const material = new THREE.ShaderMaterial({
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide,
          uniforms: {
            uMap: { value: cachedTex ?? null },
            uHasMap: { value: cachedTex ? 1.0 : 0.0 },
            uLoadMix: { value: cachedTex ? 1.0 : 0.0 },
            uUvScale: { value: new THREE.Vector2(uvScaleX, uvScaleY) },
            uOpacity: { value: 1.0 },
            uHover: { value: 0.0 },
            uBend: { value: 0.0 },
            uScalePulse: { value: 1.0 },
            uFogColor: { value: fogColor },
            uFogAmount: { value: 0.0 },
          },
        });

        const mesh = new THREE.Mesh(geom, material);
        glCtx.group.add(mesh);

        return {
          mesh,
          material,
          slot,
          planeAspect,
          hoverLift: 0,
          loadMix: cachedTex ? 1 : 0,
          hasTexture: !!cachedTex,
        };
      });

      glCtx.meshes = entries;

      const applyLoadedTexture = (url: string, tex: THREE.Texture) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        textureCacheRef.current.set(url, tex);

        const activeCtx = threeRef.current;
        if (!activeCtx) return;

        const dims = getTextureDimensions(tex);
        const imgAspect = dims ? dims.width / Math.max(1, dims.height) : 1.4;

        let touched = false;
        activeCtx.meshes.forEach((m) => {
          const itemUrl = m.slot.item.src || m.slot.item.fallbackSrc;
          if (itemUrl !== url && m.slot.item.fallbackSrc !== url) return;
          const pa = m.planeAspect;
          m.material.uniforms.uMap.value = tex;
          m.material.uniforms.uHasMap.value = 1.0;
          m.material.uniforms.uUvScale.value.set(
            imgAspect > pa ? pa / imgAspect : 1.0,
            imgAspect > pa ? 1.0 : imgAspect / pa,
          );
          m.hasTexture = true;
          touched = true;
        });
        if (touched) wake();
      };

      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');

      const uniqueUrls = new Set<string>();
      entries.forEach((m) => {
        const url = m.slot.item.src || m.slot.item.fallbackSrc;
        if (!textureCacheRef.current.has(url)) {
          uniqueUrls.add(url);
        }
      });

      uniqueUrls.forEach((url) => {
        if (loadingUrlsRef.current.has(url)) return;
        loadingUrlsRef.current.add(url);
        loader.load(
          url,
          (tex) => {
            loadingUrlsRef.current.delete(url);
            if (cancelled) {
              tex.colorSpace = THREE.SRGBColorSpace;
              textureCacheRef.current.set(url, tex);
              return;
            }
            applyLoadedTexture(url, tex);
          },
          undefined,
          () => {
            loadingUrlsRef.current.delete(url);
            if (cancelled) return;
            const matching = entries.find((m) => (m.slot.item.src || m.slot.item.fallbackSrc) === url);
            const fallback = matching?.slot.item.fallbackSrc;
            if (!fallback || fallback === url) return;

            const cachedFb = textureCacheRef.current.get(fallback);
            if (cachedFb) {
              applyLoadedTexture(url, cachedFb);
              return;
            }
            loader.load(
              fallback,
              (fbTex) => {
                if (cancelled) {
                  fbTex.colorSpace = THREE.SRGBColorSpace;
                  textureCacheRef.current.set(fallback, fbTex);
                  return;
                }
                applyLoadedTexture(fallback, fbTex);
                applyLoadedTexture(url, fbTex);
              },
              undefined,
              () => {
                /* keep warm placeholder stone */
              },
            );
          },
        );
      });
    } else if (d2Ctx) {
      d2Ctx.plates = helixLayout.slots.map((slot) => {
        const resolvedUrl = slot.item.src || slot.item.fallbackSrc;
        const cachedImg = imgCacheRef.current.get(resolvedUrl) ?? null;
        return {
          slot,
          planeAspect: slot.width / slot.height,
          image: cachedImg,
          hoverLift: 0,
          loadMix: cachedImg ? 1 : 0,
        };
      });

      const applyLoadedImage = (url: string, img: HTMLImageElement) => {
        imgCacheRef.current.set(url, img);
        const activeCtx = twoDRef.current;
        if (!activeCtx) return;
        let touched = false;
        activeCtx.plates.forEach((p) => {
          const itemUrl = p.slot.item.src || p.slot.item.fallbackSrc;
          if (itemUrl !== url && p.slot.item.fallbackSrc !== url) return;
          p.image = img;
          touched = true;
        });
        if (touched) wake();
      };

      const uniqueUrls = new Set<string>();
      d2Ctx.plates.forEach((p) => {
        const url = p.slot.item.src || p.slot.item.fallbackSrc;
        if (!imgCacheRef.current.has(url)) uniqueUrls.add(url);
      });

      uniqueUrls.forEach((url) => {
        if (loadingUrlsRef.current.has(url)) return;
        loadingUrlsRef.current.add(url);
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          loadingUrlsRef.current.delete(url);
          if (cancelled) {
            imgCacheRef.current.set(url, img);
            return;
          }
          applyLoadedImage(url, img);
        };
        img.onerror = () => {
          loadingUrlsRef.current.delete(url);
          if (cancelled) return;
          const matching = d2Ctx.plates.find((p) => (p.slot.item.src || p.slot.item.fallbackSrc) === url);
          const fallback = matching?.slot.item.fallbackSrc;
          if (!fallback || fallback === url) return;
          const cachedFb = imgCacheRef.current.get(fallback);
          if (cachedFb) {
            applyLoadedImage(url, cachedFb);
            return;
          }
          const fbImg = new Image();
          fbImg.decoding = 'async';
          fbImg.onload = () => {
            if (cancelled) {
              imgCacheRef.current.set(fallback, fbImg);
              return;
            }
            applyLoadedImage(fallback, fbImg);
            applyLoadedImage(url, fbImg);
          };
          fbImg.src = fallback;
        };
        img.src = url;
      });
    }

    // Reset camera distance proportionally when layout radius changes
    camRef.current.tDist = helixLayout.defaultCamDist;
    renderScene.current(false, false);
    wake();

    return () => {
      cancelled = true;
    };
  }, [helixLayout, wake]);

  // Smooth category transition & re-center
  const handleFilterClick = useCallback(
    (filterId: string) => {
      if (filterId === activeFilter) return;
      hoveredIdRef.current = null;
      focusIdRef.current = null;
      setHoveredItem(null);
      setFocusItem(null);
      setFilterTransitioning(true);
      onFilterChange(filterId);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setFilterTransitioning(false));
      });
    },
    [activeFilter, onFilterChange],
  );

  useEffect(() => {
    const c = camRef.current;
    c.theta = 0;
    c.y = 0;
    c.tTheta = 0;
    c.ty = 0;
    c.vTheta = 0;
    c.vy = 0;
    c.dist = layoutRef.current.defaultCamDist;
    c.tDist = layoutRef.current.defaultCamDist;
    renderScene.current(false, false);
    wake();
  }, [activeFilter, wake]);

  // Global release safety so focus/blur/outside-release never sticks drag
  useEffect(() => {
    const clearInputs = () => {
      dragRef.current.active = false;
      pointersRef.current.clear();
      pinchDistRef.current = null;
      keysHeldRef.current.clear();
      hudHoldRef.current = null;
    };

    if (isLightboxOpen) clearInputs();

    window.addEventListener('pointerup', clearInputs);
    window.addEventListener('pointercancel', clearInputs);
    window.addEventListener('blur', clearInputs);
    return () => {
      window.removeEventListener('pointerup', clearInputs);
      window.removeEventListener('pointercancel', clearInputs);
      window.removeEventListener('blur', clearInputs);
    };
  }, [isLightboxOpen]);

  const resetCamera = useCallback(() => {
    const c = camRef.current;
    const L = layoutRef.current;
    c.vTheta = 0;
    c.vy = 0;
    c.tTheta = Math.round(c.tTheta / (Math.PI * 2)) * (Math.PI * 2);
    c.ty = Math.round(c.ty / L.spanY) * L.spanY;
    c.tDist = L.defaultCamDist;
    wake();
  }, [wake]);

  const nudgeCamera = useCallback(
    (dTheta: number, dy: number, dDist: number) => {
      markInteracted();
      const c = camRef.current;
      const L = layoutRef.current;
      c.tTheta += dTheta;
      c.ty += dy;
      c.tDist = clamp(c.tDist + dDist, L.minCamDist, L.maxCamDist);
      wake();
    },
    [markInteracted, wake],
  );

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.code === 'KeyR') {
        resetCamera();
        return;
      }
      keysHeldRef.current.add(e.code || e.key);
      wake();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeldRef.current.delete(e.code || e.key);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isLightboxOpen, resetCamera, wake]);

  // Infinite Wheel & Trackpad X/Y Spiral Control
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (e: WheelEvent) => {
      if (isLightboxOpen) return;
      if ((e.target as HTMLElement)?.closest('[data-filter-strip="true"]')) return;

      e.preventDefault();
      e.stopPropagation();
      markInteracted();
      const c = camRef.current;

      // Two-finger horizontal swipe OR Shift+Wheel -> spin 360° around cylinder infinitely
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        const dx = Math.abs(e.deltaX) > 0 ? e.deltaX : e.deltaY;
        c.tTheta -= dx * 0.0022;
        c.vTheta = reducedMotionRef.current ? 0 : clamp(-dx * 0.00038, -0.06, 0.06);
        wake();
        return;
      }

      // Vertical scroll wheel -> travel endlessly up/down along ascending helical gallery
      c.ty -= e.deltaY * 0.0036;
      c.tTheta -= e.deltaY * 0.00045;
      c.vy = reducedMotionRef.current ? 0 : clamp(-e.deltaY * 0.0007, -0.1, 0.1);
      wake();
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [isLightboxOpen, markInteracted, wake]);

  // Pointer drag, 2-finger mobile pinch zoom, hover raycast & click-to-lightbox
  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement)?.closest('[data-hud-control="true"]')) return;

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      pinchDistRef.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      dragRef.current.active = false;
      return;
    }

    dragRef.current = {
      active: true,
      lastX: e.clientX,
      lastY: e.clientY,
      totalDist: 0,
    };
    camRef.current.vTheta = 0;
    camRef.current.vy = 0;
    wake();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (rect) {
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      camRef.current.pointerX = clamp(nx, -1, 1);
      camRef.current.pointerY = clamp(ny, -1, 1);
      pointerNdcRef.current.set(nx, ny);
      pointerActiveHoverRef.current = e.pointerType !== 'touch';
      hoverDirtyRef.current = true;
      wake();
    }

    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Two-finger pinch controls depth distance smoothly on mobile
    if (pointersRef.current.size >= 2) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (pinchDistRef.current !== null) {
        const deltaDist = dist - pinchDistRef.current;
        const L = layoutRef.current;
        camRef.current.tDist = clamp(
          camRef.current.tDist - deltaDist * 0.016,
          L.minCamDist,
          L.maxCamDist,
        );
        markInteracted();
        wake();
      }
      pinchDistRef.current = dist;
      return;
    }

    if (!dragRef.current.active) return;

    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    dragRef.current.totalDist += Math.hypot(dx, dy);

    if (dragRef.current.totalDist > 4) markInteracted();

    const spinFactor = viewportWidth < 640 ? 0.0048 : 0.0034;
    const yFactor = viewportWidth < 640 ? 0.0095 : 0.0072;
    const c = camRef.current;

    c.tTheta += dx * spinFactor;
    c.ty += dy * yFactor;
    c.vTheta = reducedMotionRef.current ? 0 : clamp(dx * spinFactor * 0.45, -0.08, 0.08);
    c.vy = reducedMotionRef.current ? 0 : clamp(dy * yFactor * 0.45, -0.14, 0.14);
    wake();
  };

  const pickSlotAtClientPoint = useCallback((clientX: number, clientY: number): HelixSlot | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();

    if (threeRef.current) {
      const ctx = threeRef.current;
      const nx = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = -(((clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      ctx.raycaster.setFromCamera(new THREE.Vector2(nx, ny), ctx.camera);
      const visibleObjects = ctx.meshes.filter((m) => m.mesh.visible).map((m) => m.mesh);
      const hits = ctx.raycaster.intersectObjects(visibleObjects, false);
      if (hits.length > 0) {
        const hitMesh = hits[0].object;
        const found = ctx.meshes.find((m) => m.mesh === hitMesh);
        return found ? found.slot : null;
      }
      return null;
    }

    if (twoDRef.current) {
      return hitTestCanvas2D(
        twoDRef.current.hitPlates,
        clientX - rect.left,
        clientY - rect.top,
      );
    }

    return null;
  }, []);

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const wasTap =
      dragRef.current.active &&
      dragRef.current.totalDist <= 6 &&
      e.pointerType !== 'mouse';

    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchDistRef.current = null;
    if (pointersRef.current.size === 1) {
      const [remaining] = Array.from(pointersRef.current.values());
      dragRef.current.lastX = remaining.x;
      dragRef.current.lastY = remaining.y;
    }
    if (pointersRef.current.size === 0) {
      dragRef.current.active = false;
    }

    if (wasTap && !isLightboxOpenRef.current) {
      const slot = pickSlotAtClientPoint(e.clientX, e.clientY);
      if (slot) onSelectItem(slot.item);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement)?.closest('[data-hud-control="true"]')) return;
    if (dragRef.current.totalDist > 6 || isLightboxOpen) return;

    const slot = pickSlotAtClientPoint(e.clientX, e.clientY);
    if (slot) onSelectItem(slot.item);
  };

  const startHold = (dTheta: number, dy: number, dDist: number) => {
    nudgeCamera(dTheta * 4, dy * 4, dDist * 4);
    hudHoldRef.current = { dTheta, dy, dDist };
    wake();
  };

  const stopHold = () => {
    hudHoldRef.current = null;
  };

  const validHoveredItem =
    hoveredItem && items.some((i) => i.id === hoveredItem.id) ? hoveredItem : null;
  const validFocusItem =
    focusItem && items.some((i) => i.id === focusItem.id) ? focusItem : null;
  const activeCaption = validHoveredItem ?? validFocusItem ?? (items[0] ?? null);

  return (
    <section
      ref={stageRef}
      data-lenis-prevent
      aria-label="360 Curved Museum Exhibition"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={(e) => {
        pointerActiveHoverRef.current = false;
        hoveredIdRef.current = null;
        setHoveredItem(null);
        if (stageRef.current) stageRef.current.style.cursor = '';
        handlePointerUp(e);
      }}
      onClick={handleCanvasClick}
      onDoubleClick={(e) => {
        if (!(e.target as HTMLElement)?.closest('[data-hud-control="true"]')) {
          resetCamera();
        }
      }}
      className="relative h-[100dvh] min-h-[600px] w-full select-none overflow-hidden bg-[#f5f3ef] text-[#171613] touch-none cursor-grab active:cursor-grabbing"
    >
      {/* Warm Radial Architectural Lighting Pool */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,253,248,0.85),transparent_62%)] blur-[44px]"
      />

      {/* SEAMLESS BORDERLESS EDITORIAL TOP VEIL & CATEGORY FILTERS */}
      <header
        data-hud-control="true"
        onPointerDown={(e) => e.stopPropagation()}
        className="pointer-events-none relative z-30 w-full bg-gradient-to-b from-[#f5f3ef] from-64% via-[#f5f3ef]/96 via-84% to-transparent"
      >
        <div className="mx-auto max-w-[1440px] px-5 pt-24 pb-10 sm:px-10 sm:pt-28 sm:pb-12">
          <div className="pointer-events-auto flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="no-split font-serif text-2xl font-normal tracking-[-0.02em] text-[#171613] sm:text-4xl">
                Gallery <span className="italic text-[#5c5850]">in Infinite Space</span>
              </h1>
              {!loading && !error && (
                <span className="text-[11px] font-medium tracking-[0.14em] text-[#8e6b37] uppercase">
                  {items.length} Works
                </span>
              )}
            </div>

            <nav
              data-filter-strip="true"
              role="tablist"
              aria-label="Filter 360 gallery by category"
              className="no-scrollbar flex touch-pan-x flex-nowrap items-center gap-x-5 gap-y-1.5 overflow-x-auto py-1 md:flex-wrap"
            >
              {filters.map((f) => {
                const active = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleFilterClick(f.id)}
                    className={cn(
                      'relative shrink-0 pb-1 text-[10.5px] tracking-[0.11em] uppercase transition-colors sm:text-[11px]',
                      active
                        ? 'font-semibold text-[#171613]'
                        : 'font-medium text-[#171613]/45 hover:text-[#171613]',
                    )}
                  >
                    {f.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute right-0 bottom-0 left-0 h-[1.5px] bg-[#b18a4f]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* WEBGL 360° CURVED ARCHITECTURAL HELIX CANVAS */}
      <div
        ref={canvasHostRef}
        className={cn(
          'absolute inset-0 z-10 h-full w-full transition-opacity duration-200',
          filterTransitioning ? 'opacity-40' : 'opacity-100',
        )}
      />

      {/* Status Overlay for Loading / Error / Empty / WebGL Fallback */}
      {loading && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <span className="text-xs font-medium tracking-[0.18em] text-[#5c5850] uppercase">
            Curating 360° Exhibition...
          </span>
        </div>
      )}

      {!loading && error && (
        <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center px-6">
          <span className="text-sm font-medium text-red-700">{error}</span>
        </div>
      )}

      {!loading && !error && rendererUnavailable && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center">
          <span className="text-sm text-[#5c5850]">
            3D canvas rendering is unavailable in this browser context.
          </span>
        </div>
      )}

      {!loading && !error && !rendererUnavailable && helixLayout.slots.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6">
          <span className="text-sm text-[#5c5850]">
            No photos in this category yet.
          </span>
        </div>
      )}

      {/* Keyboard / Screen-reader accessible fallback index button */}
      {validFocusItem && (
        <button
          type="button"
          className="sr-only focus:not-sr-only focus:fixed focus:bottom-20 focus:left-6 focus:z-40 focus:bg-[#171613] focus:px-3 focus:py-1.5 focus:text-xs focus:text-[#f5f3ef]"
          onClick={() => onSelectItem(validFocusItem)}
        >
          Open {validFocusItem.title}
        </button>
      )}

      {/* SEAMLESS BOTTOM WHISPER CAPTION & FRAMELESS NAVIGATION CONTROLS */}
      <div
        data-hud-control="true"
        onPointerDown={(e) => e.stopPropagation()}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 w-full bg-gradient-to-t from-[#f5f3ef] from-42% via-[#f5f3ef]/92 via-78% to-transparent pt-14 pb-5 sm:pb-6"
      >
        {/* Whisper Focal Title above Navigation Strip */}
        {activeCaption && !loading && !error && (
          <div className="mb-2 flex items-baseline justify-center gap-3 px-6 text-center transition-opacity duration-200">
            <span className="max-w-[65vw] truncate font-serif text-lg text-[#171613] sm:text-xl">
              {activeCaption.title}
            </span>
            <span className="hidden text-[10px] font-medium tracking-[0.14em] text-[#8e6b37] uppercase sm:inline">
              {activeCaption.category}
            </span>
          </div>
        )}

        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-10">
          <span
            className={cn(
              'hidden text-[11px] font-medium tracking-[0.12em] text-[#171613]/60 uppercase transition-opacity duration-500 md:inline',
              hasInteracted ? 'opacity-50' : 'opacity-100',
            )}
          >
            Spin 360° sides &amp; scroll spiral infinitely · ← ↑ → ↓
          </span>

          {/* Pure Frameless 360° & Helix Controls (Zero Border / Zero Capsule) */}
          <div className="pointer-events-auto flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Spin 360 left"
              onPointerDown={() => startHold(0.03, 0, 0)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="flex h-7 w-7 items-center justify-center text-[#171613]/75 transition hover:text-[#171613] active:scale-90 sm:h-8 sm:w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Climb spiral up"
              onPointerDown={() => startHold(0, 0.08, 0)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="flex h-7 w-7 items-center justify-center text-[#171613]/75 transition hover:text-[#171613] active:scale-90 sm:h-8 sm:w-8"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Descend spiral down"
              onPointerDown={() => startHold(0, -0.08, 0)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="flex h-7 w-7 items-center justify-center text-[#171613]/75 transition hover:text-[#171613] active:scale-90 sm:h-8 sm:w-8"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Spin 360 right"
              onPointerDown={() => startHold(-0.03, 0, 0)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="flex h-7 w-7 items-center justify-center text-[#171613]/75 transition hover:text-[#171613] active:scale-90 sm:h-8 sm:w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <span className="mx-1 h-3.5 w-px bg-black/15 sm:mx-1.5" aria-hidden="true" />

            <button
              type="button"
              aria-label="Step back from cylinder"
              onPointerDown={() => startHold(0, 0, 0.14)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="flex h-7 w-7 items-center justify-center text-[#171613]/75 transition hover:text-[#171613] active:scale-90 sm:h-8 sm:w-8"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={resetCamera}
              aria-label="Recenter camera"
              className="flex h-7 w-7 items-center justify-center text-[#171613]/75 transition hover:text-[#171613] active:scale-90 sm:h-8 sm:w-8"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Zoom closer to plate"
              onPointerDown={() => startHold(0, 0, -0.14)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="flex h-7 w-7 items-center justify-center text-[#171613]/75 transition hover:text-[#171613] active:scale-90 sm:h-8 sm:w-8"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onScrollToFooter}
            className="pointer-events-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-medium tracking-[0.11em] text-[#171613]/75 uppercase transition hover:text-[#171613] sm:gap-1.5 sm:text-[11px] sm:tracking-[0.12em]"
          >
            Footer
            <ArrowDown className="h-3.5 w-3.5 text-[#b18a4f]" />
          </button>
        </div>
      </div>
    </section>
  );
}
