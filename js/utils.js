// js/utils.js — Fonctions utilitaires de calcul
// Dépend de : state.js

import { State } from './state.js';

export function calcLoad(rm, pct) {
    return Math.round(rm * pct / 2.5) * 2.5;
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
