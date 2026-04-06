// js/sections/charges.js — Matrice de Télémétrie (Tactical Blueprint)
import { State, save } from '../state.js';
import { fmt, calcLoad } from '../utils.js';

const PERCENTAGES = [40, 50, 60, 65, 70, 75, 78, 80, 82, 85, 88, 90, 92, 93, 95, 98, 100, 102];
const USAGE_MAP = {
    40:'Initialisation', 50:'Initialisation', 60:'Initialisation',
    65:'Accessoire', 70:'Accessoire', 75:'Échauffement gamme',
    78:'S1-S2 Accumulation', 80:'S1-S2 / Refroidissement', 82:'S1-S2 Accumulation',
    85:'S3 Transmutation', 88:'S3 Transmutation',
    90:'S4 / Opener', 92:'S4 / Opener', 93:'S4 Acclimatation',
    95:'S5 AMRAP Test', 98:'S6 2ème tentative',
    100:'PR Tentative', 102:'PR Override'
};

export function renderCharges(meta) {
    const sq = State.rm.squat, bp = State.rm.bench, dl = State.rm.deadlift;
    const rows = PERCENTAGES.map(p => {
        const usage = USAGE_MAP[p] || '';
        const isHigh = p >= 95;
        const rowStyle = isHigh ? ' style="color:var(--alert)"' : '';
        return `<tr${rowStyle}>
            <td style="font-weight:700">${p}%</td>
            <td>${fmt(calcLoad(sq, p / 100))} kg</td>
            <td>${fmt(calcLoad(bp, p / 100))} kg</td>
            <td>${fmt(calcLoad(dl, p / 100))} kg</td>
            <td style="color:var(--text-3)">${usage}</td>
        </tr>`;
    }).join('');

    return `
        <div class="section-header"><h2>${meta.title}</h2><div class="subtitle">${meta.subtitle}</div></div>

        <div class="card">
            <h3>RECALIBRER LES SPÉCIFICATIONS</h3>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
                <div><div class="label" style="margin-bottom:6px">SQ (kg)</div><input class="input input-sm" type="number" id="charges-sq" value="${sq}" inputmode="numeric"></div>
                <div><div class="label" style="margin-bottom:6px">BP (kg)</div><input class="input input-sm" type="number" id="charges-bp" value="${bp}" inputmode="numeric"></div>
                <div><div class="label" style="margin-bottom:6px">DL (kg)</div><input class="input input-sm" type="number" id="charges-dl" value="${dl}" inputmode="numeric"></div>
            </div>
            <div class="note"><strong>[ INFO ]</strong> Ces valeurs ne modifient pas le profil système. La matrice se recalcule instantanément.</div>
        </div>

        <div class="card">
            <div class="table-wrap"><table id="charges-table">
                <thead><tr><th>% 1RM</th><th>SQ</th><th>BP</th><th>DL</th><th>Usage</th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>
        </div>
    `;
}

export function initCharges() {
    ['sq','bp','dl'].forEach(lift => {
        const input = document.getElementById(`charges-${lift}`);
        if (!input) return;
        input.addEventListener('input', () => {
            const liftMap = {sq:'squat', bp:'bench', dl:'deadlift'};
            const val = parseFloat(input.value) || 0;
            updateTable(liftMap);
        });
    });
}

function updateTable(liftMap) {
    const sq = parseFloat(document.getElementById('charges-sq').value) || 0;
    const bp = parseFloat(document.getElementById('charges-bp').value) || 0;
    const dl = parseFloat(document.getElementById('charges-dl').value) || 0;
    const table = document.getElementById('charges-table');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row, i) => {
        const p = PERCENTAGES[i] / 100;
        const cells = row.querySelectorAll('td');
        cells[1].textContent = `${fmt(calcLoad(sq, p))} kg`;
        cells[2].textContent = `${fmt(calcLoad(bp, p))} kg`;
        cells[3].textContent = `${fmt(calcLoad(dl, p))} kg`;
    });
}
