# Grippo redesign assets

## Existing product assets

The four WebP illustrations and Manrope fonts come from the neighboring `grippo-mobile/design-system/resources/provider/src/commonMain/composeResources/` directory. They are copied without modifying the app repository.

The fonts' full SIL Open Font License 1.1 is included in `public/assets/fonts/OFL.txt`, retaining the copyright notice embedded in the shipped TTFs. The license text comes from the [official Google Fonts Manrope distribution](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt).

The anatomical SVGs preserve the original `FullFront.kt` and `FullBack.kt` contours from the mobile resource provider. Green is illustrative training distribution; orange marks a selected muscle group. The anatomy is embedded into `index.html` so native radio controls can highlight groups without another JavaScript module.

Original EN/RU/UA app screenshots remain available as PNG fallbacks. New WebP encodings preserve their dimensions and reduce the combined screenshot transfer size from 15,431,613 to 1,992,454 bytes (87.1%).

## Generated editorial photograph

Saved asset: `public/assets/brand/effort-editorial.jpg`.

Generated with the built-in Imagegen tool, then encoded as JPEG for delivery. Original generation is retained in the conversation's generated image directory.

Exact generation prompt:

> Create a premium editorial sports photograph for the hero background of Grippo, a strength-training analytics app. Landscape 3:2 composition. Extreme close-up, tactile black rubber weight plates loaded on an Olympic barbell in a dark boutique strength gym. One hand with subtle chalk is firmly gripping the steel knurling at the right third, muscular forearm enters from top right; no face visible. Black and charcoal scene, cinematic side light in warm vivid vermilion-orange from the upper right catching the rim of the plates, realistic silver metal, fine chalk particles and nuanced film grain. Left half falls into deep almost-black negative space so white headline text can sit over it. Restrained, confident, physically real, documentary campaign art direction, sharp beautiful composition, professional advertising photography. No text, no logos, no watermark, no UI, no neon sci-fi.

Final placement is the closing “Made for the work” section; the hero uses the mobile app's own approved 3D illustration.
