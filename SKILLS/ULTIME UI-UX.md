---
name: ultimate-ui-ux
description: "Compétence UI/UX ultime pour Antigravity. Fusionne baseline-ui (ibelick), UI/UX Pro Max, Antigravity Design Expert, Frontend Design, Scroll Experience, 3D Web, Web Design Guidelines et React UI Patterns en un seul fichier. Couvre : direction artistique, typographie, couleurs, motion, layout, accessibilité, performance, composants, thèmes, scroll, 3D, et anti-patterns."
category: design
risk: safe
source: "Synthèse de ibelick/ui-skills, sickn33/antigravity-awesome-skills, vibeship-spawner-skills, vercel-labs/agent-skills"
date_added: "2026-04-12"
---

# Ultimate UI/UX — La Compétence Ultime pour Antigravity

Compétence tout-en-un qui remplace et fusionne : `baseline-ui`, `ui-ux-pro-max`, `antigravity-design-expert`, `frontend-design`, `scroll-experience`, `3d-web-experience`, `web-design-guidelines`, `react-ui-patterns`, `theme-factory`, `core-components`, `tailwind-patterns`.

## Quand utiliser

- Construction de tout composant, page, application ou interface web
- Choix de palette, typographie, style, thème
- Review de code UI/UX pour conformité qualité
- Création de landing pages, dashboards, présentations interactives
- Implémentation d'animations, scroll-driven experiences, 3D web
- Audit d'accessibilité, performance, responsive

---

## 1. Direction Artistique

### Processus de décision (obligatoire avant de coder)

1. **Objectif** — Quel problème résout cette interface ? Pour qui ?
2. **Ton** — Choisir une direction forte parmi : minimalist, brutalist, glassmorphism, organic, luxury, playful, editorial, art deco, soft pastel, industrial, retro-futuristic, maximalist
3. **Contraintes** — Framework, performance, accessibilité
4. **Différenciation** — Qu'est-ce qui rend cette interface mémorable ?

### Règles de style

- TOUJOURS choisir une direction artistique claire et l'exécuter avec précision
- JAMAIS de design générique "AI slop" : pas d'Inter/Roboto/Arial par défaut, pas de gradients violet sur blanc, pas de layouts cookie-cutter
- Varier entre thèmes clairs et sombres, polices différentes, esthétiques différentes d'un projet à l'autre
- Limiter l'accent color à un seul par vue
- Utiliser les tokens couleur existants du thème ou de Tailwind avant d'en introduire de nouveaux
- Utiliser les ombres de l'échelle Tailwind par défaut sauf demande explicite

### Anti-patterns design (JAMAIS sauf demande explicite)

- JAMAIS de gradients
- JAMAIS de gradients violet ou multicolore
- JAMAIS de glow effects comme affordance principale
- JAMAIS d'emojis comme icônes UI → utiliser des SVG (Lucide, Heroicons, Simple Icons)
- JAMAIS de logos de marque devinés → vérifier via Simple Icons

---

## 2. Typographie

### Règles obligatoires

- `text-wrap: balance` sur tous les headings
- `text-wrap: pretty` sur les paragraphes et body text
- `font-variant-numeric: tabular-nums` sur toutes les données chiffrées
- Line-height : 1.5–1.75 pour le body text
- Longueur de ligne : 65–75 caractères max
- Taille minimum : 16px pour le body sur mobile
- `truncate` ou `line-clamp` pour les UI denses

### Interdictions

- JAMAIS modifier le `letter-spacing` (`tracking-*`) sauf demande explicite
- JAMAIS utiliser de polices génériques (Inter, Roboto, Arial, system fonts) comme choix par défaut

### Pairing de polices — Approche

- Associer une police display distinctive (headings) avec une police body raffinée
- Faire des choix inattendus et caractériels qui élèvent l'esthétique
- Exemples de pairings forts : Instrument Serif + DM Sans, Playfair Display + Source Sans, Space Grotesk + Libre Baskerville (mais varier, ne jamais converger sur les mêmes choix)

---

## 3. Couleurs & Thèmes

### Principes

- Palette dominante + accents francs > palette timide également répartie
- Un seul accent color par vue
- Utiliser les CSS variables pour la cohérence

### Contraste (obligatoire)

- Ratio minimum 4.5:1 pour le texte normal
- La couleur ne doit JAMAIS être le seul indicateur

### Light mode

- Cards glassmorphiques : `bg-white/80` ou plus (jamais `bg-white/10`)
- Texte : `#0F172A` (slate-900) minimum
- Texte muted : `#475569` (slate-600) minimum
- Bordures : `border-gray-200` (jamais `border-white/10`)

### Dark mode

- Cards : `bg-white/4` ou rgba solide
- Texte : `#fff` ou `#e2e8f0`
- Bordures : `border-white/7` minimum

### Système de thème

- Définir les tokens dans des CSS variables : `--color-primary`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-accent`
- Permettre le switch light/dark via une classe ou `prefers-color-scheme`

---

## 4. Animation & Motion

### Règle d'or

- JAMAIS ajouter d'animation sauf demande explicite
- Quand une animation est demandée, suivre ces contraintes :

### Propriétés autorisées

- SEULEMENT `transform` et `opacity` (propriétés compositor)
- JAMAIS animer `width`, `height`, `top`, `left`, `margin`, `padding` (propriétés layout)
- ÉVITER d'animer `background`, `color` sauf pour petits éléments locaux (texte, icônes)

### Durées

- Feedback d'interaction : 150–200ms max
- Entrées d'éléments : 200–400ms
- JAMAIS dépasser 200ms pour le feedback d'interaction
- Utiliser `ease-out` pour les entrées

### Contraintes

- Respecter `prefers-reduced-motion: reduce` → désactiver toutes les animations
- Pauser les animations en boucle quand hors écran
- JAMAIS de courbes d'easing custom sauf demande explicite
- JAMAIS animer de larges surfaces avec `blur()` ou `backdrop-filter`
- JAMAIS appliquer `will-change` en dehors d'une animation active

### Entrées staggerées (quand demandées)

- Stagger de 0.05–0.1s entre chaque élément d'une grille/liste
- Les éléments apparaissent du bas vers le haut avec une légère translation Y

### Stack animation

- CSS transitions pour les micro-interactions simples
- `motion/react` (ex framer-motion) quand du JS est nécessaire
- `tw-animate-css` pour les entrées et micro-animations Tailwind
- GSAP + ScrollTrigger pour les scroll-driven animations complexes

---

## 5. Scroll Experience

### Quand utiliser

- Landing pages narratives, storytelling, présentations immersives
- Sections qui doivent réagir au scroll (reveal, parallax, rotation)

### Patterns de scroll

- **Parallax** : les éléments de fond bougent plus lentement que ceux du premier plan
- **Reveal on scroll** : éléments apparaissent depuis l'axe Y avec légère rotation
- **Scroll-driven rotation** : modèles 3D ou éléments qui tournent selon la position de scroll
- **Pinning** : sections épinglées pendant le scroll pour créer des transitions entre contenus

### Implémentation

- GSAP ScrollTrigger comme outil principal
- `scrub: true` pour lier l'animation au scroll
- Toujours prévoir un fallback statique pour mobile basse performance
- Tester sur de vrais appareils mobiles

### Anti-patterns scroll

- JAMAIS de scroll hijacking agressif qui empêche la navigation naturelle
- JAMAIS d'animations scroll sur les éléments de navigation principaux
- TOUJOURS permettre le scroll natif comme fallback

---

## 6. 3D Web

### Quand utiliser la 3D

- Visualisation produit, configurateurs
- Portfolios immersifs
- Storytelling avec profondeur spatiale
- JAMAIS de 3D "pour le fun" sans objectif fonctionnel

### Stack 3D

| Outil | Usage | Contrôle |
|-------|-------|----------|
| CSS 3D Transforms | Éléments légers, cartes isométriques, perspective | Bas |
| React Three Fiber | Apps React, scènes complexes | Haut |
| Three.js vanilla | Contrôle max, hors React | Maximum |

### Profondeur spatiale sans 3D

- Layering sur l'axe Z avec `perspective` CSS
- Ombres diffuses multicouches : `box-shadow: 0 20px 40px rgba(0,0,0,0.05)`
- Éléments de fond plus flous/translucides que ceux du premier plan
- Background depth : couleurs plus sombres/désaturées en arrière-plan

### Glassmorphism (quand demandé)

- `backdrop-filter: blur(12px)` avec `background: rgba(255,255,255,0.04)`
- Bordures semi-transparentes : `border: 1px solid rgba(255,255,255,0.07)`
- Ombres intérieures subtiles : `inset 0 1px 0 rgba(255,255,255,0.05)`
- JAMAIS animer les surfaces avec `backdrop-filter`

### Performance 3D

- Modèles < 100K polygones pour le web
- Fichiers < 5MB (compresser avec gltf-transform + draco)
- Format GLB/GLTF privilégié
- Réduire la qualité sur mobile
- Fournir un fallback statique
- Indicateur de chargement obligatoire

---

## 7. Layout & Responsive

### Règles obligatoires

- `viewport meta` : `width=device-width, initial-scale=1`
- JAMAIS de scroll horizontal involontaire
- Tester à 375px, 768px, 1024px, 1440px
- Navbar flottante : `top-4 left-4 right-4` (jamais collée à `top-0`)
- Compenser la hauteur de la navbar fixe dans le contenu
- Utiliser un `max-width` cohérent (même valeur partout)

### Z-index

- Utiliser une échelle fixe : 10, 20, 30, 40, 50 (pas de valeurs arbitraires)
- JAMAIS de z-index arbitraires (`z-[999]`)

### Utilitaires

- `h-dvh` au lieu de `h-screen`
- `size-*` pour les éléments carrés (au lieu de `w-* h-*`)
- Respecter `safe-area-inset` pour les éléments fixés
- `container queries` pour les composants adaptatifs

---

## 8. Composants & Interaction

### Primitives accessibles

- TOUJOURS utiliser des primitives accessibles pour le comportement clavier/focus : Base UI, React Aria, ou Radix
- JAMAIS reconstruire le comportement clavier/focus à la main
- Utiliser les primitives existantes du projet en premier
- JAMAIS mixer les systèmes de primitives dans la même surface
- Préférer Base UI pour les nouvelles primitives si compatible

### Interaction

- `cursor-pointer` sur TOUT élément cliquable/hoverable
- Feedback visuel au hover (couleur, opacité, ombre, bordure)
- Transitions lisses : `transition-colors duration-200`
- JAMAIS de changement d'état instantané
- `AlertDialog` pour les actions destructives/irréversibles
- Erreurs affichées à côté de l'action concernée
- JAMAIS bloquer le paste dans les inputs

### Hover states

- Utiliser des transitions couleur/opacité (pas de `scale` qui décale le layout)
- Feedback subtil mais clair que l'élément est interactif
- JAMAIS de hover state qui cause un layout shift

### Loading states

- Skeletons structurels pour les chargements
- Boutons désactivés pendant les opérations async
- Indicateur de progression pour les chargements longs
- Charger le contenu lourd (3D, images) après que la page soit interactive

### Empty states

- TOUJOURS donner une action claire à l'utilisateur dans un état vide

---

## 9. Accessibilité

### Obligatoire

- `aria-label` sur les boutons icon-only
- `alt` descriptif sur les images significatives
- `label` avec `for` sur tous les champs de formulaire
- Tab order qui correspond à l'ordre visuel
- Focus visible (`focus-visible`) sur tous les éléments interactifs
- Touch targets minimum 44×44px

### Recommandé

- Tester navigation clavier complète
- La couleur ne doit pas être le seul indicateur d'état
- Respecter `prefers-reduced-motion`
- Respecter `prefers-color-scheme`

---

## 10. Performance

### Règles strictes

- JAMAIS animer de larges surfaces `blur()` ou `backdrop-filter`
- JAMAIS appliquer `will-change` en dehors d'une animation active
- JAMAIS utiliser `useEffect` pour ce qui peut être exprimé en logique de rendu
- Images : WebP, `srcset`, lazy loading
- Réserver l'espace pour le contenu async (pas de content jumping)
- `transform` et `opacity` uniquement pour les animations (GPU-accelerated)

---

## 11. React Patterns

### Structure

- Composants modulaires et réutilisables
- `cn()` (`clsx` + `tailwind-merge`) pour la logique de classes
- Séparer logique (hooks) et présentation (composants)
- Props par défaut pour tous les composants

### UI Patterns

- **Skeleton loading** : forme identique au contenu final
- **Error boundaries** : erreurs gracieuses avec retry
- **Optimistic updates** : feedback immédiat avant confirmation serveur
- **Progressive disclosure** : montrer l'essentiel, cacher le détail
- **Infinite scroll** avec intersection observer (pas de scroll events)

### State

- État local pour l'UI transitoire (modals, toggles)
- État global pour les données partagées (user, theme)
- Dériver l'état du rendu quand possible (pas de `useEffect` inutiles)

---

## 12. Stack recommandé

| Couche | Outil par défaut |
|--------|-----------------|
| Framework | React / Next.js |
| Styling | Tailwind CSS (layout + utility) + CSS custom pour 3D/transforms |
| Classes | `cn()` via `clsx` + `tailwind-merge` |
| Animation (CSS) | `tw-animate-css` |
| Animation (JS) | `motion/react` (ex framer-motion) |
| Scroll animation | GSAP + ScrollTrigger |
| 3D | React Three Fiber ou CSS 3D Transforms |
| Composants | Base UI / Radix / React Aria |
| Icônes | Lucide React, Heroicons, Simple Icons |

---

## 13. Checklist pré-livraison

### Qualité visuelle
- [ ] Aucun emoji utilisé comme icône (SVG uniquement)
- [ ] Tous les icônes du même set (Lucide ou Heroicons)
- [ ] Logos de marque vérifiés (Simple Icons)
- [ ] Hover states sans layout shift
- [ ] Direction artistique cohérente et intentionnelle

### Typographie
- [ ] `text-wrap: balance` sur les headings
- [ ] `text-wrap: pretty` sur le body
- [ ] `tabular-nums` sur les données chiffrées
- [ ] Aucune modification de letter-spacing

### Interaction
- [ ] `cursor-pointer` sur tous les éléments cliquables
- [ ] Transitions 150–200ms pour le feedback
- [ ] Focus visible pour la navigation clavier
- [ ] Touch targets 44×44px minimum

### Animation
- [ ] Aucune animation non demandée
- [ ] Seulement `transform` et `opacity`
- [ ] Aucun gradient non demandé
- [ ] `prefers-reduced-motion` respecté

### Layout
- [ ] Pas de scroll horizontal sur mobile
- [ ] Z-index sur échelle fixe (10, 20, 30, 40, 50)
- [ ] `h-dvh` au lieu de `h-screen`
- [ ] `safe-area-inset` sur les éléments fixés
- [ ] Responsive testé à 375px, 768px, 1024px, 1440px

### Accessibilité
- [ ] `aria-label` sur les boutons icon-only
- [ ] `alt` sur les images
- [ ] `label` + `for` sur les formulaires
- [ ] Contraste texte 4.5:1 minimum

### Performance
- [ ] Aucun `will-change` permanent
- [ ] Aucun `backdrop-filter` animé
- [ ] Images en WebP avec lazy loading
- [ ] Pas de content jumping

---

## Sources & Crédits

Skill synthétisée à partir de :
- **ibelick/ui-skills** — `baseline-ui`, `fixing-accessibility`, `fixing-motion-performance` (MIT)
- **sickn33/antigravity-awesome-skills** — `ui-ux-pro-max`, `antigravity-design-expert`, `frontend-design`, `scroll-experience`, `3d-web-experience`, `theme-factory`, `core-components`, `react-patterns`, `react-ui-patterns`, `tailwind-patterns`, `web-design-guidelines` (MIT)
- **vercel-labs/agent-skills** — `web-design-guidelines` (MIT)

## When to Use
Cette compétence s'applique à toute tâche de construction, review ou amélioration d'interface utilisateur web. Elle est le point d'entrée unique pour tout travail UI/UX dans Antigravity.
