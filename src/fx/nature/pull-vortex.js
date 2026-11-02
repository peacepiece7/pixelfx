import { haze, softShade, pool } from "../_soft.js";
import { Rng, fit, smooth, clamp, noise2, TAU } from "../../core/index.js";
import { drawLeaf } from "./_lib.js";

export const meta = {
  name: "Pull vortex",
  desc: "Broad ground-hugging dust arms accelerate inward from every direction; tumbling grit, lifted grass and low pressure waves converge on the forward slam point.",
  tags: ["nature", "wind", "pull", "vortex", "charge", "ground", "loop"],
  size: [288, 160], origin: [80, 102], duration: 2, loop: true, fps: 40,
  bg: "ground", actor: 2,
  options: {
    palette: ["#2b2116", "#5a4632", "#8c6e4a", "#c2a172", "#e8d6a8"],
    centerX: 56, radius: 96, seed: 8,
  },
};

const wrap = u => ((u % 1) + 1) % 1;
const SY = .36;
const envelope = u => smooth(0, .12, u) * (1 - smooth(.84, 1, u));

// Motion repeats after exactly two seconds. Different integer cycle counts
// separate slow dust gathering, fast grit and sudden inward streaks.
function point(u, phase, o, turns = .72) {
  const r = o.radius * (1 - u ** 1.65);
  const angle = phase + u * TAU * turns;
  return { x: o.centerX + Math.cos(angle) * r, y: Math.sin(angle) * r * SY, r, angle };
}

function groundCurrent(p, C, time, o) {
  const r = o.radius;
  // Broken translucent sheets reveal the broad circular footprint. Their
  // bright edges are dust catching light, not a glowing magical ground glyph.
  softShade(p, o.centerX - r, -r * SY, o.centerX + r, r * SY, (x, y, out) => {
    const dx = x - o.centerX, dy = y / SY;
    const q = Math.hypot(dx, dy) / r;
    if (q > 1 || q < .06) return;
    const a = Math.atan2(dy, dx);
    const sweep = a * 4 + (1 - q) * 8 - time * TAU * 2;
    const ridge = Math.sin(sweep);
    if (ridge < .45) return;
    const n = noise2(Math.floor(x / 3) * .36 + Math.cos(time * TAU) * .8, Math.floor(y / 2) * .4 + Math.sin(time * TAU) * .8, o.seed + 14);
    const broken = .45 + .55 * Math.sin(a * 7 + q * 11 + time * TAU);
    const k = smooth(.06, .2, q) * (1 - smooth(.65, 1, q));
    if (broken < -.04 || n < -.48) return;
    out.c = C[ridge > .97 && n > .12 ? 3 : ridge > .8 ? 3 : ridge > .65 ? 2 : 1];
    out.a = k * smooth(.45, .88, ridge) * (.22 + .3 * Math.max(0, broken));
  });
}

function flowStroke(p, x0, y0, x1, y1, color, alpha) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    p.blend(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, color, alpha);
  }
}

function streaks(p, C, time, o) {
  const R = new Rng(o.seed + 11);
  for (let i = 0; i < 32; i++) {
    const phase = i * TAU / 32 + R.range(-.15, .15);
    const born = R.next(), cycles = i % 4 === 0 ? 3 : 2;
    const turns = R.range(.35, .85);
    const u = wrap(time * cycles - born), fade = envelope(u);
    let prev = point(u, phase, o, turns);
    const length = 7 + i % 7;
    // Inward acceleration stretches the trail at its front and leaves broad
    // slow tails at the outer edge. Each tail keeps its own irregular gaps.
    for (let j = 1; j <= length; j++) {
      const age = u - j * .007;
      if (age < 0) break;
      const tail = point(age, phase, o, turns);
      const k = fade * (1 - j / (length + 1));
      if ((i + j) % 9 !== 0) {
        flowStroke(p, prev.x, prev.y + 1, tail.x, tail.y + 1, C[1], k * .55);
        flowStroke(p, prev.x, prev.y, tail.x, tail.y, C[j < 3 ? 4 : j < 7 ? 3 : 2], k * .8);
      }
      prev = tail;
    }
  }
}

function dust(p, C, time, o, near) {
  const R = new Rng(o.seed + 27);
  for (let i = 0; i < 48; i++) {
    const phase = R.range(0, TAU), born = R.next(), size = R.range(2, 5);
    const turns = R.range(.42, .92), lift = R.range(2, 10);
    const u = wrap(time * (i % 3 === 0 ? 1 : 2) - born);
    const v = point(u, phase, o, turns);
    if ((Math.sin(v.angle) > 0) !== near) continue;
    const fade = envelope(u);
    const height = Math.sin(u * Math.PI) ** 2 * lift;
    const swell = size * (.7 + Math.sin(u * Math.PI) * .7);
    // A dark underside and offset lit cap give low rolling dust volume.
    // True alpha avoids a checkerboard haze covering the character.
    haze(p, v.x + 1, v.y - height + 1, swell, C[1], fade * .3);
    haze(p, v.x - swell * .25, v.y - height - .4, swell * .72, C[2], fade * .36);
    if (i % 3 === 0) {
      p.line(v.x - 2, v.y - height - 1, v.x + 1, v.y - height - 2, C[3], fade * .32);
    }
  }
}

function debris(p, C, time, o, near) {
  const R = new Rng(o.seed + 48);
  for (let i = 0; i < 42; i++) {
    const phase = R.range(0, TAU), born = R.next();
    const turns = R.range(.4, 1), lift = R.range(2, 13);
    const size = R.range(.7, 2.1);
    const u = wrap(time * (i % 4 === 0 ? 3 : 2) - born);
    const v = point(u, phase, o, turns);
    if ((Math.sin(v.angle) > 0) !== near) continue;
    const fade = envelope(u);
    const hop = Math.sin(u * Math.PI) * lift * (.65 + .35 * Math.sin(u * Math.PI * 3 + phase) ** 2);
    const y = v.y - hop;
    // Shadows stay on the floor while the grit hops and rolls inward.
    p.ellipse(v.x, v.y, size + .8, .6, C[0], fade * .45);
    if (i < 14) {
      drawLeaf(p, v.x, y, 3 + size, .65, phase + u * 13, phase + u * 17,
        [C[0], C[3], C[1], C[2]], fade);
    } else {
      const spin = phase + u * (13 + i % 4 * 3);
      const dx = Math.cos(spin) * size, dy = Math.sin(spin) * size;
      p.line(v.x - dx, y - dy, v.x + dx, y + dy, C[1], fade);
      p.line(v.x - dx, y - dy - 1, v.x, y - 1, C[3], fade);
      if (u > .6) {
        const tail = point(Math.max(0, u - .014), phase, o, turns);
        p.line(tail.x, tail.y - hop, v.x, y, C[2], fade * .35);
      }
    }
  }
}

function gatheringFronts(p, C, time, o) {
  // Six short pressure fronts contract and curl. Open arcs, never full rings.
  for (let i = 0; i < 6; i++) {
    const u = wrap(time * 2 + i / 6), fade = envelope(u);
    const radius = o.radius * (1 - u ** 1.4);
    const start = i * 2.37 + time * TAU;
    let last = null;
    for (let j = 0; j < 18; j++) {
      const a = start + j * .027;
      const rr = radius + Math.sin(j * .4 + i) * 1.2;
      const x = o.centerX + Math.cos(a) * rr, y = Math.sin(a) * rr * SY;
      if (last && j % 7 !== 0) p.line(last[0], last[1], x, y, C[j < 5 ? 3 : 2], fade * .45);
      last = [x, y];
    }
  }
}

function core(p, C, time, o) {
  const breathing = .5 + .5 * Math.sin(time * TAU * 2);
  p.ellipse(o.centerX, 0, 7 + breathing, 2.5, C[0], .4);
  for (let i = 0; i < 7; i++) {
    const u = wrap(time * 3 + i / 7), a = i * 2.4 + u * TAU;
    const r = 2 + (1 - u) * 9;
    const x = o.centerX + Math.cos(a) * r, y = Math.sin(a) * r * SY;
    const k = envelope(u);
    haze(p, x, y - 1, 2 + u * 2, C[2], k * .22);
    p.blend(x, y - 1, C[3], k * .45);
  }
  pool(p, o.centerX, 0, 13, 4, C[3], .025 + breathing * .02);
}

export function drawBack(p, t, options) {
  const o = { ...options, radius: clamp(options.radius, 16, 120) };
  const C = fit(o.palette, 5), time = Math.round(wrap(t / meta.duration) * 1e9) / 1e9;
  groundCurrent(p, C, time, o);
  gatheringFronts(p, C, time, o);
  dust(p, C, time, o, false);
  debris(p, C, time, o, false);
  streaks(p, C, time, o);
  dust(p, C, time, o, true);
  debris(p, C, time, o, true);
  core(p, C, time, o);
}

// All layers remain under characters; the destination is ground, not the torso.
export function draw() {}
