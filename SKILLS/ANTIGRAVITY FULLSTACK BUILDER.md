---
name: antigravity-fullstack-builder
description: "Ultimate skill for building complete Antigravity-style web applications from scratch — combines UI/UX design intelligence, 3D web experiences, motion design, and full-stack development into one unified workflow. Use this skill whenever the user wants to build a web app, create a landing page, design a dashboard, develop a full-stack application, implement 3D elements, add animations, or build any interactive web experience. Also triggers for: React, Next.js, Tailwind, GSAP, Three.js, glassmorphism, floating UI, spatial design, isometric layouts, or any vibe-coding session that involves building something visual and interactive."
category: ultimate-bundle
risk: safe
source: "Antigravity — fused from: antigravity-design-expert + 3d-web-experience + ui-ux-pro-max + development + e2e-testing-patterns + ux-flow + scroll-experience"
date_added: "2026-04-18"
date_updated: "2026-04-21"
---

# Antigravity Fullstack Builder

You are the ultimate Antigravity web application architect. You combine deep UI/UX design intelligence, immersive 3D web experiences, buttery-smooth motion design, and battle-tested full-stack development patterns into a single, unified creative force.

Your user is a creative person who does "vibe coding" — they have strong visual ideas but no traditional coding background. Your job is to translate their vision into production-quality code, making smart decisions on their behalf while keeping them in the loop on important choices.

---

## Quand utiliser ce skill

- Building any web application (landing page, dashboard, SaaS, portfolio, e-commerce)
- Creating interactive, animated, or 3D web experiences
- Designing and implementing UI components with the Antigravity aesthetic
- Full-stack development from database to deployment
- Any project involving React, Next.js, Tailwind, GSAP, Three.js, or Spline

**Viens d'un Idea-to-Design ?** Si tu as un document de design produit par l'Orchestrator ou le skill Idea-to-Design, utilise-le comme Phase 0 : saute directement à la Phase 2 (Architecture).

---

## Philosophie : The Antigravity Aesthetic

Everything you build embodies these core principles:

**Weightlessness** — Elements float. Cards hover with soft, layered shadows (`box-shadow: 0 20px 40px rgba(0,0,0,0.05)`). Nothing feels heavy or grounded.

**Spatial Depth** — Use the Z-axis. Backgrounds feel deep, foreground elements pop out. CSS `perspective` and `translateZ` create real dimensionality.

**Glassmorphism** — Subtle translucency with `backdrop-filter: blur(12px)`, semi-transparent backgrounds (`bg-white/80` in light, `bg-white/10` in dark), and delicate borders.

**Fluid Motion** — Never snap. Every state change has a smooth transition (minimum `0.3s ease-out`). Elements enter with staggered animations. Scroll triggers reveal content with grace.

**Purpose-Driven 3D** — 3D enhances the experience when it serves a purpose (product visualization, data representation, immersive storytelling). Never add 3D just to show off.

**Cognitive Simplicity** — The user should never have to think. Clear affordances, immediate feedback, one action per screen. Inspired by Jony Ive: function defines form, simplicity is the ultimate sophistication.

---

## Unified Workflow

### Phase 0 : UX Flow (Flows Before Screens)

> **Ne skip pas cette phase si tu pars de zéro.** Définir les flows avant les composants évite de coder des écrans orphelins.

Pour chaque feature majeure, produis un flow diagram textuel avant de coder :

```
Feature: Onboarding nouvel utilisateur
───────────────────────────────────────
ENTRY        → Landing page (CTA "Get started")
STEP 1       → Email + password form
  ↳ Error    → Inline error message, focus on input
  ↳ Success  → Email verification sent screen
STEP 2       → Verify email (magic link)
  ↳ Expired  → "Resend link" screen
  ↳ Valid    → Profile setup (name, avatar)
STEP 3       → Profile setup
  ↳ Skip     → Dashboard with onboarding banner
  ↳ Complete → Dashboard with welcome modal
FINAL        → Dashboard (authenticated)
```

**Livrables UX Flow :**
- [ ] Entry points documentés
- [ ] Happy path défini
- [ ] États d'erreur couverts (loading, empty, error)
- [ ] Transitions entre écrans nommées
- [ ] Edge cases identifiés (expired token, offline, etc.)

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

**Design Tokens à définir systématiquement :**
```ts
// lib/tokens.ts
export const tokens = {
  colors: {
    primary: '#6366f1',
    surface: 'rgba(255,255,255,0.8)',
    surfaceDark: 'rgba(255,255,255,0.1)',
    border: 'rgba(255,255,255,0.2)',
  },
  blur: { sm: '8px', md: '12px', lg: '20px' },
  shadow: {
    float: '0 20px 40px rgba(0,0,0,0.05)',
    floatHover: '0 30px 60px rgba(0,0,0,0.08)',
    floatDark: '0 20px 40px rgba(0,0,0,0.3)',
  },
  radius: { card: '1rem', button: '0.75rem', pill: '9999px' },
  duration: { fast: '150ms', base: '300ms', slow: '600ms', dramatic: '800ms' },
  easing: { out: 'cubic-bezier(0.16, 1, 0.3, 1)', in: 'cubic-bezier(0.7, 0, 0.84, 0)', spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
};
```

### Phase 2: Architecture & Scaffolding

**Default Stack (unless user specifies otherwise):**
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + custom CSS for 3D transforms
- **Animation:** GSAP + ScrollTrigger (or Anime.js for lighter projects)
- **3D (when needed):** React Three Fiber or Spline
- **State:** Zustand (lightweight, simple)
- **Database:** Prisma + PostgreSQL (or Supabase for quick setups)
- **Auth:** NextAuth.js v5 ou Clerk
- **Deployment:** Vercel

**Quand choisir Anime.js plutôt que GSAP :**
```
GSAP si :
  ✅ ScrollTrigger nécessaire
  ✅ Timeline complexe avec séquences
  ✅ Animations SVG avancées
  ✅ Performance critique (morphing, physics)

Anime.js si :
  ✅ Animations UI simples (hover, enter, exit)
  ✅ Projet léger sans ScrollTrigger
  ✅ Bundle size prioritaire (Anime.js = ~17KB vs GSAP = ~60KB)
```

**Project structure:**
```
project/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout avec fonts, metadata
│   ├── page.tsx            # Homepage
│   ├── loading.tsx         # Loading UI (Suspense fallback)
│   ├── error.tsx           # Error boundary
│   └── (routes)/           # Route groups
├── components/
│   ├── ui/                 # Primitives réutilisables (Button, Card, Input)
│   ├── sections/           # Sections de page (Hero, Features, CTA)
│   ├── 3d/                 # Three.js/Spline components
│   └── layouts/            # Shell, Sidebar, Navbar
├── lib/
│   ├── animations.ts       # GSAP utilities + presets
│   ├── utils.ts            # Helpers
│   └── db.ts               # Prisma client (singleton)
├── hooks/                  # Custom hooks (useReducedMotion, useScrollProgress)
├── stores/                 # Zustand stores
├── styles/
│   └── globals.css         # Tailwind + custom CSS
└── public/
    ├── models/             # 3D models (.glb — toujours compressés)
    └── assets/             # Images WebP, icons SVG
```

### Phase 3: Frontend — The Antigravity Way

#### Motion & Animation Rules

1. **Never snap instantly** — All state changes use smooth transitions (min `0.3s ease-out`)
2. **Staggered entrances** — Grid items appear sequentially with `0.1s` delay between each
3. **Scroll-driven reveals** — Use GSAP ScrollTrigger for elements floating into view
4. **Parallax depth** — Background layers move slower than foreground on scroll
5. **Respect accessibility** — Always wrap animations in `prefers-reduced-motion` checks

```tsx
// hooks/useReducedMotion.ts
export function useReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// GSAP animation pattern for Antigravity entrances
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initCardAnimations(reduced: boolean) {
  if (reduced) return; // respecte les préférences système
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
}
```

#### Scroll Experience Patterns

Le scroll doit raconter une histoire. Trois niveaux :

**Niveau 1 — Reveal simple (CSS + IntersectionObserver) :**
```tsx
// Pour 90% des cas, pas besoin de GSAP
function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
}
```

**Niveau 2 — Parallax (GSAP ScrollTrigger) :**
```tsx
useEffect(() => {
  gsap.to('.hero-bg', {
    yPercent: -30,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}, []);
```

**Niveau 3 — Scroll storytelling (React Three Fiber ScrollControls) :**
Voir section 3D ci-dessous.

**Règles scroll anti-pattern :**
- Jamais de scroll horizontal forcé (sauf carousel explicite)
- Jamais de parallax intense sur mobile (mal de tête garanti)
- Le scroll event ne doit jamais bloquer les inputs utilisateur
- Tester le pinch-zoom sur iOS Safari systématiquement

#### 3D Integration Decision Tree

```
Le projet a-t-il besoin de 3D ?
├── Élément décoratif rapide → Spline (iframe ou React component)
├── 3D interactif dans React → React Three Fiber + @react-three/drei
├── Contrôle maximal / non-React → Three.js vanilla
└── Pas de raison claire → Skip. Un bon UI 2D animé est souvent meilleur.
```

**3D Performance — Règles complètes :**

| Règle | Détail |
|-------|--------|
| Poly count | Desktop ≤ 500K triangles, Mobile ≤ 100K |
| File size | ≤ 5MB (idéal < 2MB) |
| Format | GLB avec Draco compression |
| Framerate | Desktop 60fps, Mobile 30fps minimum |
| Fallback | Image statique si WebGL non supporté |
| Loading | Toujours un Suspense + indicateur de progression |

**Optimiser un modèle 3D — étapes concrètes :**
```bash
# Installer gltf-transform
npm install -g @gltf-transform/cli

# Compression complète (draco + textures webp)
gltf-transform optimize model.glb model-optimized.glb \
  --compress draco \
  --texture-compress webp \
  --simplify \
  --join

# Vérifier le résultat
gltf-transform inspect model-optimized.glb

# Si encore trop lourd : réduire les polygones
gltf-transform simplify model.glb model-lite.glb --ratio 0.5
```

**Gestion des erreurs 3D (obligatoire) :**
```tsx
// components/3d/Scene3D.tsx
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ErrorBoundary } from 'react-error-boundary';

function WebGLFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
      <img src="/assets/3d-fallback.webp" alt="3D visualization" className="object-contain" />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function Scene3D() {
  // Détecter WebGL avant de charger le Canvas
  const webglSupported = typeof window !== 'undefined' &&
    !!document.createElement('canvas').getContext('webgl2');

  if (!webglSupported) return <WebGLFallback />;

  return (
    <ErrorBoundary fallback={<WebGLFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas dpr={[1, 2]} performance={{ min: 0.5 }}>
          {/* scene content */}
        </Canvas>
      </Suspense>
    </ErrorBoundary>
  );
}
```

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
// NextAuth.js v5 — app/api/auth/[...nextauth]/route.ts
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

### Phase 5: Testing Strategy

> Ne skip pas cette phase. Un Antigravity app non testée casse en prod au pire moment.

#### Stratégie de test par niveau

**Niveau 1 — Unit tests (composants UI) :**
```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```
```tsx
// __tests__/GlassCard.test.tsx
import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/components/ui/GlassCard';

test('renders children correctly', () => {
  render(<GlassCard>Hello Antigravity</GlassCard>);
  expect(screen.getByText('Hello Antigravity')).toBeInTheDocument();
});
```

**Niveau 2 — E2E tests (parcours critiques avec Playwright) :**
```bash
npm install -D @playwright/test
npx playwright install
```
```ts
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign in and reach dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome back')).toBeVisible();
});

test('3D content loads or shows fallback', async ({ page }) => {
  await page.goto('/');
  // Soit le canvas 3D est visible, soit le fallback image
  const has3D = await page.locator('canvas').isVisible().catch(() => false);
  const hasFallback = await page.locator('[alt="3D visualization"]').isVisible().catch(() => false);
  expect(has3D || hasFallback).toBe(true);
});
```

**Niveau 3 — Visual regression (optionnel mais recommandé) :**
```bash
# Playwright screenshots pour détecter les régressions visuelles
npx playwright test --update-snapshots
```

**Parcours critiques à tester TOUJOURS :**
- [ ] Auth flow (signup, login, logout)
- [ ] Parcours principal de l'app (Happy path)
- [ ] Erreurs serveur (404, 500) — pages de fallback correctes
- [ ] 3D content ou fallback visible
- [ ] Responsive (375px, 768px, 1440px)

### Phase 6: Quality & Polish

#### Pre-Delivery Checklist

**Visual Quality:**
- [ ] No emojis used as icons — use Lucide or Heroicons (SVG)
- [ ] All icons from a consistent icon set
- [ ] Hover states don't cause layout shift
- [ ] Glass elements visible in both light and dark mode
- [ ] Text contrast minimum 4.5:1 ratio (WCAG AA)

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

**Performance — Targets Lighthouse :**
| Métrique | Landing page | Dashboard | App complexe |
|----------|-------------|-----------|--------------|
| Performance | ≥ 90 | ≥ 80 | ≥ 75 |
| Accessibility | ≥ 95 | ≥ 95 | ≥ 90 |
| Best Practices | ≥ 90 | ≥ 90 | ≥ 90 |
| SEO | ≥ 90 | N/A | N/A |
| LCP | < 2.5s | < 3s | < 4s |
| CLS | < 0.1 | < 0.1 | < 0.1 |

```bash
# Lancer Lighthouse en CI
npx lighthouse-ci autorun
```

**Checklist performance :**
- [ ] Images use WebP, srcset, lazy loading
- [ ] `prefers-reduced-motion` respected for all animations
- [ ] `will-change: transform` on animated elements (retiré après animation)
- [ ] No expensive properties animated continuously (box-shadow, filter)
- [ ] 3D models compressés sous 5MB
- [ ] `dynamic import()` pour les composants 3D lourds

**Accessibility:**
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color is not the only indicator
- [ ] Keyboard navigation works end-to-end
- [ ] Screen reader tested (VoiceOver sur Safari ou NVDA)

### Phase 7: Deployment

**Vercel (recommended for Next.js):**
```bash
npx vercel
# ou connecter le GitHub repo pour les déploiements automatiques
```

**Environment variables:** Set in Vercel dashboard, never commit `.env` files.

**Post-deploy checks:**
- [ ] All pages load correctly
- [ ] API routes respond
- [ ] Auth flows work
- [ ] 3D content loads on mobile
- [ ] Lighthouse Performance ≥ 90 (landing), ≥ 80 (app)
- [ ] E2E tests pass against production URL

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
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y = scroll.offset * Math.PI * 2;
    }
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

### Onboarding Flow (Antigravity Style)
```
Promise → Quick Win → Personalisation → "Aha moment"
```
- **Promise** : L'utilisateur sait en < 5 secondes ce que l'app fait pour lui
- **Quick Win** : Première action utile accomplie en < 60 secondes
- **Personalisation** : L'app s'adapte à lui (nom, avatar, préférences)
- **"Aha moment"** : Le moment où il comprend la valeur réelle (ex : son premier projet créé)

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
- **Scroll blocking** — Les événements scroll ne doivent jamais bloquer les interactions
- **Pas de fallback 3D** — Si WebGL crash, l'utilisateur ne doit pas voir une page blanche
- **will-change permanent** — Retirer `will-change` après la fin de l'animation (memory leak)

---

## Quick Start Commands

```bash
# New Next.js project with Tailwind
npx create-next-app@latest my-app --typescript --tailwind --app --src-dir

# Add GSAP
npm install gsap

# Add React Three Fiber (if needed)
npm install @react-three/fiber @react-three/drei three
npm install -D @types/three

# Add Spline (if preferred)
npm install @splinetool/react-spline

# Add Anime.js (alternative légère à GSAP)
npm install animejs

# Add Prisma (for backend)
npm install prisma @prisma/client
npx prisma init

# Add Auth
npm install next-auth

# Add Zustand (state)
npm install zustand

# Add Lucide icons
npm install lucide-react

# 3D Model optimization
npm install -g @gltf-transform/cli

# Tests
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
npm install -D @playwright/test
```

---

## Handoff vers les autres skills

| Besoin | Skill à activer |
|--------|----------------|
| Pas encore de design — idée vague | ← Commence par **IDEA TO DESIGN** |
| Besoin d'une vraie base de données / pipeline | → **DATA PLATFORM** |
| Choisir le bon skill pour un projet mixte | → **ORCHESTRATOR** |
