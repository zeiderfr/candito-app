// js/sections/progression.js — Feature 4 : Graphiques de progression SVG
// Dépend de : state.js, data.js

import { State } from '../state.js';
import { PROGRAM } from '../data.js';

// ── Labels courts par session ───────────────────────────────────────────────
const SESSION_LABELS = {
    's12_lun': 'S1 Lun', 's12_mar': 'S1 Mar', 's12_jeu': 'S1 Jeu',
    's12_ven': 'S1 Ven', 's12_sam': 'S1 Sam',
    's3_lun':  'S3 Lun', 's3_mar':  'S3 Mar', 's3_ven':  'S3 Ven',
    's4_lun':  'S4 Lun', 's4_mar':  'S4 Mar', 's4_ven':  'S4 Ven',
    's5_lun':  'S5 Lun', 's5_mar':  'S5 Mar',
    's6_test_lun': 'S6 TL', 's6_test_mer': 'S6 TM',
    's6_dec_lun':  'S6 DL', 's6_dec_mer':  'S6 DM',
};

const LIFT_COLORS = {
    squat:    '#C2A060',
    bench:    '#4A7B9D',
    deadlift: '#9B6E38',
};

const LIFT_FR = {
    squat:    'Squat',
    bench:    'Bench',
    deadlift: 'Deadlift',
};

// ── SVG layout constants ────────────────────────────────────────────────────
const VB_W = 400, VB_H = 180;
const PAD  = { top: 16, right: 20, bottom: 44, left: 48 };
const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top  - PAD.bottom;

// ── Calcul des données ──────────────────────────────────────────────────────
function getChartData(lift, mode) {
    const points = [];

    for (const week of PROGRAM) {
        for (const session of week.sessions) {
            const sd = State.sessions[session.id] || {};
            const label = SESSION_LABELS[session.id] || session.id;

            const values = [];
            let setIndex = 0;

            for (const ex of session.exercises) {
                for (let si = 0; si < ex.sets; si++) {
                    const idx = setIndex++;
                    if (ex.lift !== lift) continue;
                    const done = (sd.sets || [])[idx];
                    if (!done) continue;

                    if (mode === 'load') {
                        const load = (sd.loads || [])[idx];
                        if (load && load > 0) values.push(load);
                    } else {
                        const rpe = (sd.rpes || [])[idx];
                        if (rpe != null) values.push(rpe);
                    }
                }
            }

            const avg = values.length > 0
                ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
                : null;
            points.push({ label, value: avg });
        }
    }

    return points;
}

// ── Construction SVG ────────────────────────────────────────────────────────
function buildSVG(points, color, mode) {
    const validValues = points.map(p => p.value).filter(v => v !== null);
    if (validValues.length === 0) return null;

    const rawMin = Math.min(...validValues);
    const rawMax = Math.max(...validValues);
    const pad = mode === 'rpe' ? 0.5 : 5;
    const yMin = Math.max(0, Math.floor((rawMin - pad) / (mode === 'rpe' ? 1 : 5)) * (mode === 'rpe' ? 1 : 5));
    const yMax = Math.ceil((rawMax + pad)  / (mode === 'rpe' ? 1 : 5)) * (mode === 'rpe' ? 1 : 5);
    const yRange = yMax - yMin || 1;

    const n = points.length;
    const xStep = n > 1 ? PLOT_W / (n - 1) : PLOT_W;

    // Coordonnées SVG d'un point
    const cx = i => PAD.left + (n > 1 ? (i / (n - 1)) * PLOT_W : PLOT_W / 2);
    const cy = v => PAD.top + PLOT_H - ((v - yMin) / yRange) * PLOT_H;

    // ── Guides Y ──
    const yTicks = 4;
    let guides = '';
    let yLabels = '';
    for (let t = 0; t <= yTicks; t++) {
        const v = yMin + (yRange * t / yTicks);
        const y = cy(v);
        const label = mode === 'rpe' ? v.toFixed(1) : Math.round(v);
        guides  += `<line x1="${PAD.left}" y1="${y.toFixed(1)}" x2="${VB_W - PAD.right}" y2="${y.toFixed(1)}"
            stroke="rgba(0,0,0,0.06)" stroke-width="1"/>`;
        yLabels += `<text x="${PAD.left - 5}" y="${y.toFixed(1)}" dy="0.35em"
            text-anchor="end" font-size="9" fill="rgba(0,0,0,0.35)"
            font-family="-apple-system,BlinkMacSystemFont,'Inter',sans-serif">${label}</text>`;
    }

    // ── Path (avec gestion des gaps pour les sessions sans données) ──
    let pathD = '';
    let pathStarted = false;
    points.forEach((p, i) => {
        if (p.value === null) {
            pathStarted = false;
            return;
        }
        const x = cx(i).toFixed(1);
        const y = cy(p.value).toFixed(1);
        if (!pathStarted) {
            pathD += `M ${x} ${y}`;
            pathStarted = true;
        } else {
            pathD += ` L ${x} ${y}`;
        }
    });

    // ── Cercles ──
    let circles = '';
    let xLabels = '';
    points.forEach((p, i) => {
        const x = cx(i);
        // Labels X (tous les 2 points si ≥ 10 sessions, sinon tous)
        const showLabel = n <= 7 || i % 2 === 0;
        if (showLabel) {
            xLabels += `<text x="${x.toFixed(1)}" y="${(VB_H - 6).toFixed(1)}"
                text-anchor="middle" font-size="8" fill="rgba(0,0,0,0.35)"
                font-family="-apple-system,BlinkMacSystemFont,'Inter',sans-serif"
                transform="rotate(-30 ${x.toFixed(1)} ${(VB_H - 6).toFixed(1)})">${p.label}</text>`;
        }
        if (p.value !== null) {
            circles += `<circle cx="${x.toFixed(1)}" cy="${cy(p.value).toFixed(1)}" r="4"
                fill="${color}" stroke="#fff" stroke-width="2">
                <title>${p.label} : ${p.value}${mode === 'rpe' ? '' : ' kg'}</title>
            </circle>`;
        }
    });

    return `<svg viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="xMinYMin meet"
        role="img" aria-label="Graphique de progression">
        ${guides}
        ${pathD ? `<path d="${pathD}" stroke="${color}" stroke-width="2.5" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>` : ''}
        ${circles}
        ${yLabels}
        ${xLabels}
    </svg>`;
}

// ── Rendu de la section ─────────────────────────────────────────────────────
export function renderProgression(meta) {
    const lifts = ['squat', 'bench', 'deadlift'];
    const chartCards = lifts.map(lift => `
        <div class="card chart-card" id="chart-${lift}">
            <div class="chart-card-header">
                <h3>${LIFT_FR[lift]}</h3>
            </div>
            <div class="chart-area" id="chart-area-${lift}"></div>
        </div>
    `).join('');

    return `
        <div class="section-header">
            <h2>${meta.title}</h2>
            <div class="subtitle">${meta.subtitle}</div>
        </div>

        <!-- Sub-nav pour Progression / Charges / RPE -->
        <div class="outils-subnav" role="tablist" aria-label="Outils et Progression">
            <button class="outils-subnav-btn active" data-panel="panel-charts" role="tab" aria-selected="true">📈 Graphiques</button>
            <button class="outils-subnav-btn" data-panel="panel-charges" role="tab" aria-selected="false">📊 Charges</button>
            <button class="outils-subnav-btn" data-panel="panel-rpe" role="tab" aria-selected="false">🎯 RPE</button>
        </div>

        <!-- Panel 1: Graphiques de progression -->
        <div class="outils-panel active" id="panel-charts">
            <div class="chart-toggle" role="group" aria-label="Type de données">
                <button class="chart-toggle-btn active" data-mode="load">Charge (kg)</button>
                <button class="chart-toggle-btn" data-mode="rpe">RPE</button>
            </div>
            <div class="section-cards-grid" style="grid-template-columns:1fr">
                ${chartCards}
            </div>
        </div>

        <!-- Panel 2: Tableau des charges (calculateur) -->
        <div class="outils-panel" id="panel-charges"></div>

        <!-- Panel 3: Guide RPE -->
        <div class="outils-panel" id="panel-rpe"></div>
    `;
}

// ── Init ────────────────────────────────────────────────────────────────────
export function initProgression() {
    let mode = 'load';

    function renderAllCharts() {
        ['squat', 'bench', 'deadlift'].forEach(lift => {
            const container = document.getElementById(`chart-area-${lift}`);
            if (!container) return;

            const points = getChartData(lift, mode);
            const hasData = points.some(p => p.value !== null);

            if (!hasData) {
                container.innerHTML = '<p class="chart-empty">Aucune donnée enregistrée pour ce mouvement.</p>';
                return;
            }

            const svg = buildSVG(points, LIFT_COLORS[lift], mode);
            container.innerHTML = svg || '<p class="chart-empty">Données insuffisantes.</p>';
        });
    }

    renderAllCharts();

    // Chart type toggle (Charge/RPE)
    document.querySelectorAll('#progression .chart-toggle-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            mode = e.target.dataset.mode;
            document.querySelectorAll('#progression .chart-toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderAllCharts();
        });
    });

    // ── Lazy-render Charges panel ──
    const chargesPanel = document.getElementById('panel-charges');
    if (chargesPanel && chargesPanel.innerHTML.trim() === '') {
        chargesPanel.innerHTML = renderChargesContent();
    }

    // ── Lazy-render RPE panel ──
    const rpePanel = document.getElementById('panel-rpe');
    if (rpePanel && rpePanel.innerHTML.trim() === '') {
        rpePanel.innerHTML = renderRPEContent();
    }

    // ── Sub-nav toggle ──
    document.querySelectorAll('#progression .outils-subnav-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const panelId = e.target.dataset.panel;
            // Toggle active state on buttons
            document.querySelectorAll('#progression .outils-subnav-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            e.target.classList.add('active');
            e.target.setAttribute('aria-selected', 'true');

            // Toggle active state on panels
            document.querySelectorAll('#progression .outils-panel').forEach(p => p.classList.remove('active'));
            const target = document.getElementById(panelId);
            if (target) target.classList.add('active');

            // Init Charges listeners on first show
            if (panelId === 'panel-charges') {
                initChargesListeners();
            }
        });
    });
}

// ── Charges content (inline) ────────────────────────────────────────────────
import { State } from '../state.js';
import { fmt, calcLoad } from '../utils.js';

const PERCENTAGES = [40, 50, 60, 65, 70, 75, 78, 80, 82, 85, 88, 90, 92, 93, 95, 98, 100, 102];
const USAGE_MAP = {
    40:'Échauffement', 50:'Échauffement', 60:'Échauffement',
    65:'Accessoire', 70:'Accessoire', 75:'Gamme montante',
    78:'S1-S2 Accumulation', 80:'S1-S2 / Décharge', 82:'S1-S2 Accumulation',
    85:'S3 Transmutation', 88:'S3 Transmutation',
    90:'S4 / Opener', 92:'S4 / Opener', 93:'S4 Acclimatation',
    95:'S5 AMRAP Test', 98:'S6 2ème tentative',
    100:'PR Tentative', 102:'PR Objectif'
};

function renderChargesContent() {
    const sq = State.rm.squat, bp = State.rm.bench, dl = State.rm.deadlift;
    const rows = PERCENTAGES.map(p => {
        const usage = USAGE_MAP[p] || '';
        const style = p >= 95 ? ' style="color:var(--red);font-weight:600"' : '';
        return `<tr${style}>
            <td style="font-weight:600">${p}%</td>
            <td>${fmt(calcLoad(sq, p / 100))} kg</td>
            <td>${fmt(calcLoad(bp, p / 100))} kg</td>
            <td>${fmt(calcLoad(dl, p / 100))} kg</td>
            <td style="color:var(--text-2)">${usage}</td>
        </tr>`;
    }).join('');

    return `
        <div class="card">
            <h3>Modifier les 1RM</h3>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
                <div><div class="label" style="margin-bottom:6px">Squat (kg)</div><input class="input input-sm" type="number" id="inline-charges-sq" value="${sq}" inputmode="numeric"></div>
                <div><div class="label" style="margin-bottom:6px">Bench (kg)</div><input class="input input-sm" type="number" id="inline-charges-bp" value="${bp}" inputmode="numeric"></div>
                <div><div class="label" style="margin-bottom:6px">Deadlift (kg)</div><input class="input input-sm" type="number" id="inline-charges-dl" value="${dl}" inputmode="numeric"></div>
            </div>
            <div class="note"><strong>Note :</strong> Ces valeurs ne modifient pas ton profil. Le tableau se recalcule instantanément.</div>
        </div>

        <div class="card">
            <div class="table-wrap"><table id="inline-charges-table">
                <thead><tr><th>% 1RM</th><th>Squat</th><th>Bench</th><th>Deadlift</th><th>Usage</th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>
        </div>
    `;
}

let _chargesListenersInit = false;
function initChargesListeners() {
    if (_chargesListenersInit) return;
    _chargesListenersInit = true;

    ['sq', 'bp', 'dl'].forEach(lift => {
        const input = document.getElementById(`inline-charges-${lift}`);
        if (!input) return;
        input.addEventListener('input', () => {
            const sq = parseFloat(document.getElementById('inline-charges-sq').value) || 0;
            const bp = parseFloat(document.getElementById('inline-charges-bp').value) || 0;
            const dl = parseFloat(document.getElementById('inline-charges-dl').value) || 0;
            const table = document.getElementById('inline-charges-table');
            if (!table) return;
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach((row, i) => {
                const p = PERCENTAGES[i] / 100;
                const cells = row.querySelectorAll('td');
                cells[1].textContent = `${fmt(calcLoad(sq, p))} kg`;
                cells[2].textContent = `${fmt(calcLoad(bp, p))} kg`;
                cells[3].textContent = `${fmt(calcLoad(dl, p))} kg`;
            });
        });
    });
}

function renderRPEContent() {
    return `
        <div class="card">
            <h3>Échelle RPE – RIR</h3>
            <div class="table-wrap"><table>
                <thead><tr><th>RPE</th><th>RIR</th><th>Description</th><th>Sensation</th></tr></thead>
                <tbody>
                    <tr><td><strong>10</strong></td><td>0</td><td>Effort maximal</td><td>Aucune rep supplémentaire possible</td></tr>
                    <tr><td><strong>9.5</strong></td><td>0–1</td><td>Peut-être 1 de plus</td><td>Vitesse très lente, incertain</td></tr>
                    <tr><td><strong>9</strong></td><td>1</td><td>1 rep en réserve</td><td>Dernière rep lente mais contrôlée</td></tr>
                    <tr><td><strong>8.5</strong></td><td>1–2</td><td>1-2 reps en réserve</td><td>Start to grind, mais faisable</td></tr>
                    <tr><td><strong>8</strong></td><td>2</td><td>2 reps en réserve</td><td>Charge lourde, technique solide</td></tr>
                    <tr><td><strong>7.5</strong></td><td>2–3</td><td>2-3 reps en réserve</td><td>Vitesse correcte</td></tr>
                    <tr><td><strong>7</strong></td><td>3</td><td>3 reps en réserve</td><td>Charge modérée, rythme fluide</td></tr>
                    <tr><td><strong>6</strong></td><td>4+</td><td>4+ reps en réserve</td><td>Échauffement / Technique</td></tr>
                </tbody>
            </table></div>
        </div>

        <div class="card">
            <h3>Règles d'autorégulation</h3>
            <div class="table-wrap"><table>
                <thead><tr><th>Situation</th><th>Action</th></tr></thead>
                <tbody>
                    <tr><td>RPE réel > RPE cible de +1</td><td>Réduire la charge de 2.5–5 kg pour la série suivante</td></tr>
                    <tr><td>RPE réel < RPE cible de -1</td><td>Augmenter la charge de 2.5 kg</td></tr>
                    <tr><td>RPE = cible ± 0.5</td><td>Parfait — conserver la charge</td></tr>
                    <tr><td>3+ séances avec RPE > 9</td><td>Envisager une mini-décharge (volume -40%)</td></tr>
                </tbody>
            </table></div>
        </div>

        <div class="note-red"><strong>Signaux d'alerte — arrêter la séance si :</strong><br>
        &bull; Douleur articulaire aiguë (vs. inconfort musculaire normal)<br>
        &bull; Technique qui se dégrade malgré la réduction de charge<br>
        &bull; RPE 10 dès la 1ère série de travail<br>
        &bull; Sensation de vertige ou nausée persistante</div>

        <div class="note"><strong>Bon à savoir :</strong> Les RPE des semaines 1-2 doivent être autour de 7-8. Si tu es régulièrement à 9+, tes 1RM sont probablement surévalués — recalibrer via le Tableau des Charges.</div>
    `;
}
