// js/sections/weeksummary.js — Feature 7 : Résumé de Fin de Semaine
// Dépend de : state.js

import { getWeekSummary } from '../state.js';

const WEEK_LABELS = {
    s1s2: 'Semaines 1-2',
    s3:   'Semaine 3',
    s4:   'Semaine 4',
    s5:   'Semaine 5',
    s6:   'Semaine 6',
};

const LIFT_FR = { squat: 'Squat', bench: 'Bench', deadlift: 'Deadlift' };

function formatVolume(v) {
    if (v >= 1000) return `${(v / 1000).toFixed(1)} t`;
    return `${v} kg`;
}

function buildShareText(summary, weekLabel) {
    const lines = [
        `📊 ${weekLabel} — Résumé Candito`,
        ``,
        `Volume total : ${formatVolume(summary.volume)}`,
        summary.avgRpe != null ? `RPE moyen : ${summary.avgRpe}` : null,
        summary.fatigueTrend != null
            ? `Tendance fatigue : ${summary.fatigueTrend > 0 ? '+' : ''}${summary.fatigueTrend}`
            : null,
        summary.weekPrs.length > 0
            ? `PRs : ${summary.weekPrs.map(p => `${LIFT_FR[p.lift] || p.lift} ${p.weight}kg`).join(', ')}`
            : null,
    ].filter(Boolean);
    return lines.join('\n');
}

function trendIcon(trend) {
    if (trend === null) return '→';
    if (trend > 0.3)  return '↑';
    if (trend < -0.3) return '↓';
    return '→';
}

function trendClass(trend) {
    if (trend === null || Math.abs(trend) <= 0.3) return 'wks-trend--neutral';
    return trend > 0 ? 'wks-trend--up' : 'wks-trend--down';
}

function trendText(trend) {
    if (trend === null) return 'Tendance stable';
    if (trend > 0.3)  return `Fatigue en hausse (+${trend} RPE vs semaine précédente)`;
    if (trend < -0.3) return `Récupération (+${Math.abs(trend)} RPE de moins)`;
    return 'Fatigue stable vs semaine précédente';
}

/**
 * Crée et injecte la modal dans le DOM.
 */
export function showWeekSummary(weekId) {
    const summary = getWeekSummary(weekId);
    if (!summary) return;

    const weekLabel = WEEK_LABELS[weekId] || weekId;
    const tc = trendClass(summary.fatigueTrend);
    const ti = trendIcon(summary.fatigueTrend);
    const tt = trendText(summary.fatigueTrend);

    const prHtml = summary.weekPrs.length > 0
        ? `<div class="wks-prs">
            <div class="wks-prs-title">🏆 Records personnels cette semaine</div>
            ${summary.weekPrs.map(pr => `
                <div class="wks-pr-item">
                    <span>🥇</span>
                    <span>${LIFT_FR[pr.lift] || pr.lift} — ${pr.weight} kg</span>
                    <span style="color:var(--text-3);font-size:0.75rem;margin-left:auto">${pr.date}</span>
                </div>
            `).join('')}
           </div>`
        : '';

    const modal = document.createElement('div');
    modal.className = 'week-summary-overlay';
    modal.id = 'week-summary-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', `Résumé ${weekLabel}`);
    modal.innerHTML = `
        <div class="week-summary-modal">
            <button class="week-summary-close" aria-label="Fermer">✕</button>
            <div class="week-summary-week-label">${weekLabel}</div>
            <h2>Résumé de semaine</h2>
            <div class="week-summary-stats">
                <div class="wks-stat">
                    <span class="wks-stat-value">${formatVolume(summary.volume)}</span>
                    <span class="wks-stat-label">Volume total</span>
                </div>
                <div class="wks-stat">
                    <span class="wks-stat-value">${summary.avgRpe != null ? summary.avgRpe : '—'}</span>
                    <span class="wks-stat-label">RPE moyen</span>
                </div>
                <div class="wks-stat">
                    <span class="wks-stat-value">${summary.completedSessions}/${summary.totalSessions}</span>
                    <span class="wks-stat-label">Séances complètes</span>
                </div>
                <div class="wks-stat">
                    <span class="wks-stat-value">${summary.weekPrs.length}</span>
                    <span class="wks-stat-label">PRs établis</span>
                </div>
            </div>
            <div class="wks-trend ${tc}">${ti} ${tt}</div>
            ${prHtml}
            <button class="wks-share-btn">Partager le résumé</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Fermeture
    const close = () => modal.remove();
    modal.querySelector('.week-summary-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    // Partage
    modal.querySelector('.wks-share-btn').addEventListener('click', async () => {
        const text = buildShareText(summary, weekLabel);
        const btn = modal.querySelector('.wks-share-btn');
        if (navigator.share) {
            try {
                await navigator.share({ title: `Résumé Candito — ${weekLabel}`, text });
            } catch { /* annulé par l'utilisateur */ }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                btn.textContent = 'Copié ! ✓';
                setTimeout(() => { btn.textContent = 'Partager le résumé'; }, 2000);
            } catch {
                btn.textContent = 'Erreur copie';
            }
        }
    });
}

/**
 * Retourne le HTML du bouton déclencheur.
 */
export function renderWeekSummaryButton(weekId) {
    return `<button class="btn-week-summary" data-week="${weekId}">
        📊 Résumé de semaine
    </button>`;
}

/**
 * Attache le listener sur le bouton déclencheur.
 */
export function initWeekSummaryButton(weekId, sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const btn = section.querySelector(`.btn-week-summary[data-week="${weekId}"]`);
    if (btn) btn.addEventListener('click', () => showWeekSummary(weekId));
}

/**
 * Auto-popup si toutes les séances de la semaine sont complètes.
 */
export function checkAutoShowSummary(weekId) {
    const summary = getWeekSummary(weekId);
    if (!summary) return;
    if (summary.completedSessions >= summary.totalSessions && summary.totalSessions > 0) {
        // Vérifier qu'il n'y a pas déjà une modal ouverte
        if (!document.getElementById('week-summary-overlay')) {
            setTimeout(() => showWeekSummary(weekId), 1200);
        }
    }
}
