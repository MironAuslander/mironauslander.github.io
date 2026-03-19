# Design System: Miron Auslander Portfolio
**Site:** mironauslander.com — Visual Effects & Motion Graphics Creative

## 1. Visual Theme & Atmosphere

**Cinematic, immersive, and moody.** The portfolio embodies a dark theatrical aesthetic — the kind of atmosphere you'd expect from a VFX artist's personal stage. The design philosophy is "content in darkness": near-black backgrounds create a void from which media, gradients, and glass surfaces emerge with dramatic presence.

The overall density is **spacious and breathable** — full-viewport sections with generous padding let each piece of work command attention. Subtle particle animations on canvas, gradient light-leaks, and glassmorphic containers give the site a layered, dimensional quality — as if the interface itself is a composited scene.

**Key atmosphere words:** Cinematic, Dark-luxe, Glass-layered, Dramatic, Editorial, Immersive

## 2. Color Palette & Roles

### Primary Backgrounds
- **Void Black** (`#08090a`) — Primary page background. Near-true-black with a cool micro-tint that avoids the harshness of pure black.
- **Deep Space** (`#0a0a0f`) — Secondary background / hero sections. Slightly cooler and deeper, used for visual separation.
- **Charcoal Abyss** (`#0f1115`) — Darker accent background for recessed areas and overlays.

### Text Colors
- **Pure White** (`#ffffff`) — Primary headings and high-emphasis text. Used sparingly for maximum contrast.
- **Silver Mist** (`#a0a0a0`) — Body text and secondary content. Muted enough to recede but fully readable.
- **Soft Pewter** (`#b0b0b0`) — Tertiary text, meta labels, and UI chrome text.

### Accent — Blue-Violet (Primary Brand)
- **Soft Indigo** (`#667eea`) — Primary accent. Used for interactive elements, link hovers, gradient starts, hero glows. Conveys creativity and tech sophistication.
- **Deep Amethyst** (`#764ba2`) — Secondary accent. Paired with Soft Indigo in the signature gradient. Adds warmth and depth to the cool palette.
- **Primary Gradient:** 135deg from Soft Indigo to Deep Amethyst — the signature brand gradient used on profile borders, hero card edges, and CTA button underlays.

### Accent — Warm (Project & Action Highlights)
- **Coral Ember** (`#ff6b6b`) — Warm accent for project cards, filter states, and "featured" elements. Creates visual energy against the cool dark palette.
- **Sunbeam Gold** (`#feca57`) — Yellow-gold used in project hero bottom light-leaks. Adds cinematic warmth.
- **Warm Gradient:** 135deg from Coral Ember to Sunbeam Gold — used for project hero atmospheric glows and warm button variants.

### Accent — Cool (Skills & Services)
- **Electric Sky** (`#4facfe`) — Cyan-blue accent for skill bars, service cards, links, and download elements. Clean and professional.
- **Aqua Flare** (`#00f2fe`) — Vivid cyan endpoint for skill progress bars and link underlines.
- **Cyan Gradient:** 135deg from Electric Sky to Aqua Flare — used on skill progress bars, download items, and link hover underlines.

### Functional Transparency Scale
- `rgba(255,255,255, 0.05–0.1)` — Glass surface backgrounds, subtle card fills
- `rgba(255,255,255, 0.1–0.3)` — Borders, dividers, hover states
- `rgba(0,0,0, 0.3–0.95)` — Overlay layers, button gradient dark stops, modal backdrops

## 3. Typography Rules

### Font Families
- **Poppins** (Primary / `--font-primary`) — Used for all headings, navigation, buttons, and UI labels. A geometric sans-serif with friendly roundness that balances professionalism with approachability. Loaded in Thin (100), Light (300), Regular (400), and Medium (500) weights.
- **Inter** (Secondary / `--font-secondary`) — Used for body text, descriptions, metadata, and form inputs. A highly legible humanist sans-serif optimized for screen reading. Regular (400) weight.
- **Inter Accent** (`--font-accent`) — A variant of Inter loaded with Medium (500) and Bold (700) weights for emphasis in body contexts — link text, skill levels, and highlighted descriptions.
- **Devil Breeze** (Logo / `--font-logo`) — A distinctive display face used exclusively for the "Ma" logo mark. Demi weight (600), tight usage.

### Weight Hierarchy
- **Hero H1:** Poppins Thin (100) — ethereally light, cinematic presence. `clamp(1.8rem, 5vw, 3rem)`, letter-spacing 1px.
- **Section Titles:** Poppins Light (300) — understated elegance. `clamp(2rem, 4vw, 2.5rem)`, uppercase, letter-spacing 2px.
- **Card/Component Headings (H3):** Poppins Medium (500) — clear hierarchy. 1.3–1.5rem, uppercase with 1px letter-spacing.
- **Buttons & CTAs:** Poppins Semi-Bold (600) — assertive but not heavy. 0.95–1.1rem, uppercase, letter-spacing 0.5–2px.
- **Body Text:** Inter Regular (400) — clean readability. 0.95–1.2rem, line-height 1.6–1.8.
- **Meta/Labels:** Poppins Semi-Bold (600) — small and structured. 0.85–0.9rem, uppercase, letter-spacing 1px, color #333 (on light meta cards).

### Character
The typographic voice is **quiet confidence** — ultra-light display weights for headings communicate sophistication without shouting, while the medium-weight body type ensures readability. Uppercase with generous letter-spacing is used consistently for section titles, category headers, and buttons to create a structured, editorial rhythm.

## 4. Component Stylings

### Buttons (CTA)
- **Shape:** Pill-shaped (`border-radius: 50px`) with generous horizontal padding (2–2.5rem).
- **Background:** Multi-layer gradient — a dark-to-transparent diagonal wash over a colored gradient underlay. Creates depth, as if the button surface is slightly translucent.
- **Border:** 2px solid with gradient mask technique — the border itself carries the brand gradient (Soft Indigo to Deep Amethyst), fading at edges.
- **Backdrop:** `backdrop-filter: blur(10px)` — glass effect blending with background.
- **Hover behavior:** Lifts 2px (`translateY(-2px)`), gains a colored glow shadow (matching the button's accent color), and a diagonal light sweep overlay fades in.
- **Variants by color context:**
  - *Hero/Default:* Blue-violet gradient border, purple/blue glow on hover
  - *Projects:* Coral Ember border (`rgba(255,107,107)`), warm glow on hover
  - *Skills/Services:* Electric Sky border (`rgba(79,172,254)`), cool glow on hover

### Cards — Project Cards
- **Shape:** Subtly rounded corners (`border-radius: 10px`), 16:9 aspect ratio.
- **Border:** 2px solid Coral Ember at 30% opacity — warm accent framing.
- **Overlay:** A whisper-thin diagonal gradient wash with 0.5px backdrop blur — barely tints the thumbnail, preserving image fidelity.
- **Hover:** Border brightens to 50% Coral Ember, card lifts 5px, gains a heavy dark shadow (`0 20px 40px rgba(0,0,0,0.4)`). A diagonal light-flash sweeps across (pseudo-element translating 200%).
- **Title reveal:** Project name fades up from 10px below on hover with heavy text-shadow for readability over images.

### Cards — Skill/Link Categories
- **Shape:** Generously rounded corners (`border-radius: 12px`).
- **Background:** 145deg diagonal gradient from a tinted accent (10–15% opacity) fading through deep black stops — glass-over-void effect.
- **Border:** 2px solid accent color at 30% opacity (Soft Indigo for skill categories, Electric Sky for service cards).
- **Backdrop:** `backdrop-filter: blur(10px)` — consistent glass treatment.
- **Hover (service cards):** Lifts 5px, shadow intensifies with accent color glow, light-flash sweep.

### Hero Content Container (Homepage)
- **Shape:** Generous rounded corners (`border-radius: 20px`).
- **Background:** Multi-layer — a subtle bottom-left radial white glow (4% opacity) over a dark semi-transparent base (`rgba(10,10,15, 0.4)`).
- **Backdrop:** Heavy blur (`blur(10px)` standard, `blur(20px)` webkit).
- **Border:** Gradient mask technique — purple gradient fading from top-left corner, blue gradient fading from bottom-right corner. Only visible as edge accents, not a full border.
- **Depth:** Inner box-shadows simulate frosted glass refraction — whisper-soft white insets from the top.
- **Refraction layer:** A pseudo-element offset 5px creates a subtle dark shadow beneath, adding physical depth.

### Project Meta Box
- **Shape:** Rounded (`border-radius: 15px`).
- **Background:** Light gradient (`rgba(200-220, 200-220, 200-220, 0.95)`) — deliberately inverted from the dark theme. Creates a "card on a desk" feeling, making project metadata feel tangible and distinct.
- **Position:** Sticky at `top: 100px` — follows scroll within the project details section.
- **Text:** Dark text (#111, #333) on light background — high contrast for metadata readability.

### Forms (Contact)
- **Container:** Light gray background (`#b0b0b0`), rounded corners (`border-radius: 10px`) — another deliberate light inversion for approachability.
- **Inputs:** White background, 2px transparent border that transitions to Soft Indigo on focus with a 3px blue ring shadow. Rounded corners (`border-radius: 6px`).
- **Submit button:** Dark gradient with Soft Indigo border, squared-off rounded corners (`border-radius: 6px`) — distinct from pill CTAs, signaling "form action" vs. "navigation."

### Social Links
- **Shape:** Perfect circles (`border-radius: 50%`), 60x60px.
- **Style:** Same glass-gradient treatment as CTA buttons — dark diagonal gradient, Soft Indigo border at 40% opacity.
- **Hover:** Lifts 3px and scales up 10% (`scale(1.1)`), with blue glow shadow.

### Modals (Video Showreel)
- **Overlay:** Near-opaque black (`rgba(0,0,0,0.9)`) with 10px backdrop blur.
- **Content container:** Dark gradient surface, generous rounding (`border-radius: 20px`), subtle white border at 10% opacity. Enters with a slide-down scale animation.
- **Close button:** Circular, glass-filled, rotates 90deg on hover.

### Tool Tags
- **Shape:** Pill-shaped (`border-radius: 25px`).
- **Default:** Transparent background, 2px Coral Ember border, Coral Ember text — outline style.
- **Hover:** Fills with Coral Ember, text turns white, lifts 2px with warm glow shadow.

## 5. Layout Principles

### Spacing Strategy
The site uses a **systematic spacing scale** defined as CSS custom properties:
- `--space-xs: 0.25rem` (4px) — micro gaps
- `--space-sm: 0.5rem` (8px) — tight internal spacing
- `--space-md: 1rem` (16px) — standard component padding
- `--space-lg: 2rem` (32px) — section gaps and grid gutters
- `--space-xl: 4rem` (64px) — major section separations

### Section Structure
- **Full-viewport sections** (`min-height: 100vh`) with flex centering — each major section (Hero, Projects, About, Skills, Contact) occupies the full screen height minimum.
- **Scroll snap** (`scroll-snap-align: start`) — sections lock into view during scrolling.
- **Max content width:** 1200px (`--max-width`) with auto margins — content is centered with comfortable reading widths.
- **Section padding:** 80px top, 40px bottom — generous breathing room with header clearance.

### Grid System
- **Project grids:** Single column on mobile, expanding via CSS Grid with `auto-fill` and responsive `minmax()` breakpoints. Gap: 1.5rem.
- **Service/links grids:** `repeat(auto-fit, minmax(250–300px, 1fr))` — fluid cards that wrap naturally.
- **Navigation:** CSS Grid with `auto 1fr auto` columns — logo left, nav centered, utility right.

### Responsive Breakpoints
- **768px** — Tablet/desktop: hamburger menu hides, nav goes horizontal, grids expand.
- **1024px** — Large desktop: container padding increases.
- **1200px** — Max content width constraint.

### Depth & Elevation
The site uses a **4-tier elevation system**:
1. **Background plane** — Flat void black, no shadow.
2. **Surface plane** — Glass cards/containers with subtle inner shadows and backdrop blur. Borders provide edge definition rather than shadows.
3. **Interactive plane** — On hover, elements lift physically (`translateY(-2px to -5px)`) and gain colored glow shadows (10–40px spread, accent-tinted).
4. **Overlay plane** — Modals at z-index 1000 with heavy dark backdrop and dramatic entry animations.

**Shadow character:** Shadows are either *deep and dark* (`rgba(0,0,0, 0.4-0.8)`, large spreads) or *colored glows* (accent-tinted, medium spreads). There are no subtle gray drop shadows — everything is either void-dark or luminous. This creates a cinematic lighting feel.

### Transition System
- **Standard:** `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` — Material Design-inspired easing. Smooth but snappy.
- **Slow:** `all 0.6s` with same easing — for larger, more dramatic state changes.
- **Hover pattern:** Consistent across all interactive elements — upward lift + glow + optional sweep animation.

### Color Coding by Section
The site uses a deliberate **color-accent strategy** to differentiate content areas:
- **Hero / Brand:** Blue-Violet (Soft Indigo + Deep Amethyst)
- **Projects:** Warm (Coral Ember + Sunbeam Gold)
- **Skills / Services:** Cool (Electric Sky + Aqua Flare)
- **Contact / Social:** Blue (Soft Indigo)

This creates intuitive wayfinding without explicit labels.
