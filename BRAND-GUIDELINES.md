# Brand Guidelines - Miron Auslander Portfolio

> Visual identity and design system documentation for the Visual Effects & Motion Graphics portfolio website

## Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [UI Components](#ui-components)
5. [Visual Elements](#visual-elements)
6. [Animation & Transitions](#animation--transitions)

---

## Color Palette

### Core Colors

| Color Name | Hex Value | RGB | Usage |
|------------|-----------|-----|-------|
| **Dark Background** | `#08090a` | rgb(8, 9, 10) | Main background color |
| **Darker Background** | `#0f1115` | rgb(15, 17, 21) | Body background, footer |
| **Text White** | `#ffffff` | rgb(255, 255, 255) | Primary text color |
| **Text Gray** | `#b0b0b0` | rgb(176, 176, 176) | Secondary text, descriptions |
| **Accent Blue** | `#667eea` | rgb(102, 126, 234) | Links, highlights, tech tags |
| **Accent Warm** | `#ff6b6b` | rgb(255, 107, 107) | Hover states, emphasis |
| **Accent Cyan** | `#4facfe` | rgb(79, 172, 254) | Skills, services |

### Tool Interface Colors

| Color Name | Hex Value | RGB | Usage |
|------------|-----------|-----|-------|
| **BG Primary** | `#0a0a0a` | rgb(10, 10, 10) | Tool background |
| **BG Secondary** | `#1a1a1a` | rgb(26, 26, 26) | Tool cards, sections |
| **BG Tertiary** | `#2a2a2a` | rgb(42, 42, 42) | Tool headers, buttons |
| **Success** | `#4caf50` | rgb(76, 175, 80) | Success states |
| **Warning** | `#ff9800` | rgb(255, 152, 0) | Warning states |
| **Error** | `#f44336` | rgb(244, 67, 54) | Error states |
| **Border** | `#333333` | rgb(51, 51, 51) | Borders, dividers |

### Gradient Definitions

#### Primary Gradient
```css
linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```
**Color Breakdown:**
- Start (0%): `#667eea` - Soft Blue Purple (rgb(102, 126, 234))
- End (100%): `#764ba2` - Deep Purple (rgb(118, 75, 162))
- **Usage:** Hero sections, social links, submit buttons

#### Warm Gradient
```css
linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)
```
**Color Breakdown:**
- Start (0%): `#ff6b6b` - Coral Red (rgb(255, 107, 107))
- End (100%): `#feca57` - Golden Yellow (rgb(254, 202, 87))
- **Usage:** Project hero sections, accent elements

#### Cyan Gradient
```css
linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)
```
**Color Breakdown:**
- Start (0%): `#4facfe` - Sky Blue (rgb(79, 172, 254))
- End (100%): `#00f2fe` - Bright Cyan (rgb(0, 242, 254))
- **Usage:** Skill progress bars, service cards

#### CTA Button Gradient
```css
linear-gradient(145deg,
    rgba(102, 126, 234, 0.15) 0%,
    rgba(0, 0, 0, 0.7) 30%,
    rgba(0, 0, 0, 0.9) 70%,
    rgba(0, 0, 0, 0.95) 100%)
```
**Color Breakdown:**
- 0%: Semi-transparent blue purple (15% opacity)
- 30%: Dark black (70% opacity)
- 70%: Near black (90% opacity)
- 100%: Almost pure black (95% opacity)
- **Usage:** Primary CTA buttons with glassmorphism effect

#### Project Card Overlay Gradient
```css
linear-gradient(145deg,
    rgba(255, 107, 107, 0.08) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.15) 70%,
    rgba(0, 0, 0, 0.2) 100%)
```
**Color Breakdown:**
- 0%: Very subtle warm red (8% opacity)
- 30%: Light black overlay (10% opacity)
- 70%: Medium black overlay (15% opacity)
- 100%: Darker black overlay (20% opacity)
- **Usage:** Project card glassmorphism overlays

#### Flash Animation Gradient
```css
linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)
```
**Color Breakdown:**
- 30%: Transparent
- 50%: White flash (30% opacity)
- 70%: Transparent
- **Usage:** Hover animations on cards and buttons

#### Before/After Label Gradient
```css
linear-gradient(145deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(0, 0, 0, 0.7) 30%,
    rgba(0, 0, 0, 0.9) 70%,
    rgba(0, 0, 0, 0.95) 100%)
```
**Usage:** Labels on before/after comparison widgets

---

## Typography

### Font Families

#### Primary Font Stack
```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
**Weights Available:** 100 (Thin), 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
**Usage:** Headings, navigation, buttons, hero text

#### Body Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
**Weights Available:** 400 (Regular), 500 (Medium), 700 (Bold)
**Usage:** Body text, paragraphs, descriptions, form inputs

#### Logo Font
```css
font-family: 'Devil Breeze', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
**Weight:** 600 (Demi)
**Usage:** Logo text only

#### System Fallback Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Typography Scale

#### Headings

| Element | Font Size | Font Weight | Line Height | Letter Spacing |
|---------|-----------|-------------|-------------|----------------|
| **H1 Hero** | `clamp(2rem, 5vw, 3.5rem)` | 100 | 1.2 | 1px |
| **H2 Section** | `clamp(2rem, 4vw, 2.5rem)` | 300 | 1.3 | 2px |
| **H2 Project** | `2rem` | 400 | 1.4 | - |
| **H3** | `1.5rem` | 600 | 1.4 | - |
| **Logo** | `1.5rem` | 600 | 1 | 2px |

#### Body Text

| Element | Font Size | Line Height | Color |
|---------|-----------|-------------|-------|
| **Body** | `1rem` | 1.6 | `#ffffff` |
| **Body Secondary** | `1rem` | 1.6 | `#b0b0b0` |
| **Large Body** | `1.1rem` | 1.8 | `#b0b0b0` |
| **Small** | `0.9rem` | 1.4 | `#b0b0b0` |

#### Special Text

| Element | Font Size | Weight | Transform | Letter Spacing |
|---------|-----------|--------|-----------|----------------|
| **Hero Subtitle** | `clamp(1rem, 3vw, 1.3rem)` | 300 | - | - |
| **Button** | `1.1rem` | 600 | - | 1px |
| **Tech Tag** | `0.9rem` | 500 | - | - |
| **Navigation** | `1rem` / `1.5rem` (mobile) | 500 | - | - |
| **Section Title** | `clamp(2rem, 4vw, 2.5rem)` | 300 | uppercase | 2px |
| **BA Labels** | `13px` / `12px` (mobile) | 600 | uppercase | 2px |

---

## Spacing & Layout

### Container System

| Container | Max Width | Padding |
|-----------|-----------|---------|
| **Main Container** | `1200px` | `0 1rem` |
| **Tool Container** | `1400px` | `0 2rem` |
| **Form Container** | `600px` | `2rem` |
| **Project Media** | `800px` | `0` |

### Spacing Scale

| Variable | Value | Usage |
|----------|-------|-------|
| **XS** | `0.25rem` (4px) | Micro spacing |
| **S** | `0.5rem` (8px) | Small gaps |
| **M** | `1rem` (16px) | Default spacing |
| **L** | `1.5rem` (24px) | Section gaps |
| **XL** | `2rem` (32px) | Large sections |
| **XXL** | `3rem` (48px) | Major sections |
| **XXXL** | `4rem` (64px) | Hero padding |

### Responsive Breakpoints

| Breakpoint | Value | Description |
|------------|-------|-------------|
| **Mobile** | `< 768px` | Single column layouts |
| **Tablet** | `768px - 1023px` | Two column grids |
| **Desktop** | `1024px - 1199px` | Full layouts |
| **Large** | `≥ 1200px` | Maximum width containers |

### Grid Systems

#### Projects Grid
- Mobile: `1 column`
- Tablet+: `repeat(auto-fit, minmax(300px, 1fr))`
- Gap: `1.5rem` / `2rem` (desktop)

#### Skills Grid
- Mobile: `1 column`
- Desktop: `repeat(auto-fit, minmax(250px, 1fr))`
- Gap: `1rem`

#### Gallery Grid
- Mobile: `1 column`
- Desktop: `repeat(auto-fit, minmax(300px, 1fr))`
- Gap: `1.5rem`

#### Process Media Layout
- **Vertical Only**: `display: flex; flex-direction: column`
- Gap: `1.5rem`
- No horizontal grid layouts

---

## UI Components

### Buttons

#### Primary CTA Button
```css
background: linear-gradient(145deg,
    rgba(102, 126, 234, 0.15) 0%,
    rgba(0, 0, 0, 0.7) 30%,
    rgba(0, 0, 0, 0.9) 70%,
    rgba(0, 0, 0, 0.95) 100%);
padding: 1rem 2.5rem;
border-radius: 50px;
border: 2px solid rgba(102, 126, 234, 0.4);
backdrop-filter: blur(10px);
```
**Hover State:**
- Transform: `translateY(-2px)`
- Box Shadow: `0 10px 30px rgba(102, 126, 234, 0.2)`
- Border Color: `rgba(102, 126, 234, 0.6)`

#### Submit Button
```css
background: var(--primary-gradient);
padding: 1rem 2rem;
border-radius: 6px;
```

#### Filter Button
```css
background: linear-gradient(145deg,
    rgba(176, 176, 176, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.5) 100%);
padding: 1rem 2rem;
border-radius: 12px;
border: 2px solid rgba(176, 176, 176, 0.3);
```

### Form Elements

#### Input Fields
```css
padding: 0.75rem;
border: 2px solid transparent;
border-radius: 6px;
background-color: #ffffff;
```
**Focus State:**
- Border: `2px solid #667eea`
- Box Shadow: `0 0 0 3px rgba(102, 126, 234, 0.2)`

#### Textarea
- Min Height: `120px`
- Resize: `vertical`

### Cards

#### Project Card
```css
border-radius: 12px;
aspect-ratio: 16/9;
border: 2px solid rgba(255, 107, 107, 0.3);
```
**Glassmorphism Overlay:**
```css
background: linear-gradient(145deg,
    rgba(255, 107, 107, 0.08) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.15) 70%,
    rgba(0, 0, 0, 0.2) 100%);
backdrop-filter: blur(0.5px);
```

#### Skill Card
```css
background-color: #b0b0b0;
padding: 1.5rem;
border-radius: 12px;
```

#### Service Card
```css
background: var(--cyan-gradient);
padding: 2.5rem;
border-radius: 12px;
```

### Navigation

#### Desktop Nav
- Position: `fixed`
- Background: `#08090a`
- Backdrop Filter: `blur(10px)`
- Height: `80px`

#### Mobile Menu
- Full screen overlay
- Slide from right: `right: -100%` → `right: 0`
- Background: `#08090a`

#### Hamburger Menu
- Line Width: `25px`
- Line Height: `3px`
- Line Color: `#ffffff`
- Transform on active: Rotate lines to form X

### Before/After Comparison Widget

#### Container
```css
border-radius: 12px;
background: #000;
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
```

#### Slider Handle
```css
width: 44px;
height: 44px;
border-radius: 50%;
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 3px solid rgba(255, 255, 255, 0.8);
```

#### Slider Line
```css
width: 4px;
background: rgba(255, 255, 255, 0.8);
box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
```

---

## Visual Elements

### Border Radius Values

| Element | Value | Usage |
|---------|-------|-------|
| **Standard** | `12px` | Cards, sections, media |
| **Small** | `6px` | Buttons, inputs |
| **Medium** | `8px` | Small cards, badges |
| **Large** | `20px` | Tags, badges |
| **Round** | `50px` | CTA buttons |
| **Circle** | `50%` | Profile images, social links |

### Shadow Styles

#### Card Shadow
```css
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
```

#### Hover Shadow
```css
box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
```

#### Button Hover Shadow
```css
box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
```

#### Project Media Shadow
```css
box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
```

#### Before/After Container Shadow
```css
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
```

### Glassmorphism Effects

#### Standard Glass
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

#### Dark Glass
```css
background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(0, 0, 0, 0.7) 30%,
    rgba(0, 0, 0, 0.9) 70%,
    rgba(0, 0, 0, 0.95) 100%);
backdrop-filter: blur(15px);
```

### Text Effects

#### Text Shadow (Project Titles on Images)
```css
text-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.9),
    -1px -1px 3px rgba(0, 0, 0, 0.5),
    0 0 10px rgba(0, 0, 0, 0.8);
```

#### Gradient Text (Headers)
```css
background: linear-gradient(135deg, #ffffff 0%, #ff6b6b 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## Animation & Transitions

### Global Transition
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Patterns

#### Shimmer Effect (Skill Bars)
```css
@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
animation: shimmer 2s infinite;
```

#### Flash Animation (Cards)
On hover, a diagonal light flash sweeps across:
```css
background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
transform: translateX(-100%) → translateX(100%);
```

#### Hover Lift
```css
transform: translateY(-5px);
/* or */
transform: translateY(-2px);
/* or */
transform: translateY(-3px) scale(1.1);
```

### Interaction States

| Element | Default | Hover | Active/Focus |
|---------|---------|-------|--------------|
| **Button** | `translateY(0)` | `translateY(-2px)` | Scale down |
| **Card** | `translateY(0)` | `translateY(-5px)` | - |
| **Navigation Link** | Color: `#ffffff` | Color: `#667eea`, `translateY(-2px)` | - |
| **Social Link** | Scale: `1` | `translateY(-3px) scale(1.1)` | - |
| **Skill Card** | BG: `#b0b0b0` | BG: `#667eea`, `translateY(-3px)` | - |

### Timing Functions

| Name | Value | Usage |
|------|-------|-------|
| **Default** | `cubic-bezier(0.4, 0, 0.2, 1)` | Most animations |
| **Ease** | `ease` | Simple transitions |
| **Ease In Out** | `ease-in-out` | Skill bar animations |

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## Accessibility Features

- **Skip Links**: Hidden skip navigation link for keyboard users
- **ARIA Labels**: Proper ARIA attributes on interactive elements
- **Focus Indicators**: 3px solid accent blue outline with 2px offset
- **Keyboard Navigation**: Full keyboard support with Ctrl+Arrow navigation
- **Reduced Motion**: Respects user's motion preferences
- **Color Contrast**: Meets WCAG AA standards for text contrast

---

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Required CSS Features
- CSS Grid
- Flexbox
- Custom Properties (CSS Variables)
- Backdrop Filter
- Clamp() function
- Aspect Ratio

### Required JavaScript Features
- ES6+ syntax
- Intersection Observer API
- FormData API
- Array methods (forEach, filter, map)

---

## Design Principles

1. **Dark Theme First**: Built for dark environments with high contrast
2. **Glassmorphism**: Subtle glass effects for depth without distraction
3. **Performance**: Optimized animations with GPU acceleration
4. **Responsive**: Mobile-first approach with progressive enhancement
5. **Accessibility**: WCAG compliant with keyboard navigation
6. **Consistency**: Unified spacing scale and color system
7. **Visual Hierarchy**: Clear content structure with typography scale
8. **Interactive Feedback**: Smooth transitions and hover states

---

*Last Updated: 2025 | Version: 1.0*