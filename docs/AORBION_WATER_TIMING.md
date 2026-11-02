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
| .05 | 12px front, dark raised water, 3 vent droplets | 10px rise, small dark base, 2 bubbles | Tail gathers, low wake, horns still submerged |
| .10 | 38px front, bright lip, first claw, 8 fast droplets | 35px rise, pale inner vein, 5 vertical beads | Body develops, neck rises, far hand extends |
| .15 | 69px front, crest curls, second claw, 10 droplets | 58px peak, three uneven tip lobes, 4 beads | Head/horns separate, whiskers begin to lag |
| .20 | 91px front, third claw, crest sheds 7 beads | 62px peak, thin moving strands, 3 beads | Jaw opens, eye glint, near hand reaches, bow spray |
| .25 | 100px front, claw tips break, lip folds | 57px surge, side bubbles loosen, 2 beads | Shoulders roll, two horns catch different light |
| .30 | Veins drain; 4 split claw fragments; first plinks | 53px height, foam cap shrinks, 3 beads | Near hand grips down; whisker ends trail behind |
| .35 | Broken claw trails; foam moves sideways | 46px height, pressure falls, 1 bead | Body wave reaches tail, mane tears into droplets |
| .40 | Low water sheet; independent landing rings | 37px height, fragments detach upward | Far hand tucks, near hand pushes, jaw narrows |
| .45 | Bubbles pop; cool teal rim, thin mist | 28px height, cyan-to-teal cooling | Second asymmetric shoulder roll, renewed bow crest |
| .50 | Small splashes, broken ground arcs | 18px height, thin water root | Horn/eye light recedes, water veins accelerate |
| .55 | Last drifting foam, dark wet film | 9px water root, falling beads | Fingers open; opposite whisker snaps later |
| .60 | Residual translucent ripples only | Root vanishes, small landing rings | Tail begins to unravel; neck stays readable |
| .65 | Empty | Small rings and two fading bubble groups | Hindbody separates into uneven watery chunks |
| .70 | — | Thin wet film, individual ring remnants | Near hand breaks into spray; head still intact |
| .75 | — | Last dim rim, no new particles | Body erosion moves forward; horn tips fade |
| .80 | — | Empty | Jaw/whiskers unravel at different rates |
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
- Dragon: 300px lane, approximately 50px body depth. Tail, spine, shoulders, jaw, hands,
  horns, whiskers, fin rays and wake use distinct keyframes or delayed motion.
- Render at 20 fps to inspect every row, then 60 fps for interpolation/motion.
- Validate determinism, empty end frame, bounds, palette/facing and count variants.
- Each effect source must contain at least as many lines as the 285-line geyser reference,
  with the additional code devoted to choreography and visible components.

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
