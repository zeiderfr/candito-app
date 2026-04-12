// js/sections/s6.js — Test Maxis / Décharge
import { renderWeekTracker, initTracker } from '../tracker.js';
import { renderMaxPrediction, initMaxPrediction } from './maxprediction.js';
import { renderWeekSummaryButton, initWeekSummaryButton, checkAutoShowSummary } from './weeksummary.js';

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
        ${renderMaxPrediction()}
        ${testHtml}
        <div class="note" style="margin:16px 0">
            <strong>Choisis ton alternative :</strong> Si tu ne testes pas tes maxis cette semaine,
            utilise l'alternative 2 (Décharge) pour maintenir la technique sans accumuler de fatigue.
        </div>
        ${decHtml}
        ${renderWeekSummaryButton('s6')}
    `;
}

export function initS6() {
    initMaxPrediction();
    initTracker('s6');
    initWeekSummaryButton('s6', 's6');
    checkAutoShowSummary('s6');
}
