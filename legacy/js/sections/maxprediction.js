// js/sections/maxprediction.js — Feature 8 : Prédiction de Max (S6)
// Dépend de : state.js

import { getPredictions, State } from '../state.js';
import { PROGRAM } from '../data.js';

function hasS3Data() {
    const s3 = PROGRAM.find(w => w.id === 's3');
    if (!s3) return false;
    for (const session of s3.sessions) {
        const sd = State.sessions[session.id];
        if (sd && (sd.sets || []).some(Boolean)) return true;
    }
    return false;
}

const LIFT_FR   = { squat: 'Squat',    bench: 'Bench',    deadlift: 'Deadlift' };
const LIFT_CONF = { high: 'Élevée',    medium: 'Moyenne', low: 'Faible', none: 'Aucune' };

export function renderMaxPrediction() {
    if (!hasS3Data()) return '';

    const preds = getPredictions();
    const lifts = ['squat', 'bench', 'deadlift'];

    const cards = lifts.map(lift => {
        const p = preds[lift];
        const valueHtml = p.predicted != null
            ? `<div class="pred-value">${p.predicted} <span style="font-size:1rem;font-weight:600">kg</span></div>`
            : `<div class="pred-value pred-value--empty">— kg</div>`;
        const confLabel = LIFT_CONF[p.confidence] || p.confidence;

        return `<div class="pred-card">
            <div class="pred-lift-name">${LIFT_FR[lift]}</div>
            ${valueHtml}
            <div class="pred-confidence pred-confidence--${p.confidence}">
                <span class="pred-conf-dot"></span>
                ${confLabel} · ${p.dataPoints} pt${p.dataPoints !== 1 ? 's' : ''}
            </div>
            <div class="pred-note">Estimation S3-S5</div>
        </div>`;
    }).join('');

    return `<div class="pred-section">
        <div class="pred-section-label">🎯 Prédiction du max au jour J</div>
        <div class="pred-cards-grid">${cards}</div>
    </div>`;
}

export function initMaxPrediction() {
    // Pas d'état interactif — rendu statique
}
