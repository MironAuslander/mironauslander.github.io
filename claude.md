# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Professional portfolio website for **Miron Auslander**, a Visual Effects & Motion Graphics Creative. Built as a high-performance static site hosted on GitHub Pages with automatic deployment, focusing on showcasing visual work for TV, Films, and Digital Media.

## Project Management System
This project uses an **advanced template-based generation system** for project pages:

### Core Components
- **Data Source**: `projects-data.json` with flexible media configurations
- **Templates**:
  - `templates/project-page.html` - Basic template
  - `templates/project-page-advanced.html` - Advanced flexible media template
- **Generators**:
  - `scripts/generate-project-pages.js` - Basic generator
  - `scripts/generate-project-pages-advanced.js` - Advanced generator with media handlers
- **Migration**: `scripts/migrate-to-advanced.js` - Convert to new format
- **Validation**: `scripts/validate-projects.js` - Check for missing files/issues
- **Visual Tools**: `tools/project-manager.html` - Drag-drop project organization
- **Examples**: `templates/media-examples.json` - Media configuration examples

### Media Configuration Options
Each project supports customizable media layouts:
- **Hero Section**: Video (with poster) OR Image
- **Process Section**: 1-6 media blocks, each can be:
  - Standard video player
  - Standard image
  - Before/after video comparison widget
  - Before/after image comparison widget

## Commands

### Local Development
```bash
# Python 3 (recommended - available on system)
python -m http.server 8000

# Python 2 fallback
python -m SimpleHTTPServer 8000

# Node.js alternative (if http-server installed globally)
npx http-server -p 8000

# Then open: http://localhost:8000
```

### Testing & Validation
```bash
# Lighthouse audit (via Chrome DevTools or CLI)
lighthouse http://localhost:8000 --view

# HTML validation
# Visit: https://validator.w3.org/#validate_by_input

# CSS validation
# Visit: https://jigsaw.w3.org/css-validator/#validate_by_input

# Accessibility check (via Chrome DevTools)
# DevTools > Lighthouse > Accessibility
```

### Project Updates
```bash
# Update all project pages from projects-data.json
node scripts/run-all-updates.js

# Generate with basic template
node scripts/generate-project-pages.js 1238

# Generate with advanced template (flexible media)
node scripts/generate-project-pages-advanced.js 1238

# Migrate data to advanced format
node scripts/migrate-to-advanced.js

# Validate all projects (check for missing files)
node scripts/validate-projects.js
```

### Deployment
```bash
# GitHub Pages deploys automatically on push to main branch
git add .
git commit -m "commit message"
git push origin main

# Site available at: https://mironauslander.com
```

## Quick Reference
- **Live Site**: https://mironauslander.com
- **Tech Stack**: Vanilla HTML/CSS/JS (no frameworks, no build process)
- **Deployment**: Automatic via GitHub Pages (`.nojekyll` disables Jekyll)
- **Performance Target**: Lighthouse scores >90 all categories

## Architecture

### Navigation Flow
- **Homepage (index.html)**: Single-page with hero, about, 6 featured projects, skills/links, contact sections
- **Projects Page (projects.html)**: Full portfolio grid displaying all 25 projects with filter tagging
- **Individual Projects (projects/Project-XXXX.html)**: Detailed project showcases
- **Skills Page (skills.html)**: Technical skills breakdown
- **Links Page (links.html)**: Professional resources and inspirations
- **404 Page (404.html)**: Custom error page

### Project Files (projects/)
25 individual project showcase pages (Project-XXXX.html format)

### JavaScript Architecture
- **main.js**: Core site functionality (navigation, smooth scroll)
- **before-after.js**: Interactive before/after comparison widgets
- **MobileNav**: Hamburger menu functionality for mobile devices
- **ContactForm**: Form validation and submission handling
- **SmoothScroll**: Smooth scrolling to page sections
- **ProjectFilter**: Category filtering on projects page (if applicable)
- **LazyLoading**: Image and video lazy loading

### CSS Architecture (assets/css/style.css)
- **CSS Custom Properties**: Design tokens for colors, spacing, typography
- **Mobile-First**: Breakpoints at 768px, 1024px, 1200px
- **Glassmorphism**: backdrop-filter: blur() with fallbacks
- **Dark Theme**: Primary dark theme with gradient accents
- **Font Loading**: Self-hosted fonts with preload and font-display: swap

### Image Optimization
- **Format**: WebP with JPG fallbacks
- **Sizes**: Multiple responsive sizes using srcset
- **Loading**: Lazy loading for below-fold content
- **Compression**: Optimized file sizes while maintaining quality

## Key Constraints
- **GitHub Pages**: Static files only, no server-side processing
- **No Build Process**: Direct HTML/CSS/JS editing
- **Self-Hosted Assets**: All fonts, images, videos stored locally
- **Modern Browser Support**: ES6+, CSS Grid, Flexbox, Custom Properties
