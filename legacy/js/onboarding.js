// js/onboarding.js — Onboarding (Apple Keynote Style)
// Dépend de : state.js — reçoit callback pour éviter import circulaire

import { State, saveImmediate } from './state.js';

export function initOnboarding(onComplete) {
    const $onb     = document.getElementById('onboarding');
    const $overlay = document.getElementById('calc-overlay');

    // ⭐ Focus UX : Sélectionne tout le texte pour éviter d'écrire "150200" au lieu de "200"
    ['onb-squat', 'onb-bench', 'onb-deadlift'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('focus', () => el.select());
    });

    document.getElementById('onb-go').addEventListener('click', () => {
        State.rm.squat    = Number(document.getElementById('onb-squat').value)    || 150;
        State.rm.bench    = Number(document.getElementById('onb-bench').value)    || 110;
        State.rm.deadlift = Number(document.getElementById('onb-deadlift').value) || 170;

        // Force check once more for absurd values from UI
        if (State.rm.squat > 600) State.rm.squat = 150;
        if (State.rm.bench > 450) State.rm.bench = 110;
        if (State.rm.deadlift > 650) State.rm.deadlift = 170;

        State.initialized = true;
        saveImmediate();

        const total = State.rm.squat + State.rm.bench + State.rm.deadlift;

        // 1. Fade out card
        const card = $onb.querySelector('.onb-card');
        card.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95) translateY(-10px)';

        // 2. Apple Keynote-style number cascade
        setTimeout(() => {
            $overlay.style.opacity = '1';
            $overlay.style.pointerEvents = 'auto';

            const t = setInterval(() => {
                let html = '';
                for (let i = 0; i < 50; i++) {
                    const w = Math.floor(Math.random() * 180) + 40;
                    const p = (Math.random() * 60 + 40).toFixed(0);
                    const a = (Math.random() * 0.35 + 0.05).toFixed(2);
                    html += `<span style="color:rgba(0,0,0,${a});margin:4px 6px;font-size:${Math.random() * 6 + 11}px">${w}×${p}%</span>`;
                }
                $overlay.innerHTML = html;
            }, 60);

            // 3. Show total with clean animation
            setTimeout(() => {
                clearInterval(t);
                $overlay.innerHTML = `<div style="text-align:center;animation:onbIn 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;opacity:0;transform:translateY(8px) scale(0.98)">
                    <div style="font-size:3.5rem;font-weight:700;letter-spacing:-0.03em;margin-bottom:6px;color:#1D1D1F">${total} kg</div>
                    <div style="color:#86868B;font-size:0.9375rem;font-weight:500">Total — Programme généré</div>
                </div>`;

                // 4. Transition to app
                setTimeout(() => {
                    $overlay.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    $overlay.style.opacity = '0';
                    $onb.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    $onb.style.opacity = '0';
                    setTimeout(() => {
                        $onb.classList.add('hidden');
                        $overlay.classList.add('hidden');
                        onComplete();
                    }, 600);
                }, 1000);
            }, 1400);
        }, 500);
    });
}
