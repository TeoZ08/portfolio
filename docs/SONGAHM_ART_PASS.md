# Songahm art pass

## Composition concept

Songahm becomes the south-west destination of the field: an open training hall on a raised stone terrace, reached on the existing path through a calm axial forecourt. The pavilion remains visibly functional and inhabited by its mats, dobok, bag and training equipment. Warm timber and lantern light form the foreground, while cool layered mountains, mist and a low late-afternoon disc create depth beyond the playable boundary.

The composition is fictional and belongs to this portfolio world. It adapts spatial rhythm and material contrast from the supplied references without copying a real temple, religious symbol, inscription or Korean calligraphy.

## Visual motifs adapted from the references

- Strong central approach ending at a broad stair and landing.
- Raised, hand-laid stone terrace with an open practice hall above it.
- Repeated red-brown timber columns and layered bracket/beam details.
- A wide charcoal roof with projected eaves, lifted corner silhouettes and a quieter rear roof layer.
- Restrained jade, teal, sage, cream and muted gold accents at structural joints.
- A factual physical sign: `Songahm` / `um lugar de prática`.
- Warm hanging porch lanterns beneath the front eave.
- A composed forecourt with an abstract stacked-stone marker, shallow basin, stepping stones and framing pine silhouettes.
- Painterly depth from near, middle and far mountain values, sparse mist, ridge pines, one waterfall ribbon and a low warm celestial disc.

## Spatial footprint and approach

- The existing dojo anchor and yaw remain unchanged at the far south-west.
- The pavilion terrace expands locally to approximately `13.2 × 9.8` world units.
- A central stair projects from the current front edge and meets the existing path on axis.
- The center of the forecourt remains open; markers, basin, pines and warm accents sit outside the direct sprint/dash line.
- The dojo vegetation exclusion grows to cover the new terrace and forecourt margins.
- Mountain scenery sits behind the pavilion, mostly beyond the south/west playable bounds, and has no collision.

## Palette additions

- Songahm timber red-brown: `#70483c`
- Roof charcoal: `#394443`
- Joinery jade: `#4f746e`
- Joinery teal: `#5d8782`
- Warm cream: `#ead7a7`
- Lantern amber: `#f0b35e`
- Near ridge: `#3f5d58`
- Middle ridge: `#647e76`
- Far ridge: `#98aaa5`
- Mist: `#c5d3d0`

All additions stay matte and low-poly and continue to use the existing material and primitive systems.

## Performance constraints

- Scenery is static and allocates no per-frame work.
- Mountains use a small authored set of low-segment procedural primitives.
- Decorative beams, brackets, roof layers, pines, mist, waterfall and celestial disc have no colliders.
- Navigation uses only broad terrace and stair colliders plus the already necessary dojo functional colliders.
- No textures, external assets, packages or global density increase.
- Transparent mist remains sparse, uses `depthWrite={false}` and avoids stacked full-world layers.

## Acceptance and review checklist

- [ ] Existing path reaches the central stair without obstruction.
- [ ] Player can ascend the stair and traverse the terrace/practice area.
- [ ] Mats, dobok, training bag, wall equipment and practice-space identity remain present.
- [ ] Front elevation reads through terrace, columns, brackets, deep eaves and lifted corners.
- [ ] Rear roof/gable layer gives Songahm a skyline distinct from the house.
- [ ] Sign text is legible and contains no religious or copied real-world signage.
- [ ] Forecourt frames the axis without cluttering sprint/dash traversal.
- [ ] Mountains sit beyond the play space and show clear near/middle/far value separation.
- [ ] Ridge pines, waterfall, sparse mist and the warm disc read from the dojo approach.
- [ ] The disc supports the south-west composition without dominating unrelated camera angles.
- [ ] Existing fog, lighting, camera, interactions, house/computer/Desktop and traversal flows remain unchanged.
- [ ] Balanced/low quality remains viable without a new settings system.
- [ ] Camera tests, movement tests, typecheck, production build and `git diff --check` pass.
- [ ] A real rendered recording reviews roof silhouette, sign legibility, approach clearance, mist sorting, mountain scale and sun prominence.
