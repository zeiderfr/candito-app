---
name: iphone-pwa-adaptation
description: "Compétence ultime pour adapter une PWA React/Tailwind aux dimensions et comportements iOS iPhone. Couvre : safe area insets (notch, Dynamic Island, home indicator), viewport CSS, touch targets (Apple HIG 44×44pt), tap highlight, overscroll bounce, input zoom iOS, GPU compositing scroll, fixed elements overlay. Fusionne hig-patterns (touch targets, design language), building-native-ui (safe area strategy, flexbox), tailwind-patterns (mobile-first, dvh), scroll-experience (GPU layers, iOS momentum)."
category: mobile
risk: safe
source: "Synthèse de sickn33/antigravity-awesome-skills (hig-patterns, building-native-ui, tailwind-patterns, scroll-experience) + expertise iOS web/PWA/CSS env()"
date_added: "2026-04-13"
---

# iPhone PWA Adaptation — Compétence Ultime

Compétence tout-en-un pour **adapter une PWA React/Tailwind aux contraintes iPhone** : safe areas, touch behavior, input, scroll, performance GPU, et éléments fixed.

## Quand utiliser

- Adapter une PWA installable sur iPhone (standalone mode)
- Corriger le flash gris sur les boutons, le bounce de fond, le zoom automatique sur les inputs
- Gérer la safe area du notch, Dynamic Island et home indicator
- Rendre les éléments `fixed` (bottom sheets, overlays) conscients de la safe area
- Optimiser le scroll et les animations pour 60fps sur iOS

---

## 1. Fondations HTML — Viewport & Meta Tags

### Meta indispensables

```html
<!-- viewport-fit=cover : active env(safe-area-inset-*) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

<!-- PWA standalone sur iOS -->
<meta name="apple-mobile-web-app-capable" content="yes">

<!-- black-translucent : status bar transparent, overlay sur le contenu -->
<!-- Nécessite padding-top: env(safe-area-inset-top) pour pousser le contenu dessous -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

<!-- Icône iOS home screen -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

### Comparatif status-bar-style

| Valeur | Barre | Contenu | Utilisation |
|---|---|---|---|
| `default` | Blanche | Sombre | App light |
| `black` | Noire | Clair | Rare |
| `black-translucent` | Transparente (overlay) | Clair | **Dark apps — nécessite safe area CSS** |

---

## 2. CSS Fondations — index.css

### Pattern complet iOS-ready

```css
@layer base {
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;  /* Supprime le flash gris iOS au tap */
    touch-action: manipulation;                 /* Supprime le délai 300ms (double-tap zoom) */
  }

  body {
    min-height: 100dvh;                        /* dvh = dynamic viewport height (iOS Safari aware) */
    padding-top: env(safe-area-inset-top);     /* Pousse sous notch/Dynamic Island en standalone */
    overscroll-behavior: none;                 /* Empêche le bounce derrière l'app */
  }

  /* Prevents iOS auto-zoom on input focus — font-size < 16px déclenche un zoom viewport */
  input, select, textarea {
    font-size: max(16px, 1em);
  }

  button, a, [role="button"] {
    cursor: pointer;
    touch-action: manipulation;                /* Redondant avec * mais explicit */
  }
}
```

### Pourquoi `100dvh` et pas `100vh`

- `vh` sur iOS Safari = hauteur avec la barre d'adresse visible → overflow quand elle se cache
- `dvh` = taille dynamique qui s'adapte à la barre d'adresse → correct pour les apps

### Pourquoi supprimer `padding-bottom: env(safe-area-inset-bottom)` du body

- Le body ajoute de l'espace au bas de la page = scroll area inutilement plus grande
- Pour les apps avec BottomNav `fixed`, la safe area est mieux gérée directement sur le nav
- Garde uniquement `padding-top` sur le body (pour l'overlay status bar)

---

## 3. Safe Area — Stratégie par type d'élément

### Principe (from building-native-ui skill)
"Always account for safe area — both top and bottom."

| Type d'élément | Stratégie | Pourquoi |
|---|---|---|
| `body` (document flow) | `padding-top: env(safe-area-inset-top)` | Pousse tout le contenu sous le status bar |
| `fixed bottom-0` (BottomNav) | `pb-[env(safe-area-inset-bottom)]` | Pad icons au-dessus du home indicator |
| `fixed inset-0` (overlays) | Gérer sa propre safe area top | Ignore le padding du body |
| Contenu principal (main) | Breathing room visuel seulement | Body gère déjà la safe area top |
| Slide-up panel `fixed bottom-0` | `pb-[max(2.5rem,env(safe-area-inset-bottom))]` | Min visuel + home indicator |

### Fixed `inset-0` — Pattern safe area avec inline style

```tsx
// ❌ Mauvais : pt-14 (56px) < Dynamic Island (59px) → contenu coupé
<div className="fixed inset-0 pt-14">

// ✅ Correct : max() garantit au moins le padding visuel OU la safe area si plus grande
<div
  className="fixed inset-0"
  style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top))' }}
>
```

### Slide-up panel bottom — Pattern

```tsx
// ✅ Minimum 40px (pb-10) OU la safe area du home indicator (34px iPhone 15)
<div className="fixed bottom-0 left-0 right-0 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
```

### CSS utility custom (Tailwind v4 @theme)

```css
/* Dans index.css — si utilisé fréquemment */
@layer utilities {
  .pt-safe {
    padding-top: env(safe-area-inset-top);
  }
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .pb-safe-or-10 {
    padding-bottom: max(2.5rem, env(safe-area-inset-bottom));
  }
}
```

---

## 4. Touch Targets — Apple HIG (44×44pt minimum)

Source : hig-patterns skill. Apple recommande un minimum de **44×44 points** pour tout élément tappable.

```tsx
// ✅ Touch target suffisant
<button className="size-11 flex items-center justify-center"> {/* 44px */}
  <Icon size={20} />
</button>

// ✅ Avec hit area étendue (padding transparent) pour petits visuels
<button className="p-2 -m-2">  {/* visual: icon | hit area: icon + 8px */}
  <X size={14} />
</button>

// ❌ Touch target trop petit — manqué sur iPhone
<button className="size-6">
  <X size={14} />
</button>
```

---

## 5. Scroll iOS — Performance & Comportement

Source : scroll-experience skill.

### GPU compositing pour scroll smooth (60fps)

```css
/* Force GPU layer sur les éléments qui scrollent ou animent */
.scroll-container {
  transform: translateZ(0);    /* ou translate3d(0,0,0) */
  backface-visibility: hidden;
  will-change: transform;      /* ← uniquement si animation active, sinon retirer */
}
```

### ⚠️ `-webkit-overflow-scrolling: touch` — DÉPRÉCIÉ

```css
/* ❌ Déprécié depuis iOS 13 — ne pas utiliser */
.scroll { -webkit-overflow-scrolling: touch; }

/* ✅ Le momentum scroll est natif depuis iOS 13 sur overflow: auto/scroll */
.scroll { overflow-y: auto; }
```

### Contenir le scroll bounce dans un container

```css
/* Empêche que le scroll d'un enfant propage le bounce au parent */
.scroll-container {
  overscroll-behavior-y: contain;
}
```

---

## 6. Input iOS — Prévenir le zoom automatique

iOS Safari zoome automatiquement sur tout `<input>` dont `font-size < 16px`. Ce zoom est involontaire et casse l'UX.

```css
/* Filet de sécurité global */
input, select, textarea {
  font-size: max(16px, 1em);  /* Toujours ≥ 16px, mais respecte les tailles plus grandes */
}
```

```tsx
// En Tailwind — classes ≥ text-base (16px) sont safe
// ✅ Safe
"text-base"   // 16px
"text-lg"     // 18px
"text-xl"     // 20px
"text-2xl"    // 24px

// ❌ Provoque le zoom
"text-sm"     // 14px
"text-xs"     // 12px
"text-[13px]" // 13px — custom mais < 16px
```

---

## 7. Viewport Units — Mobile-First avec Tailwind v4

Source : tailwind-patterns skill.

```css
/* Tailwind v4 : mobile first = pas de préfixe */
/* breakpoints standard */
/* sm: 640px | md: 768px | lg: 1024px | xl: 1280px */

/* Pour les hauteurs plein écran — utiliser dvh */
min-h-dvh          /* 100dvh — dynamic (correct sur iOS) */
/* plutôt que */
min-h-screen       /* 100vh — peut déborder sur iOS Safari */
```

---

## 8. Checklist Adaptation iPhone

### HTML
- [ ] `viewport-fit=cover` dans le meta viewport
- [ ] `apple-mobile-web-app-capable` + `status-bar-style` présents
- [ ] `apple-touch-icon` présent

### CSS (index.css)
- [ ] `-webkit-tap-highlight-color: transparent` sur `*`
- [ ] `touch-action: manipulation` sur `*` ou boutons
- [ ] `overscroll-behavior: none` sur body
- [ ] `padding-top: env(safe-area-inset-top)` sur body
- [ ] `padding-bottom` absent du body (géré dans BottomNav)
- [ ] `input, select, textarea { font-size: max(16px, 1em) }`
- [ ] `min-height: 100dvh` (pas `100vh`)

### Composants
- [ ] BottomNav : `pb-[env(safe-area-inset-bottom)]` ✅
- [ ] Overlays `fixed inset-0` : `paddingTop: 'max(Xrem, env(safe-area-inset-top))'`
- [ ] Slide-up panels : `pb-[max(2.5rem,env(safe-area-inset-bottom))]`
- [ ] Tous les boutons : surface ≥ 44×44px (Apple HIG)
- [ ] Inputs dans les forms : `text-base` ou plus grand

### Contenu principal
- [ ] `pt-12` → `pt-6` (body gère déjà le push sous notch — le double compte)

---

## 9. Anti-patterns (JAMAIS)

| Anti-pattern | Pourquoi |
|---|---|
| `min-height: 100vh` | Déborde sur iOS Safari quand la barre d'adresse est visible — utiliser `100dvh` |
| `padding-bottom: env(safe-area-inset-bottom)` sur body | Scroll area inutilement plus haute — gérer dans les composants fixed |
| `pt-14` fixe dans un `fixed inset-0` | Ne s'adapte pas au Dynamic Island (59px) — utiliser `max()` |
| `-webkit-overflow-scrolling: touch` | Déprécié depuis iOS 13 — inutile |
| `touch-action: none` sur un container scrollable | Empêche le scroll natif — crash UX |
| `new Notification()` direct | Bloqué sur iOS — utiliser `registration.showNotification()` |
| Input `text-sm` ou `text-xs` | Zoom iOS involontaire — minimum `text-base` (16px) |
| Bouton `size-6` ou `size-8` sans padding | Touch target < 44px — manqués fréquemment |
