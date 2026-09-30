# Portfolio Management - Quick Reference

## 🚀 Most Common Commands

### Update Everything at Once
```bash
node scripts/run-all-updates.js
```
This updates homepage, projects page, and all project pages automatically.

### Add a New Project
1. Edit `projects-data.json` with project details
2. Add media files to `assets/images/projects/[ID]/` and `assets/videos/[ID]/`
3. Run: `node scripts/generate-project-unified.js [PROJECT_ID]`
4. Validate: `node scripts/validate-enhanced.js`

### Fix Before/After Videos Not Working
```bash
# Regenerate the specific project
node scripts/generate-project-unified.js 1537

# Or regenerate all projects
node scripts/generate-project-unified.js
```

### Check for Issues
```bash
# Quick check
node scripts/validate-enhanced.js

# Detailed check with all info
node scripts/validate-enhanced.js --verbose
```

## 📁 File Structure

```
Your Project ID: 1234
├── assets/images/projects/1234/
│   ├── 1234-thumb.webp/.jpg          (Required: grid thumbnail)
│   ├── 1234-cover.webp/.jpg          (Hero cover, cropped behind the title; og:image)
│   └── 1234-video-poster.webp/.jpg   (Video poster, full frame in the player)
└── assets/videos/1234/
    ├── project-1234.mp4       (Main video)
    ├── 1234-before-1.mp4      (Before/after pairs)
    └── 1234-after-1.mp4
```

Image paths in JSON use `.jpg`; pages load the `.webp` twin, so keep both files.
Sizes, crops and safe areas: `docs/ASSET-GUIDE.md`.

## 🎨 Visual Tools

Open these in your browser after starting local server:

```bash
# Start server first
python -m http.server 8000

# Then open:
http://localhost:8000/tools/project-studio.html    # Edit details, images and media
http://localhost:8000/tools/project-manager.html   # Order projects, check image assets
```

## ⚡ Testing Locally

```bash
# Start local server
python -m http.server 8000

# View your site
http://localhost:8000

# Test specific project
http://localhost:8000/projects/Project-1537.html
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Before/after not working | Run: `node scripts/generate-project-unified.js [ID]` |
| Project not on homepage | Set `"featured": true` in projects-data.json |
| Media not showing | Check file paths in projects-data.json match actual files |
| Cover/poster missing | Both `.jpg` and `.webp` twins must exist |
| Cover cropped badly | Set `coverPosition` in Project Studio, then regenerate |
| Changes not appearing | Clear browser cache (Ctrl+F5) |

## 📊 Regular Maintenance

### Daily (After Adding Projects)
```bash
node scripts/validate-enhanced.js
```

### Weekly
```bash
node scripts/validate-enhanced.js --verbose
```

### Before Deploying
```bash
# 1. Validate
node scripts/validate-enhanced.js

# 2. Test locally
python -m http.server 8000

# 3. Deploy
git add .
git commit -m "Update projects"
git push origin main
```

## 🎯 Project Data Quick Template

```json
{
  "id": "1234",
  "displayTitle": "Short Title",
  "fullTitle": "Full Project Title",
  "category": ["vfx"],  // any of "ai", "vfx", "motion", "editing", "personal"
  "description": "Project description...",
  "client": "Client Name",
  "year": 2025,
  "duration": "2 months",
  "role": ["VFX Artist", "Compositor"],
  "tools": ["After Effects", "Nuke"],
  "featured": true,
  "visible": true,
  "thumbnail": "assets/images/projects/1234/1234-thumb.webp",
  "cover": "assets/images/projects/1234/1234-cover.jpg",
  "coverPosition": { "desktop": "center 30%" },  // optional
  "heroMedia": {
    "type": "video",
    "src": "assets/videos/1234/project-1234.mp4",
    "poster": "assets/images/projects/1234/1234-video-poster.jpg"
  },
  "processMedia": [
    {
      "type": "before-after-video",
      "before": "assets/videos/1234/1234-before.mp4",
      "after": "assets/videos/1234/1234-after.mp4",
      "label": "VFX Breakdown"
    }
  ]
}
```

---
*For detailed documentation, see `docs/PROJECT-GENERATION-GUIDE.md`*