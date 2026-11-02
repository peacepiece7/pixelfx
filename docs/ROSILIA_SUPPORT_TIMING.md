# Rosilia support shot: sight lifecycle and contact

The pure `draw` and `drawBack` exports still accept time and options. `pulse` is
an external 1→0 envelope spanning a nominal 0.35 seconds; no shots are scheduled.
Optional `age` is the time since the sight was created, in seconds. When omitted,
pure calls show an already assembled sight.

A local `create` adapter supplies unwrapped birth age for the standard pixelfx
runtime. This avoids replaying creation every time the 2-second idle loop wraps.
When the caller ends a shot pulse, the retained sight begins assembling again;
removing/stopping the instance still belongs to the caller.

- Birth 0–0.20s: radius expands, rim writes around the floor, markings enter in
  groups and the independent crosshair extends into place.
- Pulse age 0.015–0.085s: engraving expands and dissolves; 24 tangential strips
  scatter outward with local light. All sight remnants clear by 0.095s.
- 0.10s: the round contacts the empty ground. Only now do the crater and cracks
  appear, together with the sharp ivory impact fan and floor reflection.
- 0.11–0.30s: twelve lit dust lobes fan outward, two pressure fronts spread,
  stones and brass fragments fly and the central soil plume rises.
- 0.35s: shot layers are empty. Only an externally retained sight may reassemble.

Canvas 240×180 includes the 169px incoming trajectory; the reticle radius remains
62 and no combat radius or additional hit is introduced. All colours use palette.

`node tools/render-rosilia-support-shot.mjs final` renders birth, a demo pulse,
pre-contact disappearance, impact and reassembly. Demo firing intervals belong
only to the renderer. `tools/test-rosilia-support-shot.mjs` covers lifecycle,
pre-contact clearance, flight, empty shot endpoint and multiple-seed bounds.
