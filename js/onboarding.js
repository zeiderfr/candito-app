// js/onboarding.js — Onboarding cinématique (Idée C)
// Dépend de : state.js — reçoit callback pour éviter import circulaire

import { State, saveImmediate } from './state.js';

export function initOnboarding(onComplete) {
    const $onb     = document.getElementById('onboarding');
    const $overlay = document.getElementById('calc-overlay');

    document.getElementById('onb-go').addEventListener('click', () => {
        State.rm.squat    = parseInt(document.getElementById('onb-squat').value)    || 150;
        State.rm.bench    = parseInt(document.getElementById('onb-bench').value)    || 110;
        State.rm.deadlift = parseInt(document.getElementById('onb-deadlift').value) || 170;
        State.initialized = true;
        saveImmediate();

        // 1. Fade out card
        const card = $onb.querySelector('.onb-card');
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.92)';

        // 2. Show cascade matrix
        setTimeout(() => {
            $overlay.style.opacity = '1';
            $overlay.style.pointerEvents = 'auto';
            const t = setInterval(() => {
                let html = '';
                for (let i = 0; i < 60; i++) {
                    const w = Math.floor(Math.random() * 180) + 40;
                    const p = (Math.random() * 60 + 40).toFixed(0);
                    const a = (Math.random() * 0.6 + 0.15).toFixed(2);
                    html += `<span style="color:rgba(255,255,255,${a});margin:4px 6px;font-size:${Math.random() * 8 + 10}px">${w}×${p}%</span>`;
                }
                $overlay.innerHTML = html;
            }, 60);

            // 3. After 1.4s, show total
            setTimeout(() => {
                clearInterval(t);
                $overlay.innerHTML = `<div style="text-align:center;animation:onbIn 0.6s var(--ease) forwards;opacity:0">
                    <div style="font-size:3rem;font-weight:700;margin-bottom:8px">${State.rm.squat + State.rm.bench + State.rm.deadlift} kg</div>
                    <div style="color:rgba(255,255,255,0.5);font-size:0.875rem">Total — Programme généré</div>
                </div>`;

                // 4. Transition to app
                setTimeout(() => {
                    $overlay.style.transition = 'opacity 0.6s ease';
                    $overlay.style.opacity = '0';
                    $onb.style.transition = 'opacity 0.6s ease';
                    $onb.style.opacity = '0';
                    setTimeout(() => {
                        $onb.classList.add('hidden');
                        $overlay.classList.add('hidden');
                        onComplete(); // ← callback au lieu de bootApp()
                    }, 600);
                }, 900);
            }, 1400);
        }, 500);
    });
}
