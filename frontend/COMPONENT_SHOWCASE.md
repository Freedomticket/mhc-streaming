# MHC Streaming CSS Component Showcase

## Overview
Complete guide to using the Dante-inspired CSS system across all three realms (Inferno, Purgatorio, Paradiso).

---

## 1. Buttons

### Primary Buttons
```html
<!-- Inferno -->
<button class="btn-inferno">Enter the Inferno</button>

<!-- Purgatorio -->
<button class="btn-purgatorio">Ascend Purgatorio</button>

<!-- Paradiso -->
<button class="btn-paradiso">Reach Paradiso</button>
```

### Secondary Buttons
```html
<button class="btn-secondary-inferno">Learn More</button>
<button class="btn-secondary-purgatorio">Explore</button>
<button class="btn-secondary-paradiso">Discover</button>
```

**Features:**
- Hover effects with scale/lift animations
- Active state feedback
- Realm-specific glow effects
- Smooth transitions

---

## 2. Cards

### Card Components
```html
<!-- Inferno Card -->
<div class="card-inferno">
  <h3 class="text-etched text-h3 mb-4">Dark Content</h3>
  <p>Content with fire glow on hover</p>
</div>

<!-- Purgatorio Card -->
<div class="card-purgatorio">
  <h3 class="text-ascend text-h3 mb-4">Rising Content</h3>
  <p>Glassmorphic card with mist effects</p>
</div>

<!-- Paradiso Card -->
<div class="card-paradiso">
  <h3 class="text-divine text-h3 mb-4">Divine Content</h3>
  <p>Radiant card with golden glow</p>
</div>
```

**Features:**
- Lift on hover
- Realm-specific border glows
- Smooth shadow transitions
- Backdrop blur effects (Purgatorio)

---

## 3. Forms

### Input Fields
```html
<!-- Inferno -->
<input type="text" class="input-inferno" placeholder="Enter your email..." />

<!-- Purgatorio -->
<input type="text" class="input-purgatorio" placeholder="Your username..." />

<!-- Paradiso -->
<input type="text" class="input-paradiso" placeholder="Search..." />
```

### Textarea
```html
<textarea class="textarea-inferno" placeholder="Your message..."></textarea>
<textarea class="textarea-purgatorio"></textarea>
<textarea class="textarea-paradiso"></textarea>
```

### Select Dropdown
```html
<select class="select-inferno">
  <option>Choose realm...</option>
  <option>Inferno</option>
  <option>Purgatorio</option>
  <option>Paradiso</option>
</select>
```

**Features:**
- Focus ring animations
- Glow effects on focus
- Backdrop blur (Purgatorio)
- Accessible focus states

---

## 4. Typography

### Text Styles
```html
<!-- Etched (Inferno) -->
<h1 class="text-etched text-h1">Abandon All Hope</h1>

<!-- Ascending (Purgatorio) -->
<h2 class="text-ascend text-h2">The Middle Way</h2>

<!-- Divine (Paradiso) -->
<h3 class="text-divine text-h3">Eternal Light</h3>
```

### Gradient Text
```html
<h1 class="gradient-text-inferno">Fire & Brimstone</h1>
<h1 class="gradient-text-purgatorio">Rising Through Mist</h1>
<h1 class="gradient-text-paradiso">Golden Paradise</h1>
```

### Text Shadows
```html
<p class="text-shadow-inferno">Glowing ember text</p>
<p class="text-shadow-purgatorio">Misty ethereal text</p>
<p class="text-shadow-paradiso">Divine radiant text</p>
```

---

## 5. Badges

```html
<span class="badge-inferno">LIVE</span>
<span class="badge-purgatorio">TRENDING</span>
<span class="badge-paradiso">FEATURED</span>
```

---

## 6. Links

```html
<a href="#" class="link-inferno">Explore Inferno</a>
<a href="#" class="link-purgatorio">Visit Purgatorio</a>
<a href="#" class="link-paradiso">Enter Paradiso</a>
```

---

## 7. Glassmorphism Effects

```html
<div class="glass-inferno p-6 rounded-lg">
  Dark glass overlay
</div>

<div class="glass-purgatorio p-6 rounded-lg">
  Misty glass overlay
</div>

<div class="glass-paradiso p-6 rounded-lg">
  Light glass overlay
</div>
```

---

## 8. Navigation

```html
<nav class="nav-inferno">
  <!-- Dark themed nav -->
</nav>

<nav class="nav-purgatorio">
  <!-- Gradient themed nav -->
</nav>

<nav class="nav-paradiso">
  <!-- Light themed nav -->
</nav>
```

**Features:**
- Backdrop blur
- Realm-specific borders
- Sticky positioning support

---

## 9. Layout Utilities

### Container
```html
<div class="container-responsive">
  <!-- Max-width content with responsive padding -->
</div>
```

### Gallery Grid
```html
<div class="grid-gallery">
  <!-- 1-4 columns responsive grid -->
</div>
```

### Masonry Grid
```html
<div class="grid-masonry">
  <!-- Pinterest-style masonry layout -->
</div>
```

---

## 10. Animations

### Available Animations
```html
<!-- Flicker (Inferno) -->
<div class="animate-flicker">Flickering fire</div>

<!-- Float -->
<div class="animate-float">Floating element</div>

<!-- Ascend (Purgatorio) -->
<div class="animate-ascend">Rising particles</div>

<!-- Orbit -->
<div class="animate-orbit">Orbiting element</div>

<!-- Radiate (Paradiso) -->
<div class="animate-radiate">Pulsing glow</div>

<!-- Shimmer -->
<div class="animate-shimmer">Shimmering effect</div>

<!-- Pulse Glow -->
<div class="animate-pulse-glow">Pulsing light</div>
```

---

## 11. Hover Effects

```html
<!-- Lift on hover -->
<div class="hover-lift">Lifts up</div>

<!-- Glow effects -->
<div class="hover-glow-inferno">Fire glow on hover</div>
<div class="hover-glow-paradiso">Golden glow on hover</div>
```

---

## 12. Realm Wrappers

### Full Page Realms
```html
<!-- Inferno Page -->
<div class="realm-inferno min-h-screen">
  <!-- Fire particle effects + dark theme -->
  <div class="container-responsive py-12">
    <!-- Your content -->
  </div>
</div>

<!-- Purgatorio Page -->
<div class="realm-purgatorio min-h-screen">
  <!-- Rising particles + gradient theme -->
  <div class="container-responsive py-12">
    <!-- Your content -->
  </div>
</div>

<!-- Paradiso Page -->
<div class="realm-paradiso min-h-screen">
  <!-- Divine light rays + radiant theme -->
  <div class="container-responsive py-12">
    <!-- Your content -->
  </div>
</div>
```

**Background Effects:**
- **Inferno**: Animated ember particles
- **Purgatorio**: Rising mist particles + wave effect
- **Paradiso**: Rotating light rays + radiant glow

---

## 13. Aspect Ratio Utilities

```html
<div class="aspect-video-card">16:9 ratio</div>
<div class="aspect-square-card">1:1 ratio</div>
<div class="aspect-portrait-card">3:4 ratio</div>
```

---

## 14. Scrollbar Utilities

```html
<!-- Smooth scrolling -->
<div class="scroll-smooth">...</div>

<!-- Hide scrollbar -->
<div class="hide-scrollbar overflow-auto">...</div>
```

---

## Example: Complete Gallery Item

```html
<div class="realm-inferno min-h-screen">
  <div class="container-responsive py-12">
    <h1 class="text-etched text-h1 mb-8 text-shadow-inferno">
      Featured Artists
    </h1>
    
    <div class="grid-gallery">
      <div class="card-inferno hover-lift">
        <div class="aspect-video-card bg-inferno-ash rounded mb-4">
          <img src="..." alt="..." class="w-full h-full object-cover rounded" />
        </div>
        <span class="badge-inferno mb-2">LIVE NOW</span>
        <h3 class="text-h3 mb-2">Artist Name</h3>
        <p class="text-inferno-muted mb-4">Genre • Location</p>
        <button class="btn-inferno w-full">Watch Now</button>
      </div>
    </div>
  </div>
</div>
```

---

## Color Palette Reference

### Inferno Colors
- `inferno-bg` - #0B0B0B
- `inferno-black` - #000000
- `inferno-charcoal` - #1A1A1A
- `inferno-ash` - #333333
- `inferno-smoke` - #666666
- `inferno-muted` - #6B6B6B
- `inferno-border` - rgba(255,255,255,0.06)

### Purgatorio Colors
- `purgatorio-top` - #111111
- `purgatorio-dark` - #2e2e2e
- `purgatorio-medium` - #808080
- `purgatorio-mist` - #C7C7C7
- `purgatorio-fog` - #B8B8B8
- `purgatorio-light` - #e0e0e0
- `purgatorio-bottom` - #EDEDED

### Paradiso Colors
- `paradiso-bg` - #FFFFFF
- `paradiso-pearl` - #F5F5F5
- `paradiso-crystal` - #EFEFEF
- `paradiso-platinum` - #E5E5E5
- `paradiso-silver` - #C0C0C0
- `paradiso-gold` - #FFD700
- `paradiso-ink` - #0B0B0B

---

## Performance Notes

1. **Animations**: All animations use GPU-accelerated properties (transform, opacity)
2. **Backdrop blur**: May impact performance on low-end devices
3. **Z-indexing**: Realm effects use z-index 0, content uses z-index 1
4. **Pointer events**: Background effects have `pointer-events: none` for performance

---

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (backdrop-filter requires -webkit- prefix)
- Mobile: Tested on iOS Safari and Chrome Android

---

## Accessibility

- All focus states have visible rings
- Color contrast meets WCAG AA standards
- Animations respect `prefers-reduced-motion` (recommended to add)
- Semantic HTML recommended for all components
