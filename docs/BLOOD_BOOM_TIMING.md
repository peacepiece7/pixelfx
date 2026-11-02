# Blood boom: 50 ms choreography

`blood/blood-boom` is a 1.4-second simulation on a 120×140 canvas, anchored at the
caster's feet. `FLOW_BEATS` contains 29 control rows (0.00–1.40 in 0.05-second steps),
interpolated continuously. Each row independently controls height, width, pressure,
membrane breakup, inscription light and pooled liquid. This is animation timing only;
no hero or combat integration is included.

| Interval | Liquid motion | Seal and lighting |
|---|---|---|
| 0.00–0.10 | Low wet pressure mound begins rising | Two opposing writing heads trace the outer ring |
| 0.10–0.20 | Mound broadens; cracks extend segment by segment | Inner ring and twelve staggered angular marks appear |
| 0.20–0.30 | Vent breaks at 0.25; five differently angled sheets snap upward within 45ms; core jumps 12→99px | Tight ivory flash plus a broader red floor reflection |
| 0.30–0.40 | Full-height sheets coast and peel away; opaque lower centre covers a 48px hero | Ivory-red ribbons rise inside deep crimson folds |
| 0.40–0.50 | Crest folds outward; eight asymmetric splash fins open; first membranes detach | Initial flash cools; seal remains readable |
| 0.50–0.60 | Pressure drops before the crest; suspended sheets separate | Separate glints on the falling sheets and beads |
| 0.60–0.70 | Curtain tears along irregular moving holes; height falls 35→25→17px | Core light shrinks with the pressure |
| 0.70–0.80 | Height falls 17→11→7px; heavy folded membranes accelerate down | Low returning shock rim starts expanding |
| 0.80–0.90 | Low core collapses; primary droplets and folded sheets land | Individual wet crowns, small landing pools and short reflections |
| 0.90–1.00 | Core falls 2→1→0px; remaining droplets rebound | Seal cools; local ripples overlap the pooled liquid |
| 1.00–1.10 | Final rain settles; wet puddles flatten | Outer marks begin extinguishing at staggered times |
| 1.10–1.20 | Pool margins retreat independently of their alpha | Ring segments lose light and break apart |
| 1.20–1.30 | Dark residue contracts; isolated wet glints remain | Nearly all inscription light is gone |
| 1.30–1.40 | Last residue shrinks and clears | Both buffers are empty at exactly 1.40 |

There are 40 seeded primary ballistic droplets, 12 detached liquid membranes and
20 fine spray flecks. Primary droplets and membranes generate landing crowns, not
additional gameplay hits. The radius-70 ground footprint is projected to 56 pixels
horizontally to retain the requested 120px canvas, matching the previous convention.
Every color, including light and near-white glints, comes from `o.palette`.

The peak silhouette follows the supplied blood-boom reference: tall torn crest,
bright irregular inner liquid ribbons, dark crimson outer membranes, and broad
asymmetric splash fins. It is authored geometry, not a traced bitmap. Forty beads
launch from different heights beside the core, decelerate laterally and fall under
gravity; their landing positions use the same drag equation as their flight.

Validation: `node tools/test-blood-boom.mjs` and `node tools/check.mjs blood/blood-boom`.
Visual review: `node tools/render-blood-boom.mjs final` creates a 60fps-source GIF and
all 29 contact frames at exact 50ms intervals in `records/blood/blood-boom/final/`.
Character choreography: `node tools/act.mjs blood/blood-boom`.

The impact is an upward response to a ground strike: five sheets launch 4ms apart,
each reaching its own 64–110px apex in 45ms. Their lower membranes tear free
before the tips fall. Forty primary beads launch in a 44ms burst and leave
64ms curved trails sampled from their own ballistic paths. No hit is added.

Liquid-surface refinement: each of the five launch sheets now has an independent
moving cross-section, uneven split crest, dark edge, advected highlights and
late perforations. Fifteen small secondary fragments shear from those crests.
The twelve descending membranes use changing liquid silhouettes instead of rigid
polygons: their folded tops open holes while the lower ends stretch toward landing.
Ground cracks briefly carry a pale inner highlight, secondary branches and local
reflections, then cool. The 50ms impulse and 1.4s empty endpoint remain unchanged.
