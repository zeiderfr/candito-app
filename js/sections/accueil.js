// js/sections/accueil.js — Dashboard Accueil (Mode Locker Room) + Wall of Fame
import { State, getNextSession, getProgress } from '../state.js';
import { fmt, loadRange } from '../utils.js';
import { SECTION_META } from '../data.js';

export function renderAccueil(meta) {
    const rm = State.rm;
    const total = Number(rm.squat || 0) + Number(rm.bench || 0) + Number(rm.deadlift || 0);
    const next = getNextSession();
    const prog = getProgress();
    const prs = State.prs || [];

    let headerHtml = '';
    let mainHtml = '';

    if (next) {
        const s = next.session;
        const weekId = next.weekId;
        
        // 1. Mantra (Motivation)
        let mantra = "Prépare-toi pour la séance.";
        if (weekId === 's1s2') mantra = "Volume et technique.<br>Construis la fondation.";
        else if (weekId === 's3') mantra = "Transmutation.<br>La charge monte, reste gainé.";
        else if (weekId === 's4') mantra = "Acclimatation lourde.<br>Le système nerveux s'éveille.";
        else if (weekId === 's5') mantra = "Jour d'AMRAP.<br>Ne laisse rien dans le réservoir.";
        else if (weekId === 's6') mantra = "Semaine 6.<br>C'est l'heure de la guerre.";

        headerHtml = `<div class="locker-room-header" style="margin-top: 10px;"><h2>${mantra}</h2></div>`;

        // 2. Main Event
        const mainEx = s.exercises && s.exercises.length > 0 ? s.exercises[0] : null;
        
        if (mainEx) {
            let loadText = "Poids de corps";
            let detailText = `${mainEx.sets}×${mainEx.reps}`;

            if (mainEx.lift && mainEx.lo && mainEx.hi) {
                loadText = loadRange(mainEx.lift, mainEx.lo, mainEx.hi);
                detailText = `${mainEx.sets} séries × ${mainEx.reps} reps`;
            } else if (mainEx.isTest || mainEx.isPR) {
                if (mainEx.lift && mainEx.lo && mainEx.hi) {
                    loadText = loadRange(mainEx.lift, mainEx.lo, mainEx.hi);
                } else {
                    loadText = "Max";
                }
                detailText = `1 série × ${mainEx.reps}`;
            }

            const heroCardHtml = `
                <div class="hero-card-workout">
                    <div style="font-size:0.875rem;font-weight:800;color:#FF6B35;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">
                        ▶ ${s.day} — ${s.focus}
                    </div>
                    <div class="hero-lift-name">${mainEx.name}</div>
                    <div class="hero-lift-load">${loadText}</div>
                    <div style="font-size:1.0625rem;color:rgba(255,255,255,0.6);font-weight:500;">
                        ${detailText}
                    </div>
                </div>
            `;

            // 3. Battle Plan
            let battlePlanHtml = '';
            if (s.exercises.length > 1) {
                const accList = s.exercises.slice(1).map(ex => {
                    let accDetail = `${ex.sets}×${ex.reps}`;
                    if (ex.lift && ex.lo && ex.hi) {
                        accDetail = `${ex.sets}×${ex.reps} @ ${loadRange(ex.lift, ex.lo, ex.hi)}`;
                    }
                    return `
                        <div class="battle-plan-item">
                            <span>${ex.name}</span>
                            <span>${accDetail}</span>
                        </div>
                    `;
                }).join('');
                
                battlePlanHtml = `
                    <div class="battle-plan-list">
                        <div style="font-size:0.8rem;text-transform:uppercase;color:var(--text-3);font-weight:700;margin-bottom:8px;padding-left:14px;">Plan de bataille cible</div>
                        ${accList}
                    </div>
                `;
            }

            // 4. Bouton Démarrer
            const btnHtml = `<button class="btn-start-war" data-tab-to="${next.weekId}">DÉMARRER LA SÉANCE</button>`;

            mainHtml = heroCardHtml + battlePlanHtml + btnHtml;
        }

    } else {
        headerHtml = `<div class="locker-room-header"><h2>Programme terminé. 🎉</h2></div>`;
        mainHtml = `
            <div class="card next-session rest">
                <div class="session-focus">Tu as complété l'intégralité du Candito 6 Semaines. Bravo ! Repose-toi.</div>
            </div>
        `;
    }

    // 5. Relégation des stats
    let wallHtml = '';
    if (prs.length > 0) {
        const items = prs.map(pr => `
            <div class="pr-item">
                <span class="pr-lift">${pr.lift}</span>
                <span class="pr-weight">${pr.weight} kg</span>
                <span class="pr-date">${pr.date}</span>
            </div>
        `).join('');
        wallHtml = `<div class="card wall-of-fame" style="margin-top:16px;"><h3>Wall of Fame</h3>${items}</div>`;
    }

    const statsHtml = `
        <div class="stats-title">Tes Maximas Actuels</div>
        <div class="stats-grid">
            <div class="stat-total stat-card--total"><div class="value">${total} kg</div><div class="label">Total</div></div>
            <div class="card stat-card stat-card--squat"><div class="value">${fmt(rm.squat)}</div><div class="label">Squat</div></div>
            <div class="card stat-card stat-card--bench"><div class="value">${fmt(rm.bench)}</div><div class="label">Bench</div></div>
            <div class="card stat-card stat-card--deadlift"><div class="value">${fmt(rm.deadlift)}</div><div class="label">Deadlift</div></div>
        </div>

        <div class="card progress-bar-wrap" style="margin-top:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <h3 style="margin:0">Progression</h3>
                <span class="badge badge-green">${prog.pct}%</span>
            </div>
            <div class="progress-bar"><div class="progress-bar-fill" style="width:${prog.pct}%"></div></div>
            <div class="progress-label"><span>${prog.done} séances</span><span>${prog.total} total</span></div>
        </div>
    `;

    return `
        ${headerHtml}
        ${mainHtml}
        ${statsHtml}
        ${wallHtml}
        <div style="height: 40px;"></div>
    `;
}

export function initAccueil() {
    document.querySelectorAll('#accueil [data-tab-to], .btn-start-war').forEach(btn => {
        btn.addEventListener('click', e => {
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            
            // Allow bubbling to work if nested elements are clicked
            const trigger = e.currentTarget;
            let tabId = trigger.dataset.tabTo;
            if (!tabId && trigger.closest('[data-tab-to]')) {
                tabId = trigger.closest('[data-tab-to]').dataset.tabTo;
            }

            if (tabId) {
                import('../app.js').then(app => app.navigateToTab(tabId));
            }
        });
    });
}
