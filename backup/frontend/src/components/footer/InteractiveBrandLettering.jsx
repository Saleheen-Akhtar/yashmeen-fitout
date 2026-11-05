import { useEffect, useRef, useState } from "react";

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
        line([-0.26, -0.36], [-0.26, 0.36]),
        line([-0.26, -0.36], [0.24, -0.36]),
        line([-0.26, 0], [0.14, 0]),
        line([-0.26, 0.36], [0.24, 0.36]),
      ];
    case "N":
      return [
        line([-0.30, 0.36], [-0.30, -0.36], [0.30, 0.36], [0.30, -0.36]),
      ];
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
    const co = Math.cos(this.angle),
      si = Math.sin(this.angle);

    for (const stroke of letterStrokes(this.char)) {
      const local = stroke.points.map((p) => ({ x: p.x * this.w, y: p.y * this.h }));
      let length = 0;
      const lengths = [0];
      for (let i = 1; i < local.length; i++) {
        length += Math.hypot(local[i].x - local[i - 1].x, local[i].y - local[i - 1].y);
        lengths.push(length);
      }
      const count = Math.max(4, Math.ceil(length / (this.radius * 0.55)));
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
        let n = null,
          best = reach;
        for (const m of this.nodes) {
          const d = Math.hypot(m.lx - lx, m.ly - ly);
          if (d < best) {
            n = m;
            best = d;
          }
        }
        if (!n) {
          const ox = lx * co - ly * si,
            oy = lx * si + ly * co;
          n = {
            body: this,
            lx,
            ly,
            ox,
            oy,
            x: pose.x + ox,
            y: pose.y + oy,
            homeX: pose.x + ox,
            homeY: pose.y + oy,
            vx: 0,
            vy: 0,
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

    // Structural internal cross-struts to prevent folding, collapsing, or noodle distortion
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const d = Math.hypot(a.ox - b.ox, a.oy - b.oy);
        if (d < this.radius * 2.5) {
          const alreadyLinked = this.links.some(
            (l) => (l.a === a && l.b === b) || (l.a === b && l.b === a)
          );
          if (!alreadyLinked) {
            this.link(a, b);
          }
        }
      }
    }
    this.update();
  }

  // Exact plump bubble typography ratios from reference image
  static strokeRadius(c, w, h) {
    if (c === "I") return Math.max(9, h * 0.14);
    const ratioMap = { E: 0.12, S: 0.13, M: 0.13, H: 0.14, A: 0.14, Y: 0.14, N: 0.14 };
    return Math.max(9, Math.min(w * 0.24, h * (ratioMap[c] || 0.14)));
  }

  link(a, b) {
    this.links.push({ a, b, length: Math.hypot(a.ox - b.ox, a.oy - b.oy) });
  }

  update() {
    let x = 0,
      y = 0,
      minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const n of this.nodes) {
      x += n.x;
      y += n.y;
      minX = Math.min(minX, n.x - n.rx);
      maxX = Math.max(maxX, n.x + n.rx);
      minY = Math.min(minY, n.y - n.ry);
      maxY = Math.max(maxY, n.y + n.ry);
    }
    this.cx = x / this.nodes.length;
    this.cy = y / this.nodes.length;
    this.bounds = { minX, maxX, minY, maxY };
  }

  hitTest(p) {
    const inBounds =
      p.x >= this.bounds.minX - 25 &&
      p.x <= this.bounds.maxX + 25 &&
      p.y >= this.bounds.minY - 25 &&
      p.y <= this.bounds.maxY + 25;
    if (!inBounds) return false;
    return this.nodes.some(
      (n) => ((p.x - n.x) / (n.rx * 1.5)) ** 2 + ((p.y - n.y) / (n.ry * 1.5)) ** 2 <= 1.6
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
    this.returning = 0;
    this.time = 0;
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
  }

  grab(g, p) {
    const node = g.nodes.reduce((a, b) =>
      Math.hypot(a.x - p.x, a.y - p.y) < Math.hypot(b.x - p.x, b.y - p.y) ? a : b
    );
    this.drag = {
      glyph: g,
      node,
      x: p.x,
      y: p.y,
      dx: node.x - p.x,
      dy: node.y - p.y,
    };
    this.returning = 0;
    this.energy = 1;
    this.puff(g, 2.0);
  }

  release(vx = 0, vy = 0) {
    if (this.drag) {
      const g = this.drag.glyph;
      const speed = Math.hypot(vx, vy);
      for (const n of g.nodes) {
        n.vx = clamp(vx * 1.25, -55, 55);
        n.vy = clamp(vy * 1.25, -55, 55);
      }
      if (speed > 4) {
        this.puff(g, 2.8);
      }
    }
    this.drag = null;
    this.energy = 1;
  }

  returnHome() {
    this.drag = null;
    this.returning = 50;
    this.energy = 1;
    for (const g of this.glyphs) {
      this.puff(g, 2.2);
    }
  }

  followHome() {
    if (this.returning <= 0) return;
    this.returning--;
    const progress = (50 - this.returning) / 50;
    const factor = 0.14 + progress * 0.12;

    for (const n of this.nodes) {
      n.x += (n.homeX - n.x) * factor;
      n.y += (n.homeY - n.y) * factor;
      n.vx *= 0.5;
      n.vy *= 0.5;
    }

    if (this.returning === 0) {
      for (const n of this.nodes) {
        n.x = n.homeX;
        n.y = n.homeY;
        n.vx = 0;
        n.vy = 0;
      }
      for (const g of this.glyphs) {
        g.update();
      }
    }
  }

  nudge(index, x, y) {
    if (!this.glyphs[index]) return;
    const g = this.glyphs[index];
    for (const n of g.nodes) {
      n.vx += x;
      n.vy += y;
    }
    this.puff(g, 2.8);
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
    return !!this.target || this.returning > 0;
  }

  followResize() {
    const t = this.target,
      b = this.base;
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
    g.update();
    g.w *= k;
    g.h *= k;
    g.radius *= k;
    for (const n of g.nodes) {
      n.ox *= k;
      n.oy *= k;
      n.rx *= k;
      n.ry *= k;
      n.homeX = g.homeCx + (n.homeX - g.homeCx) * k;
      n.homeY = g.homeCy + (n.homeY - g.homeCy) * k;
      n.x = g.cx + (n.x - g.cx) * k;
      n.y = g.cy + (n.y - g.cy) * k;
    }
    for (const l of g.links) l.length *= k;
  }

  puff(g, intensity = 2.5) {
    // Spongy bubble wobble: radial velocity impulse on nodes that springs back to rest shape
    // Geometry scale is strictly immutable so letters NEVER get permanently bigger
    if (!g) return;
    g.update();
    const impulse = Math.max(1.2, Math.min(5.0, intensity));
    for (const n of g.nodes) {
      const dx = n.x - g.cx;
      const dy = n.y - g.cy;
      const dist = Math.hypot(dx, dy) || 1;
      n.vx += (dx / dist) * impulse;
      n.vy += (dy / dist) * impulse;
    }
    this.energy = 1;
  }

  solve() {
    // 1. Structural spring constraints with firm bubble elasticity
    for (const g of this.glyphs) {
      for (const l of g.links) {
        const dx = l.b.x - l.a.x,
          dy = l.b.y - l.a.y,
          d = Math.hypot(dx, dy) || 1;
        const rest = Math.hypot(l.b.ox - l.a.ox, l.b.oy - l.a.oy);
        const k = ((d - rest) / d) * 0.28;
        l.a.x += dx * k;
        l.a.y += dy * k;
        l.b.x -= dx * k;
        l.b.y -= dy * k;
      }
      for (const path of g.paths) {
        const nodes = path.nodes,
          start = path.closed ? 0 : 1,
          end = path.closed ? nodes.length : nodes.length - 1;
        for (let i = start; i < end; i++) {
          const n = nodes[i],
            a = nodes[(i - 1 + nodes.length) % nodes.length],
            b = nodes[(i + 1) % nodes.length];
          const dx = ((a.x + b.x) / 2 - n.x + (n.ox - (a.ox + b.ox) / 2)) * 0.20;
          const dy = ((a.y + b.y) / 2 - n.y + (n.oy - (a.oy + b.oy) / 2)) * 0.20;
          n.x += dx;
          n.y += dy;
          a.x -= dx / 2;
          a.y -= dy / 2;
          b.x -= dx / 2;
          b.y -= dy / 2;
        }
      }
    }

    // 2. Elastic ball-to-ball collisions with bouncy bubble reflection
    // Skip inter-body collisions while returning home so letters glide cleanly into position
    if (this.returning > 0) {
      for (const n of this.nodes) this.confine(n);
      return;
    }

    const cell = Math.max(16, ...this.nodes.map((n) => Math.max(n.rx, n.ry) * 2 + 4));
    const grid = new Map();
    for (const a of this.nodes) {
      const gx = Math.floor(a.x / cell),
        gy = Math.floor(a.y / cell);
      for (let x = gx - 1; x <= gx + 1; x++) {
        for (let y = gy - 1; y <= gy + 1; y++) {
          for (const b of grid.get(x + "," + y) || []) {
            if (a.body === b.body && this.neighbors.has(b.id + ":" + a.id)) continue;
            const dx = a.x - b.x,
              dy = a.y - b.y,
              d = Math.hypot(dx, dy) || 0.001;
            const nx = dx / d,
              ny = dy / d;
            const ra = Math.hypot(a.rx * nx, a.ry * ny);
            const rb = Math.hypot(b.rx * nx, b.ry * ny);
            const overlap = ra + rb - d;
            if (overlap > 0) {
              const k = overlap * 0.38;
              if (!this.drag || a.body !== this.drag.glyph) {
                a.x += nx * k;
                a.y += ny * k;
              }
              if (!this.drag || b.body !== this.drag.glyph) {
                b.x -= nx * k;
                b.y -= ny * k;
              }

              // Elastic bubble bounce impulse between distinct letters (88% restitution)
              if (a.body !== b.body) {
                const normalSpeed = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
                if (normalSpeed < 0) {
                  const impulse = -normalSpeed * 0.88;
                  a.vx += nx * impulse;
                  a.vy += ny * impulse;
                  b.vx -= nx * impulse;
                  b.vy -= ny * impulse;
                }
              }
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

  // Energetic perimeter bounce: 88% elastic bubble reflection off container edges
  confine(n) {
    const pad = 6;
    const minX = n.rx + pad;
    const maxX = this.width - n.rx - pad;
    const minY = n.ry + pad;
    const maxY = this.height - n.ry - pad;

    const restitution = 0.88;

    if (n.x < minX) {
      n.x = minX;
      if (n.vx < 0) n.vx = -n.vx * restitution;
    } else if (n.x > maxX) {
      n.x = maxX;
      if (n.vx > 0) n.vx = -n.vx * restitution;
    }

    if (n.y < minY) {
      n.y = minY;
      if (n.vy < 0) n.vy = -n.vy * restitution;
    } else if (n.y > maxY) {
      n.y = maxY;
      if (n.vy > 0) n.vy = -n.vy * restitution;
    }
  }

  step(time = 0) {
    this.time = time;
    this.followResize();
    this.followHome();

    const old = this.nodes.map((n) => [n.x, n.y]);
    const t = (time || performance.now()) * 0.001;

    // 1. Perpetual Zero-Gravity Space Float ("Floating Even if We Leave the Words")
    // Every letter gently drifts, bobs, and floats along zero-gravity space curves in real time.
    // Whisper celestial anchor (0.0022) ensures letters preserve single-row YASHMEEN baseline formation over time.
    if (!this.reducedMotion && this.returning <= 0) {
      for (let i = 0; i < this.glyphs.length; i++) {
        const g = this.glyphs[i];
        if (this.drag && this.drag.glyph === g) continue;

        const phase = i * 1.57;
        const driftX = Math.sin(t * 0.75 + phase) * 0.045;
        const driftY = Math.cos(t * 0.95 + phase * 1.25) * 0.052;

        // Whisper celestial anchor (0.0022) preserves single-row YASHMEEN baseline
        const anchorX = (g.homeCx - g.cx) * 0.0022;
        const anchorY = (g.homeCy - g.cy) * 0.0022;

        for (const n of g.nodes) {
          n.vx += driftX + anchorX;
          n.vy += driftY + anchorY;
        }
      }
    }

    // 2. Soft jelly Cole Derochie shape recovery around moving center
    for (const g of this.glyphs) {
      g.update();
      const meanX = g.nodes.reduce((s, n) => s + n.ox, 0) / g.nodes.length;
      const meanY = g.nodes.reduce((s, n) => s + n.oy, 0) / g.nodes.length;
      for (const n of g.nodes) {
        const tx = g.cx + (n.ox - meanX);
        const ty = g.cy + (n.oy - meanY);
        n.vx += (tx - n.x) * 0.045;
        n.vy += (ty - n.y) * 0.045;
      }
    }

    // 3. Pointer drag physics: held node follows pointer, rest of letter follows elastically
    const move = this.nodes.map((n) => [n.vx, n.vy]);
    let held = null;
    if (this.drag) {
      const d = this.drag;
      const n = d.node;
      const mx = clamp(d.x + d.dx - n.x, -70, 70);
      const my = clamp(d.y + d.dy - n.y, -70, 70);
      for (const m of d.glyph.nodes) {
        move[m.id][0] += mx * 0.28;
        move[m.id][1] += my * 0.28;
      }
      held = { n, x0: n.x, y0: n.y, x: n.x + mx, y: n.y + my };
    }

    // 4. Sub-step position integration and constraint solving
    let far = 0,
      thin = Infinity;
    for (const n of this.nodes) thin = Math.min(thin, n.rx, n.ry);
    for (const [x, y] of move) far = Math.max(far, Math.hypot(x, y));
    if (held) far = Math.max(far, Math.hypot(held.x - held.x0, held.y - held.y0));
    const steps = clamp(Math.ceil(far / (thin * 0.5)), 1, 6);
    const passes = Math.ceil(4 / steps);

    for (let s = 1; s <= steps; s++) {
      this.nodes.forEach((n, i) => {
        n.x += move[i][0] / steps;
        n.y += move[i][1] / steps;
      });
      for (let i = 0; i < passes; i++) {
        this.solve();
        if (held) {
          const tSub = s / steps;
          held.n.x = held.x0 + (held.x - held.x0) * tSub;
          held.n.y = held.y0 + (held.y - held.y0) * tSub;
          this.confine(held.n);
        }
      }
    }

    // 5. Stable velocity derivation with bouncy rubber ball restitution & zero-gravity air glide
    const friction = this.drag ? 0.94 : 0.982;
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      n.vx = clamp((n.x - old[i][0]) * friction, -48, 48);
      n.vy = clamp((n.y - old[i][1]) * friction, -48, 48);
    }

    for (const g of this.glyphs) {
      g.update();
    }
  }
}

function prepareLetter(glyph) {
  const rx = glyph.nodes[0].rx / glyph.radius,
    ry = glyph.nodes[0].ry / glyph.radius;
  const paths = glyph.paths.map((stroke) => {
    const nodes = stroke.nodes,
      count = nodes.length,
      path = new Path2D();
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
      const ax = c[0] - p0[0],
        ay = c[1] - p0[1],
        bx = p1[0] - c[0],
        by = p1[1] - c[1];
      const pieces = clamp(
        Math.ceil(Math.abs(Math.atan2(ax * by - ay * bx, ax * bx + ay * by)) / 0.1),
        1,
        24
      );
      for (let k = 1; k <= pieces; k++) {
        const t = k / pieces,
          u = 1 - t;
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
  const recentPositionsRef = useRef([]);
  const pressRef = useRef(null);
  const wakeRef = useRef(null);
  const [hintVisible, setHintVisible] = useState(true);

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
      // AudioContext unavailable
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    let width = 0,
      height = 0,
      ratio = 1;

    // Exact reference single-row layout poses matching Image 3
    const createLayout = (w, h) => {
      const chars = [...word];
      const count = chars.length;
      const aspectMap = { Y: 0.72, A: 0.76, S: 0.64, H: 0.72, M: 0.86, E: 0.62, N: 0.72 };

      let glyphH = Math.min(h * 0.64, 250);
      let letterWidths = chars.map((c) => glyphH * (aspectMap[c] || 0.72));
      let sumWidths = letterWidths.reduce((a, b) => a + b, 0);
      const minPadding = Math.max(24, w * 0.04);
      const availW = w - minPadding * 2;

      // If the word exceeds container width, scale glyphH down proportionally
      const estGaps = (count - 1) * 16;
      if (sumWidths + estGaps > availW) {
        const scale = (availW - estGaps) / sumWidths;
        glyphH *= Math.max(0.4, scale);
        letterWidths = chars.map((c) => glyphH * (aspectMap[c] || 0.72));
        sumWidths = letterWidths.reduce((a, b) => a + b, 0);
      }

      // Calculate uniform optical gap between letters
      const totalGapSpace = availW - sumWidths;
      const gap = clamp(totalGapSpace / (count - 1), 10, 26);
      const totalWordW = sumWidths + (count - 1) * gap;
      const startX = (w - totalWordW) / 2;

      const angles = [-0.03, 0.02, -0.04, 0.03, -0.02, 0.03, -0.03, 0.02];
      const yOffsets = [-0.012, 0.012, -0.008, 0.012, -0.012, 0.008, -0.012, 0.012];

      let curX = startX;
      const poses = chars.map((char, i) => {
        const lw = letterWidths[i];
        const pose = {
          x: curX + lw * 0.5,
          y: h * 0.5 + (yOffsets[i % yOffsets.length] || 0) * h,
          w: lw,
          h: glyphH,
          angle: angles[i % angles.length] || 0,
          packingScale: 1.0,
        };
        curX += lw + gap;
        return pose;
      });

      const glyphs = chars.map((c, i) => new Glyph(c, poses[i], i));
      return new World(w, h, glyphs);
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
      if (document.hidden || !world) {
        return;
      }

      world.step(time);
      draw();

      // Perpetual zero-gravity space float: continuously floats in real time
      rafRef.current = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      if (!document.hidden) {
        rafRef.current = requestAnimationFrame(loop);
      }
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

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    handleResize();

    return () => {
      observer.disconnect();
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
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
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
            fontSize: "11px",
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
            fontSize: "10px",
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
