# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Professional portfolio website for **Miron Oslander**, a Visual Effects & Motion Graphics Creative. Built as a high-performance static site hosted on GitHub Pages with automatic deployment.

## Development Commands

Since this is a static site with no build process, development is straightforward:

```bash
# No build commands needed - direct HTML/CSS/JS deployment
# Open in browser for local development
start index.html  # Windows
open index.html   # macOS

# Git workflow (with Claude permissions configured)
git status
git add .
git commit -m "feat: description"
git push origin main
```

**Testing Commands:**
- Manual testing in browser at different screen sizes (320px to 2560px)
- Chrome DevTools Lighthouse audit for performance/accessibility
- Cross-browser testing: Chrome, Firefox, Safari, Edge

## High-Level Architecture

### Core Architecture Principles
- **Zero Build System**: Direct HTML/CSS/JS deployment via GitHub Pages
- **Performance-First**: Inline critical CSS, minimal external resources
- **Framework-Free**: Pure vanilla JavaScript with class-based modules
- **Mobile-First**: Progressive enhancement with responsive design

### File Structure & Responsibilities

```
/                           # GitHub Pages root
├── index.html              # Main homepage (self-contained, ~1040 lines)
├── projects.html           # Projects listing page
├── skills.html            # Skills showcase page
├── links.html             # External links page
├── projects/              # Individual project detail pages
│   ├── Project-a.html     # Each project has dedicated page
│   └── [project-b through project-f].html
├── assets/
│   ├── css/
│   │   ├── critical.css   # Critical path styles
│   │   └── style.css      # Shared stylesheet across pages
│   ├── js/
│   │   └── main.js        # Modular JavaScript classes
│   ├── images/            # Optimized images (WebP + fallbacks)
│   └── videos/            # Project showcase videos
├── .nojekyll              # Disables Jekyll processing
└── sitemap.xml            # SEO sitemap
```

### JavaScript Architecture (main.js)
**Class-based modular system** with these core modules:
- `MobileNav`: Handles responsive navigation with accessibility
- `ContactForm`: Form validation and submission handling
- `SmoothScroll`: Custom smooth scrolling with accessibility controls
- `SkipLink`: Screen reader navigation assistance

Each class follows the pattern:
```javascript
class ModuleName {
  constructor() { this.init(); }
  init() { /* DOM queries and binding */ }
  bindEvents() { /* Event listeners */ }
}
```

### CSS Architecture
**Performance-optimized styling system:**
- **CSS Custom Properties**: Consistent design tokens in `:root`
- **Inline Critical CSS**: Above-the-fold styles embedded in HTML `<style>` tags
- **Glassmorphism Design System**: Advanced glass effects using `backdrop-filter`
- **Mobile-First Responsive**: CSS Grid and Flexbox with progressive enhancement

### Design System Tokens
```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --dark-bg: #08090a;
  --text-white: #ffffff;
  --max-width: 1200px;
  --border-radius: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Technical Constraints & Requirements

### Hard Constraints
- **No External Dependencies**: All CSS/JS must be inline or self-hosted
- **No Build Process**: Direct deployment (uses `.nojekyll`)
- **HTTPS Only**: All resources served over HTTPS
- **GitHub Pages Compatible**: Static files only

### Performance Requirements  
- **Lighthouse Scores >90**: All categories (Performance, Accessibility, Best Practices, SEO)
- **Inline Critical CSS**: Above-the-fold styles in `<style>` tags
- **WebP Images**: With fallbacks for browser compatibility
- **Minimal JavaScript**: ES6+ classes, no framework dependencies

### Accessibility Requirements
- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Semantic HTML**: Proper heading hierarchy (h1 > h2 > h3)
- **ARIA Labels**: Complete screen reader support
- **Keyboard Navigation**: Focus management and skip links
- **Skip Links**: `SkipLink` class provides screen reader navigation

## Development Patterns

### HTML Pattern
- **Self-contained pages**: Each HTML file includes its own `<style>` block
- **Semantic structure**: Proper heading hierarchy and landmarks
- **Progressive enhancement**: Works without JavaScript

### CSS Pattern
- **Mobile-first**: `min-width` media queries for progressive enhancement
- **Utility classes**: Reusable classes for common patterns
- **Component-scoped**: Styles grouped by component/section

### JavaScript Pattern
- **Class-based modules**: Each feature as a separate class
- **Event delegation**: Efficient event handling
- **Accessibility-first**: ARIA attributes and keyboard support
- **Progressive enhancement**: Site works without JS

## Content Guidelines

### Brand Identity
- **Professional but approachable** tone
- **Visual storytelling focus** with emphasis on emotional impact
- **Industry terminology**: VFX, motion graphics, post-production
- **Dark theme aesthetic** with glassmorphism effects

### SEO Strategy
- **Complete meta tags**: Description, keywords, author
- **Open Graph**: Social media sharing optimization
- **Structured data**: Semantic markup for search engines
- **Sitemap.xml**: Updated project listings

## Git Workflow & Permissions

**Claude has git permissions** configured in `.claude/settings.local.json`:
- Allowed: `git rev-list`, `checkout`, `merge`, `push`, `stash`, `commit`
- **Automatic deployment**: Changes pushed to `main` branch deploy via GitHub Pages

## Success Metrics
- **Performance**: Lighthouse scores >90 all categories
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile**: Responsive 320px to 2560px
- **Cross-browser**: Chrome, Firefox, Safari, Edge compatibility
- **Professional impact**: Clear skills showcase and portfolio presentation.