// js/sections/rpe.js — Échelle RPE-RIR + Autorégulation (Tactical Blueprint)
export function renderRPE(meta) {
    return `
        <div class="section-header"><h2>${meta.title}</h2><div class="subtitle">${meta.subtitle}</div></div>

        <div class="card">
            <h3>ÉCHELLE RPE — RIR</h3>
            <div class="table-wrap"><table>
                <thead><tr><th>RPE</th><th>RIR</th><th>Statut</th><th>Diagnostic</th></tr></thead>
                <tbody>
                    <tr style="color:var(--alert)"><td><strong>10</strong></td><td>0</td><td>CRITIQUE — Max</td><td>Aucune rep supplémentaire possible</td></tr>
                    <tr style="color:var(--alert)"><td><strong>9.5</strong></td><td>0–1</td><td>REDLINE</td><td>Vitesse très lente, incertain</td></tr>
                    <tr style="color:var(--warn)"><td><strong>9</strong></td><td>1</td><td>LIMITE</td><td>Dernière rep lente mais contrôlée</td></tr>
                    <tr style="color:var(--warn)"><td><strong>8.5</strong></td><td>1–2</td><td>ÉLEVÉ</td><td>Start to grind, mais faisable</td></tr>
                    <tr><td><strong>8</strong></td><td>2</td><td>OPTIMAL</td><td>Charge lourde, technique solide</td></tr>
                    <tr><td><strong>7.5</strong></td><td>2–3</td><td>NOMINAL</td><td>Vitesse correcte</td></tr>
                    <tr style="color:var(--cyan)"><td><strong>7</strong></td><td>3</td><td>FLUIDE</td><td>Charge modérée, rythme fluide</td></tr>
                    <tr style="color:var(--cyan)"><td><strong>6</strong></td><td>4+</td><td>INIT</td><td>Échauffement / Technique</td></tr>
                </tbody>
            </table></div>
        </div>

        <div class="card">
            <h3>PROTOCOLE D'AUTORÉGULATION</h3>
            <div class="table-wrap"><table>
                <thead><tr><th>Diagnostic</th><th>Action corrective</th></tr></thead>
                <tbody>
                    <tr><td>RPE réel > RPE cible de +1</td><td>Réduire la charge de 2.5–5 kg séance suivante</td></tr>
                    <tr><td>RPE réel < RPE cible de -1</td><td>Augmenter la charge de 2.5 kg</td></tr>
                    <tr><td>RPE = cible ± 0.5</td><td>Nominal — Conserver les paramètres</td></tr>
                    <tr><td>3+ séquences avec RPE > 9</td><td>Déclencher mini-refroidissement (volume -40%)</td></tr>
                </tbody>
            </table></div>
        </div>

        <div class="note-red"><strong>[ ALERTE CRITIQUE ]</strong> Arrêter la séquence immédiatement si :<br>
        &bull; Douleur articulaire aiguë (vs. inconfort musculaire normal)<br>
        &bull; Dégradation technique malgré la réduction de charge<br>
        &bull; RPE 10 dès la 1ère série de travail<br>
        &bull; Sensation de vertige ou nausée persistante</div>

        <div class="note"><strong>[ INFO ]</strong> Les RPE des semaines 1-2 doivent être autour de 7-8. Si les relevés sont régulièrement à 9+, les spécifications sont probablement surévaluées — recalibrer via la Matrice de Télémétrie.</div>
    `;
}
export function initRPE() { /* Contenu statique */ }
