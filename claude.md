# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Professional portfolio website for **Miron Auslander**, a Visual Effects & Motion Graphics Creative. Built as a high-performance static site hosted on GitHub Pages with automatic deployment, focusing on showcasing visual work for TV, Films, and Digital Media.

## Project Generation System

### System Overview
The portfolio uses a **unified template-based generation system** that:
- Automatically selects appropriate templates based on project complexity
- Maintains consistent **vertical layout** for all media displays
- Provides comprehensive validation and error checking
- Offers visual management tools for non-technical updates

### Core Components

#### Data Management
- **Source of Truth**: `projects-data.json` - Single JSON file containing all project data
- **Format**: `thumbnail`, `cover`, optional `coverPosition`, `heroMedia` and `processMedia` (legacy fields `videoPoster`, `heroImage`, `mainVideo`, `beforeAfterMedia` were removed; validators warn if they reappear)

#### Templates
- **`templates/project-page-advanced.html`**: Primary template with flexible media support
  - Vertical layout for Process & Variations section
  - V2 hero: cropped cover image with the title overlaid, then the hero video (or full image) below
  - Handles 1-6 process media blocks
  - Adds cover preload and og:image/twitter:image meta

#### Generation Scripts
- **`scripts/generate-project-unified.js`** ⭐ **PRIMARY GENERATOR**
  - The only page generator (`quick-update.js` and `run-update.bat/.ps1` call it too)
  - Serves the `.webp` twin of any `.jpg` image path
  - Ensures consistent script inclusion
  - Usage: `node scripts/generate-project-unified.js [PROJECT_IDs]`

- **`scripts/run-all-updates.js`** - One-command full site update
  - Updates featured projects on homepage
  - Regenerates projects grid page
  - Regenerates all project pages
  - Runs validation automatically

#### Validation Scripts
- **`scripts/validate-enhanced.js`** - Comprehensive validation
  - Checks HTML structure, scripts, CSS inclusion
  - Validates media file existence and sizes
  - Supports `--verbose` and `--fix` flags
  - Checks `.jpg` + `.webp` twins for cover and video poster, and that the page's hero-cover matches the JSON

- **`scripts/validate-projects.js`** - Basic validation
  - Quick check for critical issues
  - Lighter weight for CI/CD

#### Visual Management Tools
Access at `http://localhost:8000/tools/` after starting local server:

- **`tools/index.html`** - Dashboard hub for all tools

- **`tools/project-studio.html`** ⭐ **PRIMARY TOOL - All-in-One Solution**
  - Unified interface combining all project management functions
  - **Multi-project editing**: Edit multiple projects before saving
  - **Auto-save on switch**: Changes persist in memory when switching projects
  - **Visual indicators**: Shows which projects have pending changes
  - **Single save operation**: Download one JSON file with all changes
  - Features:
    - Drag-and-drop project organization (featured/visible/hidden)
    - Complete project details editing (categories, roles, tools)
    - Project images: thumbnail, cover, cover crop (`coverPosition`) with desktop/mobile crop previews
    - Visual media configuration (hero + process media blocks)
    - Live preview with device modes
    - No manual JSON merging required

- **`tools/project-manager.html`** - Layout & Assets Manager
  - Drag-and-drop featuring, ordering and visibility
  - Per-project asset badges (thumbnail / cover / video poster found or missing)
  - Inline editing of the three image paths

### Media Configuration

#### Project Images
Three separate images, each with one role (sizes and safe areas: `docs/ASSET-GUIDE.md`):

| Role | File | JSON field |
|---|---|---|
| Card thumbnail | `[ID]-thumb.webp` + `.jpg` | `thumbnail` |
| Hero cover (cropped, title on top, og:image) | `[ID]-cover.webp` + `.jpg` | `cover` |
| Video poster (full frame in the player) | `[ID]-video-poster.webp` + `.jpg` | `heroMedia.poster` |

- JSON stores `.jpg` paths; pages load the `.webp` twin. Keep both files.
- No `cover` → the generator uses the hero image (image hero) or video poster (video hero) as cover (validator warns). Rules live in `scripts/lib/media-rules.js`, mirrored in `tools/js/utils.js`.

```json
"thumbnail": "assets/images/projects/[ID]/[ID]-thumb.webp",
"cover": "assets/images/projects/[ID]/[ID]-cover.jpg",
"coverPosition": { "desktop": "center 30%", "mobile": "40% center" }
```
`coverPosition` is optional CSS `object-position`; defaults are `center top` (desktop) and `center center` (mobile).

#### Hero Section Options
```json
// Video Hero
"heroMedia": {
  "type": "video",
  "src": "assets/videos/[ID]/project-[ID].mp4",
  "poster": "assets/images/projects/[ID]/[ID]-video-poster.jpg"
}

// Image Hero (shown uncropped below the cover)
"heroMedia": {
  "type": "image",
  "src": "assets/images/projects/[ID]/[ID]-hero.jpg",
  "alt": "Description for accessibility"
}
```

#### Process Media Types
Each project supports 1-6 media blocks in vertical layout:
- **Standard Video**: Simple video player with optional poster
- **Standard Image**: Static image with caption
- **Before/After Video**: Interactive comparison widget
- **Before/After Image**: Interactive comparison widget

### Design Standards

#### Layout Consistency
- **Vertical Layout Only**: All Process & Variations sections display media vertically
- **CSS Implementation**: `display: flex; flex-direction: column; gap: 1.5rem;`
- **No Horizontal Grids**: Horizontal grid classes commented out in templates
- **Visual Tools Match**: Project Studio media preview uses same vertical layout

#### File Structure
```
projects/[PROJECT_ID]/
├── assets/images/projects/[ID]/
│   ├── [ID]-thumb.webp/.jpg          # Required: grid thumbnail
│   ├── [ID]-cover.webp/.jpg          # Hero cover + og:image
│   ├── [ID]-video-poster.webp/.jpg   # Video poster
│   └── [ID]-before-*.webp            # Before/after images
└── assets/videos/[ID]/
    ├── project-[ID].mp4        # Main hero video
    ├── [ID]-before-*.mp4       # Before media
    └── [ID]-after-*.mp4        # After media
```

## Commands Reference

### Quick Start
```bash
# Start local development server
python -m http.server 8000

# Update everything at once
node scripts/run-all-updates.js

# Validate all projects
node scripts/validate-enhanced.js
```

### Project Management
```bash
# Add/Update specific project
node scripts/generate-project-unified.js 1798

# Regenerate all projects
node scripts/generate-project-unified.js

# Update featured projects on homepage only
node scripts/update-featured.js

# Update projects grid page only
node scripts/update-projects-page.js
```

### Validation & Testing
```bash
# Comprehensive validation with details
node scripts/validate-enhanced.js --verbose

# Attempt automatic fixes
node scripts/validate-enhanced.js --fix

# Basic validation (quick check)
node scripts/validate-projects.js

# Test locally
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Deployment
```bash
# GitHub Pages auto-deploys on push to main
git add .
git commit -m "Update projects"
git push origin main

# Site available at: https://mironauslander.com
```

## Architecture Details

### Navigation Structure
- **Homepage** (`index.html`): Hero, about, featured projects, skills, contact
- **Projects Grid** (`projects.html`): All 25 projects with filtering
- **Project Pages** (`projects/Project-[ID].html`): Individual showcases
- **Skills** (`skills.html`): Technical capabilities
- **Links** (`links.html`): Professional resources
- **404** (`404.html`): Custom error page

### JavaScript Components
- **`main.js`**: Core functionality (navigation, smooth scroll)
- **`before-after.js`**: Interactive comparison widgets
  - Auto-initializes all `.before-after-container` elements
  - Syncs video playback for comparisons
  - Supports mouse, touch, and keyboard navigation

### CSS Architecture
- **Custom Properties**: Design tokens for consistent theming
- **Mobile-First**: Responsive breakpoints at 768px, 1024px, 1200px
- **Glassmorphism**: Modern glass effects with fallbacks
- **Dark Theme**: Primary dark with gradient accents
- **Font System**: Self-hosted with preload optimization

### Performance Optimization
- **Image Format**: WebP with JPG fallbacks
- **Lazy Loading**: Below-fold content loaded on demand
- **Font Loading**: `font-display: swap` for faster text rendering
- **No Build Process**: Direct file serving, no compilation needed

## Troubleshooting Guide

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Before/after videos not working | Run `node scripts/generate-project-unified.js [ID]` |
| Project not showing on homepage | Set `"featured": true` in projects-data.json |
| Media files not displaying | Check file paths match structure in projects-data.json |
| Cover or poster image missing on page | `.jpg` paths are served as `.webp` - make sure both twins exist |
| Cover cropped badly | Set `coverPosition` in Project Studio, then regenerate |
| Validation showing warnings | Run `node scripts/validate-enhanced.js --verbose` for details |
| Changes not appearing | Clear browser cache (Ctrl+F5) |

### Media Placeholder Detection
The system detects placeholder files (11 bytes) and reports them during validation. Replace with actual media files before deployment.

### Template Marker Reference
Projects use markers for updatable sections:
- `PROJECT_INFO_START/END` - Project details section
- `PROCESS_MEDIA_START/END` - Media gallery section (new format)

## Development Workflow

### Adding a New Project
1. Add project data to `projects-data.json`
2. Add media files to correct directories
3. Run: `node scripts/generate-project-unified.js [PROJECT_ID]`
4. Validate: `node scripts/validate-enhanced.js`
5. Test: `python -m http.server 8000`
6. Deploy: `git add . && git commit && git push`

### Updating Multiple Projects
1. Edit `projects-data.json` with all changes
2. Run: `node scripts/run-all-updates.js`
3. Validation runs automatically
4. Test locally before deploying

### Using Visual Tools

#### Project Studio (Recommended)
1. Start server: `python -m http.server 8000`
2. Open: `http://localhost:8000/tools/project-studio.html`
3. **Edit multiple projects**:
   - Switch to "Edit" view in sidebar
   - Click any project to edit details/media
   - Changes auto-save to memory when switching projects
   - Visual indicators show modified projects
4. **Save once**: Click "Save All Changes" for single JSON download
5. Replace `projects-data.json` with downloaded file
6. Run: `node scripts/run-all-updates.js`

#### Multi-Project Editing Workflow
```
Edit Project A (details/media) →
Switch to Project B (A auto-saves to memory) →
Edit Project B →
Switch to Project C (B auto-saves to memory) →
Edit Project C →
Click "Save All Changes" → Single JSON file with A, B, C changes
```

**Benefits**:
- No manual JSON merging
- Clear visual feedback (orange dots on modified projects)
- Edit as many projects as needed before saving
- Single download contains all changes

See `docs/MULTI-PROJECT-EDITING.md` for detailed documentation.

## Key Constraints
- **GitHub Pages**: Static hosting only, no server-side processing
- **No Build Tools**: Direct HTML/CSS/JS editing, no webpack/npm build
- **Self-Hosted**: All assets stored in repository
- **Modern Browsers**: ES6+, CSS Grid, Flexbox, Custom Properties support required

## Quick Reference Links
- **Live Site**: https://mironauslander.com
- **GitHub Repo**: [Repository URL]
- **Documentation**:
  - `QUICK-REFERENCE.md` - Common commands cheatsheet
  - `docs/PROJECT-GENERATION-GUIDE.md` - Detailed generation guide
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---
*Last Updated: 2025 | System Version: Unified Generation v2.0*