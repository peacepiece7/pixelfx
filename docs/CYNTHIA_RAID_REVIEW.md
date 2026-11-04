# Cynthia / raid VFX review batch

16 code effects, pending user playback approval in the project's `/vfx` page. No hero, scene, boss, atom, combat timing, review or applied records are connected/changed by this batch. GIF/contact previews: `records/cynthia/<id>/` and `records/raid/<id>/` (generated, git-ignored). Registry/catalog and gallery include both categories.

## Host contract

All coordinates are effect-local pixels; painter handles x/y, flip and angle. Palettes are replaceable, seed is deterministic. One-shots end empty. Loops continue until host stop/remove. Pause by not advancing the instance; scene teardown removes it. Combat remains authoritative for target selection, hit counts, pulse deduplication, delayed ignition, per-installation lifetime and death-independent persistence.

Cynthia `gunfire` takes `weapon: shotgun|gatling|rifle`; each shot is a fresh instance. This changes muzzle spread/length, not weapon cadence or damage. `overheat` is shallow vent heat, no state changes. `jericho-flight` takes local targetX/targetY; its .3s travel never schedules damage. `jericho-impact` radius55 and `ignition-burst` radius75 are independent one-shot blasts. `ignition-marker` is a one-second bolt cue; installation and ignition clocks belong to host. `ignition-zone` and `satellite-trail` render one patch each (radius75/65); explicit pulse 0..1 adds light. `satellite` takes height/pulse/active; host moves x/y at the actual endpoint, active:false draws nothing while awaiting a target. Eight zone pulses, residual lifetime6s and satellite sampling/rate limits must not be inferred from the 1s visual loop.

Raid `maskRects` and `protectRects` are arrays of local [x,y,width,height]. Empty maskRects draws nothing. Fog defaults below the platform; near dust defaults to outer edges; warning/impact default to a representative platform strip. Production callers must provide real geometry. Fog's canvas depth region is y70..180; broader scene geometry requires moving/scaling the instance rather than treating it as a gameplay mask. `dragon-breath` takes local source/target points, defaults [0,0]→[-230,65], faces left; it draws no dragon head/teeth. Phase surge is a generic neck/chest outline candidate, requiring placement against the final dragon sprite during approval. Host coalesces phase changes. Reduced motion freezes ambient loops and simplifies moving breath edges; all effects stop when their instance stops receiving time or is removed.

## Verification

`node tools/check.mjs cynthia` and `node tools/check.mjs raid`: 16 passes, no warnings after refinement. `node tools/test-cynthia-raid.mjs`: deterministic rendering, palette replacement, mirror, loop/end, teardown, empty/protected masks, reduced-motion ambience, pulse, weapon and target options. Three visual passes corrected a floor ring, brightened explosion lobes, reduced full-screen shader work and removed breath striping without a costly high-vertex polygon. GIF frame samples/contact sheets inspected; artistic approval remains with the user.

`node tools/index.mjs` registers 304 total effects. `node tools/build-gallery.mjs` builds the static gallery. All 16 requested tickets loaded/replayed in `/vfx` without browser errors. SSOT sync pending: MCP transport unavailable during this task.
