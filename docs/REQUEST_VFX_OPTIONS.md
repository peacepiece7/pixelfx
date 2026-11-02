# Request VFX options: Oskal, Rosilia, Aorbion

These files render visuals only. The host owns position, direction, creation/removal,
actual firing ticks, status lifetimes, cancellation, death and wave transitions.
A loop's metadata duration is its animation period, never the gameplay lifetime.
Every effect accepts `seed`, `palette` and the painter's standard `flip`.

| Effect | Options |
|---|---|
| `shadow/kings-decree` | `targets`: local x coordinates, maximum 5; filtered to finite numbers and clamped to ±136. Omitted/null previews five positions; `[]` draws only the crown. The local impact line is y=100 below the air anchor. `curse` is the secondary red-violet ramp. |
| `projectiles/rosilia-target-reticle` | `pulse`: 0–1, default 0. Create/follow each target separately; remove when its real mark ends. |
| `status/rosilia-reload-ready` | No gameplay clock or automatic consumption. Remove when the reservation is actually consumed or the caster dies. |
| `status/rosilia-infinite-magazine` | `intro`: 0–1, default 0; feed a short descending envelope on refill. The marker never refills ammunition itself. |
| `projectiles/rosilia-support-shot` | `pulse`: 0–1, default 0. Feed a descending envelope from 1 to 0 on each actual shot. The visual reticle defaults to radius 62 (combat radius is host-owned). At zero, only drawBack's fixed reticle remains. No four-shot schedule is embedded. |
| `water/aorbion-submerge` | Exports `actorAlpha() = 0`; it renders supplied actor pixels at the waterline during entry/exit. `speed` is host travel speed (default 240), used for trailing ripples. Removing it restores the normal actor. |
| `water/aorbion-charge-emerge` | Render once per emergence, with the saved direction. No target-count duplication. |
| `water/aorbion-tail-pillars` | `count`: integer 1–12, default 3, spacing 35. Export canvas metadata fits up to 5; use a taller host/export viewport for larger counts. |
| `water/aorbion-seadragon` | Pure one-shot, empty at 1s. Host moves the fixed-direction 300px body using the real traveling state; this file does not advance its world position. |
| `water/aorbion-poseidon` | `pulse`: external 0–1 brightness envelope. Omitted/null previews a 0.5s brightness beat. Three orbiting pillars do not represent three hits. |
| `water/aorbion-sea-response` | `mode: "travel"` (default): small dragon crest; `mode: "claw"`: water edges around claws. Remove with the actual buff. |

In the asset studio, use **미리보기 옵션 → 옵션 적용** for JSON such as
`{"targets":[-100,40]}`, `{"count":5}`, or `{"mode":"claw"}`.
**발사·맥동 미리보기** supplies one short visual pulse/refill envelope without a combat event.
These controls never verify or apply an effect.

Validation: `node tools/test-vfx-request-batch.mjs` and `node tools/check.mjs <id>`.
Default GIFs: `node tools/render.mjs <id> --gif`.
Host-event demonstration GIFs: `node tools/render-vfx-request-options.mjs`, saved
under `records/options/`. The demonstration driver owns its illustrative pulse timing;
the actual effects do not contain that firing schedule.
