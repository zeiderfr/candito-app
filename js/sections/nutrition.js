// js/sections/nutrition.js — Nutrition (Macros, Timing, Suppléments)
export function renderNutrition(meta) {
    return `
        <div class="section-header"><h2>${meta.title}</h2><div class="subtitle">${meta.subtitle}</div></div>

        <div class="card">
            <h3>Macros journaliers — Base 66 kg</h3>
            <div class="table-wrap"><table>
                <thead><tr><th>Nutriment</th><th>Jour entraînement</th><th>Jour repos</th><th>Protocole</th></tr></thead>
                <tbody>
                    <tr><td><strong>Protéines</strong></td><td>132–145 g</td><td>132–145 g</td><td>2–2.2 g/kg — constant</td></tr>
                    <tr><td><strong>Lipides</strong></td><td>60–70 g</td><td>65–75 g</td><td>~1 g/kg — régulation hormonale</td></tr>
                    <tr><td><strong>Glucides</strong></td><td>300–350 g</td><td>200–250 g</td><td>Ajuster selon la charge de la semaine</td></tr>
                    <tr><td><strong>Calories</strong></td><td>~2500–2700</td><td>~2200–2400</td><td>Surplus S1-S4, maintien S5-S6</td></tr>
                </tbody>
            </table></div>
        </div>

        <div class="card">
            <h3>Timing des repas</h3>
            <div class="table-wrap"><table>
                <thead><tr><th>Moment</th><th>Nutrition</th><th>Exemple</th></tr></thead>
                <tbody>
                    <tr><td><strong>Pré-entraînement</strong> (1-2h avant)</td><td>Glucides complexes + Protéines</td><td>Riz + Poulet ou Flocons + Whey</td></tr>
                    <tr><td><strong>Intra-entraînement</strong></td><td>Glucides rapides (optionnel)</td><td>Boisson glucosée, banane</td></tr>
                    <tr><td><strong>Post-entraînement</strong> (< 1h)</td><td>Protéines rapides + Glucides</td><td>Whey + Riz blanc ou Fruit</td></tr>
                </tbody>
            </table></div>
        </div>

        <div class="card">
            <h3>Hydratation & Suppléments</h3>
            <div class="note"><strong>Hydratation :</strong> 3–4 L/jour les jours d'entraînement, 2.5–3 L les jours de repos.</div>
            <div class="table-wrap"><table>
                <thead><tr><th>Supplément</th><th>Dosage</th><th>Timing</th></tr></thead>
                <tbody>
                    <tr><td>Créatine monohydrate</td><td>5 g/jour</td><td>Quotidien, n'importe quel moment</td></tr>
                    <tr><td>Caféine (optionnel)</td><td>3–5 mg/kg</td><td>30 min avant l'entraînement</td></tr>
                    <tr><td>Vitamine D</td><td>2000–4000 UI</td><td>Avec un repas contenant des lipides</td></tr>
                    <tr><td>Magnésium</td><td>300–400 mg</td><td>Le soir — aide à la récupération</td></tr>
                </tbody>
            </table></div>
        </div>
    `;
}
export function initNutrition() { /* Contenu statique */ }
