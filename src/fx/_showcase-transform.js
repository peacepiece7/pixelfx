// Derived painter: keep placement, mirroring and inverse sampling consistent.
export function transform(base, sx = 1, sy = sx, dy = 0, alpha = 1) {
  const p = Object.create(base);
  p.toX = (x, y) => base.toX(x * sx, y * sy + dy);
  p.toY = (x, y) => base.toY(x * sx, y * sy + dy);
  p.fromX = (x, y) => base.fromX(x, y) / sx;
  p.fromY = (x, y) => (base.fromY(x, y) - dy) / sy;
  p.fade = base.fade * alpha;
  return p;
}
