# Aorbion water revision — 50 ms choreography

Review-only VFX. No combat events, hits or hero bindings. Host owns travel/facing.
Each source contains a numeric 0.05-second timeline, interpolated between samples;
particles have individually seeded birth delays and ballistic paths, not identical loops.
`water/geyser.js` is the reference for layered columns, short highlights, mist, foam and landing ripples.
Pixel edges remain sharp; translucency belongs to thin water films and mist, not checkerboard opacity.

Layer order: far ground ripples / far spray → dark water body → teal middle → pale moving veins
→ near foam and droplets → small localized light. Each component has its own envelope.

| Time | Charge emerge (0.65 s) | Tail pillars (0.8 s, per pillar) | Sea dragon (1 s) |
|---|---|---|---|
| .00 | Empty | Empty | Empty |
| .05 | 12px front, dark raised water, 3 vent droplets | 10px rise, small dark base, 2 bubbles | Tail gathers, low wake, head still indistinct |
| .10 | 38px front, bright lip, first claw, 8 fast droplets | 35px rise, pale inner vein, 5 vertical beads | Body develops, neck rises, rear water veil opens |
| .15 | 69px front, crest curls, second claw, 10 droplets | 58px peak, three uneven tip lobes, 4 beads | Soft head gathers, water wisps begin to lag |
| .20 | 91px front, third claw, crest sheds 7 beads | 62px peak, thin moving strands, 3 beads | Head billows brighten above the bow spray |
| .25 | 100px front, claw tips break, lip folds | 57px surge, side bubbles loosen, 2 beads | Front water mass rolls through uneven highlights |
| .30 | Veins drain; 4 split claw fragments; first plinks | 53px height, foam cap shrinks, 3 beads | Underbody foam loosens; water wisps trail behind |
| .35 | Broken claw trails; foam moves sideways | 46px height, pressure falls, 1 bead | Body wave reaches tail, mane tears into droplets |
| .40 | Low water sheet; independent landing rings | 37px height, fragments detach upward | Head and body water compress independently |
| .45 | Bubbles pop; cool teal rim, thin mist | 28px height, cyan-to-teal cooling | Second asymmetric shoulder roll, renewed bow crest |
| .50 | Small splashes, broken ground arcs | 18px height, thin water root | Head light recedes, water veins accelerate |
| .55 | Last drifting foam, dark wet film | 9px water root, falling beads | Front water veil loosens; opposite wisp lags |
| .60 | Residual translucent ripples only | Root vanishes, small landing rings | Tail begins to unravel; neck stays readable |
| .65 | Empty | Small rings and two fading bubble groups | Hindbody separates into uneven watery chunks |
| .70 | — | Thin wet film, individual ring remnants | Underbody breaks into spray; soft head remains |
| .75 | — | Last dim rim, no new particles | Body erosion moves forward; head rim fades |
| .80 | — | Empty | Head/wisps unravel at different rates |
| .85 | — | — | Head becomes water lobes; shoulder mist remains |
| .90 | — | — | No intact anatomy, last droplets land |
| .95 | — | — | Ground ripples and dim spray only |
| 1.00 | — | — | Empty |

## Constraints and review

- Pillars: count 1–12; centers remain 35px apart, 30px ground radius. Height about 62px
  overlaps the neighboring column. No umbrella overflow or broad rain curtain.
  The metadata viewport fits five pillars; hosts displaying more must allocate a taller frame.
- Charge: front reaches 100px, 32px ground width. Three claws have separate release and
  close times. Bubbles and splashes stay small beside a 48px hero.
- Dragon: 300px lane, approximately 50px body depth. Grounded wave volume, curling lip, foam curtains, wind wisps and wake use separate motion.
  The 2026-11-03 revision removes all legs and rigid facial anatomy.
- Render at 20 fps to inspect every row, then 60 fps for interpolation/motion.
- Validate determinism, empty end frame, bounds, palette/facing and count variants.
- The original 285-line source-size floor counts the shared `_surging-water.js` rendering code
  for the revised tail pillars; do not duplicate that code merely to inflate the wrapper.

## Verification commands

```sh
node tools/test-aorbion-water.mjs
node tools/check.mjs water/aorbion-charge-emerge water/aorbion-tail-pillars water/aorbion-seadragon
node tools/render.mjs water/aorbion-charge-emerge water/aorbion-tail-pillars water/aorbion-seadragon --fps 20 --all --gif
```

The test checks every 50ms sample for repeatability and update partition independence,
empty start/end, palette/facing support, 1/3/5/12 pillars and the requested source-size floor.
The final authoring tables contain 14 / 17 / 21 keys respectively. Acceptance remains the
user's `/vfx` review; these checks do not certify artistic quality or combat integration.

## Approved still reference revision

Source stills are registered in the host project's `assets/vfx-ref/vfx-ref/source/`:
`aorbion-seadragon.png`, `aorbion-tail-pillars.png`, `aorbion-poseidon.png`,
`aorbion-geyser.png`, `wet-status.png`. These are art references, not runtime textures.

The dragon descriptions in the original timing table above describe the retired spirit
shape. The current 21 timing keys instead control formation, wave heave, bend, lip fold,
curl shear, wisp lift, localized light, foam and settling. At .05–.15 the low
wake builds into a broad wave; .20–.55 the hollow leading curl and staggered foam
curtains roll over dark channels; .60–.85 the entire wave loses height while its full footprint spreads into low foam;
.90–.95 thin ground films and scattered droplets remain; 1.00 is empty. No legs, fins, eyes or jaw.
The curled leading lip only suggests a dragon head. Broad water planes use 2px
clusters; the foam, short strands and falling beads use 1px accents.

Tail pillars retain the specified vertical centerline, 35px spacing and count option,
so their projection is more overlapped than the diagonal presentation in the still.
Their shared surge renderer supplies dark channels, twisting caustics, climbing fine
strands, asynchronous five-lobe caps and a low foam foot. Poseidon uses a wider crown
and three layered orbit-following wave ribbons around an open center. The six-second
cycle remains seamless and pulse changes light only.

The original geyser keeps its eruption, rain, rebound and foam animation; a configurable
`channelDepth` darkens broken secondary streams (zero restores the original column).
Wet status reuses bleed trajectories with brighter cyan bead midtones and four to eight
small beads per cycle, saturating visual density at three status stacks. Zero stacks
remain empty. No source column or large status puddle.

Visual review used repeated black/ground contact renders at 1x and 2x, with 50ms
samples for the one-shots. Functional checks remain distinct from artistic acceptance:
the user must inspect these animations in `/vfx`. No combat integration or review
approval was performed by this revision.

## Sea wave start/end correction

The approved still represents maximum swell, not a rigid shape to reveal or erase.
The full 300px lane now rises from a shallow water film at .00–.20, holds its large
curl through .45, then steadily settles at .50/.60/.70/.80/.90/.95 with height factors
.93/.74/.47/.22/.05/.012. At 1.00 everything is empty. A spatial erase front and
floating rectangular breakup pieces were removed. The curl hollow, leading lip,
foam size, mist height and emitted droplets follow the same height envelope;
independently delayed low foam/ripples carry the lost height into a spreading wash.
Rear and leading water edges taper inside an expanded 400×200 preview viewport
(origin 40,144); the attack's 300px local span and one-second contract are unchanged.
A regression check verifies all three lane sections remain visible while settling.
