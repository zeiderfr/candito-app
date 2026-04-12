// js/utils.js — Fonctions utilitaires de calcul
// Dépend de : state.js

import { State } from './state.js';

export function calcLoad(rm, pct) {
    const rawRM = Number(rm || 0);
    const rawPct = Number(pct || 0);
    return Math.round(rawRM * rawPct / 2.5) * 2.5;
}

export function fmt(v) {
    return v % 1 === 0 ? v.toString() : v.toFixed(1);
}

export function loadRange(lift, lo, hi) {
    const rm = State.rm[lift];
    return lo === hi
        ? fmt(calcLoad(rm, lo)) + ' kg'
        : fmt(calcLoad(rm, lo)) + ' – ' + fmt(calcLoad(rm, hi)) + ' kg';
}

export function calculateAutoRPE(true1RM, weight, repsStr) {
    // Si accessoire sans 1RM connu, ou donnes manquantes
    if (!true1RM || !weight || !repsStr) return 7.5; 
    if (repsStr === 'AMRAP') return 10;
    
    // Extraire les reps (ex: "6-8" -> 7, "2-3" -> 2.5, "1" -> 1)
    let reps = 1;
    if (typeof repsStr === 'string' && repsStr.includes('-')) {
        const parts = repsStr.split('-');
        reps = (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    } else {
        reps = parseInt(repsStr) || 1;
    }

    const pct = parseFloat(weight) / true1RM;
    
    // Formule RTS : chaque Rep et chaque RIR coûte ~2.5% (-0.025)
    // RPE = 9 + Reps - (1 - %1RM) * 40
    let rpe = 9 + reps - (1 - pct) * 40;
    
    // Borner entre 6 et 10, et arrondir au 0.5 le plus proche
    rpe = Math.max(6, Math.min(10, rpe));
    return Math.round(rpe * 2) / 2;
}
