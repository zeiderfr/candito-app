# Programme Candito 6 Semaines — Cahier des charges Web

---

## Athlète

| Info | Valeur |
|------|--------|
| Nom | Théo |
| Age | 20 ans |
| Poids | 66 kg |
| Taille | 1m70 |
| Squat 1RM | 150 kg |
| Bench 1RM | 110 kg |
| Deadlift 1RM | 170 kg |
| Total | 430 kg |

---

## 1. Objectif du projet

Transformer la présentation PowerPoint du programme Candito 6 semaines en une **application web monofichier** consultable sur téléphone en salle de sport. L'application doit être à la fois un guide visuel du programme et un outil de suivi interactif pendant les séances.

---

## 2. Format technique

| Paramètre | Choix |
|-----------|-------|
| Format | Un seul fichier `.html` (HTML + CSS + JS + SVG inline) |
| Dépendances externes | Google Fonts (Inter) — fallback system-ui si hors-ligne |
| Responsive | Mobile-first (optimisé iPhone / Android) |
| Hors-ligne | Fonctionne en ouvrant le fichier localement |
| Hébergeable | Compatible GitHub Pages / Netlify tel quel |
| Stockage | localStorage pour la sauvegarde des données |

---

## 3. Design

### 3.1 Style global

Inspiré de la maquette fitness app premium fournie en référence :

- **Fond général** : blanc cassé `#F8F8F8`
- **Cartes** : fond blanc `#FFFFFF`, coins arrondis `border-radius: 20px`, ombre douce `box-shadow: 0 2px 20px rgba(0,0,0,0.06)`
- **Headers de section** : blocs noirs arrondis `#1A1A1A` avec texte blanc
- **Boutons** : capsules pill noires `border-radius: 50px` avec texte blanc
- **Espacement** : généreux, aéré, beaucoup de whitespace

### 3.2 Palette de couleurs

| Rôle | Couleur | Code |
|------|---------|------|
| Fond page | Blanc cassé | `#F8F8F8` |
| Cartes | Blanc pur | `#FFFFFF` |
| Headers / boutons | Noir | `#1A1A1A` |
| Texte principal | Noir | `#1D1D1F` |
| Texte secondaire | Gris | `#86868B` |
| Texte tertiaire | Gris clair | `#AEAEB2` |
| Muscle primaire | Rouge vif | `#FF3B30` |
| Muscle secondaire | Rouge doux | `#FF8A80` |
| Succès / Décharge | Vert | `#34C759` |
| Alerte / Orange | Orange | `#FF9F0A` |

### 3.3 Typographie

| Usage | Police | Poids |
|-------|--------|-------|
| Titres de section | Inter | 700 (Bold) |
| Sous-titres | Inter | 600 (Semi-bold) |
| Corps de texte | Inter | 400 (Regular) |
| Données chiffrées | Inter | 700 (Bold) |
| Fallback | system-ui, -apple-system, sans-serif | — |

### 3.4 Composants UI

- **Cartes exercice** : style "Categories" de la ref — image SVG à gauche, nom + séries + charge à droite, checkbox à l'extrême droite
- **Barre de stats** : bulles arrondies avec icônes pour Squat/Bench/Deadlift/Total (style Statistics de la ref)
- **Onglets navigation** : pills noirs/gris dans un menu sticky horizontal scrollable
- **Tableaux** : headers noirs, lignes alternées blanc/gris très léger, coins arrondis
- **Notes/alertes** : cartes avec bordure gauche colorée (rouge ou orange)
- **Inputs** : champs arrondis avec bordure subtile pour les charges et RPE

---

## 4. Navigation

### Structure

Menu sticky en haut de page avec onglets horizontaux scrollables :

```
[ Accueil ] [ Échauffement ] [ S1-S2 ] [ S3 ] [ S4 ] [ S5 ] [ S6 ] [ Nutrition ] [ Charges ]
```

- Cliquer sur un onglet = scroll fluide vers la section
- En scrollant, l'onglet actif se met à jour automatiquement (Intersection Observer)
- L'onglet actif est en noir, les inactifs en gris clair

### Sections (ordre du scroll)

1. **Accueil** — Stats athlète + Calculateur 1RM
2. **Échauffement Bas du Corps** — Wenning + Kabuki + Gamme montante Squat
3. **Échauffement Haut du Corps** — Wenning + Kabuki + Gamme montante Bench
4. **Semaines 1-2 : Accumulation** — 5 séances (Lundi → Samedi) + Notes
5. **Semaine 3 : Transmutation** — 3 séances
6. **Semaine 4 : Acclimatation** — 3 séances >90%
7. **Semaine 5 : Peaking** — Tests AMRAP
8. **Semaine 6 : Test / Décharge** — 2 alternatives
9. **Nutrition** — Macros périodisées + Timing repas + Suppléments
10. **RPE & Autorégulation** — Échelle RPE-RIR + Signaux d'alerte
11. **Tableau des Charges** — Toutes les charges de 40% à 102% (auto-calculé)

---

## 5. Illustrations anatomiques SVG

### 5.1 Style

Inspiré de la planche anatomique fournie en référence :

- **Corps** : contours détaillés avec courbes Bézier, silhouette réaliste
- **Muscles** : zones distinctes pour chaque groupe musculaire, avec des lignes de fibres pour l'effet anatomique
- **Équipement** : barre, disques, banc, rack en gris moyen `#8E8E93`
- **Corps au repos** : gris clair `#D1D1D6` avec contours `#AEAEB2`

### 5.2 Code couleur musculaire

| Type | Couleur | Code | Exemple (Squat) |
|------|---------|------|-----------------|
| Muscle primaire | Rouge vif | `#FF3B30` | Quadriceps, Fessiers |
| Muscle secondaire | Rouge doux | `#FF8A80` | Ischio-jambiers, Core, Mollets |
| Muscle au repos | Gris clair | `#D1D1D6` | Bras, Épaules |

### 5.3 Liste des 25 exercices à illustrer

| # | Exercice | Muscles primaires (rouge vif) | Muscles secondaires (rouge doux) |
|---|----------|-------------------------------|----------------------------------|
| 1 | Squat Low Bar | Quadriceps, Fessiers | Ischio-jambiers, Core, Adducteurs |
| 2 | Soulevé de terre | Érecteurs du rachis, Ischio-jambiers, Fessiers | Quadriceps, Trapèzes, Avant-bras |
| 3 | Développé couché | Pectoraux, Triceps | Deltoïdes antérieurs, Core |
| 4 | Hip Thrust | Fessiers | Ischio-jambiers, Core |
| 5 | OHP (Dév. militaire) | Deltoïdes, Triceps | Trapèzes, Core |
| 6 | Dips | Pectoraux, Triceps | Deltoïdes antérieurs |
| 7 | Rowing buste penché | Dorsaux, Trapèzes, Biceps | Érecteurs, Deltoïdes postérieurs |
| 8 | Tractions / Tirage | Dorsaux, Biceps | Trapèzes, Deltoïdes postérieurs |
| 9 | Face Pulls | Deltoïdes postérieurs, Trapèzes moyens | Rhomboïdes, Rotateurs externes |
| 10 | Élévations latérales | Deltoïdes médians | Trapèzes supérieurs |
| 11 | Triceps Pushdowns | Triceps | Anconé |
| 12 | Pause Squat | Quadriceps, Fessiers | Ischio-jambiers, Core, Adducteurs |
| 13 | RDL (Romanian DL) | Ischio-jambiers, Fessiers, Érecteurs | Trapèzes, Avant-bras |
| 14 | Hack Squat | Quadriceps | Fessiers, Mollets |
| 15 | Hanging Leg Raises | Grand droit (abdos), Fléchisseurs de hanche | Obliques |
| 16 | Nordic Curls | Ischio-jambiers | Mollets, Fessiers |
| 17 | Dév. incliné haltères | Pectoraux supérieurs, Deltoïdes ant. | Triceps |
| 18 | Larsen Press | Pectoraux, Triceps | Deltoïdes antérieurs |
| 19 | Ab Wheel | Grand droit (abdos), Obliques | Deltoïdes, Dorsaux |
| 20 | Leg Curls | Ischio-jambiers | Mollets |
| 21 | Reverse Hyper | Fessiers, Ischio-jambiers | Érecteurs du rachis |
| 22 | Dead Bugs | Transverse, Grand droit (abdos) | Fléchisseurs de hanche |
| 23 | Cossack Squat | Quadriceps, Adducteurs | Fessiers, Mollets |
| 24 | Foam Rolling | — (récupération) | — |
| 25 | Cat-Camel | — (mobilité colonne) | Érecteurs, Abdominaux |

---

## 6. Fonctionnalités interactives

### 6.1 Calculateur 1RM (section Accueil)

- 3 champs éditables : Squat / Bench / Deadlift
- Modifier une valeur recalcule instantanément TOUTES les charges du programme
- Formule d'arrondi : `Math.round(1RM * % / 2.5) * 2.5`
- Les valeurs par défaut sont 150 / 110 / 170
- Le Total se met à jour automatiquement

### 6.2 Tracker de séance

Pour chaque exercice dans chaque séance :

- **Checkbox par série** : cocher = série terminée → la ligne se grise
- **Compteur visuel** : "2/4 séries" avec barre de progression
- **Champ charge réelle** : input numérique pré-rempli avec la charge calculée, éditable
- **Sélecteur RPE réel** : dropdown ou slider (6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10)

### 6.3 Sauvegarde localStorage

- Sauvegarde automatique à chaque interaction (pas de bouton "Sauvegarder")
- Clé : `candito_tracker_data`
- Structure : `{ squat: 150, bench: 110, deadlift: 170, sessions: { "s12_lundi_1": { sets: [true, true, false, false], rpe: [8, 8.5, null, null], loads: [117.5, 117.5, null, null] } } }`
- Bouton "Réinitialiser" en bas de page (avec confirmation)

---

## 7. Données du programme

### Charges calculées (formule : `round(1RM × % / 2.5) × 2.5`)

| % 1RM | Squat | Bench | Deadlift | Utilisation |
|-------|-------|-------|----------|-------------|
| 40% | 60.0 | 45.0 | 67.5 | Échauffement |
| 60% | 90.0 | 65.0 | 102.5 | Échauffement |
| 65% | 97.5 | 72.5 | 110.0 | Accessoires |
| 70% | 105.0 | 77.5 | 120.0 | Volume léger |
| 75% | 112.5 | 82.5 | 127.5 | Échauffement lourd |
| 78% | 117.5 | 85.0 | 132.5 | S1-S2 bas |
| 80% | 120.0 | 87.5 | 135.0 | S1-S2 / Décharge |
| 82% | 122.5 | 90.0 | 140.0 | S1-S2 haut |
| 85% | 127.5 | 92.5 | 145.0 | S3 bas |
| 88% | 132.5 | 97.5 | 150.0 | S3 haut / Feeler |
| 90% | 135.0 | 100.0 | 152.5 | S4 bas |
| 93% | 140.0 | 102.5 | 157.5 | S4 haut |
| 95% | 142.5 | 105.0 | 162.5 | S5 AMRAP |
| 100% | 150.0 | 110.0 | 170.0 | 1RM actuel |
| 102% | 152.5 | 112.5 | 172.5 | Objectif PR |

### Séances complètes

**Semaines 1-2 (Accumulation) — 5 séances/semaine :**

- Lundi : Squat 4x6-8 @78-82%, DL 2x6 @78-82%, Hip Thrust 3x8-10, Hack Squat 3x8-12, Hanging Leg Raises 3x10-15
- Mardi : Bench 4x6-8 @78-82%, Dips 3x8-12, Rowing 3x8-12, Face Pulls 4x15-20
- Mercredi : REPOS
- Jeudi : Larsen Press 4x8-10 @65-75%, OHP 3x6-8, Tractions 3x8-10, Face Pulls 4x15-20
- Vendredi : Pause Squat 3x8 @68-72%, RDL 3x8 @65-70%, Nordic Curls 3x4-6, Ab Wheel 3x10-15
- Samedi : Bench 3x6-8 @78-82%, Incliné DB 3x8-12, Latérales 3x12-15, Triceps Pushdowns 3x10-15, Face Pulls 3x15-20
- Dimanche : REPOS

**Semaine 3 (Transmutation) — 3 séances :**

- Lundi : Squat 3x4-6 @85-88%, DL 1-2x4-6 @85-88%, Hanging Leg Raises 2x10-15
- Mardi : Bench 3x4-6 @85-88%, Rowing 2x6-8, Face Pulls 3x15
- Vendredi : Bench/Larsen 3x4-6 @82-85%, Tractions 2x6-8, Face Pulls 2x15

**Semaine 4 (Acclimatation) — 3 séances :**

- Lundi : Squat 2-3x2-3 @90-93%, DL 1-2x2-3 @90-93%
- Mardi : Bench 3x2-3 @90-93%, Rowing 2x5-6
- Vendredi : Bench 2-3x2-3 @90-92%, Face Pulls 2x15

**Semaine 5 (Peaking) — 2 séances :**

- Lundi : TEST Squat AMRAP @95%, TEST Deadlift AMRAP @95%
- Mardi : TEST Bench AMRAP @95%, Rowing 2-3x8, Face Pulls 2x15

**Semaine 6 — Alternative 1 (Test Maxis) :**

- Opener @90-92%, 2ème @96-98%, 3ème (PR) @100-102%
- Lundi : SQ + DL | Mercredi : BP

**Semaine 6 — Alternative 2 (Décharge) :**

- Lundi : Squat 2x3 + DL 1x3 @80%
- Mercredi : Bench 2x3 @80%

---

## 8. Plan de construction

| Étape | Description | Estimation |
|-------|-------------|------------|
| 1 | Structure HTML + CSS du design system | Fondation |
| 2 | Navigation sticky + scroll spy | Navigation |
| 3 | Section Accueil + Calculateur 1RM | Interactif |
| 4 | Illustrations SVG des 25 exercices | Visuel clé |
| 5 | Sections d'entraînement S1-S2 à S6 avec tracker | Cœur du programme |
| 6 | Sections Échauffement avec gammes montantes | Complément |
| 7 | Sections Nutrition + RPE + Tableau des charges | Référence |
| 8 | Système de sauvegarde localStorage | Persistance |
| 9 | Test mobile + responsive + ajustements | QA |
| 10 | Vérification visuelle complète | Validation |

---

## 9. Contraintes techniques

- **Pas de framework** : vanilla HTML/CSS/JS uniquement
- **Pas de build** : aucun bundler, transpileur ou CLI nécessaire
- **Monofichier** : tout dans un seul `.html` (CSS dans `<style>`, JS dans `<script>`, SVG inline)
- **Performance** : page <500KB, chargement instantané
- **Compatibilité** : Safari iOS 15+, Chrome Android, Chrome Desktop

---

*Document généré le 6 avril 2026 — Projet Candito Web App pour Théo*
