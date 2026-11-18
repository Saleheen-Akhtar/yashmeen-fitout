import * as THREE from "three";
import type { RefObject, Dispatch, SetStateAction } from "react";
import type { SpatialGalleryItem, MeshEntry, Canvas2DPlateEntry, Canvas2DHitPlate, ProjectedStripPoint } from "./types";
import { clamp, wrapSigned, hitTestCanvas2D } from "./geometry";
import { createHelixLayout } from "./layout";
interface RenderBindings {
 camRef: RefObject<{theta:number;y:number;dist:number;tTheta:number;ty:number;tDist:number;vTheta:number;vy:number;pointerX:number;pointerY:number;tiltX:number;tiltY:number}>;
 layoutRef: RefObject<ReturnType<typeof createHelixLayout>>;
 threeRef: RefObject<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    raycaster: THREE.Raycaster;
    group: THREE.Group;
    meshes: MeshEntry[];
  } | null>;
 twoDRef: RefObject<{
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
  } | null>;
 hoveredIdRef: RefObject<string | null>; focusIdRef: RefObject<string | null>;
 hoverDirtyRef: RefObject<boolean>; pointerActiveHoverRef: RefObject<boolean>; isLightboxOpenRef: RefObject<boolean>;
 dragRef: RefObject<{active:boolean;lastX:number;lastY:number;totalDist:number}>;
 pointerNdcRef: RefObject<THREE.Vector2>; stageRef: RefObject<HTMLElement | null>;
 setFocusItem: Dispatch<SetStateAction<SpatialGalleryItem | null>>; setHoveredItem: Dispatch<SetStateAction<SpatialGalleryItem | null>>;
}
export function createGalleryRenderer({ camRef, layoutRef, threeRef, hoveredIdRef, focusIdRef, setFocusItem, hoverDirtyRef, pointerActiveHoverRef, dragRef, isLightboxOpenRef, pointerNdcRef, setHoveredItem, stageRef, twoDRef }: RenderBindings) {
  return (isMoving: boolean, allowStateSync = true) => {
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
        scratchCtx.fillStyle = '#fbfaf7';
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
}
