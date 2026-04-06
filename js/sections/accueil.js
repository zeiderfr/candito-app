// js/sections/accueil.js — Dashboard Accueil + Wall of Fame (Idée B)
import { State, getNextSession, getProgress } from '../state.js';
import { fmt, loadRange } from '../utils.js';
import { SECTION_META } from '../data.js';

export function renderAccueil(meta) {
    const rm = State.rm;
    const total = rm.squat + rm.bench + rm.deadlift;
    const next = getNextSession();
    const prog = getProgress();
    const prs = State.prs || [];

    let nextHtml = '';
    if (next) {
        const s = next.session;
        const weekMeta = SECTION_META[next.weekId];
        const statusLabel = next.status === 'in-progress' ? 'Reprendre la séance' : 'Démarrer la séance';
        const statusBadge = next.status === 'in-progress'
            ? '<span class="badge badge-orange">En cours</span>'
            : '<span class="badge badge-red">Prochaine</span>';
        const previews = s.exercises.slice(0, 4).map(ex => {
            const detail = ex.lift ? `${ex.sets}×${ex.reps} @ ${loadRange(ex.lift, ex.lo, ex.hi)}` : `${ex.sets}×${ex.reps}`;
            return `<div class="exercise-mini"><span class="ex-name">${ex.name}</span><span class="ex-detail">${detail}</span></div>`;
        }).join('');
        const more = s.exercises.length > 4 ? `<p style="color:var(--text-3);font-size:0.75rem;text-align:center">+ ${s.exercises.length - 4} exercice(s)</p>` : '';

        nextHtml = `
            <div class="card next-session">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <span class="label">${weekMeta.title}</span>
                    ${statusBadge}
                </div>
                <div class="session-day">${s.day} — ${s.focus}</div>
                <div class="session-focus">${s.exercises.length} exercices</div>
                <div class="exercise-preview">${previews}${more}</div>
                <button class="btn btn-block" data-tab-to="${next.weekId}">${statusLabel} →</button>
            </div>`;
    } else {
        nextHtml = `
            <div class="card next-session rest">
                <div class="session-day">Programme terminé</div>
                <div class="session-focus">Tu as complété l'intégralité du Candito 6 Semaines. Bravo !</div>
            </div>`;
    }

    let wallHtml = '';
    if (prs.length > 0) {
        const items = prs.map(pr => `
            <div class="pr-item">
                <span class="pr-lift">${pr.lift}</span>
                <span class="pr-weight">${pr.weight} kg</span>
                <span class="pr-date">${pr.date}</span>
            </div>
        `).join('');
        wallHtml = `<div class="card wall-of-fame"><h3>Wall of Fame</h3>${items}</div>`;
    }

    return `
        <div class="section-header">
            <h2>${meta.title}</h2>
        </div>

        <div class="stats-grid">
            <div class="card stat-card"><div class="value">${fmt(rm.squat)}</div><div class="label">Squat</div></div>
            <div class="card stat-card"><div class="value">${fmt(rm.bench)}</div><div class="label">Bench</div></div>
            <div class="card stat-card"><div class="value">${fmt(rm.deadlift)}</div><div class="label">Deadlift</div></div>
            <div class="stat-total"><div class="value">${total} kg</div><div class="label">Total</div></div>
        </div>

        <div class="card progress-bar-wrap">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <h3 style="margin:0">Progression</h3>
                <span class="badge badge-green">${prog.pct}%</span>
            </div>
            <div class="progress-bar"><div class="progress-bar-fill" style="width:${prog.pct}%"></div></div>
            <div class="progress-label"><span>${prog.done} séances</span><span>${prog.total} total</span></div>
        </div>

        ${nextHtml}
        ${wallHtml}
    `;
}

export function initAccueil() {
    // Tab-switch buttons (SPA navigation)
    document.querySelectorAll('#accueil [data-tab-to]').forEach(btn => {
        btn.addEventListener('click', e => {
            const tabId = e.currentTarget.dataset.tabTo;
            // Import navigateToTab from app.js (dynamic to avoid circular dep)
            import('../app.js').then(app => app.navigateToTab(tabId));
        });
    });
}
