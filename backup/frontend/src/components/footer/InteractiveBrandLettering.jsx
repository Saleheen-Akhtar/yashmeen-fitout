import { useEffect, useRef, useState } from "react";

/**
 * Interactive Soft-Body Inflatable Lettering Component
 * Inspired by Cole Derochie (colederochie.com)
 * Features:
 * - Particle-based soft-body elastic stroke simulation
 * - Multi-contact spatial hash collision resolution
 * - Pointer drag, squish, stretch, and spring restitution
 * - Elastic puff/wobble and procedural Web Audio pop tone on click/tap
 * - Device-pixel-ratio crisp 2D canvas rendering with round joins and separation halo
 * - Zero CPU consumption when resting (sleeps when energy drops)
 * - Accessible fallback with screen-reader announcement and keyboard nudging
 */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const line = (...points) => ({ points: points.map(([x, y]) => ({ x, y })) });

function sCurve() {
  const pts = [
    [0.22, -0.22],
    [0.18, -0.31],
    [0.08, -0.36],
    [-0.06, -0.36],
    [-0.18, -0.31],
    [-0.24, -0.20],
    [-0.22, -0.10],
    [-0.13, -0.04],
    [0.0, 0.0],
    [0.13, 0.04],
    [0.22, 0.10],
    [0.24, 0.20],
    [0.18, 0.31],
    [0.06, 0.36],
    [-0.08, 0.36],
    [-0.18, 0.31],
    [-0.22, 0.22],
  ];
  return { closed: false, points: pts.map(([x, y]) => ({ x, y })) };
}

function letterStrokes(c) {
  switch (c) {
    case "Y":
      return [
        line([-0.30, -0.36], [0, -0.02], [0, 0.36]),
        line([0.30, -0.36], [0, -0.02]),
      ];
    case "A":
      return [
        line([-0.34, 0.36], [0, -0.36], [0.34, 0.36]),
        line([-0.20, 0.06], [0.20, 0.06]),
      ];
    case "S":
      return [sCurve()];
    case "H":
      return [
        line([-0.30, -0.36], [-0.30, 0.36]),
        line([0.30, -0.36], [0.30, 0.36]),
        line([-0.30, 0], [0.30, 0]),
      ];
    case "M":
      return [
        line([-0.34, 0.36], [-0.34, -0.36], [0, 0.12], [0.34, -0.36], [0.34, 0.36]),
      ];
    case "E":
      return [
        line([-0.28, -0.36], [-0.28, 0.36]),
        line([-0.28, -0.36], [0.28, -0.36]),
        line([-0.28, 0], [0.18, 0]),
        line([-0.28, 0.36], [0.28, 0.36]),
      ];
    case "N":
      return [
        line([-0.30, 0.36], [-0.30, -0.36], [0.30, 0.36], [0.30, -0.36]),
      ];
    case "D":
      return [
        line([-0.30, -0.36], [-0.30, 0.36]),
        {
          closed: false,
          points: Array.from({ length: 20 }, (_, i) => {
            const a = -Math.PI / 2 + (Math.PI * i) / 19;
            return { x: -0.30 + Math.cos(a) * 0.58, y: Math.sin(a) * 0.36 };
          }),
        },
      ];
    case "U":
      return [
        line([-0.28, -0.36], [-0.28, 0.14]),
        {
          closed: false,
          points: Array.from({ length: 15 }, (_, i) => {
            const a = Math.PI - (Math.PI * i) / 14;
            return { x: Math.cos(a) * 0.28, y: 0.14 + Math.sin(a) * 0.22 };
          }),
        },
        line([0.28, 0.14], [0.28, -0.36]),
      ];
    case "B":
      return [
        line([-0.28, -0.36], [-0.28, 0.36]),
        {
          closed: false,
          points: Array.from({ length: 15 }, (_, i) => {
            const a = -Math.PI / 2 + (Math.PI * i) / 14;
            return { x: -0.28 + Math.cos(a) * 0.54, y: -0.18 + Math.sin(a) * 0.18 };
          }),
        },
        {
          closed: false,
          points: Array.from({ length: 15 }, (_, i) => {
            const a = -Math.PI / 2 + (Math.PI * i) / 14;
            return { x: -0.28 + Math.cos(a) * 0.54, y: 0.18 + Math.sin(a) * 0.18 };
          }),
        },
      ];
    case "I":
      return [line([0, -0.36], [0, 0.36])];
    default:
      return [line([0, -0.36], [0, 0.36])];
  }
}

class Glyph {
  constructor(char, pose, index) {
    const packing = Math.min(pose.packingCap || 1.35, pose.packingScale || 1);
    this.char = char;
    this.index = index;
    this.w = pose.w * packing;
    this.h = pose.h * packing;
    this.angle = pose.angle || 0;
    this.nodes = [];
    this.paths = [];
    this.links = [];
    this.bounds = {};
    this.cx = pose.x;
    this.cy = pose.y;
    this.homeCx = pose.x;
    this.homeCy = pose.y;
    this.radius = Glyph.strokeRadius(this.char, this.w, this.h);
    const co = Math.cos(this.angle), si = Math.sin(this.angle);

    for (const stroke of letterStrokes(this.char)) {
      const local = stroke.points.map((p) => ({ x: p.x * this.w, y: p.y * this.h }));
      let length = 0;
      const lengths = [0];
      for (let i = 1; i < local.length; i++) {
        length += Math.hypot(local[i].x - local[i - 1].x, local[i].y - local[i - 1].y);
        lengths.push(length);
      }
      const count = Math.max(3, Math.ceil(length / (this.radius * 0.6)));
      const path = [];
      for (let i = 0; i <= count; i++) {
        if (stroke.closed && i === count) break;
        const distance = (length * i) / count;
        let j = 1;
        while (j < lengths.length - 1 && lengths[j] < distance) j++;
        const t = (distance - lengths[j - 1]) / (lengths[j] - lengths[j - 1] || 1);
        const lx = local[j - 1].x + (local[j].x - local[j - 1].x) * t;
        const ly = local[j - 1].y + (local[j].y - local[j - 1].y) * t;
        const reach = this.radius * (!stroke.closed && (i === 0 || i === count) ? 1.1 : 0.28);
        let n = null, best = reach;
        for (const m of this.nodes) {
          const d = Math.hypot(m.lx - lx, m.ly - ly);
          if (d < best) { n = m; best = d; }
        }
        if (!n) {
          const ox = lx * co - ly * si, oy = lx * si + ly * co;
          n = {
            body: this,
            lx, ly, ox, oy,
            x: pose.x + ox,
            y: pose.y + oy,
            homeX: pose.x + ox,
            homeY: pose.y + oy,
            vx: 0, vy: 0,
            rx: this.radius,
            ry: this.radius,
          };
          this.nodes.push(n);
        }
        if (path[path.length - 1] !== n) path.push(n);
      }
      for (let i = 1; i < path.length; i++) this.link(path[i - 1], path[i]);
      if (stroke.closed) this.link(path[path.length - 1], path[0]);
      this.paths.push({ nodes: path, closed: !!stroke.closed });
    }

    const owners = new Map(this.nodes.map((n) => [n, new Set()]));
    this.paths.forEach((p, i) => p.nodes.forEach((n) => owners.get(n).add(i)));
    for (const a of this.nodes) {
      for (const b of this.nodes) {
        if (a === b || this.nodes.indexOf(a) > this.nodes.indexOf(b) || [...owners.get(a)].some((i) => owners.get(b).has(i))) continue;
        if (Math.hypot(a.ox - b.ox, a.oy - b.oy) < this.radius * 2.2) this.link(a, b);
      }
    }
    this.update();
  }

  static strokeRadius(c, w, h) {
    if (c === "I") return Math.max(8, h * 0.14);
    const ratioMap = { E: 0.14, S: 0.13, M: 0.13, H: 0.14, A: 0.14, Y: 0.14, N: 0.14 };
    return Math.max(8, Math.min(w * 0.24, h * (ratioMap[c] || 0.15)));
  }

  link(a, b) {
    this.links.push({ a, b, length: Math.hypot(a.ox - b.ox, a.oy - b.oy) });
  }

  update() {
    let x = 0, y = 0, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of this.nodes) {
      x += n.x; y += n.y;
      minX = Math.min(minX, n.x - n.rx); maxX = Math.max(maxX, n.x + n.rx);
      minY = Math.min(minY, n.y - n.ry); maxY = Math.max(maxY, n.y + n.ry);
    }
    this.cx = x / this.nodes.length;
    this.cy = y / this.nodes.length;
    this.bounds = { minX, maxX, minY, maxY };
  }

  hitTest(p) {
    return this.nodes.some(
      (n) => ((p.x - n.x) / n.rx) ** 2 + ((p.y - n.y) / n.ry) ** 2 <= 1.2
    );
  }
}

class World {
  constructor(width, height, glyphs) {
    this.width = width;
    this.height = height;
    this.glyphs = glyphs;
    this.nodes = glyphs.flatMap((g) => g.nodes);
    this.drag = null;
    this.energy = 1;
    this.reducedMotion = false;
    this.nodes.forEach((n, i) => (n.id = i));

    this.neighbors = new Set();
    for (const g of glyphs) {
      for (const a of g.nodes) {
        for (const b of g.nodes) {
          if (a.id < b.id && Math.hypot(a.ox - b.ox, a.oy - b.oy) < g.radius * 2.1) {
            this.neighbors.add(a.id + ":" + b.id);
          }
        }
      }
    }
    for (const g of glyphs) {
      for (const l of g.links) {
        this.neighbors.add(Math.min(l.a.id, l.b.id) + ":" + Math.max(l.a.id, l.b.id));
      }
    }
    for (let i = 0; i < 25; i++) this.solve();
    for (const g of glyphs) g.update();
    this.sleep();
  }

  grab(g, p) {
    const node = g.nodes.reduce((a, b) =>
      Math.hypot(a.x - p.x, a.y - p.y) < Math.hypot(b.x - p.x, b.y - p.y) ? a : b
    );
    this.drag = { glyph: g, node, x: p.x, y: p.y, dx: node.x - p.x, dy: node.y - p.y };
    this.energy = 1;
  }

  release() {
    this.drag = null;
  }

  nudge(index, x, y) {
    if (!this.glyphs[index]) return;
    for (const n of this.glyphs[index].nodes) {
      n.vx += x; n.vy += y;
    }
    this.energy = 1;
  }

  sleep() {
    for (const n of this.nodes) n.vx = n.vy = 0;
    this.energy = 0;
  }

  resize(w, h) {
    if (!this.base) this.base = { w: this.width, h: this.height, scale: 1, v: 0 };
    this.width = w;
    this.height = h;
    this.target = { w, h };
    this.energy = 1;
  }

  get busy() {
    return !!this.target || this.glyphs.some((g) => g.puff);
  }

  followResize() {
    const t = this.target, b = this.base;
    if (!t) return;
    let goal = Math.sqrt((t.w * t.h) / (b.w * b.h));
    if (goal < 1) goal **= 0.75;
    b.v += ((goal - b.scale) * 30 - b.v * 8) / 60;
    const k = (b.scale + b.v / 60) / b.scale;
    b.scale += b.v / 60;
    for (const g of this.glyphs) this.scaleGlyph(g, k);
    if (Math.abs(goal - b.scale) < 0.0005 && Math.abs(b.v) < 0.0005) this.target = null;
  }

  scaleGlyph(g, k) {
    g.update(); g.w *= k; g.h *= k; g.radius *= k;
    for (const n of g.nodes) {
      n.ox *= k; n.oy *= k; n.rx *= k; n.ry *= k;
      n.homeX = g.homeCx + (n.homeX - g.homeCx) * k;
      n.homeY = g.homeCy + (n.homeY - g.homeCy) * k;
      n.x = g.cx + (n.x - g.cx) * k;
      n.y = g.cy + (n.y - g.cy) * k;
    }
    for (const l of g.links) l.length *= k;
  }

  puff(g, target, elastic = true) {
    g.puff = { size: 1, target, v: 0, elastic };
    this.energy = 1;
  }

  followPuffs() {
    for (const g of this.glyphs) {
      const p = g.puff;
      if (!p) continue;
      const k = p.elastic ? 220 : 260, c = p.elastic ? 8 : 28;
      p.v += ((p.target - p.size) * k - p.v * c) / 60;
      const next = Math.max(0.6, p.size + p.v / 60);
      this.scaleGlyph(g, next / p.size);
      p.size = next;
      if (p.target === 1 && Math.abs(p.size - 1) < 0.001 && Math.abs(p.v) < 0.01) {
        this.scaleGlyph(g, 1 / p.size);
        g.puff = null;
      }
    }
  }

  solve() {
    for (const g of this.glyphs) {
      for (const l of g.links) {
        const dx = l.b.x - l.a.x, dy = l.b.y - l.a.y, d = Math.hypot(dx, dy) || 1;
        const rest = Math.hypot(l.b.ox - l.a.ox, l.b.oy - l.a.oy), k = ((d - rest) / d) * 0.24;
        l.a.x += dx * k; l.a.y += dy * k; l.b.x -= dx * k; l.b.y -= dy * k;
      }
      for (const path of g.paths) {
        const nodes = path.nodes,
          start = path.closed ? 0 : 1,
          end = path.closed ? nodes.length : nodes.length - 1;
        for (let i = start; i < end; i++) {
          const n = nodes[i],
            a = nodes[(i - 1 + nodes.length) % nodes.length],
            b = nodes[(i + 1) % nodes.length];
          const dx = ((a.x + b.x) / 2 - n.x + (n.ox - (a.ox + b.ox) / 2)) * 0.18;
          const dy = ((a.y + b.y) / 2 - n.y + (n.oy - (a.oy + b.oy) / 2)) * 0.18;
          n.x += dx; n.y += dy; a.x -= dx / 2; a.y -= dy / 2; b.x -= dx / 2; b.y -= dy / 2;
        }
      }
    }

    const cell = Math.max(16, ...this.nodes.map((n) => Math.max(n.rx, n.ry) * 2 + 3)),
      grid = new Map();
    for (const a of this.nodes) {
      const gx = Math.floor(a.x / cell), gy = Math.floor(a.y / cell);
      for (let x = gx - 1; x <= gx + 1; x++) {
        for (let y = gy - 1; y <= gy + 1; y++) {
          for (const b of grid.get(x + "," + y) || []) {
            if (a.body === b.body && this.neighbors.has(b.id + ":" + a.id)) continue;
            const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy) || 0.001,
              nx = dx / d, ny = dy / d;
            const ra = Math.hypot(a.rx * nx, a.ry * ny),
              rb = Math.hypot(b.rx * nx, b.ry * ny),
              overlap = ra + rb + 2.0 - d;
            if (overlap > 0) {
              const k = overlap * 0.5;
              a.x += nx * k; a.y += ny * k; b.x -= nx * k; b.y -= ny * k;
            }
          }
        }
      }
      const key = gx + "," + gy;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(a);
    }
    for (const n of this.nodes) this.confine(n);
  }

  confine(n) {
    n.x = clamp(n.x, n.rx + 2, this.width - n.rx - 2);
    n.y = clamp(n.y, n.ry + 2, this.height - n.ry - 2);
  }

  step() {
    this.followResize();
    this.followPuffs();
    const old = this.nodes.map((n) => [n.x, n.y]);

    // Shape recovery and soft restitution towards home baseline
    for (const g of this.glyphs) {
      g.update();
      const meanX = g.nodes.reduce((s, n) => s + n.ox, 0) / g.nodes.length;
      const meanY = g.nodes.reduce((s, n) => s + n.oy, 0) / g.nodes.length;
      for (const n of g.nodes) {
        const tx = g.cx + (n.ox - meanX);
        const ty = g.cy + (n.oy - meanY);
        n.vx += (tx - n.x) * 0.024;
        n.vy += (ty - n.y) * 0.024;

        // Return pull towards original baseline when unheld
        if (!this.drag || n.body !== this.drag.glyph) {
          n.vx += (n.homeX - n.x) * 0.016;
          n.vy += (n.homeY - n.y) * 0.016;
        }
      }
    }

    const move = this.nodes.map((n) => [n.vx, n.vy]);
    let held = null;
    if (this.drag) {
      const d = this.drag,
        n = d.node,
        mx = clamp(d.x + d.dx - n.x, -70, 70),
        my = clamp(d.y + d.dy - n.y, -70, 70);
      for (const m of d.glyph.nodes) {
        move[m.id][0] += mx * 0.22;
        move[m.id][1] += my * 0.22;
      }
      held = { n, x0: n.x, y0: n.y, x: n.x + mx, y: n.y + my };
    }
    let far = 0, thin = Infinity;
    for (const n of this.nodes) thin = Math.min(thin, n.rx, n.ry);
    for (const [x, y] of move) far = Math.max(far, Math.hypot(x, y));
    if (held) far = Math.max(far, Math.hypot(held.x - held.x0, held.y - held.y0));
    const steps = clamp(Math.ceil(far / (thin * 0.5)), 1, 8),
      passes = Math.ceil(6 / steps);
    for (let s = 1; s <= steps; s++) {
      this.nodes.forEach((n, i) => {
        n.x += move[i][0] / steps;
        n.y += move[i][1] / steps;
      });
      for (let i = 0; i < passes; i++) {
        this.solve();
        if (held) {
          const t = s / steps;
          held.n.x = held.x0 + (held.n.x - held.x0) * t;
          held.n.y = held.y0 + (held.n.y - held.y0) * t;
          this.confine(held.n);
        }
      }
    }
    let e = 0;
    this.nodes.forEach((n, i) => {
      n.vx = clamp((n.x - old[i][0]) * (this.reducedMotion ? 0.7 : 0.94), -32, 32);
      n.vy = clamp((n.y - old[i][1]) * (this.reducedMotion ? 0.7 : 0.94), -32, 32);
      e += n.vx * n.vx + n.vy * n.vy;
    });
    this.energy = Math.sqrt(e / this.nodes.length);
    for (const g of this.glyphs) g.update();
  }
}

function prepareLetter(glyph) {
  const rx = glyph.nodes[0].rx / glyph.radius, ry = glyph.nodes[0].ry / glyph.radius;
  const paths = glyph.paths.map((stroke) => {
    const nodes = stroke.nodes, count = nodes.length, path = new Path2D();
    const at = (n) => [n.x / rx, n.y / ry],
      mid = (a, b) => [(a.x + b.x) / 2 / rx, (a.y + b.y) / 2 / ry];
    let last = null;
    const to = (x, y) => {
      if (!last) path.moveTo(x, y);
      else if (Math.hypot(x - last[0], y - last[1]) < 0.05) return;
      else path.lineTo(x, y);
      last = [x, y];
    };
    const curve = (p0, c, p1) => {
      const ax = c[0] - p0[0], ay = c[1] - p0[1], bx = p1[0] - c[0], by = p1[1] - c[1];
      const pieces = clamp(
        Math.ceil(Math.abs(Math.atan2(ax * by - ay * bx, ax * bx + ay * by)) / 0.1),
        1,
        24
      );
      for (let k = 1; k <= pieces; k++) {
        const t = k / pieces, u = 1 - t;
        to(
          u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
          u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]
        );
      }
    };
    if (stroke.closed) {
      let start = mid(nodes.at(-1), nodes[0]);
      to(...start);
      for (let i = 0; i < count; i++) {
        const end = mid(nodes[i], nodes[(i + 1) % count]);
        curve(start, at(nodes[i]), end);
        start = end;
      }
      path.closePath();
    } else {
      let start = at(nodes[0]);
      to(...start);
      for (let i = 1; i < count - 1; i++) {
        const end = mid(nodes[i], nodes[i + 1]);
        curve(start, at(nodes[i]), end);
        start = end;
      }
      if (count > 1) to(...at(nodes.at(-1)));
      if (count === 1) path.lineTo(...start);
    }
    return path;
  });
  return { paths, rx, ry };
}

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
  const pressRef = useRef(null);
  const [hintVisible, setHintVisible] = useState(true);

  // Play subtle organic pop tone on click / puff
  const playPop = (radius) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const pitch = 580 * Math.sqrt(28 / Math.max(12, radius));
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.25, now + 0.12);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // AudioContext unavailable or blocked by policy
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let width = 0, height = 0, ratio = 1;
    let accumulator = 0, previousTime = 0, quietFrames = 0;

    const createLayout = (w, h) => {
      const chars = [...word];
      const count = chars.length;
      const paddingX = Math.max(16, w * 0.02);
      const innerW = w - paddingX * 2;
      const colW = innerW / count;
      const glyphH = Math.min(h * 0.76, colW * 1.55);
      const glyphW = Math.min(colW * 0.94, glyphH * 0.82);

      // Varied organic angles and slight vertical rhythm like Cole Derochie
      const angles = [-0.04, 0.03, -0.05, 0.04, -0.03, 0.04, -0.04, 0.03];
      const yOffsets = [-0.02, 0.02, -0.015, 0.02, -0.02, 0.015, -0.02, 0.02];

      const poses = chars.map((char, i) => ({
        x: paddingX + colW * (i + 0.5),
        y: h * 0.5 + (yOffsets[i % yOffsets.length] || 0) * h,
        w: glyphW,
        h: glyphH,
        angle: angles[i % angles.length] || 0,
        packingScale: 1.05,
      }));

      const glyphs = chars.map((c, i) => new Glyph(c, poses[i], i));
      return new World(w, h, glyphs);
    };

    const draw = () => {
      const world = worldRef.current;
      if (!world) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const halo = Math.max(3.0, Math.min(6.5, Math.min(width, height) * 0.008));
      const sorted = [...world.glyphs].sort((a, b) => (a.z || 0) - (b.z || 0));

      for (const glyph of sorted) {
        const drawing = prepareLetter(glyph);

        ctx.save();
        ctx.scale(drawing.rx, drawing.ry);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const band = (halo * 2) / Math.sqrt(drawing.rx * drawing.ry);
        const outer = glyph.radius * 2 + band;

        // Outer separation halo
        ctx.strokeStyle = haloColor;
        ctx.lineWidth = outer;
        for (const path of drawing.paths) ctx.stroke(path);

        // Core obsidian inflatable stroke
        ctx.strokeStyle = color;
        ctx.lineWidth = glyph.radius * 2;
        for (const path of drawing.paths) ctx.stroke(path);

        ctx.restore();
      }
    };

    const loop = (time) => {
      rafRef.current = 0;
      const world = worldRef.current;
      if (document.hidden || !world) {
        previousTime = 0;
        return;
      }

      accumulator = Math.min(
        1000 / 60,
        accumulator + Math.min(time - (previousTime || time - 16.67), 33.34)
      );
      previousTime = time;

      while (accumulator >= 1000 / 60) {
        world.step();
        accumulator -= 1000 / 60;
      }

      draw();

      quietFrames = !world.drag && !world.busy && world.energy < 0.08 ? quietFrames + 1 : 0;
      if (quietFrames < 35) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        world.sleep();
        previousTime = 0;
        accumulator = 0;
      }
    };

    const wake = () => {
      quietFrames = 0;
      if (!rafRef.current && !document.hidden) {
        previousTime = 0;
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    const handleResize = () => {
      const nextW = Math.max(280, container.clientWidth);
      const nextH = Math.max(160, Math.min(360, Math.round(nextW * 0.22)));
      const nextR = Math.min(window.devicePixelRatio || 1, 2);

      if (width === nextW && height === nextH && ratio === nextR) return;

      width = nextW;
      height = nextH;
      ratio = nextR;

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (worldRef.current && Math.min(worldRef.current.width, worldRef.current.height) >= 120) {
        worldRef.current.resize(width, height);
      } else {
        worldRef.current = createLayout(width, height);
      }
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
      if (event.button !== 0 || activePointerRef.current !== null) return;
      const point = pointAt(event);
      const glyph = hit(point);
      if (!glyph) return;

      event.preventDefault();
      activePointerRef.current = event.pointerId;
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture fallback
      }

      glyph.z = ++topZRef.current;
      worldRef.current.grab(glyph, point);
      pressRef.current = { glyph, startX: point.x, startY: point.y, time: Date.now() };

      playPop(glyph.radius);
      setHintVisible(false);
      canvas.style.cursor = "grabbing";
      wake();
    };

    const onPointerMove = (event) => {
      const point = pointAt(event);
      const world = worldRef.current;
      if (!world || !point) return;

      if (activePointerRef.current !== null && event.pointerId === activePointerRef.current) {
        if (world.drag) {
          world.drag.x = clamp(point.x, 6, width - 6);
          world.drag.y = clamp(point.y, 6, height - 6);
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
      if (pressRef.current && world) {
        const press = pressRef.current;
        const elapsed = Date.now() - press.time;
        const point = event ? pointAt(event) : { x: press.startX, y: press.startY };
        const dist = Math.hypot(point.x - press.startX, point.y - press.startY);
        if (elapsed < 320 && dist < 12) {
          world.puff(press.glyph, 1.45, true);
        }
      }

      pressRef.current = null;
      activePointerRef.current = null;
      if (world) world.release();
      try {
        if (event && event.pointerId !== undefined && canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Ignore capture release errors
      }
      canvas.style.cursor = "default";
      wake();
    };

    const onDoubleClick = (event) => {
      const point = pointAt(event);
      const glyph = hit(point);
      if (glyph && worldRef.current) {
        glyph.z = ++topZRef.current;
        worldRef.current.puff(glyph, 1.55, true);
        playPop(glyph.radius);
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

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    handleResize();

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("dblclick", onDoubleClick);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
      window.removeEventListener("blur", releasePointer);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, [word, color, haloColor]);

  // Keyboard accessibility: tab to nudge/puff individual letters
  const handleKeyNudge = (index, dir) => {
    const world = worldRef.current;
    if (!world || !world.glyphs[index]) return;
    const g = world.glyphs[index];
    g.z = ++topZRef.current;
    if (dir === "puff") {
      world.puff(g, 1.4, true);
      playPop(g.radius);
    } else {
      const step = 8;
      const map = { left: [-step, 0], right: [step, 0], up: [0, -step], down: [0, step] };
      const [dx, dy] = map[dir] || [0, 0];
      world.nudge(index, dx, dy);
    }
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
        aria-label="Yashmeen Future Building & Fit-Out Contracting L.L.C. Interactive inflatable lettering. Use mouse or touch to stretch and bounce the letters, or use keyboard tab controls below."
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
        }}
      />

      {/* Subtle playful interactive hint */}
      {hintVisible && (
        <div
          className="brand-play-hint"
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "6px",
            right: "12px",
            fontSize: "10px",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted-light)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: 0.85,
            transition: "opacity 0.4s ease",
          }}
        >
          <span style={{ fontSize: "12px" }}>🖐</span> DRAG OR TAP LETTERS
        </div>
      )}

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
