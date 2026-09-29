# Project Asset Guide

How to prepare thumbnails, covers, videos and before/after media for project pages. Every number here comes from the site's code (`assets/css/style.css`, `assets/js/before-after.js`, `scripts/generate-project-unified.js`, `templates/project-page-advanced.html`) and from measurements of the current asset files.

## 1. Specs

| Asset | File | Size | Format | Size target | Where it shows |
|---|---|---|---|---|---|
| Thumbnail | `[ID]-thumb.webp` + `.jpg` | 1280×720 | WebP q80 | ≤120 KB | Project cards on the homepage, projects page and Related Projects. Always a 16:9 box. |
| Cover / poster | `[ID]-poster.webp` + `.jpg` | 2560×1440 (1920×1080 minimum) | WebP q80 | ≤350 KB | Two places: the cropped hero cover and the video poster (full frame). |
| Main video | `project-[ID].mp4` | 1920×1080, 16:9 | H.264 High, yuv420p, AAC | ≤8 Mbps, file <50 MB | Player with controls, at most 900 px wide |
| A/B video pair | `[ID]-before-N.mp4` / `[ID]-after-N.mp4` | 1920×1080, exactly 16:9 | H.264, no audio | 4–6 Mbps, ≤8 MB each, 3–10 s | Forced 16:9 box, autoplays muted and loops |
| A/B image pair | `[ID]-before-N.webp` / `[ID]-after-N.webp` + `.jpg` | 1920×1080, exactly 16:9 | WebP q85 | ≤250 KB | Forced 16:9 box |
| Process video/image | any name | 1920 wide | as above | as above | No crop. Height follows the file's own aspect ratio. |

Why these values:

- **Thumbnails.** The current thumbnails are 400×225. Phones draw the card 330–700 CSS px wide at 2–3× pixel density, so 400 px images look soft.
- **Cover.** On phones the portrait crop draws the image about 900 CSS px wide at 3× density. On retina desktops the 1.12 zoom enlarges it further. A 1920 source gets upscaled in both cases, so use 2560.
- **Size targets.** The cover is the first large image to load, so keep it light. Every A/B pair uses `preload="auto"`, so all pairs download as soon as the page opens. The Project 1798 page currently loads about 100 MB.

## 2. Cover safe area

The cover is cropped differently on desktop and on mobile.

| Device | Hero height | Crop anchor | What stays visible |
|---|---|---|---|
| Desktop (>768 px) | 55vh | `center top` | Only the top ~45–50% of the image. The bottom half is never seen. |
| Phone (≤768 px) | 60–65vh | centered | Only the center ~40–45% of the width |

Two more things reduce the visible area:

- **Slow zoom.** The cover animates to `scale(1.12)` and stays there. This crops about 5% more from every edge.
- **HTML title and meta bar.** The page draws both over the bottom 120–130 CSS px of the hero. In source-image pixels, this covers roughly row 310 and below on desktop, and row 780 and below on mobile.

**Safe box for any embedded text, on a 1920×1080 frame: x 620–1300, y 70–300** (about 680×230 px). For a 2560×1440 frame, multiply by 1.333: x 830–1730, y 95–400.

```
1920 ┌───────────────────────────────────────────┐
     │        ┌──────────────┐  y 70             │
     │        │  SAFE TITLE  │                   │
     │        └──────────────┘  y 300            │  desktop cut ~ y 500
     │      x 620        x 1300                  │
     │   (lower half: desktop never sees it)     │
1080 └───────────────────────────────────────────┘
```

Rules:

- **Do not embed the title in the cover.** The page already draws the title and the category accent (for example "| VFX BREAKDOWN") in HTML on top of the cover. An embedded title appears twice. If you must embed text, keep it inside the safe box and never in the lower third.
- **Subject placement.** Keep the key subject in the upper center of the frame (y 0–500, x 560–1360).
- **Contrast.** A vignette darkens the top ~50% of the hero and fades the bottom to black. Use high-contrast art.
- **Image-type hero** (`heroMedia.type: "image"`). Only the cropped cover renders. The full frame is never shown anywhere on the page.
- **Video-type hero.** The same poster file is also the video poster, which shows the full frame uncropped. An embedded title looks correct in the player but is cropped or doubled in the hero. Separating the two needs a new `cover` field in the generator.
- **Test the crop.** In browser devtools device mode, check 360×800, 390×844, 768×1024, 1440×900, 1920×1080 and one ultrawide size.

## 3. Thumbnail rules

- **Frame.** 16:9, shown in full. Only the 10 px rounded corners and a 2 px coral border clip it. A light dark tint and a 0.5 px blur sit on top, so avoid thin or fine text.
- **Phones show no name label.** The hover label never appears on touch screens. On phones, a title embedded in the thumbnail is the only title the visitor sees.
- **Desktop shows the name on hover, centered, in bold white.** Put an embedded title in the lower-left or top-left corner. Keep the middle band (y 40–60%) clear.
- **Margins.** Keep at least 6% from each edge (about 75 px horizontal and 45 px vertical at 1280×720).
- **Text size.** Use a cap height of at least 7% of the frame height (about 50 px at 720). The smallest card is about 210 px wide (5 columns on the projects page).

## 4. Before/after rules

- **Frame.** Strictly 16:9, rendered with `object-fit: cover`. Any other aspect ratio is center-cropped.
- **Both files must match exactly:** resolution, fps, duration, first frame and encode settings. Export both from the same comp with the same in and out points.
  - Playback sync only follows the "before" clip and corrects drift larger than 0.1 s. Clips of unequal length loop out of step and jump.
  - Mismatched quality biases the comparison. In projects 1238, 1270, 1537 and 1711, the "before" clip is 0.65 Mbps and the "after" clip is 8 Mbps.
- **Clear zones.**
  - Top corners: keep the top ~90 px (at 1080p) clear, 20% in from each side. The "Before" and "After" labels sit there.
  - Center: the slider starts at 50%, with its handle in the exact center of the frame. Frame the change so that it crosses the center line. Both halves then show a difference when the page loads.
- **Audio.** None. The clips always play muted, so strip the audio track.
- **Possible label bug (not yet confirmed).** Based on the code in `before-after.js`, the "after" clip appears on the left of the slider, but the left label says "Before". Open a project page and drag the slider to check. If the labels are swapped, the fix is a one-line code change. Do not rename files to work around it.

## 5. General rules

- **Keep both `.jpg` and `.webp` files.** `projects-data.json` and the validator reference the `.jpg` path. The generator replaces `.jpg` with `.webp`, and pages load the `.webp` file. Only `.jpg` is converted; `.jpeg` and `.png` are not.
- **Filenames.** Use lowercase, no spaces and no Hebrew characters. The case must match the JSON exactly: Windows ignores case, so a mismatch works locally but returns 404 on GitHub Pages.
- **Video encoding.** Use H.264, yuv420p and `+faststart`. Do not use HEVC or ProRes. 25 fps is fine; use one frame rate per project.
- **Hosting limits.** GitHub blocks files over 100 MiB and warns above 50 MiB. Check the current GitHub documentation, because these limits can change.
  - `ShowReel.mp4` is 97.4 MiB and `project-1353.mp4` is 91 MB. Both are close to the limit.
  - The `.git` folder is already 577 MB, and GitHub Pages has a soft site limit of about 1 GB.
- **Process blocks.** Prefer 16:9. A vertical 9:16 video renders about 2000 px tall on desktop.

## 6. ffmpeg commands

```bash
# Main video
ffmpeg -i in.mov -map 0:v:0 -map 0:a:0? -c:v libx264 -profile:v high -preset slow -crf 20 -maxrate 8M -bufsize 16M -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -movflags +faststart -map_metadata -1 project-ID.mp4

# A/B clip (run the same command for the before and the after file)
ffmpeg -i before.mov -map 0:v:0 -an -dn -c:v libx264 -profile:v high -preset slow -crf 21 -maxrate 6M -bufsize 12M -pix_fmt yuv420p -g 25 -vf scale=1920:1080 -movflags +faststart -map_metadata -1 ID-before-1.mp4

# Cover and thumbnail
ffmpeg -i cover.png -vf scale=2560:1440 -c:v libwebp -quality 80 ID-poster.webp
ffmpeg -i cover.png -vf scale=1280:720  -c:v libwebp -quality 80 ID-thumb.webp
```

## 7. Placeholders still in place (as of September 2026)

- About 14 projects share an identical placeholder poster (50,278 bytes) and thumbnail (7,820 bytes).
- Many projects share the same 4-second placeholder `project-*.mp4` (1,069,582 bytes).
- The validator does not flag these. It only detects 11-byte placeholder files.
