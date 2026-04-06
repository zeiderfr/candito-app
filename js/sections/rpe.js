// js/sections/rpe.js — Échelle RPE-RIR + Autorégulation + Alertes
export function renderRPE(meta) {
    return `
        <div class="section-header"><h2>${meta.title}</h2><div class="subtitle">${meta.subtitle}</div></div>

        <div class="card reveal">
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

        <div class="card reveal">
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
export function initRPE() { /* Contenu statique */ }
