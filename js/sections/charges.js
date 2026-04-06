// js/sections/charges.js — Tableau dynamique 40%-102% + Calculateur 1RM
import { State } from '../state.js';
import { calcLoad, fmt } from '../utils.js';

const PERCENTAGES = [
    { pct: 0.40, label: '40%', usage: 'Échauffement léger' },
    { pct: 0.60, label: '60%', usage: 'Échauffement' },
    { pct: 0.65, label: '65%', usage: 'Accessoires (RDL, Larsen)' },
    { pct: 0.68, label: '68%', usage: 'Pause Squat bas' },
    { pct: 0.70, label: '70%', usage: 'Volume léger' },
    { pct: 0.72, label: '72%', usage: 'Pause Squat haut' },
    { pct: 0.75, label: '75%', usage: 'Échauffement lourd' },
    { pct: 0.78, label: '78%', usage: 'S1-S2 bas' },
    { pct: 0.80, label: '80%', usage: 'S1-S2 / Décharge S6' },
    { pct: 0.82, label: '82%', usage: 'S1-S2 haut / S3 Larsen' },
    { pct: 0.85, label: '85%', usage: 'S3 bas' },
    { pct: 0.88, label: '88%', usage: 'S3 haut' },
    { pct: 0.90, label: '90%', usage: 'S4 bas / S6 Opener' },
    { pct: 0.92, label: '92%', usage: 'S4 / S6 Opener alt.' },
    { pct: 0.93, label: '93%', usage: 'S4 haut' },
    { pct: 0.95, label: '95%', usage: 'S5 AMRAP' },
    { pct: 0.96, label: '96%', usage: 'S6 2ème tentative' },
    { pct: 0.98, label: '98%', usage: 'S6 2ème tentative alt.' },
    { pct: 1.00, label: '100%', usage: '1RM actuel' },
    { pct: 1.02, label: '102%', usage: 'Objectif PR' },
];

function buildRows(rm) {
    return PERCENTAGES.map(({ pct, label, usage }) => {
        const sq = fmt(calcLoad(rm.squat, pct));
        const bp = fmt(calcLoad(rm.bench, pct));
        const dl = fmt(calcLoad(rm.deadlift, pct));
        const style = pct >= 0.90
            ? ' style="font-weight:700;color:var(--red)"'
            : pct >= 0.78 ? ' style="font-weight:600"' : '';
        return `<tr${style}>
            <td>${label}</td>
            <td>${sq} kg</td><td>${bp} kg</td><td>${dl} kg</td>
            <td style="color:var(--text-2);font-size:0.8rem">${usage}</td>
        </tr>`;
    }).join('');
}

export function renderCharges(meta) {
    const rows = buildRows(State.rm);

    return `
        <div class="section-header">
            <h2>${meta.title}</h2>
            <div class="subtitle">${meta.subtitle}</div>
        </div>

        <div class="card reveal">
            <h3>Recalculer depuis des 1RM personnalisés</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
                <label style="display:flex;flex-direction:column;gap:4px;font-size:0.85rem;font-weight:600">
                    Squat (kg)
                    <input id="ch-squat" class="input input-sm" type="number" inputmode="decimal"
                        value="${State.rm.squat}" min="20" max="500" aria-label="1RM Squat pour calcul">
                </label>
                <label style="display:flex;flex-direction:column;gap:4px;font-size:0.85rem;font-weight:600">
                    Bench (kg)
                    <input id="ch-bench" class="input input-sm" type="number" inputmode="decimal"
                        value="${State.rm.bench}" min="20" max="500" aria-label="1RM Bench pour calcul">
                </label>
                <label style="display:flex;flex-direction:column;gap:4px;font-size:0.85rem;font-weight:600">
                    Deadlift (kg)
                    <input id="ch-deadlift" class="input input-sm" type="number" inputmode="decimal"
                        value="${State.rm.deadlift}" min="20" max="500" aria-label="1RM Deadlift pour calcul">
                </label>
            </div>
            <div class="note" style="margin:0">
                Ces valeurs ne modifient pas ton profil. Le tableau se met à jour instantanément.
            </div>
        </div>

        <div class="card reveal">
            <div class="table-wrap">
                <table id="charges-table">
                    <thead><tr>
                        <th>% 1RM</th>
                        <th>Squat</th>
                        <th>Bench</th>
                        <th>Deadlift</th>
                        <th>Utilisation programme</th>
                    </tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
}

export function initCharges() {
    const inputs = {
        squat:    document.getElementById('ch-squat'),
        bench:    document.getElementById('ch-bench'),
        deadlift: document.getElementById('ch-deadlift'),
    };
    const tbody = document.querySelector('#charges-table tbody');
    if (!tbody) return;

    function recalc() {
        const rm = {
            squat:    parseFloat(inputs.squat.value)    || State.rm.squat,
            bench:    parseFloat(inputs.bench.value)    || State.rm.bench,
            deadlift: parseFloat(inputs.deadlift.value) || State.rm.deadlift,
        };
        tbody.innerHTML = buildRows(rm);
    }

    Object.values(inputs).forEach(inp => inp.addEventListener('input', recalc));
}
