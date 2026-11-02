# Poseidon water study and rebuild — 2026-11-03

The requested direction is three powerful, foamy jets connected by moving water,
with a clear central opening. The local still
`assets/vfx-ref/vfx-ref/source/aorbion-poseidon.png` is the composition reference;
it is not imported as a texture or traced into animation frames.

## Sources inspected

- [Sprite Fusion: How to make good pixel art effects with Claude](https://www.spritefusion.com/blog/how-to-make-good-pixel-art-effects-with-claude)
  informs the repeated render/look/refine process, not fluid simulation.
- [Sprite Fusion bubbles](https://www.spritefusion.com/pixel-art-vfx/bubbles)
  and [black hole](https://www.spritefusion.com/pixel-art-vfx/black-hole)
  provide the original MIT recipes behind this repository's waterfall/whirlpool.
  Read those local implementations for integer pixel lanes, periodic noise and
  curved flowing foam. Retain the attribution in the effect source.
- [Pixor geyser](https://pixor.art/library/elements/geyser/): inspected its CC0
  example GIF, particularly the narrow spout against the wider changing cap.
  Used as a silhouette/timing study, not the final quality target or copied art.
- [Falahatpisheh and Kheradvar, High-Speed Acquisition of Free Vortex Formation](https://arxiv.org/abs/1210.4144):
  inspected the supplementary slow-motion video. Its rotating surface develops
  an uneven, evolving funnel. This is a draining tank, not an upward fountain;
  it supports the surface-motion study only. This VFX is not a fluid solver.
- Local `water/geyser`, `water/waterfall`, `water/whirlpool` and `_lib` supply
  the repository's pixel-water vocabulary: dark channels, narrow pale streaks,
  uneven foam clusters, ballistic drops and landing ripples.

No downloaded images or videos are bundled in the effect.

## Rebuilt movement

The former shared surge-column drawing is replaced with a Poseidon-specific jet.
Each jet has a pressure-varying silhouette, upward-scrolling broad and fine lanes,
an irregular aerated crown, separate downward fringe streaks, and shed droplets
that retain their birth position. Three orbiting jets share a dark moving water
belt; raised curved lips and short curling foot splashes connect their bases to
that belt. Detached bubbles and foam wakes stay behind the moving jets.

Color carries the hard pixel edges; restrained light supports the water instead
of replacing its shape. Rear and front jets remain split around the actor.
All noise scroll periods and emission periods close at six seconds. `pulse`
affects light only; it does not emit another attack or change the water geometry.

## Review and verification

Three rendered revisions were inspected: narrow/flat crowns and regular floor
rings in round one; broader asymmetric jets and a darker disturbed surface in
round two; stronger curling foot splashes and less dithered foam in round three.
The final preview was sampled every 0.05 seconds (120 frames), with a GIF for
full-cycle playback. Automated checks pass without warnings, including exact
loop closure, mirrored rendering, and brightness-only pulse variants through
`tools/test-aorbion-water.mjs`. Artistic acceptance remains the user's `/vfx`
review. No combat integration or approval state was changed.
