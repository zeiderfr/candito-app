// js/sections/accueil.js — Tableau de Bord + Log des Pics de Performance
import { State, getNextSession, getProgress } from '../state.js';
import { fmt, loadRange } from '../utils.js';
import { SECTION_META } from '../data.js';

export function renderAccueil(meta) {
    const rm = State.rm;
    const total = rm.squat + rm.bench + rm.deadlift;
    const ratio = (total / 66).toFixed(1);
    const next = getNextSession();
    const prog = getProgress();
    const prs = State.prs || [];

    let nextHtml = '';
    if (next) {
        const s = next.session;
        const weekMeta = SECTION_META[next.weekId];
        const statusLabel = next.status === 'in-progress' ? 'REPRENDRE SÉQUENCE →' : 'LANCER SÉQUENCE →';
        const statusBadge = next.status === 'in-progress'
            ? '<span class="badge badge-orange">ACTIF</span>'
            : '<span class="badge badge-red">EN ATTENTE</span>';
        const previews = s.exercises.slice(0, 4).map(ex => {
            const detail = ex.lift ? `${ex.sets}×${ex.reps} @ ${loadRange(ex.lift, ex.lo, ex.hi)}` : `${ex.sets}×${ex.reps}`;
            return `<div class="exercise-mini"><span class="ex-name">${ex.name}</span><span class="ex-detail">${detail}</span></div>`;
        }).join('');
        const more = s.exercises.length > 4 ? `<p style="color:var(--text-3);font-size:0.6875rem;text-align:center;font-family:var(--mono)">+ ${s.exercises.length - 4} module(s)</p>` : '';

        nextHtml = `
            <div class="card next-session">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <span class="label">${weekMeta.title}</span>
                    ${statusBadge}
                </div>
                <div class="session-day">${s.day} — ${s.focus}</div>
                <div class="session-focus">${s.exercises.length} modules</div>
                <div class="exercise-preview">${previews}${more}</div>
                <button class="btn btn-block" data-tab-to="${next.weekId}">${statusLabel}</button>
            </div>`;
    } else {
        nextHtml = `
            <div class="card next-session rest">
                <div class="session-day">MISSION ACCOMPLIE</div>
                <div class="session-focus">Protocole Candito 6 Semaines complété. Toutes les séquences validées.</div>
            </div>`;
    }

    let wallHtml = '';
    if (prs.length > 0) {
        const items = prs.map(pr => `
            <div class="pr-item">
                <span class="pr-lift">${pr.lift}</span>
                <span class="pr-weight">${pr.weight} KG</span>
                <span class="pr-date">[${pr.date}]</span>
            </div>
        `).join('');
        wallHtml = `<div class="card wall-of-fame"><h3>LOG DES PICS DE PERFORMANCE</h3>${items}</div>`;
    }

    return `
        <div class="section-header">
            <h2>${meta.title}</h2>
        </div>

        <div class="stats-grid">
            <div class="card stat-card"><div class="value">${fmt(rm.squat)}</div><div class="label">SQ</div></div>
            <div class="card stat-card"><div class="value">${fmt(rm.bench)}</div><div class="label">BP</div></div>
            <div class="card stat-card"><div class="value">${fmt(rm.deadlift)}</div><div class="label">DL</div></div>
            <div class="stat-total"><div class="value">${total} KG</div><div class="label">PUISSANCE DE SORTIE — RATIO ${ratio}X</div></div>
        </div>

        <div class="card progress-bar-wrap">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <h3 style="margin:0">AVANCEMENT MISSION</h3>
                <span class="badge badge-green">${prog.pct}%</span>
            </div>
            <div class="progress-bar"><div class="progress-bar-fill" style="width:${prog.pct}%"></div></div>
            <div class="progress-label"><span>${prog.done} séquences</span><span>${prog.total} total</span></div>
        </div>

        ${nextHtml}
        ${wallHtml}
    `;
}

export function initAccueil() {
    document.querySelectorAll('#accueil [data-tab-to]').forEach(btn => {
        btn.addEventListener('click', e => {
            const tabId = e.currentTarget.dataset.tabTo;
            import('../app.js').then(app => app.navigateToTab(tabId));
        });
    });
}
