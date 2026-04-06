// js/sections/echauffement.js — Wenning + Kabuki + Gammes montantes
import { State } from '../state.js';
import { calcLoad, fmt } from '../utils.js';

export function renderEchauffement(meta) {
    return `
        <div class="section-header"><h2>${meta.title}</h2><div class="subtitle">${meta.subtitle}</div></div>
        <div class="note"><strong>Protocole Wenning Warm-Up</strong> — 2 exercices d'activation × 3 séries × 10 reps, tempo lent, charge légère. Focus : activation musculaire sans fatigue.</div>
        <div class="card reveal">
            <h3>Bas du Corps — Squat</h3>
            <div class="table-wrap"><table>
                <thead><tr><th>Exercice</th><th>Séries</th><th>Reps</th><th>Charge / Instruction</th></tr></thead>
                <tbody>
                    <tr><td>Foam Rolling (quadriceps, fessiers, ischio)</td><td>1</td><td>60–90s/zone</td><td>Pression lente</td></tr>
                    <tr><td>Cat-Camel</td><td>2</td><td>10</td><td>Mobilité colonne</td></tr>
                    <tr><td>Hip Thrust (activation)</td><td>3</td><td>10</td><td>Poids de corps</td></tr>
                    <tr><td>Cossack Squat</td><td>2</td><td>8/côté</td><td>Poids de corps</td></tr>
                    <tr><td>Dead Bugs</td><td>2</td><td>8/côté</td><td>Gainage anti-rotation</td></tr>
                    <tr><td>Gamme Squat @40%</td><td>1</td><td>8</td><td id="warm-sq-40">— kg</td></tr>
                    <tr><td>Gamme Squat @60%</td><td>1</td><td>5</td><td id="warm-sq-60">— kg</td></tr>
                    <tr><td>Gamme Squat @75%</td><td>1</td><td>3</td><td id="warm-sq-75">— kg</td></tr>
                    <tr><td>Gamme Squat @85%</td><td>1</td><td>1</td><td id="warm-sq-85">— kg</td></tr>
                </tbody>
            </table></div>
        </div>
        <div class="card reveal">
            <h3>Haut du Corps — Bench</h3>
            <div class="table-wrap"><table>
                <thead><tr><th>Exercice</th><th>Séries</th><th>Reps</th><th>Charge / Instruction</th></tr></thead>
                <tbody>
                    <tr><td>Foam Rolling (pectoraux, dorsaux)</td><td>1</td><td>60s/zone</td><td>Pression lente</td></tr>
                    <tr><td>Face Pulls (activation)</td><td>3</td><td>15</td><td>Charge légère</td></tr>
                    <tr><td>Élévations latérales (activation)</td><td>2</td><td>12</td><td>Haltères légers</td></tr>
                    <tr><td>Gamme Bench @40%</td><td>1</td><td>10</td><td id="warm-bp-40">— kg</td></tr>
                    <tr><td>Gamme Bench @60%</td><td>1</td><td>5</td><td id="warm-bp-60">— kg</td></tr>
                    <tr><td>Gamme Bench @75%</td><td>1</td><td>3</td><td id="warm-bp-75">— kg</td></tr>
                </tbody>
            </table></div>
        </div>`;
}

export function initEchauffement() {
    const slots = [
        { id: 'warm-sq-40', lift: 'squat', pct: 0.40 },
        { id: 'warm-sq-60', lift: 'squat', pct: 0.60 },
        { id: 'warm-sq-75', lift: 'squat', pct: 0.75 },
        { id: 'warm-sq-85', lift: 'squat', pct: 0.85 },
        { id: 'warm-bp-40', lift: 'bench', pct: 0.40 },
        { id: 'warm-bp-60', lift: 'bench', pct: 0.60 },
        { id: 'warm-bp-75', lift: 'bench', pct: 0.75 },
    ];
    slots.forEach(({ id, lift, pct }) => {
        const el = document.getElementById(id);
        if (el) el.textContent = fmt(calcLoad(State.rm[lift], pct)) + ' kg';
    });
}
