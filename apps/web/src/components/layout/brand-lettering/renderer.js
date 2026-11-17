import { clamp } from "./physics";
export function prepareLetter(glyph) {
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
