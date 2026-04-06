// js/sections/s6.js — Test Maxis / Décharge
import { renderWeekTracker, initTracker } from '../tracker.js';

export function renderS6(meta) {
    const testHtml = renderWeekTracker(
        's6',
        { title: meta.title, subtitle: 'Alternative 1 — Test Maxis : Opener · 2ème tentative · PR' },
        'test'
    );
    const decHtml = renderWeekTracker(
        's6',
        { title: null, subtitle: 'Alternative 2 — Décharge légère @80%' },
        'decharge'
    );
    return `
        ${testHtml}
        <div class="note" style="margin:16px 0">
            <strong>Choisis ton alternative :</strong> Si tu ne testes pas tes maxis cette semaine,
            utilise l'alternative 2 (Décharge) pour maintenir la technique sans accumuler de fatigue.
        </div>
        ${decHtml}
    `;
}

export function initS6() { initTracker('s6'); }
