// js/nav.js — Navigation : Dynamic Pill & Fullscreen Menu
// Dépend de : data.js

import { NAV, NAV_GROUPS } from './data.js';

// Callback de changement d'onglet — injecté par app.js
let _onTabChange = null;

// ─── Icônes SVG inline (SF Symbols-style, 24×24, currentColor) ────────────
const ICONS = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
    </svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="3"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>`,
    leaf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 20A7 7 0 0 1 4 13c0-4.97 4-9 9-9 3.54 0 7 2.5 7 7 0 4-2 7-6 9"/>
        <path d="M4 20c2-2 4-4 7-6"/>
    </svg>`,
    bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z"/>
    </svg>`,
};

/**
 * Initialise le système de navigation
 * @param {Function} onTabChange - callback appelé à chaque changement
 */
export function buildNav(onTabChange) {
    _onTabChange = onTabChange;

    const navPill = document.getElementById('nav-pill');
    const fullscreenMenu = document.getElementById('fullscreen-menu');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const bentoGrid = document.getElementById('bento-grid');

    if (!navPill || !fullscreenMenu || !bentoGrid) return;

    // 1. Ouvrir le Menu
    navPill.addEventListener('click', () => {
        fullscreenMenu.classList.add('is-open');
        navPill.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Bloquer le scroll derrière
    });

    // 2. Fermer le Menu
    const closeMenu = () => {
        fullscreenMenu.classList.remove('is-open');
        navPill.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    menuCloseBtn.addEventListener('click', closeMenu);

    // 3. Générer la grille Bento depuis NAV
    // On peut utiliser NAV_GROUPS pour structurer, ou simplement itérer sur NAV.
    bentoGrid.innerHTML = '';
    
    NAV.forEach((navItem, i) => {
        const btn = document.createElement('button');
        btn.className = 'bento-tile';
        
        // Retrouver l'icône via NAV_GROUPS (s'il appartient à un groupe)
        const parentGroup = NAV_GROUPS.find(g => g.tabs.includes(navItem.id));
        const iconSvg = parentGroup && ICONS[parentGroup.icon] ? ICONS[parentGroup.icon] : ICONS.home;
        
        btn.innerHTML = `${iconSvg} <span>${navItem.label}</span>`;
        
        // Mettre Accueil en tuile large
        if (navItem.id === 'accueil') {
            btn.classList.add('wide');
        }

        btn.addEventListener('click', () => {
            switchTab(navItem.id);
            closeMenu();
        });

        bentoGrid.appendChild(btn);
    });
}

// ─── Switch tab (programmatic) ────────────────────────────────────────

export function switchTab(tabId) {
    const navItem = NAV.find(n => n.id === tabId);
    if (!navItem) return;

    // Mettre à jour l'intitulé de la pilule
    const pillText = document.getElementById('pill-text');
    if (pillText) {
        pillText.textContent = navItem.label;
    }

    // Call render callback
    if (_onTabChange) _onTabChange(tabId);
}

export function switchGroup(groupId) {
    // Rétrocompatibilité : rediriger le groupe vers son premier tab
    const group = NAV_GROUPS.find(g => g.id === groupId);
    if (group && group.tabs.length > 0) {
        switchTab(group.tabs[0]);
    }
}
