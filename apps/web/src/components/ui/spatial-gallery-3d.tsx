'use client';

import type { SpatialGalleryItem, SpatialGallery3DProps, HelixSlot, MeshEntry, Canvas2DPlateEntry, Canvas2DHitPlate } from "./spatial-gallery/types";
export type { SpatialGalleryItem, SpatialFilterOption } from "./spatial-gallery/types";
import { VERTEX_SHADER, FRAGMENT_SHADER, mod, wrapSigned, clamp, getTextureDimensions, detectWebGLSupport, hitTestCanvas2D, createCurvedPlateGeometry } from "./spatial-gallery/geometry";
import { createHelixLayout } from "./spatial-gallery/layout";
import { createGalleryRenderer } from "./spatial-gallery/renderer";
import GalleryHeader from "./spatial-gallery/GalleryHeader";

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
import useReducedMotionPreference from '@/hooks/useReducedMotionPreference';

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
  const reducedMotion = useReducedMotionPreference();

  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440,
  );

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Helix architectural parameters adapting seamlessly between desktop & mobile
  const helixLayout = useMemo(() => createHelixLayout(items, viewportWidth), [items, viewportWidth]);

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

  renderScene.current = createGalleryRenderer({ camRef, layoutRef, threeRef, hoveredIdRef, focusIdRef, setFocusItem, hoverDirtyRef, pointerActiveHoverRef, dragRef, isLightboxOpenRef, pointerNdcRef, setHoveredItem, stageRef, twoDRef });

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
      glRenderer.setClearColor(0xfbfaf7, 0);
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
      const fogColor = new THREE.Color(0xfbfaf7);

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
      data-nomotion
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
      className="relative h-[calc(100dvh-var(--header-height))] min-h-[600px] w-full select-none overflow-hidden bg-[var(--bg)] text-[var(--ink)] touch-none cursor-grab active:cursor-grabbing"
    >
      {/* Warm Radial Architectural Lighting Pool */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,253,248,0.85),transparent_62%)] blur-[44px]"
      />

      {/* SEAMLESS BORDERLESS EDITORIAL TOP VEIL & CATEGORY FILTERS */}
      <GalleryHeader items={items} filters={filters} activeFilter={activeFilter} loading={loading} error={error} handleFilterClick={handleFilterClick} />

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
          <span className="text-xs font-medium tracking-[0.18em] text-[var(--muted)] uppercase">
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
          <span className="text-sm text-[var(--muted)]">
            3D canvas rendering is unavailable in this browser context.
          </span>
        </div>
      )}

      {!loading && !error && !rendererUnavailable && helixLayout.slots.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6">
          <span className="text-sm text-[var(--muted)]">
            No photos in this category yet.
          </span>
        </div>
      )}

      {/* Keyboard / Screen-reader accessible fallback index button */}
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          data-hud-control="true"
          onPointerDown={(event) => event.stopPropagation()}
          className="sr-only focus:not-sr-only focus:fixed focus:bottom-20 focus:left-6 focus:z-40 focus:bg-[#171613] focus:px-3 focus:py-1.5 focus:text-xs focus:text-[#f5f3ef]"
          onClick={(event) => { event.stopPropagation(); onSelectItem(item); }}
        >
          Open {item.title}
        </button>
      ))}

      {/* SEAMLESS BOTTOM WHISPER CAPTION & FRAMELESS NAVIGATION CONTROLS */}
      <div
        data-hud-control="true"
        onPointerDown={(e) => e.stopPropagation()}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 w-full bg-gradient-to-t from-[var(--bg)] from-42% via-[var(--bg)]/92 via-78% to-transparent pt-14 pb-5 sm:pb-6"
      >
        {/* Whisper Focal Title above Navigation Strip */}
        {activeCaption && !loading && !error && (
          <div className="mb-2 flex items-baseline justify-center gap-3 px-6 text-center transition-opacity duration-200">
            <span className="max-w-[65vw] truncate font-serif text-lg text-[var(--ink)] sm:text-xl">
              {activeCaption.title}
            </span>
            <span className="hidden text-[12px] font-medium tracking-[0.14em] text-[var(--accent)] uppercase sm:inline">
              {activeCaption.category}
            </span>
          </div>
        )}

        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:flex-wrap sm:gap-4 sm:px-10 md:flex-nowrap">
          <span
            className={cn(
              'hidden text-[12px] font-medium tracking-[0.12em] text-[var(--ink)]/60 uppercase transition-opacity duration-500 md:inline',
              hasInteracted ? 'opacity-50' : 'opacity-100',
            )}
          >
            Spin 360° sides &amp; scroll spiral infinitely · ← ↑ → ↓
          </span>

          {/* Pure Frameless 360° & Helix Controls (Zero Border / Zero Capsule) */}
          <div className="pointer-events-auto grid grid-cols-4 items-center gap-1 sm:flex sm:gap-0.5">
            <button
              type="button"
              aria-label="Spin 360 left"
              onPointerDown={() => startHold(0.03, 0, 0)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="flex h-11 w-11 items-center justify-center text-[var(--ink)]/75 transition hover:text-[var(--ink)] active:scale-90 "
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
              className="flex h-11 w-11 items-center justify-center text-[var(--ink)]/75 transition hover:text-[var(--ink)] active:scale-90 "
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
              className="flex h-11 w-11 items-center justify-center text-[var(--ink)]/75 transition hover:text-[var(--ink)] active:scale-90 "
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
              className="flex h-11 w-11 items-center justify-center text-[var(--ink)]/75 transition hover:text-[var(--ink)] active:scale-90 "
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <span className="hidden mx-1 h-3.5 w-px bg-black/15 sm:block sm:mx-1.5" aria-hidden="true" />

            <button
              type="button"
              aria-label="Step back from cylinder"
              onPointerDown={() => startHold(0, 0, 0.14)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="flex h-11 w-11 items-center justify-center text-[var(--ink)]/75 transition hover:text-[var(--ink)] active:scale-90 "
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={resetCamera}
              aria-label="Recenter camera"
              className="flex h-11 w-11 items-center justify-center text-[var(--ink)]/75 transition hover:text-[var(--ink)] active:scale-90 "
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
              className="flex h-11 w-11 items-center justify-center text-[var(--ink)]/75 transition hover:text-[var(--ink)] active:scale-90 "
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onScrollToFooter}
            className="pointer-events-auto inline-flex min-h-11 shrink-0 items-center gap-1 text-[12px] font-medium tracking-[0.11em] text-[var(--ink)]/75 uppercase transition hover:text-[var(--ink)] sm:gap-1.5 sm:text-[12px] sm:tracking-[0.12em]"
          >
            Footer
            <ArrowDown className="h-3.5 w-3.5 text-[var(--accent)]" />
          </button>
        </div>
      </div>
    </section>
  );
}
