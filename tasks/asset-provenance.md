# Grippo redesign assets

## Existing product assets

The four WebP illustrations and Manrope fonts come from the neighboring `grippo-mobile/design-system/resources/provider/src/commonMain/composeResources/` directory. They are copied without modifying the app repository.

The fonts' full SIL Open Font License 1.1 is included in `public/assets/fonts/OFL.txt`, retaining the copyright notice embedded in the shipped TTFs. The license text comes from the [official Google Fonts Manrope distribution](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt).

The anatomical SVGs preserve the original `FullFront.kt` and `FullBack.kt` contours from the mobile resource provider. A light neutral base and sage muscles replace the original charcoal fills; green is illustrative training distribution and orange marks a selected muscle group. Existing front shin and inner-thigh contours are included in the Legs filter. The anatomy is embedded into `index.html` so native radio controls can highlight groups without another JavaScript module.

Original EN/RU/UA app screenshots remain available as PNG fallbacks. New WebP encodings preserve their dimensions and reduce the combined screenshot transfer size from 15,431,613 to 1,992,454 bytes (87.1%).

## Generated editorial photograph

Saved asset: `public/assets/brand/effort-editorial.jpg`.

Generated with the built-in Imagegen tool, then encoded as JPEG for delivery. Original generation is retained in the conversation's generated image directory.

Exact generation prompt:

> Create a premium editorial sports photograph for the hero background of Grippo, a strength-training analytics app. Landscape 3:2 composition. Extreme close-up, tactile black rubber weight plates loaded on an Olympic barbell in a dark boutique strength gym. One hand with subtle chalk is firmly gripping the steel knurling at the right third, muscular forearm enters from top right; no face visible. Black and charcoal scene, cinematic side light in warm vivid vermilion-orange from the upper right catching the rim of the plates, realistic silver metal, fine chalk particles and nuanced film grain. Left half falls into deep almost-black negative space so white headline text can sit over it. Restrained, confident, physically real, documentary campaign art direction, sharp beautiful composition, professional advertising photography. No text, no logos, no watermark, no UI, no neon sci-fi.

The photograph is used as the first screen's full-width background, with a responsive gradient preserving text contrast. The hero's previous 3D illustration, decorative orbit and phone preview have been removed from the layout. Real app screens remain in the dedicated explorer.

## Generated closing-section photograph

Saved asset: `public/assets/brand/show-up-editorial.webp` (1536 × 1024).

Generated with the built-in Imagegen tool, then encoded as WebP at quality 88 without resizing or visual editing. Original generation is retained at `/Users/maxvoitenko/.codex/generated_images/01a140cf-c0d5-70d2-8b79-975554efe993/exec-63d0c1e8-071c-4522-aae0-7ee884da00f7.png`.

Exact generation prompt:

> Use case: photorealistic-natural. Asset type: premium editorial background photograph for the closing section of a strength-training website. Create a LANDSCAPE 1536 x 1024 real camera photograph of a quiet, beautiful strength gym at dawn. A single adult athlete in simple charcoal training clothes is seated on a low training bench on the RIGHT THIRD of the frame, seen from the back and three-quarter rear, leaning forward preparing and tightening the laces of a trainer before a workout. Their face is not visible. Anatomically natural body, hands and shoes, understated athletic physique, candid human moment of calm commitment. The LEFT HALF of the photograph is usable dark negative space: a softly textured charcoal gym wall and rubber floor, no distracting equipment and no people there. High windows on the far right cast subtle warm morning sidelight, with natural gradation into shadow; charcoal and quiet neutral tones, very restrained warmth. Wide cinematic environmental composition, photographed on a high-end full frame camera with a 35mm lens, real skin, matte cotton fabric and rubber textures, subtle organic grain, restrained editorial sports photography, premium but authentic. The human figure fits fully in the frame with comfortable breathing room at top and bottom; keep the person around x=75% of the image and keep all important anatomy inside the central 80% of image height so it remains readable in a wide website crop. The lower story image must feel distinct from an extreme close-up of a barbell and hand. Avoid giant weight plates or barbells in foreground, orange floodlighting, stock fitness glamour, exaggerated muscles, any text, logos or watermarks, CGI, 3D illustration, artificial skin and extra limbs.

The closing “Made for the work” section uses this environmental human moment, distinct from the hero's barbell close-up. The subject sits on the right, leaving dark space on the left for the section copy. The responsive crop favors the subject's position on mobile.
