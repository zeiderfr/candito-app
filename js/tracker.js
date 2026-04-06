// js/tracker.js — Module mutualisé pour S1-S2 → S6
// Tactical Blueprint : RPE Compte-tours, PR Overdrive, Fatigue moteur
// Dépend de : data.js, state.js, utils.js

import { PROGRAM } from './data.js';
import { State, save, saveImmediate, checkAndRecordPR } from './state.js';
import { fmt, loadRange, calcLoad } from './utils.js';

// ⭐ Rendu HTML d'une semaine entière
// altFilter (optionnel) : 'test' | 'decharge' — utilisé pour S6
export function renderWeekTracker(weekId, meta, altFilter = null) {
    const week = PROGRAM.find(w => w.id === weekId);
    const sessions = altFilter
        ? week.sessions.filter(s => s.alt === altFilter)
        : week.sessions;

    let html = meta.title
        ? `<div class="section-header"><h2>${meta.title}</h2><div class="subtitle">${meta.subtitle}</div></div>`
        : `<div style="margin:4px 0 16px;padding-left:12px;border-left:2px solid var(--cyan-20)"><span class="label">${meta.subtitle}</span></div>`;

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
        html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">`;
        html += `<h3 style="margin:0">${session.day} — ${session.focus}</h3>`;
        if (sessionDone) html += `<span class="badge badge-green">VALIDÉE</span>`;
        else if (doneSets > 0) html += `<span class="badge badge-orange">${doneSets}/${totalSets} SÉRIES</span>`;
        html += `</div>`;
        html += `<div class="table-wrap"><table><thead><tr>
            <th>Exercice</th><th>Séries×Reps</th><th>Charge cible</th>
            <th>Charge réelle</th><th>RPE</th><th>✓</th>
        </tr></thead><tbody>`;

        session.exercises.forEach(ex => {
            const targetLoad = ex.lift ? loadRange(ex.lift, ex.lo, ex.hi) : '—';
            for (let si = 0; si < ex.sets; si++) {
                const idx = setIndex++;
                const done = (sd.sets || [])[idx] || false;
                const storedLoad = (sd.loads || [])[idx] ?? '';
                const storedRpe = (sd.rpes || [])[idx] ?? 6;
                const defaultLoad = ex.lift ? fmt(calcLoad(State.rm[ex.lift], ex.lo)) : '';
                const rowClass = done ? 'tracker-row-done' : '';

                html += `<tr class="${rowClass}" data-session="${session.id}" data-idx="${idx}" data-lift="${ex.lift || ''}">`;
                if (si === 0) {
                    html += `<td rowspan="${ex.sets}" style="font-weight:600;vertical-align:top">${ex.name}</td>`;
                    html += `<td rowspan="${ex.sets}" style="vertical-align:top;font-family:var(--mono)">${ex.sets}×${ex.reps}</td>`;
                    html += `<td rowspan="${ex.sets}" style="vertical-align:top;font-family:var(--mono)">${targetLoad}</td>`;
                }
                html += `<td><input class="input input-sm tracker-load" type="number"
                    data-session="${session.id}" data-idx="${idx}" data-lift="${ex.lift || ''}"
                    value="${storedLoad || defaultLoad}" placeholder="${defaultLoad}" inputmode="decimal"
                    aria-label="Charge réelle série ${idx + 1}"></td>`;

                // ⭐ RPE SLIDER (Compte-tours HUD)
                const rpeVal = storedRpe || 6;
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

        // ⭐ Jauge de fatigue (Indicateur température moteur)
        if (avgRpe) {
            const fatPct = Math.round(((avgRpe - 6) / 4) * 100);
            // Color from cyan (6) to orange (10)
            const fatColor = avgRpe >= 8.5
                ? 'var(--alert)'
                : avgRpe >= 7.5
                    ? 'var(--warn)'
                    : 'var(--cyan)';
            html += `<div class="fatigue-gauge">
                <span class="fatigue-label">TEMP.</span>
                <div class="fatigue-bar"><div class="fatigue-fill" style="width:${fatPct}%;background:${fatColor}"></div></div>
                <span class="fatigue-label">RPE ${avgRpe}</span>
            </div>`;

            // Alerte surchauffe
            if (parseFloat(avgRpe) >= 9.0) {
                html += `<div class="fatigue-alert">
                    [ ALERTE SYSTÈME : Surchauffe détectée. Recommandation : Ajuster la matrice de charge de -2.5kg ]
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

    // Checkboxes — saveImmediate
    section.querySelectorAll('.tracker-check').forEach(cb => {
        cb.addEventListener('change', e => {
            const { session, idx } = e.target.dataset;
            ensureSession(session);
            State.sessions[session].sets[parseInt(idx)] = e.target.checked;
            saveImmediate();
            e.target.closest('tr').classList.toggle('tracker-row-done', e.target.checked);

            // ⭐ PR DETECTION — OVERDRIVE
            if (e.target.checked) {
                const row = e.target.closest('tr');
                const lift = row.dataset.lift;
                const loadInput = row.querySelector('.tracker-load');
                if (lift && loadInput) {
                    const weight = parseFloat(loadInput.value);
                    if (weight && checkAndRecordPR(lift, weight)) {
                        const card = row.closest('.card');

                        // Flash blanc + bordure orange
                        card.classList.add('pr-celebration');
                        card.addEventListener('animationend', () => card.classList.remove('pr-celebration'), { once: true });

                        // Badge OVERRIDE
                        if (!row.querySelector('.pr-badge-inline')) {
                            const badge = document.createElement('span');
                            badge.className = 'pr-badge-inline';
                            badge.textContent = 'OVERRIDE';
                            row.querySelector('td').style.position = 'relative';
                            row.querySelector('td').appendChild(badge);
                        }

                        // Message OVERRIDE sous le tableau
                        const existingMsg = card.querySelector('.pr-override-msg');
                        if (!existingMsg) {
                            const msg = document.createElement('div');
                            msg.className = 'pr-override-msg';
                            msg.textContent = `[ OVERRIDE : NOUVELLE SPÉCIFICATION ENREGISTRÉE — ${lift.toUpperCase()} >> ${weight} KG ]`;
                            card.appendChild(msg);
                        }

                        // Vibration haptique
                        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                    }
                }
            }
        });
    });

    // Charge réelle — save (debounce 300ms)
    section.querySelectorAll('.tracker-load').forEach(inp => {
        inp.addEventListener('change', e => {
            const { session, idx } = e.target.dataset;
            ensureSession(session);
            State.sessions[session].loads[parseInt(idx)] = parseFloat(e.target.value) || null;
            save();
        });
    });

    // ⭐ RPE SLIDER — Compte-tours HUD (cyan → orange)
    section.querySelectorAll('.tracker-rpe').forEach(slider => {
        slider.addEventListener('input', e => {
            const val = parseFloat(e.target.value);
            const isRedline = val >= 9.5;

            // Grind class + redline blink
            e.target.classList.toggle('grind', isRedline);
            const label = e.target.parentElement.querySelector('.rpe-value');
            if (label) {
                label.textContent = val > 6 ? val : '—';
                label.classList.toggle('redline', isRedline);
            }

            // Vibration on redline
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
}

function ensureSession(id) {
    if (!State.sessions[id]) State.sessions[id] = { sets: [], loads: [], rpes: [] };
}
