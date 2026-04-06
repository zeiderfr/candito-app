// js/app.js — Point d'entrée SPA (navigation par onglets)
// Importe TOUS les modules et orchestre le boot

import { NAV, SECTION_META } from './data.js';
import { State } from './state.js';
import { buildNav, switchTab, switchGroup } from './nav.js';
import { initOnboarding } from './onboarding.js';
import { renderAccueil, initAccueil }           from './sections/accueil.js';
import { renderEchauffement, initEchauffement } from './sections/echauffement.js';
import { renderS1S2, initS1S2 }                 from './sections/s1s2.js';
import { renderS3, initS3 }                     from './sections/s3.js';
import { renderS4, initS4 }                     from './sections/s4.js';
import { renderS5, initS5 }                     from './sections/s5.js';
import { renderS6, initS6 }                     from './sections/s6.js';
import { renderNutrition, initNutrition }       from './sections/nutrition.js';
import { renderRPE, initRPE }                   from './sections/rpe.js';
import { renderCharges, initCharges }           from './sections/charges.js';

const RENDERERS = {
    accueil:      { render: renderAccueil,      init: initAccueil },
    echauffement: { render: renderEchauffement, init: initEchauffement },
    s1s2:         { render: renderS1S2,         init: initS1S2 },
    s3:           { render: renderS3,           init: initS3 },
    s4:           { render: renderS4,           init: initS4 },
    s5:           { render: renderS5,           init: initS5 },
    s6:           { render: renderS6,           init: initS6 },
    nutrition:    { render: renderNutrition,    init: initNutrition },
    rpe:          { render: renderRPE,          init: initRPE },
    charges:      { render: renderCharges,      init: initCharges },
};

const $onb     = document.getElementById('onboarding');
const $overlay = document.getElementById('calc-overlay');
const $app     = document.getElementById('app');
const $main    = document.getElementById('main');

// Track current tab for programmatic switching
let _currentTab = null;

/**
 * Render a single tab into <main>.
 * Called by nav.js switchTab and by accueil.js data-tab-to buttons.
 */
function renderTab(tabId) {
    if (tabId === _currentTab) return; // Don't re-render same tab
    _currentTab = tabId;

    const renderer = RENDERERS[tabId];
    if (!renderer) return;

    // 1. Clear main and inject section
    $main.innerHTML = '';
    const sec = document.createElement('section');
    sec.id = tabId;
    sec.className = 'app-section tab-enter';
    sec.innerHTML = renderer.render(SECTION_META[tabId]);
    $main.appendChild(sec);

    // 2. Init listeners
    renderer.init();

    // 3. Trigger entrance animation (Antigravity fade-in + slide-up)
    requestAnimationFrame(() => {
        // Stagger cards inside the section
        sec.querySelectorAll('.card, .reveal, .section-header, .note, .note-red').forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(16px)';
            el.style.transition = `opacity 0.4s var(--ease) ${i * 0.05}s, transform 0.4s var(--ease) ${i * 0.05}s`;
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        });
    });

    // 4. Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Programmatic tab switch — used by accueil.js buttons
 */
export function navigateToTab(tabId) {
    switchTab(tabId);
}

export function bootApp() {
    $app.classList.remove('hidden');

    // Build nav with tab change callback
    buildNav(renderTab);

    // Default tab: Accueil
    renderTab('accueil');
}

// Reset
document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Réinitialiser toutes les données du programme ? Cette action est irréversible.')) {
        localStorage.removeItem('candito_tracker_data');
        location.reload();
    }
});

// Boot flow : onboarding callback → bootApp
initOnboarding(() => bootApp());

// If already initialized, skip onboarding
if (State.initialized) {
    $onb.classList.add('hidden');
    $overlay.classList.add('hidden');
    bootApp();
}
