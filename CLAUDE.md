# TropiGo Design System Rules

## Project Overview
- **Type**: Mobile-first React web app (PWA-ready)
- **Framework**: React 19.2.0 + Vite 7.2.4
- **Router**: TanStack Router 1.140.5
- **State Management**: TanStack Query 5.90.12
- **Styling**: Vanilla CSS (mobile-first, no CSS framework yet)

---

## 1. Design Tokens

### Location
Currently none defined. When implementing Figma designs, create:
- `apps/ui/src/styles/tokens.css` - CSS custom properties

### Structure (to be created)
```css
/* apps/ui/src/styles/tokens.css */
:root {
  /* Colors */
  --color-primary: #00A8E8;
  --color-secondary: #F26419;
  --color-background: #FFFFFF;
  --color-text: #1A1A1A;
  --color-text-secondary: #666666;

  /* Spacing (mobile-first, 4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

---

## 2. Component Library

### Location
`apps/ui/src/components/` (to be created)

### Structure
```
apps/ui/src/components/
├── ui/              # Base UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── layout/          # Layout components
│   ├── Container.tsx
│   └── Grid.tsx
└── features/        # Feature-specific components
    ├── ActivityCard.tsx
    └── ExperienceVideo.tsx
```

### Component Pattern
```tsx
// apps/ui/src/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} button--${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

---

## 3. Frameworks & Libraries

### UI Framework
- **React 19.2.0** - Modern React with automatic batching
- **JSX Runtime**: `react-jsx` (automatic, no import React needed)

### Routing
- **TanStack Router 1.140.5** - File-based routing
- Routes in: `apps/ui/src/routes/`
- Pattern: `apps/ui/src/routes/explore.tsx` → `/explore`

### Data Fetching
- **TanStack Query 5.90.12** - Server state management
- API calls in: `apps/ui/src/api/`

### Build System
- **Vite 7.2.4** - Fast dev server and bundler
- **Bun** - Runtime and package manager

---

## 4. Asset Management

### Location
```
apps/ui/public/       # Static assets (accessible via /filename)
apps/ui/src/assets/   # Build-time assets (imported in code)
```

### Usage
```tsx
// Static assets (in public/)
<img src="/logo.png" alt="Logo" />

// Build-time assets (in src/assets/)
import logo from '@/assets/logo.png'
<img src={logo} alt="Logo" />
```

### Optimization
- Use WebP for images when possible
- Lazy load images below the fold
- Use `loading="lazy"` attribute

---

## 5. Icon System

### Approach
Use inline SVG or SVG sprites. No icon library installed yet.

### Pattern
```tsx
// apps/ui/src/components/icons/Heart.tsx
export function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="..." fill="currentColor" />
    </svg>
  )
}
```

---

## 6. Styling Approach

### Methodology
**Vanilla CSS with BEM-like naming**

### Location
- Global styles: `apps/ui/src/index.css`
- Component styles: Co-located with components or in `apps/ui/src/styles/`

### Pattern
```css
/* Component-specific styles */
.activity-card {
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.activity-card__image {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.activity-card__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}
```

### Mobile-First Responsive
```css
/* Mobile first (default) */
.container {
  padding: var(--space-4);
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
    max-width: 1280px;
    margin: 0 auto;
  }
}
```

---

## 7. Project Structure

### Current Organization
```
apps/ui/
├── src/
│   ├── routes/           # TanStack Router file-based routes
│   │   ├── __root.tsx    # Root layout
│   │   ├── index.tsx     # Home page (/)
│   │   ├── explore.tsx   # Explore page (/explore)
│   │   └── maldy/        # Maldy AI (/maldy)
│   ├── api/              # API client functions
│   │   └── experiences.ts
│   ├── components/       # Reusable components (to be created)
│   ├── styles/           # Global styles (to be created)
│   ├── main.tsx          # App entry point
│   └── index.css         # Global CSS
├── public/               # Static assets
└── package.json
```

### Route Pattern
```tsx
// apps/ui/src/routes/explore.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explore')({
  component: ExplorePage,
})

function ExplorePage() {
  return <div>Explore content</div>
}
```

---

## 8. Figma → Code Guidelines

### When Converting Figma Designs

1. **Extract design tokens first**
   - Colors → CSS variables in `tokens.css`
   - Spacing → Use 4px base spacing scale
   - Typography → Define font sizes and weights

2. **Create components bottom-up**
   - Start with atomic components (Button, Card)
   - Build up to composed components (ActivityCard, ExperienceCard)
   - Finally create page layouts

3. **Mobile-first approach**
   - Implement mobile design first (default CSS)
   - Add responsive breakpoints for tablet/desktop

4. **Use semantic HTML**
   - `<button>` for clickable actions
   - `<a>` for navigation links
   - Proper heading hierarchy (`<h1>`, `<h2>`, etc.)

5. **Accessibility**
   - Always include `alt` text for images
   - Use `aria-label` for icon buttons
   - Ensure sufficient color contrast

6. **Performance**
   - Lazy load images below fold
   - Use `loading="lazy"` for images
   - Avoid layout shifts with aspect-ratio or explicit dimensions

---

## 9. Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `ActivityCard.tsx`)
- Routes: `kebab-case.tsx` (e.g., `explore.tsx`)
- Utils: `camelCase.ts` (e.g., `formatPrice.ts`)

### CSS Classes
- BEM-like: `block__element--modifier`
- Example: `activity-card__image--featured`

### Variables
- React: `camelCase`
- CSS custom properties: `--kebab-case`

---

## 10. Code Style

### TypeScript
```tsx
// Use interfaces for props
interface ActivityCardProps {
  title: string
  price: number
  imageUrl: string
}

// Use destructuring
export function ActivityCard({ title, price, imageUrl }: ActivityCardProps) {
  return (
    <div className="activity-card">
      <img src={imageUrl} alt={title} />
      <h3>{title}</h3>
      <p>{formatPrice(price)}</p>
    </div>
  )
}
```

### Imports
```tsx
// React imports
import { useState, useEffect } from 'react'

// Third-party imports
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

// Internal imports
import { ActivityCard } from '@/components/features/ActivityCard'
import { formatPrice } from '@tropigo/utils'

// Styles (if separate)
import './explore.css'
```

---

## 11. PWA Readiness

### Manifest Location
`apps/ui/public/manifest.json`

### Service Worker
To be added later with Vite PWA plugin

### Mobile Optimizations
- Viewport meta tag in index.html
- Touch-friendly tap targets (min 44x44px)
- Prevent zoom on inputs
- iOS-specific meta tags for add to home screen

---

## Quick Reference

### File to Create for Figma Design
1. Extract colors/spacing → `apps/ui/src/styles/tokens.css`
2. Create components → `apps/ui/src/components/`
3. Create route → `apps/ui/src/routes/explore.tsx`
4. Add styles → Component-level or `apps/ui/src/styles/explore.css`

### Command to Run
```bash
bun run dev  # Start dev server at localhost:8070
```
