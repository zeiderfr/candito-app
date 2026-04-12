// js/tracker.js — Module mutualisé pour S1-S2 → S6
// Gère : rendu tableaux, RPE slider, PR celebration, SVG rings, Tunnel Vision
// Dépend de : data.js, state.js, utils.js

import { PROGRAM } from './data.js';
import { State, save, saveImmediate, checkAndRecordPR } from './state.js';
import { fmt, loadRange, calcLoad, calculateAutoRPE } from './utils.js';
import { renderReadinessPanel, initReadiness } from './readiness.js';

// ── SVG Ring constants ──
const RING_R = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R; // ≈ 100.53

function fatigueColor(avgRpe) {
    if (avgRpe < 7.5) return 'var(--green)';
    if (avgRpe < 8.5) return 'var(--orange)';
    return 'var(--red)';
}

function createFatigueRing(avgRpe) {
    const percent = Math.round(((avgRpe - 6) / 4) * 100);
    const offset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * percent / 100);
    const color = fatigueColor(avgRpe);
    return `<svg class="fatigue-ring" width="40" height="40" viewBox="0 0 40 40" aria-label="Fatigue RPE ${avgRpe}">
        <circle cx="20" cy="20" r="${RING_R}" stroke="rgba(0,0,0,0.08)" stroke-width="4" fill="none"/>
        <circle class="ring-progress" cx="20" cy="20" r="${RING_R}"
            stroke="${color}" stroke-width="4" fill="none"
            stroke-dasharray="${RING_CIRCUMFERENCE.toFixed(2)}"
            stroke-dashoffset="${offset.toFixed(2)}"
            stroke-linecap="round"
            transform="rotate(-90 20 20)"/>
    </svg>`;
}

// ── PR Ambient Glow ──
function triggerPRGlow() {
    document.documentElement.style.setProperty('--blob-1', '#FF9F0A');
    document.documentElement.style.setProperty('--blob-2', '#FF6B35');
    const bg = document.querySelector('.ambient-background');
    if (bg) bg.style.opacity = '0.8';
    setTimeout(() => {
        document.documentElement.style.removeProperty('--blob-1');
        document.documentElement.style.removeProperty('--blob-2');
        if (bg) bg.style.opacity = '';
    }, 4000);
}

// ── Tunnel Vision ──
function openTunnelVision(liftName, targetLoad, triggerEl) {
    const overlay = document.getElementById('tunnel-vision-overlay');
    if (!overlay) return;
    const row = triggerEl.closest('tr');

    document.getElementById('tunnel-lift-name').textContent = liftName;
    document.getElementById('tunnel-load').textContent = targetLoad;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    document.getElementById('tunnel-validate').onclick = () => {
        if (row) {
            const loadInput = row.querySelector('.tracker-load');
            if (loadInput) loadInput.value = targetLoad;
            const checkEl = row.querySelector('.tracker-check');
            if (checkEl) {
                checkEl.checked = true;
                checkEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        closeTunnelVision();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    };

    document.getElementById('tunnel-close').onclick = closeTunnelVision;
}

function closeTunnelVision() {
    const overlay = document.getElementById('tunnel-vision-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Expose to global scope for inline onclick handlers
window.openTunnelVision = openTunnelVision;
window.closeTunnelVision = closeTunnelVision;

// ⭐ Rendu HTML d'une semaine entière
// altFilter (optionnel) : 'test' | 'decharge' — utilisé pour S6
export function renderWeekTracker(weekId, meta, altFilter = null) {
    const week = PROGRAM.find(w => w.id === weekId);
    const sessions = altFilter
        ? week.sessions.filter(s => s.alt === altFilter)
        : week.sessions;

    let html = meta.title
        ? `<div class="section-header"><h2>${meta.title}</h2><div class="subtitle">${meta.subtitle}</div></div>`
        : `<div style="margin:4px 0 16px"><span class="label" style="font-size:0.9rem;font-weight:600;color:var(--text-2)">${meta.subtitle}</span></div>`;

    html += '<div class="section-cards-grid">';

    sessions.forEach(session => {
        const sd = State.sessions[session.id] || {};
        let setIndex = 0;
        const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets, 0);
        const doneSets = (sd.sets || []).filter(Boolean).length;
        const sessionDone = doneSets >= totalSets;

        // Calcul fatigue moyenne
        const rpes = (sd.rpes || []).filter(v => v != null);
        const avgRpe = rpes.length > 0 ? (rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1) : null;

        html += `<div class="card exercise-card" id="session-${session.id}" style="position:relative">`;
        html += renderReadinessPanel(session.id);
        html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">`;
        html += `<h3 style="margin:0">${session.day} — ${session.focus}</h3>`;
        if (sessionDone) html += `<span class="badge badge-green">Terminée ✓</span>`;
        else if (doneSets > 0) html += `<span class="badge badge-orange">${doneSets}/${totalSets} séries</span>`;
        html += `</div>`;
        html += `<div class="table-wrap"><table><thead><tr>
            <th>Exercice</th><th>Séries×Reps</th><th>Charge cible</th>
            <th>Charge réelle</th><th>RPE</th><th>✓</th>
        </tr></thead><tbody>`;

        // Lire le modificateur readiness pour cette session
        const readinessMod = sd.readiness ? sd.readiness.modifier : 0;

        session.exercises.forEach(ex => {
            const adjLo = ex.lo * (1 + readinessMod);
            const adjHi = ex.hi * (1 + readinessMod);
            const targetLoad = ex.lift ? loadRange(ex.lift, adjLo, adjHi) : '—';
            const tunnelLoad = ex.lift ? fmt(calcLoad(State.rm[ex.lift], adjLo)) : '—';
            const isFocusEx = ex.isTest || ex.isPR;

            for (let si = 0; si < ex.sets; si++) {
                const idx = setIndex++;
                const done = (sd.sets || [])[idx] || false;
                const storedLoad = (sd.loads || [])[idx] ?? '';
                const storedRpe = (sd.rpes || [])[idx] ?? null;
                const defaultLoad = ex.lift ? fmt(calcLoad(State.rm[ex.lift], ex.lo)) : '';

                const loadToUse = storedLoad || (ex.lift ? calcLoad(State.rm[ex.lift], ex.lo) : null);
                const true1RM = ex.lift ? State.rm[ex.lift] : null;
                const autoRpe = calculateAutoRPE(true1RM, loadToUse, ex.reps);
                const rpeVal = storedRpe ?? autoRpe;

                const rowClass = done ? 'tracker-row-done' : '';

                html += `<tr class="${rowClass}" data-session="${session.id}" data-idx="${idx}" data-lift="${ex.lift || ''}" data-reps="${ex.reps}">`;
                if (si === 0) {
                    const tunnelBtn = isFocusEx
                        ? `<button class="btn-tunnel-vision" onclick="openTunnelVision('${ex.name}', '${tunnelLoad}', this)" aria-label="Mode Focus">🎯 Focus</button>`
                        : '';
                    html += `<td rowspan="${ex.sets}" style="font-weight:600;vertical-align:top">${ex.name}${tunnelBtn ? '<br>' + tunnelBtn : ''}</td>`;
                    html += `<td rowspan="${ex.sets}" style="vertical-align:top">${ex.sets}×${ex.reps}</td>`;
                    html += `<td rowspan="${ex.sets}" style="vertical-align:top">${targetLoad}</td>`;
                }
                const storedAmrapReps = ex.isTest && ex.reps === 'AMRAP' ? ((sd.repsAMRAP || [])[idx] ?? '') : null;
                html += `<td><input class="input input-sm tracker-load" type="number"
                    data-session="${session.id}" data-idx="${idx}"
                    value="${storedLoad || defaultLoad}" placeholder="${defaultLoad}" inputmode="decimal"
                    aria-label="Charge réelle série ${idx + 1}">`;
                if (storedAmrapReps !== null) {
                    html += `<input class="tracker-amrap-reps" type="number"
                        data-session="${session.id}" data-idx="${idx}"
                        value="${storedAmrapReps}" placeholder="Reps" inputmode="numeric"
                        min="1" max="50" aria-label="Répétitions réalisées AMRAP">`;
                }
                html += `</td>`;

                // ⭐ RPE SLIDER
                const isRedline = rpeVal >= 9.5;
                const grindClass = isRedline ? ' grind' : '';
                const redlineClass = isRedline ? ' redline' : '';
                html += `<td style="min-width:80px">
                    <input type="range" class="rpe-slider tracker-rpe${grindClass}" min="6" max="10" step="0.5" value="${rpeVal}"
                        data-session="${session.id}" data-idx="${idx}"
                        aria-label="RPE série ${idx + 1}">
                    <div class="rpe-value${redlineClass}">${rpeVal > 6 ? rpeVal : '—'}</div>
                </td>`;

                html += `<td class="set-checkbox"><input type="checkbox" class="tracker-check"
                    data-session="${session.id}" data-idx="${idx}"
                    ${done ? 'checked' : ''}
                    aria-label="Série ${idx + 1} terminée"></td>`;
                html += `</tr>`;
            }
        });

        html += `</tbody></table></div>`;

        // ⭐ Jauge de fatigue — SVG Ring
        if (avgRpe) {
            html += `<div class="fatigue-gauge">
                <span class="fatigue-label">Fatigue</span>
                ${createFatigueRing(parseFloat(avgRpe))}
                <span class="fatigue-label">RPE moy. ${avgRpe}</span>
            </div>`;

            if (parseFloat(avgRpe) >= 9.0) {
                html += `<div class="fatigue-alert">
                    ⚠️ Fatigue élevée détectée. Envisage de réduire tes charges de 2.5 kg la séance prochaine.
                </div>`;
            }
        }
        html += `</div>`; // fin .card
    });

    html += '</div>'; // fin .section-cards-grid
    return html;
}

// ⭐ Initialisation des listeners pour une section
export function initTracker(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // ── Feature 6 : Readiness ──
    initReadiness(sectionId);

    // Checkboxes — saveImmediate
    section.querySelectorAll('.tracker-check').forEach(cb => {
        cb.addEventListener('change', e => {
            const { session, idx } = e.target.dataset;
            ensureSession(session);
            State.sessions[session].sets[parseInt(idx)] = e.target.checked;
            saveImmediate();
            e.target.closest('tr').classList.toggle('tracker-row-done', e.target.checked);

            // ⭐ LIVE BADGE UPDATE — recalculer le compteur de séries
            updateSessionBadge(e.target.closest('.card'), session);

            // ⭐ PR DETECTION
            if (e.target.checked) {
                const row = e.target.closest('tr');
                const lift = row.dataset.lift;
                const loadInput = row.querySelector('.tracker-load');
                if (lift && loadInput) {
                    const weight = parseFloat(loadInput.value);
                    if (weight && checkAndRecordPR(lift, weight)) {
                        const card = row.closest('.card');

                        // Glow animation
                        card.classList.add('pr-celebration');
                        card.addEventListener('animationend', () => card.classList.remove('pr-celebration'), { once: true });

                        // Ambient glow (mesh gradient)
                        triggerPRGlow();

                        // Badge PR
                        if (!row.querySelector('.pr-badge-inline')) {
                            const badge = document.createElement('span');
                            badge.className = 'pr-badge-inline';
                            badge.textContent = 'Nouveau PR';
                            row.querySelector('td').style.position = 'relative';
                            row.querySelector('td').appendChild(badge);
                        }

                        // Message PR
                        const existingMsg = card.querySelector('.pr-override-msg');
                        if (!existingMsg) {
                            const msg = document.createElement('div');
                            msg.className = 'pr-override-msg';
                            msg.textContent = `🎉 Nouveau record : ${lift.charAt(0).toUpperCase() + lift.slice(1)} — ${weight} kg`;
                            card.appendChild(msg);
                        }

                        // Vibration haptique
                        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                    }
                }
            }
        });
    });

    // Charge réelle — save (debounce 300ms) et recalcul RPE Auto
    section.querySelectorAll('.tracker-load').forEach(inp => {
        inp.addEventListener('change', e => {
            const { session, idx } = e.target.dataset;
            ensureSession(session);
            const loadVal = parseFloat(e.target.value) || null;
            State.sessions[session].loads[parseInt(idx)] = loadVal;
            save();

            // ⭐ RPE AUTO UPDATE
            const row = e.target.closest('tr');
            const lift = row.dataset.lift;
            const reps = row.dataset.reps;
            if (lift && loadVal) {
                const newRPE = calculateAutoRPE(State.rm[lift], loadVal, reps);
                const slider = row.querySelector('.tracker-rpe');
                if (slider) {
                    slider.value = newRPE;
                    slider.dispatchEvent(new Event('input'));
                    State.sessions[session].rpes[parseInt(idx)] = newRPE;
                    saveImmediate();
                }
            }
        });
    });

    // ⭐ RPE SLIDER
    section.querySelectorAll('.tracker-rpe').forEach(slider => {
        slider.addEventListener('input', e => {
            const val = parseFloat(e.target.value);
            const isRedline = val >= 9.5;

            e.target.classList.toggle('grind', isRedline);
            const label = e.target.parentElement.querySelector('.rpe-value');
            if (label) {
                label.textContent = val > 6 ? val : '—';
                label.classList.toggle('redline', isRedline);
            }

            if (isRedline && navigator.vibrate) {
                navigator.vibrate([50, 30, 50]);
            }
        });
        slider.addEventListener('change', e => {
            const { session, idx } = e.target.dataset;
            ensureSession(session);
            State.sessions[session].rpes[parseInt(idx)] = parseFloat(e.target.value) || null;
            save();
        });
    });

    // ── Feature 8 : AMRAP reps ──
    section.querySelectorAll('.tracker-amrap-reps').forEach(inp => {
        inp.addEventListener('change', e => {
            const { session, idx } = e.target.dataset;
            ensureSession(session);
            if (!State.sessions[session].repsAMRAP) State.sessions[session].repsAMRAP = [];
            State.sessions[session].repsAMRAP[parseInt(idx)] = parseInt(e.target.value) || null;
            save();
        });
    });
}

function ensureSession(id) {
    if (!State.sessions[id]) State.sessions[id] = { sets: [], loads: [], rpes: [], repsAMRAP: [] };
}

// ⭐ Mise à jour dynamique du badge de progression de la session
function updateSessionBadge(card, sessionId) {
    if (!card) return;
    const checkboxes = card.querySelectorAll('.tracker-check');
    const totalSets = checkboxes.length;
    const doneSets = [...checkboxes].filter(cb => cb.checked).length;
    const sessionDone = doneSets >= totalSets;

    // Trouver ou créer le badge dans le header
    const header = card.querySelector('div[style*="justify-content:space-between"]');
    if (!header) return;

    let badge = header.querySelector('.badge');
    if (sessionDone) {
        if (badge) {
            badge.className = 'badge badge-green';
            badge.textContent = 'Terminée ✓';
        } else {
            badge = document.createElement('span');
            badge.className = 'badge badge-green';
            badge.textContent = 'Terminée ✓';
            header.appendChild(badge);
        }
    } else if (doneSets > 0) {
        if (badge) {
            badge.className = 'badge badge-orange';
            badge.textContent = `${doneSets}/${totalSets} séries`;
        } else {
            badge = document.createElement('span');
            badge.className = 'badge badge-orange';
            badge.textContent = `${doneSets}/${totalSets} séries`;
            header.appendChild(badge);
        }
    } else {
        // Aucune série complétée → retirer le badge
        if (badge) badge.remove();
    }
}
