// js/readiness.js — Feature 6 : Readiness Check quotidien
// Dépend de : state.js

import { State, saveReadiness } from './state.js';

function modifierLevel(modifier) {
    if (modifier > 0)       return 'great';
    if (modifier === 0)     return 'normal';
    if (modifier >= -0.05)  return 'fatigued';
    return 'exhausted';
}

function modifierLabel(modifier) {
    if (modifier > 0)       return '+2.5%';
    if (modifier === 0)     return 'Normal';
    if (modifier >= -0.05)  return '−5%';
    return '−10%';
}

function modifierEmoji(modifier) {
    if (modifier > 0)       return '💪';
    if (modifier === 0)     return '✅';
    if (modifier >= -0.05)  return '😴';
    return '🔴';
}

/**
 * Retourne le HTML du panneau readiness pour une session donnée.
 * Si déjà rempli → badge compact. Sinon → formulaire 3 sliders.
 */
export function renderReadinessPanel(sessionId) {
    const sd = State.sessions[sessionId] || {};
    const r = sd.readiness;

    if (r) {
        // Badge persisté
        const level = modifierLevel(r.modifier);
        const label = modifierLabel(r.modifier);
        const emoji = modifierEmoji(r.modifier);
        const scoreStr = r.score.toFixed(1);
        return `<div class="readiness-badge readiness-badge--${level}">
            <span class="readiness-badge-dot"></span>
            ${emoji} Forme : ${scoreStr}/5 &nbsp;·&nbsp; Charge ${label}
        </div>`;
    }

    // Formulaire
    return `<div class="readiness-panel" id="readiness-panel-${sessionId}">
        <div class="readiness-form">
            <div class="readiness-title">Bilan du jour</div>
            <div class="readiness-sliders">
                <div class="readiness-row">
                    <span class="readiness-label">Sommeil</span>
                    <input type="range" class="readiness-slider" data-key="sleep"
                        data-session="${sessionId}" min="1" max="5" step="1" value="3"
                        aria-label="Qualité du sommeil">
                    <span class="readiness-val">3</span>
                </div>
                <div class="readiness-row">
                    <span class="readiness-label">Stress</span>
                    <input type="range" class="readiness-slider" data-key="stress"
                        data-session="${sessionId}" min="1" max="5" step="1" value="3"
                        aria-label="Niveau de stress (5 = très détendu)">
                    <span class="readiness-val">3</span>
                </div>
                <div class="readiness-row">
                    <span class="readiness-label">Énergie</span>
                    <input type="range" class="readiness-slider" data-key="energy"
                        data-session="${sessionId}" min="1" max="5" step="1" value="3"
                        aria-label="Niveau d'énergie">
                    <span class="readiness-val">3</span>
                </div>
            </div>
            <button class="readiness-submit" data-session="${sessionId}">Valider la forme du jour</button>
        </div>
    </div>`;
}

/**
 * Attache les listeners readiness pour tous les panneaux d'une section.
 * À appeler en tête de initTracker().
 */
export function initReadiness(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Mise à jour temps réel des valeurs numériques
    section.querySelectorAll('.readiness-slider').forEach(slider => {
        slider.addEventListener('input', e => {
            const val = e.target.parentElement.querySelector('.readiness-val');
            if (val) val.textContent = e.target.value;
        });
    });

    // Soumission
    section.querySelectorAll('.readiness-submit').forEach(btn => {
        btn.addEventListener('click', e => {
            const sessionId = e.target.dataset.session;
            const panel = document.getElementById(`readiness-panel-${sessionId}`);
            if (!panel) return;

            const sliders = panel.querySelectorAll('.readiness-slider');
            const vals = {};
            sliders.forEach(s => { vals[s.dataset.key] = parseInt(s.value); });

            const { sleep = 3, stress = 3, energy = 3 } = vals;
            const result = saveReadiness(sessionId, sleep, stress, energy);

            // Remplacer le panneau par le badge
            const level = modifierLevel(result.modifier);
            const label = modifierLabel(result.modifier);
            const emoji = modifierEmoji(result.modifier);
            const scoreStr = result.score.toFixed(1);
            panel.outerHTML = `<div class="readiness-badge readiness-badge--${level}">
                <span class="readiness-badge-dot"></span>
                ${emoji} Forme : ${scoreStr}/5 &nbsp;·&nbsp; Charge ${label}
            </div>`;
        });
    });
}
