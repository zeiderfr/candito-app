---
name: motion-design
description: "Compétence animation ultime pour PWA fitness React. Fusionne micro-interactions, page transitions, Framer Motion, Anime.js, Tailwind @keyframes, scroll experiences, iOS HIG motion, et performance 60fps. Couvre chaque surface animée du projet avec des patterns prêts à l'emploi."
category: animation
risk: safe
source: "Fusion : ULTIME ANIMATION + sickn33/antigravity-awesome-skills (scroll-experience, animejs-animation, hig-patterns)"
date_added: "2026-04-14"
tags: [animation, framer-motion, animejs, tailwind, ios, performance, scroll, micro-interactions]
---

# MOTION DESIGN — Animation & Interactions

Compétence tout-en-un pour les animations du projet. Couvre : micro-interactions, transitions de pages, Anime.js, Framer Motion, Tailwind CSS 4 `@keyframes`, scroll experiences, iOS HIG, performance 60fps, et `prefers-reduced-motion`.

**MANDAT ABSOLU** : JAMAIS d'animations basiques. Chaque mouvement doit être fluide, intentionnel, et premium. Pas d'`ease-in-out` générique — toujours `spring`, `cubicBezier`, ou courbes calibrées.

---

## PARTIE 1 — Stack & Règle d'Or

| Outil | Quand l'utiliser |
|-------|-----------------|
| **Tailwind CSS 4** | Micro-animations simples : shimmer, spin, ping, pulse |
| **CSS natif** | Transitions color/opacity/transform : `transition-all duration-200` |
| **Framer Motion** | Composants React : hover, tap, layout, stagger, page transitions |
| **Anime.js** | Séquences multi-étapes, SVG stroke, particules, compteurs animés |

**Règle d'or → escalader : CSS → Framer Motion → Anime.js**
Utiliser l'outil le plus simple qui fait le travail.

---

## PARTIE 2 — Système de Motion

### Durées

```
Micro-interaction (tap, check, hover)   : 100–200ms
Composant entrant, transition           : 250–350ms
Entrée de page, modal                   : 350–500ms
Séquences complexes, célébrations       : 500–1000ms
Boucles (loaders, shimmer)              : ∞ avec easing fluide
```

### Easing de référence

```javascript
// Réponse physique — interactions tactiles (tap, check)
spring: { type: "spring", stiffness: 400, damping: 30 }

// Spring rapide — boutons, chips
springSnappy: { type: "spring", stiffness: 500, damping: 25 }

// Expo out — entrées de page, modals
easeOut: [0.16, 1, 0.3, 1]

// Doux — transitions couleur, opacité
ease: "easeInOut"

// JAMAIS : linear, ease-in, ease-in-out générique pour du tactile
```

### Propriétés GPU-safe (SEULEMENT ces propriétés)

```
✅ transform (translateX, translateY, scale, rotate)
✅ opacity
✅ stroke-dashoffset (SVG)
✅ filter blur — avec extrême précaution (jamais animé en continu)

❌ width, height, top, left, right, bottom
❌ padding, margin
❌ background-color (préférer opacity sur un overlay)
❌ border-radius (à éviter sur éléments animés rapidement)
```

---

## PARTIE 3 — Accessibilité (prefers-reduced-motion)

**Obligatoire dans index.css — ne pas retirer :**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Avec Framer Motion :**

```tsx
import { useReducedMotion } from 'framer-motion'

function AnimatedCard() {
  const reduce = useReducedMotion()
  const variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    visible: { opacity: 1, y: 0 }
  }
  return <motion.div variants={variants} initial="hidden" animate="visible" />
}
```

**Règle** : L'animation ne doit JAMAIS être le seul moyen d'accéder à une information.

---

## PARTIE 4 — iOS HIG Motion

Règles pour une PWA iOS-first :

- **Feedback immédiat** : toute interaction répond en < 100ms (même si l'action est plus longue)
- **Transitions seamless** : pas de flash, pas de jump — les éléments "glissent" naturellement
- **Haptic-style** : simuler une frappe physique avec `scale(0.97) → scale(1.02) → scale(1)`
- **Undo > Confirmation** : préférer action réversible à alerte modale bloquante
- **Progressive disclosure** : révéler les détails en cascade, pas tout d'un coup

```tsx
// Pattern haptic-style standard pour bouton gym (tap physique)
<motion.button
  whileTap={{ scale: 0.96 }}
  transition={{ type: "spring", stiffness: 500, damping: 25 }}
>
  Valider le set
</motion.button>
```

---

## PARTIE 5 — Tailwind CSS v4 Animations

### Built-in Tailwind

```tsx
// Loader discret
<div className="animate-spin rounded-full border-2 border-accent border-t-transparent size-8" />

// Attention / notification ping
<span className="animate-ping absolute size-2 bg-accent rounded-full" />

// Skeleton loading
<div className="animate-pulse bg-white/10 rounded-xl h-24" />

// CTA scroll
<button className="animate-bounce">↓</button>
```

### @keyframes custom dans index.css

```css
/* Shimmer pour skeletons */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* Entrée slam (nouveau PR, completion) */
@keyframes slam {
  0%   { transform: scale(0.95); opacity: 0.7; }
  60%  { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); }
}

/* Fade + slide up */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Compteur slot machine */
@keyframes countUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 0%,
    rgba(255,255,255,0.10) 50%,
    rgba(255,255,255,0.04) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

.animate-slam     { animation: slam 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.animate-fade-up  { animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
```

---

## PARTIE 6 — Patterns Framer Motion

### Entrée de page (fade + slide)

```tsx
import { motion } from 'framer-motion'

const pageVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } }
}

export function Page() {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit">
      {/* contenu */}
    </motion.div>
  )
}
```

### Transitions de pages directionnelles (tab bar)

```tsx
import { AnimatePresence, motion } from 'framer-motion'

const TAB_ORDER = ['accueil', 'warmup', 'programme', 'nutrition', 'progres']

const slideVariants = {
  enter: (d: number) => ({ x: d * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d * -40, opacity: 0 })
}

<AnimatePresence custom={direction} mode="wait">
  <motion.div
    key={activeTab}
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
  >
    {renderContent()}
  </motion.div>
</AnimatePresence>
```

### Stagger reveal — listes de cards

```tsx
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
}

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants} style={{ contain: 'layout' }}>
      {/* ... */}
    </motion.li>
  ))}
</motion.ul>
```

### Layout animation — pill de navigation liquide

```tsx
// Dans BottomNav.tsx — pill glissant entre tabs (layoutId partagé)
{isActive && (
  <motion.div
    layoutId="active-tab"
    className="absolute inset-0 bg-accent/15 rounded-xl"
    transition={{ type: "spring", stiffness: 380, damping: 30 }}
  />
)}
```

### useSpring + useTransform — dial RPE animé

```tsx
import { useSpring, useTransform, motion } from 'framer-motion'

function RPEDial({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 200, damping: 20 })
  const rotate  = useTransform(spring, [1, 10], [-135, 135])
  const hue     = useTransform(spring, [1, 10], [120, 0]) // vert → rouge

  return (
    <motion.div style={{ rotate }} className="...">
      {/* aiguille */}
    </motion.div>
  )
}
```

### AnimatePresence — modals, slide-up panels

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* contenu panel */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## PARTIE 7 — Patterns Anime.js

### Timeline multi-étapes — célébration nouveau PR

```typescript
import anime from 'animejs'

function triggerPRExplosion(containerEl: HTMLElement) {
  const particles = Array.from({ length: 12 }, () => {
    const el = document.createElement('div')
    el.className = 'absolute size-2 rounded-full bg-accent pointer-events-none'
    containerEl.appendChild(el)
    return el
  })

  const tl = anime.timeline({
    complete: () => particles.forEach(p => p.remove())
  })

  tl
    .add({
      targets: containerEl,
      scale: [1, 1.04, 1],
      duration: 300,
      easing: 'spring(1, 80, 10, 0)'
    })
    .add({
      targets: particles,
      translateX: () => anime.random(-80, 80),
      translateY: () => anime.random(-80, 30),
      opacity: [1, 0],
      scale: [1, 0],
      duration: 700,
      delay: anime.stagger(40),
      easing: 'easeOutExpo'
    }, '-=200')
}
```

### Progress ring SVG — stroke-dashoffset

```tsx
function ProgressRing({ pct }: { pct: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const ringRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!ringRef.current) return
    anime({
      targets: ringRef.current,
      strokeDashoffset: [circumference, circumference * (1 - pct / 100)],
      duration: 1200,
      delay: 200,
      easing: 'spring(1, 60, 10, 0)'
    })
  }, [pct])

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
      <circle
        ref={ringRef} cx="44" cy="44" r={radius}
        fill="none" stroke="#34C759" strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
      />
    </svg>
  )
}
```

### Compteur animé — poids calculé

```typescript
function animateCounter(el: HTMLElement, from: number, to: number) {
  anime({
    targets: { value: from },
    value: to,
    round: 2.5, // arrondi au 2.5kg
    duration: 600,
    easing: 'easeOutExpo',
    update(anim) {
      el.textContent = String(anim.animations[0].currentValue) + ' kg'
    }
  })
}
```

---

## PARTIE 8 — Scroll Experience

### Quand utiliser des scroll animations

- Sections narratives (présentation du programme semaine par semaine)
- Révéler des éléments de progression au scroll
- Jamais pour la navigation principale

### Reveal au scroll — Framer Motion (React)

```tsx
import { motion, useInView } from 'framer-motion'

function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

### Parallax léger — GSAP ScrollTrigger

```typescript
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Fond bouge plus lentement (effet de profondeur)
gsap.to('.bg-element', {
  yPercent: -20,
  ease: 'none',
  scrollTrigger: {
    trigger: '.section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  }
})
```

### Règles scroll mobile

- Réduire l'intensité du parallax sur mobile (0.2x max)
- Désactiver sur appareils peu performants (utiliser `matchMedia`)
- Toujours GPU accelerer : `transform: translateZ(0)` sur les éléments trackés
- Tester sur iPhone réel (Safari scroll inertia diffère du desktop)
- Fallback statique obligatoire si JS échoue

---

## PARTIE 9 — Catalogue CANDITO — Animations spécifiques

### Set Completion Slam

```tsx
// Validation d'un set : micro-bounce haptic-style + changement d'état
<motion.button
  whileTap={{ scale: 0.94 }}
  animate={isCompleted
    ? { scale: [1, 1.08, 1], backgroundColor: ['rgba(76,175,80,0.1)', 'rgba(76,175,80,0.25)', 'rgba(76,175,80,0.1)'] }
    : {}}
  transition={{ type: "spring", stiffness: 500, damping: 25 }}
>
  ✓
</motion.button>
```

### Shimmer Skeleton — Chargement initial

```tsx
<div className="space-y-4">
  <div className="animate-shimmer h-32 rounded-2xl" />
  <div className="animate-shimmer h-24 rounded-2xl" />
  <div className="animate-shimmer h-20 rounded-2xl" />
</div>
```

### Focus Mode Cinematic Enter

```tsx
<AnimatePresence>
  {isFocusMode && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
    >
      {/* contenu focus mode */}
    </motion.div>
  )}
</AnimatePresence>
```

### Stagger Semaine Reveal — Programme.tsx

```tsx
// Chaque card de semaine entre avec 60ms de décalage
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
```

### PR Explosion — AthleteStats.tsx

```tsx
const containerRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (isNewPR && containerRef.current) triggerPRExplosion(containerRef.current)
}, [isNewPR])
```

---

## PARTIE 10 — Performance

### Checklist avant de livrer une animation

- [ ] Animer **uniquement** `transform` et `opacity` (sauf SVG stroke)
- [ ] `will-change: transform` sur les éléments animés EN BOUCLE seulement
- [ ] Retirer `will-change` après animation one-shot pour libérer GPU
- [ ] Tester à 60fps sur iPhone (Safari Web Inspector → Performance)
- [ ] `AnimatePresence` : chaque enfant a une `key` unique
- [ ] Pas de re-renders déclenchés par les animations (useCallback/useMemo)
- [ ] `contain: 'layout'` sur les items de stagger reveal
- [ ] JAMAIS de `setTimeout` pour séquencer → utiliser `anime.timeline()` ou `transition.delay`

---

## PARTIE 11 — Anti-patterns

- **JAMAIS** animer `width`, `height`, `top`, `left`, `right`, `bottom`
- **JAMAIS** > 300ms pour une micro-interaction (tap, check, hover)
- **JAMAIS** bloquer le scroll avec des animations
- **JAMAIS** d'animations sans fallback `prefers-reduced-motion`
- **JAMAIS** `linear` ou `ease-in` sur une interaction tactile
- **JAMAIS** oublier les `key` dans `AnimatePresence`
- **JAMAIS** `animate-bounce` ou `animate-ping` comme seul feedback
- **JAMAIS** animer `backdrop-filter` en continu (GPU cost énorme)
- **JAMAIS** de scroll hijacking agressif qui empêche la navigation naturelle

---

## Dépendances

```bash
# Dans /app/
npm install framer-motion animejs
```

- `framer-motion` — tab morphing, page transitions, set slam, RPE dial, focus mode, stagger
- `animejs` — PR explosion, progress ring SVG, weight counter, timelines complexes
