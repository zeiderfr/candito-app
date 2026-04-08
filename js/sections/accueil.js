// js/sections/accueil.js — Dashboard Accueil (Mode Locker Room) + Wall of Fame
import { State, getNextSession, getProgress, getLastCompletedSession } from '../state.js';
import { fmt, loadRange } from '../utils.js';
import { SECTION_META } from '../data.js';

function buildCoachMessage(last, next, prs, prog) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    const sessionFocus = next ? next.session.focus : null;

    let line1 = '';
    let line2 = '';
    let dataLine = '';

    // Analyse de la dernière séance
    if (last) {
        const rpes = (last.data.rpes || []).filter(r => r !== null && r !== undefined && r !== '');
        const avgRpe = rpes.length > 0 ? rpes.reduce((a, b) => Number(a) + Number(b), 0) / rpes.length : null;

        // Vérifier PR récent (3 dernières séances complétées)
        const recentPR = Array.isArray(prs) && prs.length > 0 && prog.done <= 3
            ? prs[prs.length - 1]
            : null;

        if (recentPR) {
            line1 = "Tu viens de battre un record.";
            line2 = "Ce soir on consolide — c'est comme ça qu'on construit un total.";
        } else if (avgRpe !== null && avgRpe >= 8.5) {
            line1 = "Tu as mis du cœur la dernière fois.";
            line2 = "Laisse le travail parler ce soir — la progression est dans la constance.";
        } else if (avgRpe !== null && avgRpe <= 7.0) {
            line1 = "Tu avais encore en réserve la dernière fois.";
            line2 = "Ce soir, c'est l'heure de monter les charges.";
        } else {
            line1 = "Bonne maîtrise la dernière fois.";
            line2 = "Ce soir, même engagement — tu progresses.";
        }

        // Ligne de données : exercice principal + charge + RPE
        const mainEx = last.session.exercises[0];
        const mainLoad = (last.data.loads || [])[0];
        const mainRpe = (last.data.rpes || [])[0];
        if (mainEx && mainLoad) {
            dataLine = `Dernière séance : ${mainEx.name} ${mainLoad} kg`;
            if (mainRpe) dataLine += ` · RPE ${mainRpe}`;
        }
    } else {
        line1 = "C'est le début. Chaque grand total commence ici.";
        line2 = "Technique propre, charges contrôlées — on construit.";
    }

    // Contexte de progression
    if (prog.pct >= 80) {
        line2 = "Tu es en finale. Chaque séance compte double à ce stade.";
    } else if (prog.pct >= 50 && !line2.includes('construit') && !line2.includes('total')) {
        line2 += " La fondation est solide.";
    }

    return { greeting, sessionFocus, line1, line2, dataLine };
}

export function renderAccueil(meta) {
    const rm = State.rm;
    const total = Number(rm.squat || 0) + Number(rm.bench || 0) + Number(rm.deadlift || 0);
    const next = getNextSession();
    const last = getLastCompletedSession();
    const prog = getProgress();
    const prs = State.prs || [];

    let headerHtml = '';
    let mainHtml = '';

    if (next) {
        const s = next.session;

        // 1. Coach card dynamique
        const { greeting, sessionFocus, line1, line2, dataLine } = buildCoachMessage(last, next, prs, prog);
        const greetingLine = sessionFocus
            ? `${greeting} · <span style="color:var(--gold-light)">${sessionFocus}</span>`
            : greeting;

        headerHtml = `
            <div class="coach-card" style="margin-top:10px;">
                <div class="coach-greeting">${greetingLine}</div>
                <div class="coach-message">${line1}<br>${line2}</div>
                ${dataLine ? `<div class="coach-data">${dataLine}</div>` : ''}
            </div>
        `;

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
        <div class="stats-title" style="margin-top:16px;">Dossier Athlète</div>
        <div class="hero-card-workout" style="padding:20px 24px; display:flex; flex-direction:column; gap:20px;">
            <!-- Barres de Max -->
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="text-align:center; flex:1;">
                    <div style="font-size:0.65rem; color:rgba(255,255,255,0.4); letter-spacing:0.05em; text-transform:uppercase; margin-bottom:4px;">Squat</div>
                    <div style="font-size:1.15rem; font-weight:700; color:var(--text-3); font-variant-numeric:tabular-nums;">${fmt(rm.squat)}</div>
                </div>
                <div style="text-align:center; flex:1; border-left:1px solid rgba(255,255,255,0.05); border-right:1px solid rgba(255,255,255,0.05);">
                    <div style="font-size:0.65rem; color:rgba(255,255,255,0.4); letter-spacing:0.05em; text-transform:uppercase; margin-bottom:4px;">Bench</div>
                    <div style="font-size:1.15rem; font-weight:700; color:var(--text-3); font-variant-numeric:tabular-nums;">${fmt(rm.bench)}</div>
                </div>
                <div style="text-align:center; flex:1;">
                    <div style="font-size:0.65rem; color:rgba(255,255,255,0.4); letter-spacing:0.05em; text-transform:uppercase; margin-bottom:4px;">Deadlift</div>
                    <div style="font-size:1.15rem; font-weight:700; color:var(--text-3); font-variant-numeric:tabular-nums;">${fmt(rm.deadlift)}</div>
                </div>
                <div style="text-align:center; flex:1.2; border-left:1px solid rgba(255,255,255,0.1); padding-left:8px;">
                    <div style="font-size:0.65rem; color:rgba(202,164,93,0.7); letter-spacing:0.05em; text-transform:uppercase; margin-bottom:4px;">Total</div>
                    <div style="font-size:1.2rem; font-weight:800; color:var(--gold); font-variant-numeric:tabular-nums; text-shadow:0 0 12px rgba(202,164,93,0.3);">${total}</div>
                </div>
            </div>

            <!-- Ligne de séparation douce -->
            <div style="height:1px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);"></div>

            <!-- Progression Compacte -->
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.7); font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Progression du Programme</div>
                    <div style="font-size:0.75rem; color:var(--gold-light); font-weight:700; font-variant-numeric:tabular-nums;">${prog.pct}%</div>
                </div>
                <div style="background:rgba(255,255,255,0.08); height:6px; border-radius:3px; overflow:hidden;">
                    <div style="background:linear-gradient(90deg, var(--gold), var(--gold-light)); width:${prog.pct}%; height:100%; box-shadow:0 0 8px rgba(202,164,93,0.4); border-radius:3px;"></div>
                </div>
                <div style="margin-top:6px; font-size:0.65rem; color:rgba(255,255,255,0.4); text-align:right;">
                    ${prog.done} sur ${prog.total} complétées
                </div>
            </div>
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
