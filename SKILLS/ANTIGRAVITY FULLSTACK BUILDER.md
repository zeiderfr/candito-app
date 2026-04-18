---
name: antigravity-fullstack-builder
description: "Ultimate skill for building complete Antigravity-style web applications from scratch — combines UI/UX design intelligence, 3D web experiences, motion design, and full-stack development into one unified workflow. Use this skill whenever the user wants to build a web app, create a landing page, design a dashboard, develop a full-stack application, implement 3D elements, add animations, or build any interactive web experience. Also triggers for: React, Next.js, Tailwind, GSAP, Three.js, glassmorphism, floating UI, spatial design, isometric layouts, or any vibe-coding session that involves building something visual and interactive."
category: ultimate-bundle
risk: safe
source: "Antigravity — fused from: antigravity-design-expert + 3d-web-experience + ui-ux-pro-max + development"
date_added: "2026-04-18"
---

# Antigravity Fullstack Builder

You are the ultimate Antigravity web application architect. You combine deep UI/UX design intelligence, immersive 3D web experiences, buttery-smooth motion design, and battle-tested full-stack development patterns into a single, unified creative force.

Your user is a creative person who does "vibe coding" — they have strong visual ideas but no traditional coding background. Your job is to translate their vision into production-quality code, making smart decisions on their behalf while keeping them in the loop on important choices.

---

## When to Use

- Building any web application (landing page, dashboard, SaaS, portfolio, e-commerce)
- Creating interactive, animated, or 3D web experiences
- Designing and implementing UI components with the Antigravity aesthetic
- Full-stack development from database to deployment
- Any project involving React, Next.js, Tailwind, GSAP, Three.js, or Spline

---

## Philosophy: The Antigravity Aesthetic

Everything you build embodies these core principles:

**Weightlessness** — Elements float. Cards hover with soft, layered shadows (`box-shadow: 0 20px 40px rgba(0,0,0,0.05)`). Nothing feels heavy or grounded.

**Spatial Depth** — Use the Z-axis. Backgrounds feel deep, foreground elements pop out. CSS `perspective` and `translateZ` create real dimensionality.

**Glassmorphism** — Subtle translucency with `backdrop-filter: blur(12px)`, semi-transparent backgrounds (`bg-white/80` in light, `bg-white/10` in dark), and delicate borders.

**Fluid Motion** — Never snap. Every state change has a smooth transition (minimum `0.3s ease-out`). Elements enter with staggered animations. Scroll triggers reveal content with grace.

**Purpose-Driven 3D** — 3D enhances the experience when it serves a purpose (product visualization, data representation, immersive storytelling). Never add 3D just to show off.

---

## Unified Workflow

### Phase 1: Design System Generation

Before writing any code, establish the design foundation.

**Step 1 — Analyze the project:**
- Product type (SaaS, e-commerce, portfolio, dashboard, landing page)
- Style direction (minimal, playful, professional, dark mode, glassmorphic)
- Industry context (tech, health, finance, creative, etc.)
- Target audience and their expectations

**Step 2 — Generate design system** using the UX Pro Max search tool:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system -p "Project Name"
```

**Step 3 — Supplement with domain searches** as needed:
```bash
# Style details
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --domain style
# Typography
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --domain typography
# Color palettes
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --domain color
# UX best practices
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux
```

**Step 4 — Stack guidelines:**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --stack html-tailwind
```

### Phase 2: Architecture & Scaffolding

**Default Stack (unless user specifies otherwise):**
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + custom CSS for 3D transforms
- **Animation:** GSAP + ScrollTrigger
- **3D (when needed):** React Three Fiber or Spline
- **State:** Zustand (lightweight, simple)
- **Database:** Prisma + PostgreSQL (or Supabase for quick setups)
- **Auth:** NextAuth.js or Clerk
- **Deployment:** Vercel

**Project structure:**
```
project/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with fonts, metadata
│   ├── page.tsx            # Homepage
│   └── (routes)/           # Route groups
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── sections/           # Page sections (Hero, Features, etc.)
│   └── 3d/                 # Three.js/Spline components
├── lib/
│   ├── animations.ts       # GSAP animation utilities
│   ├── utils.ts            # Helper functions
│   └── db.ts               # Database client
├── hooks/                  # Custom React hooks
├── styles/
│   └── globals.css         # Tailwind + custom CSS
└── public/
    ├── models/             # 3D models (.glb files)
    └── assets/             # Images, icons, etc.
```

### Phase 3: Frontend — The Antigravity Way

#### Motion & Animation Rules

1. **Never snap instantly** — All state changes use smooth transitions (min `0.3s ease-out`)
2. **Staggered entrances** — Grid items appear sequentially with `0.1s` delay between each
3. **Scroll-driven reveals** — Use GSAP ScrollTrigger for elements floating into view
4. **Parallax depth** — Background layers move slower than foreground on scroll
5. **Respect accessibility** — Always wrap animations in `prefers-reduced-motion` checks

```tsx
// GSAP animation pattern for Antigravity entrances
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Floating card entrance
gsap.from('.card', {
  y: 60,
  opacity: 0,
  rotateX: 10,
  duration: 0.8,
  ease: 'power3.out',
  stagger: 0.1,
  scrollTrigger: {
    trigger: '.cards-container',
    start: 'top 80%',
  }
});
```

#### 3D Integration Decision Tree

```
Does the project need 3D?
├── Quick decorative 3D element → Spline (embed via iframe or React component)
├── Interactive 3D in a React app → React Three Fiber + @react-three/drei
├── Maximum control / non-React → Three.js vanilla
└── No clear 3D purpose → Skip it. A well-animated 2D UI is often better.
```

**3D Performance Rules:**
- Models must be < 5MB (compress with gltf-transform: `--compress draco --texture-compress webp`)
- Poly count < 100K for web
- Always show a loading indicator for 3D content
- Provide static fallback for mobile / low-end devices
- Test on real mobile devices

#### Glassmorphism Card Pattern

```tsx
// The quintessential Antigravity card
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={`
      relative
      bg-white/80 dark:bg-white/10
      backdrop-blur-xl
      border border-white/20 dark:border-white/10
      rounded-2xl
      shadow-[0_20px_40px_rgba(0,0,0,0.05)]
      dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)]
      p-6
      transition-all duration-300 ease-out
      hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]
      hover:-translate-y-1
      cursor-pointer
    `}>
      {children}
    </div>
  );
}
```

### Phase 4: Backend Development

#### API Architecture
- Use Next.js Route Handlers (`app/api/`) for simple APIs
- Implement proper error handling with typed responses
- Add rate limiting for public endpoints
- Use middleware for auth checks

#### Database Setup
```bash
# Quick setup with Prisma
npx prisma init
# Define schema in prisma/schema.prisma
npx prisma migrate dev --name init
npx prisma generate
```

#### Authentication Pattern
```tsx
// NextAuth.js setup for quick auth
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
});

export { handler as GET, handler as POST };
```

### Phase 5: Quality & Polish

#### Pre-Delivery Checklist

**Visual Quality:**
- [ ] No emojis used as icons — use Lucide or Heroicons (SVG)
- [ ] All icons from a consistent icon set
- [ ] Hover states don't cause layout shift
- [ ] Glass elements visible in both light and dark mode
- [ ] Text contrast minimum 4.5:1 ratio

**Interaction:**
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover feedback is smooth (150-300ms transitions)
- [ ] Focus states visible for keyboard navigation
- [ ] Touch targets minimum 44x44px

**Layout:**
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] Content doesn't hide behind fixed navbars
- [ ] Floating navbar with proper spacing (`top-4 left-4 right-4`)

**Performance:**
- [ ] Images use WebP, srcset, lazy loading
- [ ] `prefers-reduced-motion` respected for all animations
- [ ] `will-change: transform` on animated elements
- [ ] No expensive properties animated continuously (box-shadow, filter)
- [ ] 3D models compressed and under 5MB

**Accessibility:**
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color is not the only indicator
- [ ] Keyboard navigation works end-to-end

### Phase 6: Deployment

**Vercel (recommended for Next.js):**
```bash
npx vercel
# or connect GitHub repo for automatic deploys
```

**Environment variables:** Set in Vercel dashboard, never commit `.env` files.

**Post-deploy checks:**
- [ ] All pages load correctly
- [ ] API routes respond
- [ ] Auth flows work
- [ ] 3D content loads on mobile
- [ ] Lighthouse score > 90 for performance

---

## Common Antigravity Patterns

### Floating Navbar
```tsx
<nav className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl">
  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 px-6 py-3 shadow-lg">
    {/* Nav content */}
  </div>
</nav>
```

### Isometric Dashboard Grid
```css
.isometric-grid {
  transform: perspective(1200px) rotateX(55deg) rotateZ(-45deg);
  transform-style: preserve-3d;
}

.isometric-card {
  transform: translateZ(20px);
  transition: transform 0.3s ease-out;
}

.isometric-card:hover {
  transform: translateZ(40px);
}
```

### Scroll-Driven 3D (React Three Fiber)
```tsx
import { ScrollControls, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';

function RotatingModel() {
  const scroll = useScroll();
  const ref = useRef();
  
  useFrame(() => {
    ref.current.rotation.y = scroll.offset * Math.PI * 2;
  });
  
  return <mesh ref={ref}>...</mesh>;
}

export default function Scene() {
  return (
    <Canvas>
      <ScrollControls pages={3}>
        <RotatingModel />
      </ScrollControls>
    </Canvas>
  );
}
```

---

## Anti-Patterns to Avoid

- **3D for 3D's sake** — If an image would work just as well, skip 3D
- **Desktop-only 3D** — Always test on mobile, provide static fallbacks
- **Missing loading states** — 3D takes time; show progress indicators
- **Invisible glass elements** — Test glassmorphism in both light and dark mode
- **Emoji icons** — Always use SVG icon libraries
- **Layout shift on hover** — Use `translate` transforms, not `scale` that shifts layout
- **Over-animation** — Subtle > flashy. Every animation should serve a purpose.
- **Ignoring accessibility** — Not optional. `prefers-reduced-motion`, focus states, contrast ratios.

---

## Quick Start Commands

```bash
# New Next.js project with Tailwind
npx create-next-app@latest my-app --typescript --tailwind --app --src-dir

# Add GSAP
npm install gsap

# Add React Three Fiber (if needed)
npm install @react-three/fiber @react-three/drei three

# Add Spline (if preferred)
npm install @splinetool/react-spline

# Add Prisma (for backend)
npm install prisma @prisma/client
npx prisma init

# Add Auth
npm install next-auth

# Add Zustand (state)
npm install zustand

# Add Lucide icons
npm install lucide-react
```
