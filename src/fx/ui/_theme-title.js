// A local painter view: protect title pixels in both buffers without erasing other effects.
export function protectTitle(p, o) {
  const q = Object.create(p), hw = Math.max(0, o.clearW) / 2, hh = Math.max(0, o.clearH) / 2;
  const visibility = (x, y) => {
    const d = Math.max(Math.abs(p.fromX(x + 0.5, y + 0.5)) - hw, Math.abs(p.fromY(x + 0.5, y + 0.5)) - hh);
    const u = Math.max(0, Math.min(1, d / 8));
    return u * u * (3 - 2 * u);
  };
  q.put = (x, y, c, a = 1) => { const v = visibility(x, y); if (v) p.put(x, y, c, a * v); };
  q.add = (x, y, c, k = 1) => { const v = visibility(x, y); if (v) p.add(x, y, c, k * v); };
  return q;
}
