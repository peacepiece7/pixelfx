# Hilding poison VFX — review package

The original seven effects use simulated `create(o)` modules. The added body
aura uses pure `draw`/`drawBack`. All are authored around a 48px hero.
They render only pixels/light. They do not select recipients, apply poison, deal
hits, consume mines, refresh statuses or remove areas on caster death/control.
The host creates one instance per cast, area ID, consumed mine or transferred life.
User review in the asset studio `/vfx` precedes any hero/renderer/atom integration.

| Effect ID | Size | Animation | Origin / preview |
|---|---|---|---|
| `poison/poison-arrow` | 128×64 | 0.4s once | caster; thin shaft, fletching, venom tip |
| `poison/poison-dagger` | 128×64 | 0.4s once | caster; blade bevel, guard, wrapped handle |
| `poison/poison-fog` | 160×96 | 5s loop | fixed target; radius65, low green/violet gas |
| `poison/poison-mine` | 64×64 | 12s loop | fixed target; installation → 0.5s readiness |
| `poison/mine-burst` | 128×96 | 0.5s once | consumed mine; low radius55 liquid crown |
| `poison/poison-detonation` | 160×128 | 0.7s once | poisoned target; higher green/violet bloom |
| `poison/poison-aura` | 104×112 | 2s loop | actor; mask-following green aura, actual stacks |
| `poison/poison-transfer` | 160×96 | 0.5s once | dead source; wet bead to a host-chosen recipient |

Common options: `palette` (VENOM), `seed`, runtime `x/y`, `flip`, `angle`, `light`.
One-shots draw nothing at 0 and at/after their duration. Each owns its simulation
clock and seeded particles; no shared mutable particle arrays or random streams.
The liquid drops, gas and floor light reuse the library's existing rendering
helpers, including their upstream license credits. No new external assets/code.

## Host attachment options

- Arrow/dagger: `travelDistance` default72; transfer: default94. These are short
  showcase trajectories, **not combat ranges**. Set0 when moving the effect origin
  from actual host coordinates, and align its local attachment offset. Arrow and
  dagger tips start at local(8,-24); transfer starts at(0,-16) and has a shallow
  visual arc. Direction/recipient/arrival/removal remain host-owned. There is no
  impact cue or callback that could delay damage/placement. Missed basic attacks
  may still display the projectile. No-recipient transfers are not instantiated.
- Fog: `radius` default65. Its five-second motion is seamless and has a one-second
  local light pulse. Optional `pulse:0..1` overrides **brightness only**. Pass
  `elapsed`/`remaining` seconds for optional unfold/settle fades, or call `stop()`.
- Mine: prepare once for `ARM_TIME=0.5` seconds from installation. Optional
  `elapsed` overrides the instance clock for readiness; this is installation age,
  not time since arming. Ready shimmer repeats every1.2s and does not re-arm at
  the 12-second animation boundary. `remaining` optionally fades it near expiry.
- Fog/mine `meta.loop` describes repeatable **visual motion**, not an autonomous
  lifetime or tick source. The host must `stop()`/remove fog at its area expiry
  (5s), and mines at contact or installation+12s. The 0.5s setup does not extend
  mine lifetime. Caster control/death and wave changes do not change these timers.
- Detonation: `stacks` is a creation-time snapshot, default6. Visual reach follows
  `32+24*(1-exp(-max(0,stacks)/10))` pixels to stay inside its preview frame even
  for large counts. This bounds only art size; there is no poison-stack, damage,
  summon-count or healing cap. Create once per actual poisoned target, including
  shield absorption. Mine burst creates once per consumed mine, not per target.

## Review and checks

```sh
node tools/render.mjs poison --gif --mp4 --loops 1
node tools/check.mjs poison
node tools/test-hilding-poison.mjs
node tools/build-gallery.mjs
```

GIF/MP4/contact sheets are in `records/poison/<name>/`. Three rendering rounds were
reviewed: initial silhouettes; flattened gas with a liquid crown and violet
shading; final loops/arming/GIF playback. `tools/test-hilding-poison.mjs` checks
registration, seeded repeatability,30/60Hz, palette/facing/light, clean endings,
independent clocks, host-stop/lifecycle controls, fog seam and brightness-only
pulse, exact host-age mine readiness, stack scaling and disabled showcase travel.

This package does not mark user review complete or edit `applied.json`.

## Body aura and skull transfer revision — 2026-11-04

`poison/poison-aura` adds a pure two-second status loop (104×112, actor:2).
The supplied `o.actor` mask controls the body envelope; host artwork and movement
are preserved. Keep one aura per poisoned unit. Mutable `stacks` reads the actual
poison count (0 draws nothing); increasing it deepens density/light without
creating duplicate aura instances. `pulse:0..1` emphasizes a real application or
transfer receipt, and `elapsed`/`remaining` optionally control lifecycle fades.
Remove/stop the aura when poison ends or the unit dies. The old global
`status/poisoned` effect is preserved, not silently redefined.

`poison-transfer` now reuses the exact skull bitmap from `shadow/curse`, recolored
through VENOM in `_venom-skull.js`; the approved original darkness effect is
untouched. One skull leaves the source at local(0,-24), follows a shallow arc and
folds into a brief body-wrap aura around the recipient. The visual arrival key is
`ARRIVE=.39` within its existing0.5s duration. `travelDistance` remains94 for the
showcase and0 for a host-moved origin. The old local y=-16 drop is superseded.

Receiving an existing poison adds to that recipient's existing stack display; it
does not clone stacks, refresh remaining durations, re-target after a no-target
failure, or wait for the visual skull to arrive before applying combat results.
Actual state drives the persistent aura; the short arrival catch is presentation.
New aura + changed transfer both require user review before any game connection.


### Venom drip refinement (2026-11-04)

The status aura is now a faint background tint; sticky venom drops are the main
read. Unlike `blood/bleeding` and `water/drip` status mode (which share occupied
central torso pixels at36–52% mask height), poison uses `dripSites(actor)` at
64–84% mask height and outside the central22% half-width with4.5px clearance.
Drop drift points outward. A mask without lower rows uses its actual lower
silhouette while retaining the outboard exclusion. Small toxic stains and a
single blister replace water rings/blood splash crowns. Existing bleed/wet
modules remain unchanged. Actual stack count controls only this aura's visual
frequency/intensity; its count0, lifecycle and pulse contracts remain intact.
