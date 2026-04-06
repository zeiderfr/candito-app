// js/nav.js — Navigation : bottom tab bar + sub-nav chips
// Dépend de : data.js

import { NAV, NAV_GROUPS } from './data.js';

// Callback de changement d'onglet — injecté par app.js
let _onTabChange = null;
let _$tabBar = null;
let _$subNav = null;

// Mémorise le dernier onglet visité par groupe
const _lastTabInGroup = {};

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

// ─── Build ─────────────────────────────────────────────────────────────────

export function buildNav($tabBar, $subNav, onTabChange) {
    _onTabChange = onTabChange;
    _$tabBar = $tabBar;
    _$subNav = $subNav;

    // Build bottom tab items
    $tabBar.innerHTML = '';
    NAV_GROUPS.forEach((group, i) => {
        const btn = document.createElement('button');
        btn.className = 'tab-item' + (i === 0 ? ' active' : '');
        btn.dataset.group = group.id;
        btn.setAttribute('aria-label', `Naviguer vers ${group.label}`);
        btn.innerHTML = `${ICONS[group.icon]}<span>${group.label}</span>`;
        btn.addEventListener('click', () => switchGroup(group.id));
        $tabBar.appendChild(btn);
    });

    // Build sub-nav chips (all groups, shown/hidden contextually)
    _buildSubNav();
}

function _buildSubNav() {
    _$subNav.innerHTML = '';

    NAV_GROUPS.forEach(group => {
        if (group.tabs.length <= 1) return; // Pas de sub-nav pour groupes solo

        group.tabs.forEach(tabId => {
            const navItem = NAV.find(n => n.id === tabId);
            if (!navItem) return;

            const chip = document.createElement('button');
            chip.className = 'sub-chip';
            chip.textContent = navItem.label;
            chip.dataset.tab = tabId;
            chip.dataset.group = group.id;
            chip.setAttribute('role', 'tab');
            chip.setAttribute('aria-label', `Naviguer vers ${navItem.label}`);
            chip.setAttribute('aria-selected', 'false');
            chip.addEventListener('click', () => switchTab(tabId));
            _$subNav.appendChild(chip);
        });
    });
}

// ─── Switch group (bottom tab tap) ────────────────────────────────────────

export function switchGroup(groupId) {
    const group = NAV_GROUPS.find(g => g.id === groupId);
    if (!group) return;

    // Update bottom tab active state
    _$tabBar.querySelectorAll('.tab-item').forEach(item => {
        item.classList.toggle('active', item.dataset.group === groupId);
    });

    // Show/hide sub-nav chips for this group
    const hasSubNav = group.tabs.length > 1;
    if (hasSubNav) {
        _$subNav.classList.remove('hidden');
        // Show only chips belonging to this group
        _$subNav.querySelectorAll('.sub-chip').forEach(chip => {
            const belongs = chip.dataset.group === groupId;
            chip.style.display = belongs ? '' : 'none';
        });
    } else {
        _$subNav.classList.add('hidden');
    }

    // Navigate to last tab in group (or first)
    const targetTab = _lastTabInGroup[groupId] ?? group.tabs[0];
    switchTab(targetTab);
}

// ─── Switch tab (chip tap or programmatic) ────────────────────────────────

export function switchTab(tabId) {
    // Find group for this tab
    const group = NAV_GROUPS.find(g => g.tabs.includes(tabId));
    if (!group) return;

    // Remember last tab in group
    _lastTabInGroup[group.id] = tabId;

    // Sync bottom tab active state
    if (_$tabBar) {
        _$tabBar.querySelectorAll('.tab-item').forEach(item => {
            item.classList.toggle('active', item.dataset.group === group.id);
        });
    }

    // Sync sub-nav chip active state
    if (_$subNav) {
        const hasSubNav = group.tabs.length > 1;
        if (hasSubNav) {
            _$subNav.classList.remove('hidden');
            _$subNav.querySelectorAll('.sub-chip').forEach(chip => {
                const belongs = chip.dataset.group === group.id;
                chip.style.display = belongs ? '' : 'none';
                if (belongs) {
                    const isActive = chip.dataset.tab === tabId;
                    chip.classList.toggle('active', isActive);
                    chip.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    if (isActive) {
                        chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }
            });
        } else {
            _$subNav.classList.add('hidden');
        }
    }

    // Call render callback
    if (_onTabChange) _onTabChange(tabId);
}
