import { clamp, Glyph, World } from "./brand-lettering/physics";
import { prepareLetter } from "./brand-lettering/renderer";
import { playBubblePop, closeBubbleAudio } from "./brand-lettering/audio";
import { useEffect, useRef, useState } from "react";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference";

/**
 * Super-Smooth Spongy Bubble Lettering Engine
 * Modeled after Cole Derochie (colederochie.com)
 *
 * Core Features:
 * 1. Single-row authentic YASHMEEN typography matching the exact reference baseline.
 * 2. True inflatable bubble soft-body physics with elastic ball bounce off walls and adjacent letters.
 * 3. High-fling throw momentum and silky pointer drag with zero stickiness.
 * 4. Grounded resting equilibrium: letters rest calmly on their baseline and do not drift unprompted.
 * 5. Gentle baseline recovery and instant [RE-ALIGN] button to snap back to pristine alignment.
 * 6. Synthesized Web Audio bubble-pop sound effect on tap and high-velocity impact.
 * 7. Zero CPU usage when letters are at rest.
 */

export default function InteractiveBrandLettering({
  word = "YASHMEEN",
  color = "#080807",
  haloColor = "#fcfcfc",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const rafRef = useRef(0);
  const topZRef = useRef(1);
  const audioCtxRef = useRef(null);
  const activePointerRef = useRef(null);
  const recentPositionsRef = useRef([]);
  const pressRef = useRef(null);
  const wakeRef = useRef(null);
  const isInViewRef = useRef(true);
  const reducedMotion = useReducedMotionPreference();
  const reducedMotionRef = useRef(reducedMotion);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    wakeRef.current?.();
  }, [reducedMotion]);

  const playPop = radius => playBubblePop(audioCtxRef, radius);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let width = 0,
      height = 0,
      ratio = 1;

    const isSettled = (world) => {
      if (!world || world.drag || world.target || world.returning > 0) return false;
      let maxV = 0;
      for (const n of world.nodes) {
        const speed = Math.hypot(n.vx, n.vy);
        if (speed > maxV) maxV = speed;
      }
      return maxV < 0.025;
    };

    const createLayout = (w, h) => {
      const chars = [...word];
      const aspectMap = { Y: 0.72, A: 0.76, S: 0.64, H: 0.72, M: 0.86, E: 0.62, N: 0.72 };
      const angles = [-0.03, 0.02, -0.04, 0.03, -0.02, 0.03, -0.03, 0.02];
      const yOffsets = [-0.012, 0.012, -0.008, 0.012, -0.012, 0.008, -0.012, 0.012];
      const isMobile = w < 560;
      const rows = isMobile ? [chars.slice(0, 4), chars.slice(4)] : [chars];
      const controlsSpace = isMobile ? 72 : 0;
      const usableHeight = Math.max(80, h - controlsSpace);
      const rowHeight = usableHeight / rows.length;
      const topOffset = isMobile ? 0 : (h - usableHeight) / 2;
      const padding = Math.max(isMobile ? 18 : 24, w * (isMobile ? 0.055 : 0.04));
      const availableWidth = Math.max(1, w - padding * 2);
      const gap = isMobile ? 8 : 16;
      const poses = [];

      rows.forEach((row, rowIndex) => {
        const aspectTotal = row.reduce((sum, char) => sum + (aspectMap[char] || 0.72), 0);
        const heightForWidth = (availableWidth - gap * (row.length - 1)) / aspectTotal;
        const glyphH = Math.max(1, Math.min(250, rowHeight * (isMobile ? 0.72 : 0.64), heightForWidth));
        const letterWidths = row.map((char) => glyphH * (aspectMap[char] || 0.72));
        const totalWordW = letterWidths.reduce((sum, width) => sum + width, 0) + gap * (row.length - 1);
        let curX = (w - totalWordW) / 2;
        const rowCenterY = topOffset + rowIndex * rowHeight + rowHeight / 2;

        row.forEach((char, index) => {
          const glyphIndex = rowIndex * 4 + index;
          const letterWidth = letterWidths[index];
          poses.push({
            x: curX + letterWidth * 0.5,
            y: rowCenterY + (yOffsets[glyphIndex % yOffsets.length] || 0) * rowHeight,
            w: letterWidth,
            h: glyphH,
            angle: angles[glyphIndex % angles.length] || 0,
            packingScale: 1.0,
          });
          curX += letterWidth + gap;
        });
      });

      const glyphs = chars.map((c, i) => new Glyph(c, poses[i], i));
      const world = new World(w, h, glyphs);
      world.reducedMotion = reducedMotionRef.current;
      return world;
    };

    const draw = () => {
      const world = worldRef.current;
      if (!world) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const halo = Math.max(3.5, Math.min(7.0, Math.min(width, height) * 0.009));
      const sorted = [...world.glyphs].sort((a, b) => (a.z || 0) - (b.z || 0));

      for (const glyph of sorted) {
        const drawing = prepareLetter(glyph);

        ctx.save();
        ctx.scale(drawing.rx, drawing.ry);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const band = (halo * 2) / Math.sqrt(drawing.rx * drawing.ry);
        const outer = glyph.radius * 2 + band;

        // Separation halo: white outline around each inflatable letter
        ctx.strokeStyle = haloColor;
        ctx.lineWidth = outer;
        for (const path of drawing.paths) ctx.stroke(path);

        // Core obsidian body: pitch black solid letter body matching Image 3
        ctx.strokeStyle = color;
        ctx.lineWidth = glyph.radius * 2;
        for (const path of drawing.paths) ctx.stroke(path);

        ctx.restore();
      }
    };

    const loop = (time) => {
      rafRef.current = 0;
      const world = worldRef.current;
      if (document.hidden || !world || !isInViewRef.current) {
        return;
      }

      world.reducedMotion = reducedMotionRef.current;
      world.step(time);
      draw();

      if (world.reducedMotion && isSettled(world)) {
        world.sleep();
        draw();
        return;
      }

      // Perpetual zero-gravity space float when active motion is permitted
      rafRef.current = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      const world = worldRef.current;
      if (document.hidden || !isInViewRef.current || !world) return;
      if (world.reducedMotion && isSettled(world)) {
        draw();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    wakeRef.current = wake;
    window.__wake = wake;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const nextW = Math.max(320, Math.round(rect.width || container.clientWidth || 320));
      const nextH = Math.max(340, Math.round(rect.height || container.clientHeight || Math.min(540, nextW * 0.36)));
      const nextR = Math.min(window.devicePixelRatio || 1, 2);

      if (width === nextW && height === nextH && ratio === nextR) return;

      width = nextW;
      height = nextH;
      ratio = nextR;

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      worldRef.current = createLayout(width, height);
      window.__softWorld = worldRef.current;
      draw();
      wake();
    };

    const pointAt = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const hit = (point) => {
      const world = worldRef.current;
      if (!world || !point) return null;
      for (let i = world.glyphs.length - 1; i >= 0; i--) {
        if (world.glyphs[i].hitTest(point)) return world.glyphs[i];
      }
      return null;
    };

    const onPointerDown = (event) => {
      if (event.button !== 0) return;
      const point = pointAt(event);
      const glyph = hit(point);
      if (!glyph) return;

      event.preventDefault();
      activePointerRef.current = event.pointerId;
      recentPositionsRef.current = [{ x: point.x, y: point.y, time: Date.now() }];

      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Fallback
      }

      glyph.z = ++topZRef.current;
      worldRef.current.grab(glyph, point);
      pressRef.current = { glyph, startX: point.x, startY: point.y, time: Date.now() };

      playPop(glyph.radius);
      setHintVisible(false);
      canvas.style.cursor = "grabbing";
      worldRef.current.step();
      draw();
      wake();
    };

    const onPointerMove = (event) => {
      const point = pointAt(event);
      const world = worldRef.current;
      if (!world || !point) return;

      if (activePointerRef.current !== null && event.pointerId === activePointerRef.current) {
        recentPositionsRef.current.push({ x: point.x, y: point.y, time: Date.now() });
        if (recentPositionsRef.current.length > 5) recentPositionsRef.current.shift();

        if (world.drag) {
          world.drag.x = clamp(point.x, 15, width - 15);
          world.drag.y = clamp(point.y, 15, height - 15);
          world.energy = 1;
          wake();
        }
      } else {
        const hovering = hit(point);
        canvas.style.cursor = hovering ? "grab" : "default";
      }
    };

    const releasePointer = (event) => {
      if (activePointerRef.current === null) return;
      if (event && event.pointerId !== undefined && event.pointerId !== activePointerRef.current) return;

      const world = worldRef.current;
      let vx = 0,
        vy = 0;
      const recents = recentPositionsRef.current;
      if (recents.length >= 2) {
        const pFirst = recents[0];
        const pLast = recents[recents.length - 1];
        const dt = Math.max(16, pLast.time - pFirst.time);
        vx = ((pLast.x - pFirst.x) / dt) * 20;
        vy = ((pLast.y - pFirst.y) / dt) * 20;
      }

      if (pressRef.current && world) {
        const press = pressRef.current;
        const elapsed = Date.now() - press.time;
        const currentPt = recents[recents.length - 1] || { x: press.startX, y: press.startY };
        const dist = Math.hypot(currentPt.x - press.startX, currentPt.y - press.startY);
        if (elapsed < 280 && dist < 10) {
          world.puff(press.glyph, 3.0);
        }
      }

      pressRef.current = null;
      activePointerRef.current = null;
      recentPositionsRef.current = [];

      if (world) {
        world.release(vx, vy);
      }

      try {
        if (event && event.pointerId !== undefined && canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Ignore capture errors
      }

      canvas.style.cursor = "default";
      wake();
    };

    const onDoubleClick = (event) => {
      const point = pointAt(event);
      const glyph = hit(point);
      if (glyph && worldRef.current) {
        glyph.z = ++topZRef.current;
        worldRef.current.puff(glyph, 3.5);
        playPop(glyph.radius);
        wake();
      } else if (worldRef.current) {
        worldRef.current.returnHome();
        wake();
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("dblclick", onDoubleClick);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    window.addEventListener("blur", releasePointer);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      } else {
        wake();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let io = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const inView = !!entry?.isIntersecting;
          isInViewRef.current = inView;
          if (inView) {
            wake();
          } else if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
          }
        },
        { threshold: 0.01 }
      );
      io.observe(container);
    }

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    handleResize();

    return () => {
      observer.disconnect();
      if (io) io.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("dblclick", onDoubleClick);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
      window.removeEventListener("blur", releasePointer);
      closeBubbleAudio(audioCtxRef);
    };
  }, [word, color, haloColor]);

  const handleResetBaseline = (e) => {
    e?.preventDefault();
    activePointerRef.current = null;
    pressRef.current = null;
    recentPositionsRef.current = [];
    if (worldRef.current) {
      worldRef.current.drag = null;
      worldRef.current.returnHome();
      setHintVisible(false);
      if (wakeRef.current) wakeRef.current();
    }
  };

  const handleKeyNudge = (index, dir) => {
    const world = worldRef.current;
    if (!world || !world.glyphs[index]) return;
    const g = world.glyphs[index];
    g.z = ++topZRef.current;
    if (dir === "puff") {
      world.puff(g, 3.2);
      playPop(g.radius);
    } else {
      const step = 16;
      const map = { left: [-step, 0], right: [step, 0], up: [0, -step], down: [0, step] };
      const [dx, dy] = map[dir] || [0, 0];
      world.nudge(index, dx, dy);
    }
    if (wakeRef.current) wakeRef.current();
  };

  return (
    <div
      ref={containerRef}
      className="interactive-brand-monument"
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "2.5rem",
        overflow: "hidden",
      }}
    >
      <div
        className="sr-only"
        tabIndex={0}
        aria-label="Yashmeen Future Building & Fit-Out Contracting L.L.C. Interactive inflatable lettering. Grab, squish, and throw the letters across the canvas."
      >
        YASHMEEN
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          display: "block",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          background: "transparent",
        }}
      />

      {/* Control bar: interactive hint and reset baseline action matching reference */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "14px",
          right: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          className="brand-play-hint"
          aria-hidden="true"
          style={{
            fontSize: "12px",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: hintVisible ? 0.85 : 0.45,
            transition: "opacity 0.4s ease",
          }}
        >
          <span style={{ fontSize: "14px" }}>🖐</span> GRAB, SQUISH &amp; THROW LETTERS
        </div>

        <button
          type="button"
          onClick={handleResetBaseline}
          aria-label="Re-align letters to baseline"
          style={{
            pointerEvents: "auto",
            background: "rgba(8, 8, 7, 0.05)",
            border: "1px solid rgba(8, 8, 7, 0.12)",
            borderRadius: "999px",
            padding: "5px 14px",
            fontSize: "12px",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(8, 8, 7, 0.1)";
            e.currentTarget.style.borderColor = "rgba(8, 8, 7, 0.22)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(8, 8, 7, 0.05)";
            e.currentTarget.style.borderColor = "rgba(8, 8, 7, 0.12)";
          }}
          title="Reset letters back into neat baseline alignment"
        >
          <span>RE-ALIGN</span>
          <span style={{ fontSize: "12px" }}>↺</span>
        </button>
      </div>

      {/* Accessible keyboard controls */}
      <div
        className="letter-keyboard-controls"
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          height: 0,
          overflow: "hidden",
        }}
      >
        {[...word].map((char, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${char}, letter ${i + 1} of ${word}. Press Enter to bounce, arrow keys to nudge.`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleKeyNudge(i, "puff");
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                handleKeyNudge(i, "left");
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                handleKeyNudge(i, "right");
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                handleKeyNudge(i, "up");
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                handleKeyNudge(i, "down");
              }
            }}
          >
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}
