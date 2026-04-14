---
name: design-system
description: "Système de design ultime pour PWA dark fitness. Fusionne direction artistique, tokens couleur, typographie, composants, accessibilité, glassmorphism et Tailwind v4. Source de vérité visuelle pour tout travail UI dans le projet."
category: design
risk: safe
source: "Fusion : ULTIME UI-UX + Design expert + UX Pro Max + sickn33/antigravity-awesome-skills (frontend-ui-dark-ts, tailwind-design-system, core-components, tailwind-patterns)"
date_added: "2026-04-14"
tags: [ui, ux, design, tailwind, react, accessibility, glassmorphism, dark-mode, components]
---

# DESIGN SYSTEM — Direction Artistique & Composants

Système de design complet pour le projet : tokens couleur, typographie, composants, patterns d'interaction, accessibilité, et direction artistique.

---

## PARTIE 1 — Direction Artistique

### Identité visuelle du projet

**Esthétique :** Minimalisme fonctionnel dark + glassmorphism premium
- Fond quasi-noir, éléments en glass translucide
- Contrastes forts : white sur dark, accents rouges (danger/effort) et verts (succès/deload)
- Interfaces aérées : whitespace généreux, pas de surcharge informationnelle
- Tonalité : sérieux, athlétique, précis — pas ludique, pas coloré

**Direction imposée (non négociable) :**
- JAMAIS de gradients décoratifs
- JAMAIS d'emojis comme icônes → Lucide React uniquement
- JAMAIS de couleurs aléatoires → système de tokens défini ci-dessous
- JAMAIS de designs cookie-cutter "AI slop"
- Un seul accent color par vue

### Process de décision avant de coder

1. **Objectif** — Quel problème résout cette interface pour l'athlète en salle ?
2. **Ton** — Rester dans : minimaliste, glassmorphism, dark, athlétique
3. **Contraintes** — Touch-first, portrait mobile, 90s de repos disponibles
4. **Différenciation** — Qu'est-ce qui rend cette vue mémorable ?

---

## PARTIE 2 — Tokens Couleur

### CSS Variables (index.css)

```css
:root {
  /* Surfaces */
  --color-background: #0a0a0a;
  --color-surface: rgba(255, 255, 255, 0.04);
  --color-surface-hover: rgba(255, 255, 255, 0.07);

  /* Accents */
  --color-accent: #FF3B30;          /* Rouge — effort, danger, CTA principal */
  --color-accent-success: #34C759;  /* Vert — deload, succès, PR */
  --color-accent-muted: rgba(255, 59, 48, 0.1); /* Background badge accent */

  /* Texte */
  --color-text: #ffffff;
  --color-muted: #86868B;
  --color-tertiary: #AEAEB2;

  /* Bordures */
  --color-border: rgba(255, 255, 255, 0.07);
  --color-border-active: rgba(255, 255, 255, 0.15);
}
```

### Tailwind classes sémantiques

```tsx
// Fond principal
"bg-background"          // #0a0a0a

// Cards/glass
"glass"                  // bg-white/4 + backdrop-blur
"bg-white/4"             // card dark standard
"bg-white/8"             // card hover state

// Accents
"text-accent"            // rouge
"bg-accent"              // bouton rouge plein
"bg-accent/10"           // badge background accent
"text-[#34C759]"         // vert succès

// Texte
"text-white"             // principal
"text-muted"             // secondaire #86868B
"text-white/40"          // tertiaire/disabled

// Bordures
"border-border"          // rgba(255,255,255,0.07)
"border-white/15"        // bordure active
```

### Règles contraste (obligatoires)

- Texte normal : ratio 4.5:1 minimum (WCAG AA)
- Grande typographie (≥18px bold) : 3:1 minimum
- La couleur ne doit JAMAIS être le seul indicateur d'état
- Dark mode : jamais `bg-white/10` sur fond noir → trop transparent, utiliser ≥ `bg-white/4`

---

## PARTIE 3 — Typographie

### Police

**Inter** (400, 600, 700) — chargée via Google Fonts ou bundle local.

### Règles obligatoires

```css
/* Headings */
h1, h2, h3 {
  text-wrap: balance;
  font-weight: 700;
}

/* Body */
p, li {
  text-wrap: pretty;
  line-height: 1.5;
}

/* Données numériques */
.data-numeric {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
```

### Échelle typographique Tailwind

```tsx
// Titre de page
"text-2xl font-bold text-white"

// Titre de section (caps label)
"text-xs font-bold uppercase tracking-widest text-muted"

// Corps principal
"text-sm text-white"              // 14px — contenu dense
"text-base text-white"            // 16px — body standard

// Corps secondaire
"text-[11px] text-muted"          // labels, captions
"text-[10px] font-bold uppercase tracking-widest"  // micro-labels

// Données
"text-2xl font-bold tabular-nums text-white"   // poids, RM
"text-4xl font-bold tabular-nums text-white"   // hero metric
```

### Interdictions

- JAMAIS modifier `letter-spacing` sauf pour les labels caps (tracking-widest sur uppercase)
- JAMAIS `font-size < 16px` sur les inputs (zoom iOS)
- Longueur de ligne : 65–75 caractères max sur desktop

---

## PARTIE 4 — Glassmorphism & Effets

### Pattern glass standard

```css
.glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
```

### Variantes Tailwind

```tsx
// Card glassmorphique standard
"bg-white/4 backdrop-blur-xl rounded-xl border border-border"

// Card premium (plus visible)
"bg-white/6 backdrop-blur-2xl rounded-2xl border border-white/10"

// Overlay modal
"bg-black/60 backdrop-blur-sm"

// Input glass
"bg-white/5 border border-border rounded-input focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
```

### Règles glassmorphism

- `backdrop-filter` JAMAIS animé (GPU cost énorme)
- Fond minimum : `bg-white/4` (jamais `bg-white/1` ou `bg-white/2` → invisible)
- Ombre intérieure subtile (optionnelle) : `shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`
- Toujours inclure `border` pour définir les bords du verre

---

## PARTIE 5 — Composants Référence

### Card standard

```tsx
// Container universel pour les sections de l'app
<div className="glass rounded-xl px-5 py-4 border border-border">
  <div className="flex items-center gap-3 mb-3">
    <div className="size-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
      <Icon size={16} />
    </div>
    <h3 className="text-sm font-semibold text-white">Titre</h3>
  </div>
  {/* contenu */}
</div>
```

### Bouton principal (accent)

```tsx
<button className="
  inline-flex items-center justify-center gap-2
  px-5 py-3 rounded-full
  bg-accent text-white text-sm font-semibold
  hover:bg-accent/90 active:scale-[0.97]
  transition-all duration-150
  cursor-pointer
  min-h-[44px]  // Apple HIG touch target
">
  Action
</button>
```

### Bouton secondaire (ghost)

```tsx
<button className="
  text-[10px] font-bold uppercase tracking-widest
  text-accent hover:text-white
  transition-colors duration-200 cursor-pointer
">
  Label
</button>
```

### Bouton ghost muted (fermer, secondary action)

```tsx
<button className="text-muted hover:text-white transition-colors duration-200 cursor-pointer p-1 -m-1">
  <X size={16} />
</button>
```

### Badge / Tag

```tsx
// Accent badge
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
  Label
</span>

// Neutre badge
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 text-white/60 text-[10px] font-semibold">
  Label
</span>
```

### Input texte/nombre

```tsx
<input
  type="number"
  inputMode="decimal"
  className="
    w-full bg-white/5 border border-border rounded-lg
    px-4 py-3 text-base text-white placeholder-white/30
    focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60
    transition-colors duration-200
  "
  // IMPORTANT : text-base (16px) minimum → pas de zoom iOS
/>
```

### Section header (label caps)

```tsx
<div className="flex items-center justify-between mb-3">
  <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
    Titre de section
  </h2>
  <button className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors duration-200 cursor-pointer">
    Action
  </button>
</div>
```

### Stat card (KPI)

```tsx
// Pattern pour afficher une métrique clé
<div className="glass rounded-xl px-4 py-3 border border-border">
  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">Label</p>
  <p className="text-2xl font-bold tabular-nums text-white">123 kg</p>
  <p className="text-[11px] text-muted mt-0.5">Sous-label ou delta</p>
</div>
```

### Slide-up panel (bottom sheet)

```tsx
<div className="
  fixed bottom-0 left-0 right-0 z-50
  px-6 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]
  bg-surface/95 backdrop-blur-xl rounded-t-[24px]
  border-t border-border
  animate-in slide-in-from-bottom-4 duration-300
">
  {/* Drag handle */}
  <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
  {/* contenu */}
</div>
```

---

## PARTIE 6 — Layout & Responsive

### Règles obligatoires

- `viewport meta` : `width=device-width, initial-scale=1, viewport-fit=cover`
- JAMAIS de scroll horizontal involontaire
- Tester à 375px (iPhone SE), 390px (iPhone 14), 430px (iPhone 14 Plus)
- `min-h-dvh` au lieu de `min-h-screen` (iOS Safari aware)
- Z-index sur échelle fixe : 10, 20, 30, 40, 50, 60

### Navbar bottom fixe (tab bar)

```tsx
// Toujours avec safe area inset bottom
<nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]">
  {/* tabs */}
</nav>
```

### Page content padding

```tsx
// Tenir compte de la bottom nav (≈ 60px + safe area)
<main className="px-4 pt-4 pb-28">
  {/* contenu */}
</main>
```

---

## PARTIE 7 — Accessibilité

### Règles obligatoires (WCAG AA)

```tsx
// Boutons icon-only → aria-label obligatoire
<button aria-label="Fermer la modal">
  <X size={16} />
</button>

// Images significatives → alt descriptif
<img src="..." alt="Schéma technique du squat" />

// Formulaires → label + htmlFor
<label htmlFor="weight-input" className="text-sm text-muted">Poids (kg)</label>
<input id="weight-input" type="number" ... />

// Focus visible sur tous les éléments interactifs
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1"
```

### Touch targets (Apple HIG)

- Taille minimum : **44×44px** pour tout élément tappable
- Pour les petits visuels, étendre la zone de tap avec padding négatif :

```tsx
// Visual : icône 16px | Zone de tap : 44px
<button className="p-3 -m-1 cursor-pointer">
  <Icon size={16} />
</button>
```

---

## PARTIE 8 — Interaction & Hover States

```tsx
// Transition standard sur hover (couleur/opacité seulement)
"hover:bg-white/8 transition-colors duration-200"
"hover:text-white transition-colors duration-200"

// JAMAIS de scale sur hover (layout shift)
// ❌ "hover:scale-105"

// Feedback tap (Framer Motion)
<motion.button whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>

// Disabled state
"opacity-40 pointer-events-none"

// Loading state bouton
"opacity-60 cursor-wait"
```

---

## PARTIE 9 — Icônes

Toujours **Lucide React** — set cohérent, taille fixe, stroke uniforme.

```tsx
import { Dumbbell, CheckCircle, X, ChevronRight, Bell, Download } from 'lucide-react'

// Tailles standards
<Icon size={16} />   // dans les badges, boutons ghost
<Icon size={20} />   // dans les cards header, navs
<Icon size={24} />   // icônes standalone

// JAMAIS mixer avec d'autres sets (pas d'Heroicons, pas d'emojis)
```

---

## PARTIE 10 — Checklist Pré-Livraison

### Visuel
- [ ] Aucun emoji utilisé comme icône (SVG/Lucide uniquement)
- [ ] Tous les icônes Lucide, même taille dans un même contexte
- [ ] Direction artistique cohérente (dark + glass + red accent)
- [ ] Hover states sans layout shift

### Typographie
- [ ] `text-wrap: balance` sur les headings
- [ ] `tabular-nums` sur toutes les données chiffrées
- [ ] Inputs : `text-base` ou plus (≥16px — anti-zoom iOS)

### Interaction
- [ ] `cursor-pointer` sur tous les éléments cliquables
- [ ] Transitions 150–200ms pour le feedback tap
- [ ] `focus-visible` présent sur tous les interactifs
- [ ] Touch targets ≥ 44px

### Layout
- [ ] Pas de scroll horizontal sur iPhone 375px
- [ ] Z-index sur échelle fixe (jamais `z-[999]`)
- [ ] `min-h-dvh` (pas `min-h-screen`)
- [ ] Safe area bottom gérée dans les composants fixed

### Accessibilité
- [ ] `aria-label` sur tous les boutons icon-only
- [ ] `alt` descriptif sur les images
- [ ] `label` + `htmlFor` sur les formulaires
- [ ] Contraste texte ≥ 4.5:1
- [ ] `prefers-reduced-motion` respecté

### Performance
- [ ] JAMAIS `backdrop-filter` animé
- [ ] JAMAIS `will-change` permanent (seulement pendant animation)
- [ ] JAMAIS animer `width`, `height`, `top`, `left`
