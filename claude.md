# Portfolio Website Project - Claude Context

## Project Overview
Professional portfolio website for **Miron Auslander**, a Visual Effects & Motion Graphics Creative. Built as a high-performance static site hosted on GitHub Pages with automatic deployment, focusing on showcasing visual work for TV, Films, and Digital Media.

## Quick Reference
- **Live Site**: [GitHub Pages URL]
- **Tech Stack**: Vanilla HTML/CSS/JS (no frameworks)
- **Deployment**: Automatic via GitHub Pages (`.nojekyll`)
- **Performance Target**: High-performance, accessible, mobile-first design

## Navigation Architecture

### User Journey Flow
```
ENTRY POINT: index.html
├── Menu "Projects" → projects.html (ALL projects grid)
├── Homepage "Featured Projects" → individual projects/project-x.html
├── Menu "Skills & Links" → index.html#skills  
├── Homepage "Skills & Links" → skills.html or links.html
└── All menu items → respective sections or pages
```

### Navigation Menu Structure
```
MENU:
├── Home → index.html#home (Hero section)
├── About → index.html#about (About Me section)  
├── Projects → projects.html (Separate page - ALL projects)
├── Skills & Links → index.html#skills (Skills & Links section)
└── Contact → index.html#contact (Contact section)
```

### Homepage Sections (Full Viewport Layout)
1. **HERO SECTION** - Main introduction with CTA
2. **ABOUT ME SECTION** - Personal story and expertise
3. **FEATURED PROJECTS SECTION** - project thumbnails → projects/project-x.html
4. **SKILLS & LINKS SECTION** - Two buttons to skills.html and links.html
5. **CONTACT SECTION** - Contact form and social links
6. **FOOTER** - Copyright

## File Structure
```
/                           # GitHub Pages root
├── index.html              # Main homepage (self-contained, ~1040 lines)
├── projects.html           # All projects listing with filters
├── skills.html             # Technical skills showcase  
├── links.html              # Professional/inspirational links
├── 404.html               # Custom error page
├── projects/              # Individual project detail pages
│   ├── Project-a.html     # Motion Graphics project
│   ├── project-b.html     # VFX project  
│   ├── project-c.html     # Motion Graphics project
│   ├── project-d.html     # VFX project
│   ├── project-e.html     # Commercial project
│   └── project-f.html     # Motion Graphics project
├── assets/
│   ├── css/
│   │   ├── critical.css   # Critical path styles (placeholder)
│   │   └── style.css      # Shared stylesheet (~1200 lines)
│   ├── js/
│   │   └── main.js        # Modular JavaScript classes (~200 lines)
│   ├── fonts/             # Custom fonts (WOFF2 + fallbacks)
│   │   ├── Primary/       # Poppins family
│   │   ├── Secondary/     # Inter family  
│   │   ├── Accent/        # Inter accent weights
│   │   └── Logo/          # Devil Breeze font
│   ├── images/            # Optimized images (WebP + JPG fallbacks)
│   │   ├── profile-photo.webp/jpg
│   │   └── projects/      # Project thumbnails and gallery images
│   └── videos/            # Project showcase videos (MP4)
├── .nojekyll              # Disables Jekyll processing
├── sitemap.xml            # SEO sitemap
└── claude.md              # This documentation file
```

## Technical Approach

### Core Principles
- **Performance First** - Inline critical CSS, optimized assets
- **Mobile-First** - Responsive design that works everywhere
- **Accessibility** - WCAG compliance, semantic HTML
- **Zero Dependencies** - No frameworks, self-hosted assets
- **Progressive Enhancement** - Works without JavaScript

### Current Architecture
- **CSS**: Custom properties for design tokens, glassmorphism effects
- **JavaScript**: Class-based modules (MobileNav, ContactForm, SmoothScroll)
- **Fonts**: Self-hosted with preloading and fallback stacks
- **Images**: WebP with fallbacks, lazy loading where appropriate

### Design Direction
- **Dark theme** with gradient accents
- **Modern typography** with custom fonts
- **Glassmorphism effects** using backdrop-filter
- **Smooth animations** and micro-interactions
- **Professional but approachable** aesthetics

### Font Loading Strategy
**Performance-optimized typography:**
- **Font Preloading**: Critical fonts in `<head>` with `crossorigin`
- **Font Display**: `font-display: swap` for better perceived performance
- **Fallback Stacks**: System fonts as fallbacks for each custom font
- **CSS Variables**: Centralized font family management

## Performance Requirements

### Lighthouse Targets (>90 all categories)
- **Performance**: Optimized images, inline CSS, minimal JS
- **Accessibility**: WCAG 2.1 AA compliance, semantic HTML, ARIA labels
- **Best Practices**: HTTPS, modern standards, security headers
- **SEO**: Complete meta tags, structured data, sitemap

## Development Context

### Current Status
The site structure is complete with working navigation, responsive design, and core functionality. Main areas still being refined:
- Asset integration (images, videos)
- Performance optimization
- Design polish and effects
- Content updates

### Flexibility Notes
- Design elements (colors, fonts, spacing) are actively being adjusted
- Layout and component structure may evolve
- Performance optimizations are ongoing
- Content and messaging may change

### Key Constraints
- **GitHub Pages deployment** - static files only
- **No build process** - direct HTML/CSS/JS
- **Self-hosted assets** - no external CDNs
- **HTTPS required** - all resources over secure connections
- **Modern browser support** - ES6+ is fine

## Common Tasks
- Component development and refinement
- Performance and accessibility improvements
- Mobile optimization and responsive fixes
- SEO and meta tag updates
- Asset optimization and integration
- Code organization and cleanup
- Feature implementation and enhancements

## Development Workflow

### Testing Checklist
- [ ] **Mobile Responsiveness**: 320px to 2560px viewport testing
- [ ] **Accessibility Audit**: Screen readers, keyboard navigation, color contrast
- [ ] **Performance Audit**: Lighthouse scores, Core Web Vitals
- [ ] **Cross-Browser Testing**: Chrome, Firefox, Safari, Edge compatibility
- [ ] **SEO Validation**: Meta tags, structured data, sitemap accuracy

### Common Development Tasks
1. **Asset Integration**: Replace placeholder images/videos with actual content
2. **Performance Optimization**: Reduce bundle size, optimize loading
3. **Accessibility Improvements**: ARIA labels, focus management
4. **Mobile Optimization**: Touch interactions, responsive design fixes
5. **Content Management**: Project updates, skill additions, link maintenance
6. **Feature Implementation**: Advanced interactions, animations
7. **Browser Compatibility**: Progressive enhancement, fallback handling

## Environment Context
- **OS**: Windows 11
- **Primary Browser**: Chrome DevTools
- **Testing**: Cross-browser validation required
- **Editor**: Any HTML/CSS/JS compatible editor

## Content Guidelines

### Brand Identity
- **Professional but approachable** tone
- **Visual storytelling focus** with emphasis on emotional impact
- **Focus on creativity**: with emphasis on technical expertise
- **Dark theme aesthetic** with glassmorphism effects
