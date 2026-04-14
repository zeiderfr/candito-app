---
name: ultime-animation
description: "Compétence animation ultime pour CANDITO PWA. Fusionne scroll-experience, animejs-animation, magic-ui-generator, tailwind-patterns (animations), hig-patterns et magic-animator. Couvre : micro-interactions, page transitions, Framer Motion, Anime.js, Tailwind CSS 4 @keyframes, performance 60fps, iOS HIG, accessibilité prefers-reduced-motion."
category: animation
risk: safe
source: "Synthèse de sickn33/antigravity-awesome-skills (scroll-experience, animejs-animation, magic-ui-generator, tailwind-patterns, hig-patterns, magic-animator)"
date_added: "2026-04-14"
---

# ULTIME ANIMATION — Compétence Animation pour CANDITO PWA

Compétence tout-en-un qui fusionne : `scroll-experience`, `animejs-animation`, `magic-ui-generator`, `tailwind-patterns` (animations), `hig-patterns` et `magic-animator`.

Couvre : micro-interactions, transitions de pages, Framer Motion, Anime.js, Tailwind CSS 4 `@keyframes`, performance 60fps, iOS HIG, `prefers-reduced-motion`.

---

## Quand utiliser

Activer cette compétence quand :

- Ajout d'un composant interactif (bouton, card, liste)
- Implémentation d'une transition entre pages ou états
- Création d'un feedback utilisateur (complétion, erreur, succès, PR)
- Loader, skeleton, splash screen
- Micro-interactions sur éléments fréquemment tapés (gym use)
- Révision d'une animation existante pour la polir ou la corriger
- Célébration d'un événement (nouveau record, semaine terminée)

**MANDATE ABSOLU** : JAMAIS construire d'animations basiques et ennuyeuses. Chaque animation doit être fluide, intentionnelle et premium. Pas d'`ease-in-out` générique — utiliser `spring`, `cubicBezier` ou des courbes personnalisées.

---

## 1. Stack recommandée

| Outil | Quand l'utiliser | Import |
|-------|-----------------|--------|
| **Framer Motion** | Tout composant React nécessitant des animations (transitions, hover, tap, layout, stagger) | `import { motion, AnimatePresence } from 'framer-motion'` |
| **Anime.js** | Séquences complexes multi-étapes, SVG path morphing, particules, compteurs | `import anime from 'animejs'` |
| **Tailwind CSS 4** | Micro-animations simples, shimmer, spin, ping, pulse — pas besoin de JS | Classes `animate-*` + `@keyframes` dans `index.css` |
| **CSS natif** | Transitions de couleur, opacity, transform simples — `transition-all duration-200` | `transition-*` Tailwind utilities |

**Règle d'or** : Tailwind → Framer Motion → Anime.js. Utiliser l'outil le plus simple qui fait le travail.

---

## 2. Principes de motion

### Durées

```
Micro-interaction (tap, check, hover)  : 100–200ms
Navigation, transition de composant    : 250–350ms
Entrée de page, modal                  : 350–500ms
Séquences complexes, célébrations      : 500–1000ms
Animations en boucle (loaders)         : ∞ avec easing fluide
```

### Easing

```javascript
// Réponse physique naturelle — préférer pour les interactions tactiles
spring: { type: "spring", stiffness: 400, damping: 30 }

// Sortie rapide — entrées de page
easeOut: [0.16, 1, 0.3, 1]   // expoOut

// Douce — transitions de couleur, opacité
ease: "easeInOut"

// JAMAIS pour du tactile : linear, ease-in, ease-in-out génériques
```

### Propriétés GPU-safe (ONLY these)

```
✅ transform (translateX, translateY, scale, rotate)
✅ opacity
✅ filter (blur — avec précaution)
✅ stroke-dashoffset (SVG)

❌ width, height, top, left, right, bottom
❌ padding, margin
❌ background-color (préférer opacity sur une couche)
❌ border-radius (à éviter sur des éléments animés rapidement)
```

---

## 3. Accessibilité — prefers-reduced-motion

Le projet a déjà ce bloc dans `index.css` — le respecter STRICTEMENT :

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

**Avec Framer Motion**, utiliser le hook `useReducedMotion()` pour les animations complexes :

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

**Règle** : L'animation ne doit JAMAIS être le seul moyen d'accéder à une information. Le contenu doit rester accessible sans mouvement.

---

## 4. iOS HIG Motion (Apple Human Interface Guidelines)

Règles clés pour une PWA iOS-first :

- **Feedback immédiat** : toute interaction doit répondre en < 100ms (même si l'action est plus longue)
- **Transitions seamless** : pas de flash, pas de jump — les éléments doivent "glisser" naturellement
- **Haptic-style sans haptics** : utiliser `scale(0.97) → scale(1.02) → scale(1)` pour simuler une frappe physique
- **Undo > Confirmation** : préférer une action réversible à une alerte modale
- **Pas de splash screens** : le splash doit disparaître dès que possible
- **Progressive disclosure** : révéler les détails en cascade, pas tout d'un coup

```tsx
// Pattern haptic-style pour un bouton gym
<motion.button
  whileTap={{ scale: 0.96 }}
  transition={{ type: "spring", stiffness: 500, damping: 25 }}
>
  Valider le set
</motion.button>
```

---

## 5. Patterns Tailwind CSS v4

### Animations built-in

```tsx
// Loader discret
<div className="animate-spin rounded-full border-2 border-accent border-t-transparent size-8" />

// Attention / notification
<span className="animate-ping absolute size-2 bg-accent rounded-full" />

// État de chargement sur un élément
<div className="animate-pulse bg-white/10 rounded-xl h-24" />

// Call to action
<button className="animate-bounce">↓</button>
```

### @keyframes custom dans index.css

Ajouter dans `@layer utilities` :

```css
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes slam {
  0%   { transform: scale(0.95); opacity: 0.7; }
  60%  { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); }
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

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

.animate-slam {
  animation: slam 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-fade-slide-up {
  animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## 6. Patterns Framer Motion

### Entrée de composant (fade + slide)

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

### AnimatePresence — transitions de pages directionnelles

```tsx
import { AnimatePresence, motion } from 'framer-motion'

const TAB_ORDER = ['accueil', 'warmup', 'programme', 'nutrition', 'progres']

function getDirection(from: string, to: string) {
  return TAB_ORDER.indexOf(to) > TAB_ORDER.indexOf(from) ? 1 : -1
}

// Dans App.tsx :
const [direction, setDirection] = useState(0)

// variants avec direction
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
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>{/* ... */}</motion.li>
  ))}
</motion.ul>
```

### Layout animation — indicateur de tab liquide

```tsx
// Dans BottomNav.tsx — pill glissant entre tabs
{isActive && (
  <motion.div
    layoutId="active-tab"
    className="absolute inset-0 bg-accent/15 rounded-xl"
    transition={{ type: "spring", stiffness: 380, damping: 30 }}
  />
)}
```

### useSpring + useTransform — dial/gauge animé

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

---

## 7. Patterns Anime.js

### Timeline multi-étapes — célébration PR

```typescript
import anime from 'animejs'

function triggerPRExplosion(containerEl: HTMLElement) {
  // Créer les particules dynamiquement
  const particles = Array.from({ length: 12 }, (_, i) => {
    const el = document.createElement('div')
    el.className = 'absolute size-2 rounded-full bg-accent pointer-events-none'
    containerEl.appendChild(el)
    return el
  })

  const tl = anime.timeline({
    complete: () => particles.forEach(p => p.remove())
  })

  tl
    // Flash du container
    .add({
      targets: containerEl,
      scale: [1, 1.04, 1],
      duration: 300,
      easing: 'spring(1, 80, 10, 0)'
    })
    // Explosion des particules
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

### Progress ring — stroke-dashoffset SVG

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
        ref={ringRef}
        cx="44" cy="44" r={radius}
        fill="none"
        stroke="#66bb6a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
      />
    </svg>
  )
}
```

### Compteur animé — weight slam counter

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

## 8. Performance

### Checklist avant de shipper une animation

- [ ] Animer **uniquement** `transform` et `opacity` (sauf cas SVG spécifiques)
- [ ] Ajouter `will-change: transform` sur les éléments animés en boucle (loaders)
- [ ] Retirer `will-change` après l'animation pour libérer la mémoire GPU
- [ ] Tester à 60fps sur iPhone (Safari Web Inspector → Performance)
- [ ] Vérifier que `AnimatePresence` dispose des `key` uniques sur chaque enfant
- [ ] Pas de re-renders inutiles déclenchés par l'animation (`useCallback`, `useMemo` si nécessaire)
- [ ] Pas de `layout shift` lors des animations layout Framer Motion

```css
/* Éléments animés en continu */
.animate-spin, .animate-ping {
  will-change: transform;
}

/* Retirer après animation (via JS) */
element.style.willChange = 'auto'
```

### contain: layout

Pour les stagger reveals de longues listes (Programme.tsx) :

```tsx
<motion.li style={{ contain: 'layout' }} variants={itemVariants}>
```

---

## 9. Anti-patterns — JAMAIS

- **JAMAIS** animer `width`, `height`, `top`, `left`, `right`, `bottom`
- **JAMAIS** > 300ms pour une micro-interaction (tap, check, hover)
- **JAMAIS** bloquer le scroll avec des animations
- **JAMAIS** d'animations sans fallback `prefers-reduced-motion`
- **JAMAIS** `linear` ou `ease-in` générique sur une interaction tactile
- **JAMAIS** oublier les `key` dans `AnimatePresence`
- **JAMAIS** `animate-bounce` ou `animate-ping` comme seul feedback — trop générique
- **JAMAIS** des animations qui créent du layout thrashing (`offsetHeight` + `style.height`)
- **JAMAIS** `setTimeout` pour séquencer des animations — utiliser `anime.timeline()` ou `transition.delay`

---

## 10. Catalogue CANDITO — Animations spécifiques à l'app

### Set Completion Slam — `Progres.tsx`

```tsx
// Bouton de validation d'un set : micro-bounce haptic-style
<motion.button
  whileTap={{ scale: 0.94 }}
  animate={isCompleted ? { scale: [1, 1.08, 1], backgroundColor: ['rgba(76,175,80,0.1)', 'rgba(76,175,80,0.25)', 'rgba(76,175,80,0.1)'] } : {}}
  transition={{ type: "spring", stiffness: 500, damping: 25 }}
>
  ✓
</motion.button>
```

### Tab Morphing Navigator — `BottomNav.tsx`

```tsx
// Pill liquide glissant entre les tabs (layoutId partagé entre tous les tabs)
{isActive && (
  <motion.span
    layoutId="tab-pill"
    className="absolute inset-0 rounded-xl bg-accent/10"
    transition={{ type: "spring", stiffness: 380, damping: 32 }}
  />
)}
```

### Page Slide Transitions — `App.tsx`

```tsx
// Slide directionnel selon l'index du tab
const TAB_ORDER: TabId[] = ['accueil', 'warmup', 'programme', 'nutrition', 'progres']
// direction = +1 (droite) ou -1 (gauche) selon l'index source/destination
```

### Shimmer Skeleton — Splash screen — `App.tsx`

```tsx
// Remplacer le spinner par des blocs skeleton
<div className="space-y-4">
  <div className="animate-shimmer h-32 rounded-2xl" />
  <div className="animate-shimmer h-24 rounded-2xl" />
  <div className="animate-shimmer h-20 rounded-2xl" />
</div>
```

### Stagger Week Reveal — `Programme.tsx`

```tsx
// Chaque card de semaine entre avec un décalage de 60ms
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }
```

### PR Explosion — `AthleteStats.tsx`

```tsx
// Déclenché quand un nouveau RM est sauvegardé (comparaison prev vs new)
const containerRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (isNewPR && containerRef.current) triggerPRExplosion(containerRef.current)
}, [isNewPR])
```

### Focus Mode Cinematic Enter — `FocusMode.tsx`

```tsx
// Entrée dramatique : scale + backdrop blur progressif
<AnimatePresence>
  {isFocusMode && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(12px)' }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* contenu */}
    </motion.div>
  )}
</AnimatePresence>
```

### Progress Ring Animated — `AthleteStats.tsx`

```tsx
// Anneau SVG qui se remplit au mount via Anime.js stroke-dashoffset
<ProgressRing pct={progressPct} />
```

### Weight Slam Counter — `Programme.tsx`, `NextSessionHero.tsx`

```tsx
// Compteur animé via Anime.js qui "monte" jusqu'à la charge calculée
const weightRef = useRef<HTMLSpanElement>(null)
useEffect(() => {
  if (weightRef.current) animateCounter(weightRef.current, 0, calculatedWeight)
}, [calculatedWeight])
```

---

## 11. Dépendances

```bash
# Dans /app/
npm install framer-motion animejs
npm install -D @types/animejs  # si types pas inclus
```

Packages :
- `framer-motion` — tab morphing, page transitions, set slam, RPE dial, focus mode, stagger
- `animejs` — PR explosion, progress ring SVG, weight counter

---

## Vérification (checklist de livraison)

- [ ] Build `npm run build` dans `/app/` sans erreurs TypeScript
- [ ] Test sur iPhone : toutes animations à 60fps (Safari Web Inspector)
- [ ] `prefers-reduced-motion: reduce` → animations coupées proprement
- [ ] Pas de flash/jump sur les transitions de pages
- [ ] `AnimatePresence` correctement keyed
- [ ] `will-change` nettoyé après animations one-shot
- [ ] Aucune animation ne bloque le scroll
