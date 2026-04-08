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
        <div class="chart-toggle" role="group" aria-label="Type de données">
            <button class="chart-toggle-btn active" data-mode="load">Charge (kg)</button>
            <button class="chart-toggle-btn" data-mode="rpe">RPE</button>
        </div>
        <div class="section-cards-grid" style="grid-template-columns:1fr">
            ${chartCards}
        </div>
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

    document.querySelectorAll('#progression .chart-toggle-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            mode = e.target.dataset.mode;
            document.querySelectorAll('#progression .chart-toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderAllCharts();
        });
    });
}
