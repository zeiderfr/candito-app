// js/sections/s6.js — Test Maxis / Protocole de Refroidissement
import { renderWeekTracker, initTracker } from '../tracker.js';

export function renderS6(meta) {
    const testHtml = renderWeekTracker(
        's6',
        { title: meta.title, subtitle: 'Alternative 1 — Test Maxis : Opener · 2ème tentative · PR' },
        'test'
    );
    const decHtml = renderWeekTracker(
        's6',
        { title: null, subtitle: 'Alternative 2 — Protocole de Refroidissement @80%' },
        'decharge'
    );
    return `
        ${testHtml}
        <div class="note" style="margin:16px 0">
            <strong>[ INFO ]</strong> Si les maxis ne sont pas testés cette semaine,
            utiliser le protocole de refroidissement pour maintenir la technique sans accumuler de fatigue systémique.
        </div>
        ${decHtml}
    `;
}

export function initS6() { initTracker('s6'); }
