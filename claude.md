# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Professional portfolio website for **Miron Auslander**, a Visual Effects & Motion Graphics Creative. Built as a high-performance static site hosted on GitHub Pages with automatic deployment, focusing on showcasing visual work for TV, Films, and Digital Media.

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

### Deployment
```bash
# GitHub Pages deploys automatically on push to main branch
git add .
git commit -m "commit message"
git push origin main

# Site available at: https://mironauslander.github.io
```

## Quick Reference
- **Live Site**: https://mironauslander.github.io
- **Tech Stack**: Vanilla HTML/CSS/JS (no frameworks, no build process)
- **Deployment**: Automatic via GitHub Pages (`.nojekyll` disables Jekyll)
- **Performance Target**: Lighthouse scores >90 all categories

## Architecture

### Navigation Flow
- **Homepage (index.html)**: Single-page with hero, about, featured projects, skills/links, contact sections
- **Projects Page (projects.html)**: Full portfolio grid with all projects
- **Individual Projects (projects/Project-XXXX.html)**: Detailed project showcases
- **Skills Page (skills.html)**: Technical skills breakdown
- **Links Page (links.html)**: Professional resources and inspirations
- **404 Page (404.html)**: Custom error page

### Project Files (projects/)
- Project-1238.html - Individual project showcase
- Project-1270.html - Individual project showcase
- Project-1537.html - Individual project showcase
- Project-1654.html - Individual project showcase
- Project-1711.html - Individual project showcase
- Project-1798.html - Individual project showcase

### JavaScript Architecture (assets/js/main.js)
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
