# Project Generation System Documentation

## Overview
The portfolio uses a unified template-based generation system to create and maintain project pages. This ensures consistency, maintainability, and automatic feature inclusion based on project requirements.

## System Architecture

### Core Components

```
mironauslander.github.io/
├── projects-data.json          # Single source of truth for all project data
├── templates/
│   └── project-page-advanced.html # Project page template
├── scripts/
│   ├── generate-project-unified.js  # Main generation script (USE THIS)
│   ├── validate-enhanced.js    # Comprehensive validation
│   ├── run-all-updates.js      # One-command update everything
│   └── archive-deleted.js      # Move pages/media of deleted projects to archive/
├── projects/                   # Generated HTML files
└── archive/                    # Deleted projects (git-ignored, local only)
```

## Quick Start Guide

### Adding a New Project

**With Project Studio (recommended):**

1. Open `http://localhost:8000/tools/project-studio.html` and click **➕ New project**.
2. Keep the suggested ID (a random unused 4-digit number, 🎲 for another) or type your own. Fill in the display title, full title, category, year and client.
3. The project is created in **Hidden** with the standard media paths for its ID and opens in the editor. Add the description and media blocks.
4. Add the media files under `assets/images/projects/[ID]/` and `assets/videos/[ID]/`.
5. Drag the project to **All Projects** when it is ready to show, then **Save All Changes**.
6. Replace `projects-data.json` with the download and run `node scripts/run-all-updates.js`.

**By hand:** add an entry to `projects-data.json`. The IDs are 4-digit strings and must be unique:
```json
{
  "id": "1234",
  "displayTitle": "Project Name",
  "fullTitle": "Project Name - Full Description",
  "category": ["vfx"],
  "client": "Client Name",
  "year": 2026,
  "duration": "",
  "description": "Detailed project description...",
  "role": [],
  "tools": [],
  "featured": false,
  "featuredOrder": null,
  "projectsPageOrder": null,
  "visible": false,
  "hidden": true,
  "thumbnail": "assets/images/projects/1234/1234-thumb.webp",
  "cover": "assets/images/projects/1234/1234-cover.jpg",
  "heroMedia": {
    "type": "video",
    "src": "assets/videos/1234/project-1234.mp4",
    "poster": "assets/images/projects/1234/1234-video-poster.jpg"
  },
  "processMedia": [
    {
      "type": "before-after-video",
      "before": "assets/videos/1234/1234-before-1.mp4",
      "after": "assets/videos/1234/1234-after-1.mp4",
      "label": "VFX Breakdown"
    }
  ]
}
```
`displayTitle` and at least one category are required: the generator fails without them. Set `visible: true` and `hidden: false` to show the project on `projects.html`.

Then:

2. **Generate the project page**:
```bash
# Generate specific project
node scripts/generate-project-unified.js 1234

# Or regenerate all projects
node scripts/generate-project-unified.js
```

3. **Validate the generation**:
```bash
node scripts/validate-enhanced.js --verbose
```

### Hiding vs Deleting a Project

- **Hidden:** the project stays in `projects-data.json` and its page is still generated (reachable by URL), but it is left out of the homepage, `projects.html` and related projects. Drag it to **Hidden** in Project Studio.
- **Deleted:** the project is removed from the data and its page and media are moved out of the site.

### Deleting a Project

1. In Project Studio, open the project in the Edit view and click **🗑️ Delete project**, then confirm. The project is struck through; **↩️ Undo delete** works until you save. A new project that was never saved is discarded right away.
2. **Save All Changes**. The project moves from `projects` to a top-level `deletedProjects` list (with a `deletedAt` date), and the `metadata` counts are updated.
3. Replace `projects-data.json` with the download and run `node scripts/run-all-updates.js`. The pages are regenerated without the project, and a warning lists deleted projects that still have files.
4. Review what will be archived, then archive it:
```bash
node scripts/archive-deleted.js         # dry run: lists pages and media folders with no live project
node scripts/archive-deleted.js --yes   # moves them to archive/
```
   Each project goes to `archive/[ID]/`: `Project-[ID].html`, `images/`, `videos/` and `project.json` (its `deletedProjects` entry). If `archive/[ID]` already exists, `archive/[ID]-<timestamp>/` is used. Archived entries are removed from `deletedProjects`.
5. Commit. Git shows the page and media as deleted; `archive/` is git-ignored, so the files stay only on your machine (and in git history).

**Restoring:** move `archive/[ID]/project.json` back into `projects` in `projects-data.json` (drop `deletedAt`), move `images/` and `videos/` back to `assets/images/projects/[ID]/` and `assets/videos/[ID]/`, then run `node scripts/run-all-updates.js`.

## Media Configuration Options

### Project Images

Each project has three separate images, one per role. Sizes, crops and safe areas are in `docs/ASSET-GUIDE.md`.

| Role | JSON field | Where it shows |
|---|---|---|
| Thumbnail | `thumbnail` | Project cards (homepage, projects page, related projects) |
| Cover | `cover` | Hero background, cropped, with the title on top; also the og:image |
| Video poster | `heroMedia.poster` | Full frame in the video player before playback |

- JSON stores `.jpg` paths. The generator serves the `.webp` twin, so both files must exist.
- If `cover` is missing, the hero image (image hero) or video poster (video hero) is used as cover and validation warns.
- Optional `coverPosition` adjusts the crop with CSS `object-position` values:

```json
"coverPosition": { "desktop": "center 30%", "mobile": "40% center" }
```

Defaults: `center 50%` on desktop, `center center` on mobile.

### Hero Media Types

**Video Hero:**
```json
"heroMedia": {
  "type": "video",
  "src": "assets/videos/1234/project-1234.mp4",
  "poster": "assets/images/projects/1234/1234-video-poster.jpg"
}
```

**Image Hero** (shown uncropped below the cover, in place of the video):
```json
"heroMedia": {
  "type": "image",
  "src": "assets/images/projects/1234/1234-hero.jpg",
  "alt": "Description for accessibility"
}
```

### Process Media Types

**Before/After Video Comparison:**
```json
{
  "type": "before-after-video",
  "before": "path/to/before.mp4",
  "after": "path/to/after.mp4",
  "label": "VFX Breakdown",
  "labelBefore": "Original",
  "labelAfter": "Final"
}
```

**Standard Video:**
```json
{
  "type": "video",
  "src": "path/to/video.mp4",
  "poster": "path/to/poster.jpg",
  "caption": "Behind the scenes footage"
}
```

**Before/After Image Comparison:**
```json
{
  "type": "before-after-image",
  "before": "path/to/before.jpg",
  "after": "path/to/after.jpg",
  "label": "Color Correction"
}
```

**Standard Image:**
```json
{
  "type": "image",
  "src": "path/to/image.jpg",
  "alt": "Image description",
  "caption": "Concept art"
}
```

## Data Format

Projects use `thumbnail`, `cover`, `heroMedia` and `processMedia`.

`category` is an array with one or more of `ai`, `vfx`, `motion`, `editing` and `personal`. Each value has a filter button on `projects.html` (filter buttons are hand-written in that file, outside the generated grid). The first category sets the accent in the page hero, for example "| VFX BREAKDOWN". To add a category, update `CATEGORY_DISPLAY` and `CATEGORY_ACCENT` in `scripts/generate-project-unified.js`, `validCategories` in `scripts/update-projects-page.js`, `availableCategories` in `tools/js/project-studio.js`, `getCategoryDisplay` in `tools/js/utils.js`, and add a filter button to `projects.html`.

The legacy fields `videoPoster`, `heroImage`, `mainVideo` and `beforeAfterMedia` are no longer supported. The validators warn if any of them appears in `projects-data.json`.

## Workflow Commands

### Complete Update Workflow
```bash
# 1. Update everything at once
node scripts/run-all-updates.js

# This runs:
# - Update featured projects on homepage
# - Update projects grid page
# - Generate all project pages
# - Run validation
```

### Individual Operations
```bash
# Generate specific projects
node scripts/generate-project-unified.js 1234 5678

# Update only homepage featured projects
node scripts/update-featured.js

# Update only projects grid page
node scripts/update-projects-page.js

# Validate everything
node scripts/validate-enhanced.js --verbose

# Archive pages and media of deleted projects (dry run without --yes)
node scripts/archive-deleted.js --yes
```

## Validation and Testing

### Regular Validation
Run after any changes to ensure system integrity:
```bash
# Quick check (issues only)
node scripts/validate-enhanced.js

# Detailed check
node scripts/validate-enhanced.js --verbose

# With auto-fix attempts
node scripts/validate-enhanced.js --fix
```

### What Gets Validated
- ✅ HTML file existence
- ✅ Required scripts (main.js, before-after.js when needed)
- ✅ CSS inclusion
- ✅ Font declarations
- ✅ Media file existence (including `.jpg` + `.webp` twins for cover and video poster)
- ✅ Hero cover on the page matches `cover` in the JSON
- ✅ Template markers
- ✅ SEO meta tags (description, og:image)
- ✅ Data consistency

### Local Testing
```bash
# Start local server
python -m http.server 8000

# Open in browser
# http://localhost:8000

# Test specific project
# http://localhost:8000/projects/Project-1234.html
```

## Troubleshooting

### Common Issues and Solutions

**Issue: Before/After videos not working**
- Check: Is `before-after.js` included in the HTML?
- Fix: Regenerate with unified generator
```bash
node scripts/generate-project-unified.js PROJECT_ID
```

**Issue: Media files showing as missing**
- Check: Are files in correct directories?
- Expected structure:
```
assets/
├── images/projects/1234/
│   ├── 1234-thumb.webp / .jpg
│   ├── 1234-cover.webp / .jpg
│   └── 1234-video-poster.webp / .jpg
└── videos/1234/
    ├── project-1234.mp4
    ├── 1234-before.mp4
    └── 1234-after.mp4
```

**Issue: Project not showing on homepage/projects page**
- Check: Is `featured: true` set for homepage?
- Check: Is `visible: true` set?
- Fix: Update JSON and run `node scripts/run-all-updates.js`

## Template System Details

### Template

All pages are generated from `templates/project-page-advanced.html`. `scripts/generate-project-unified.js` is the only generator; `quick-update.js` and `run-update.bat/.ps1` call it.

### Template Markers

Templates include markers for partial updates:
```html
<!-- PROJECT_INFO_START -->
  (updatable project information)
<!-- PROJECT_INFO_END -->

<!-- PROCESS_MEDIA_START -->
  (process & variations media)
<!-- PROCESS_MEDIA_END -->
```

## Best Practices

1. **Always validate after changes:**
   ```bash
   node scripts/validate-enhanced.js
   ```

2. **Use the unified generator:**
   ```bash
   node scripts/generate-project-unified.js
   ```

3. **Keep media organized:**
   - Follow the directory structure
   - Use consistent naming: `PROJECT_ID-description.ext`

4. **Optimize media files:**
   - Videos: MP4 format, reasonable compression
   - Images: WebP with JPG twins
   - Sizes and targets: see `docs/ASSET-GUIDE.md`

5. **Test locally before deploying:**
   - Check all before/after widgets
   - Verify media loads correctly
   - Test on mobile devices

## Visual Management Tools

For non-technical management, use the visual tools:

1. **Project Studio** (`tools/project-studio.html`)
   - Create projects (random unused 4-digit ID) and delete them (archived by `scripts/archive-deleted.js`)
   - Edit project details, images (thumbnail, cover, cover crop, video poster) and media
   - Desktop and mobile cover crop previews
   - Multi-project editing with a single JSON export

2. **Layout & Assets Manager** (`tools/project-manager.html`)
   - Drag-and-drop project ordering and homepage featuring
   - Asset badges showing whether each project's thumbnail, cover and video poster exist
   - Inline editing of the three image paths

## Deployment

After making changes:

```bash
# 1. Validate everything
node scripts/validate-enhanced.js

# 2. Test locally
python -m http.server 8000

# 3. Commit and push
git add .
git commit -m "Update projects"
git push origin main

# GitHub Pages will automatically deploy
```

## Support and Maintenance

### Regular Maintenance Tasks
- Weekly: Run validation script
- Monthly: Check for unused media files
- Quarterly: Review and optimize large media files

### Getting Help
- Check validation output for specific issues
- Review this documentation
- Check individual script files for inline documentation

---

*Last Updated: 2025*
*System Version: Unified Generation System v2.0*