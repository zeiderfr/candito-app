// js/nav.js — Navigation par onglets (SPA)
// Dépend de : data.js

import { NAV } from './data.js';

// Callback de changement d'onglet — injecté par app.js
let _onTabChange = null;

export function buildNav($nav, onTabChange) {
    _onTabChange = onTabChange;
    $nav.innerHTML = '';

    NAV.forEach((n, i) => {
        const btn = document.createElement('button');
        btn.className = 'nav-pill' + (i === 0 ? ' active' : '');
        btn.textContent = n.label;
        btn.dataset.target = n.id;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', `Naviguer vers ${n.label}`);
        btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        btn.addEventListener('click', () => switchTab(n.id, $nav));
        $nav.appendChild(btn);
    });
}

export function switchTab(tabId, $nav) {
    // 1. Update nav pills
    const pills = $nav.querySelectorAll('.nav-pill');
    pills.forEach(p => {
        const isActive = p.dataset.target === tabId;
        p.classList.toggle('active', isActive);
        p.setAttribute('aria-selected', isActive ? 'true' : 'false');
        // Auto-scroll nav to active pill
        if (isActive) {
            p.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });

    // 2. Call the render callback in app.js
    if (_onTabChange) _onTabChange(tabId);
}
