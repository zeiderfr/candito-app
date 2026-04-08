// js/state.js — State singleton, debounce save, PR detection
// Dépend de : data.js

import { PROGRAM, ALL_SESSIONS } from './data.js';

export const STORAGE_KEY = 'candito_tracker_data';
export let State = loadState();

export function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : defaultState();
        // 🛡️ SANITIZATION : Force numeric RM to avoid "150200 kg" bugs
        data.rm = sanitizeRM(data.rm);
        return data;
    } catch { return defaultState(); }
}

export function defaultState() {
    return { 
        rm: { squat: 150, bench: 110, deadlift: 170 }, 
        initialized: false, 
        sessions: {}, 
        prs: [], 
        v: 2 // Version schema for future migrations
    };
}

function sanitizeRM(rm) {
    const fresh = { squat: 0, bench: 0, deadlift: 0 };
    Object.keys(fresh).forEach(k => {
        let val = Number(rm[k] || 0);
        // Si absurde (> 600kg ou < 20kg), on reset à une valeur saine par défaut.
        if (isNaN(val) || val <= 0 || val > 600) {
            val = (k === 'squat') ? 150 : (k === 'bench' ? 110 : 170);
        }
        fresh[k] = val;
    });
    return fresh;
}

// ⭐ DEBOUNCE : 300ms pour inputs numériques, immédiat pour checkboxes
let _saveTimer = null;
export function save() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(State));
    }, 300);
}
export function saveImmediate() {
    clearTimeout(_saveTimer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(State));
}

export function getNextSession() {
    for (const week of PROGRAM) {
        for (const session of week.sessions) {
            const sd = State.sessions[session.id];
            if (!sd) return { weekId: week.id, session, status: 'ready' };
            const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets, 0);
            const doneSets = (sd.sets || []).filter(Boolean).length;
            if (doneSets < totalSets) return { weekId: week.id, session, status: doneSets > 0 ? 'in-progress' : 'ready' };
        }
    }
    return null;
}

export function getProgress() {
    let done = 0;
    for (const session of ALL_SESSIONS) {
        const sd = State.sessions[session.id];
        if (sd) {
            const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets, 0);
            const doneSets = (sd.sets || []).filter(Boolean).length;
            if (doneSets >= totalSets) done++;
        }
    }
    return { done, total: ALL_SESSIONS.length, pct: Math.round((done / ALL_SESSIONS.length) * 100) };
}

export function getLastCompletedSession() {
    let last = null;
    for (const week of PROGRAM) {
        for (const session of week.sessions) {
            const sd = State.sessions[session.id];
            if (!sd) return last;
            const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets, 0);
            const doneSets = (sd.sets || []).filter(Boolean).length;
            if (doneSets >= totalSets) {
                last = { weekId: week.id, session, data: sd };
            } else {
                return last;
            }
        }
    }
    return last;
}

// ⭐ PR DETECTION — appelé depuis tracker.js
export function checkAndRecordPR(lift, weight) {
    if (weight > State.rm[lift]) {
        if (!Array.isArray(State.prs)) State.prs = []; // QA: Sécurisation Array
        const existing = State.prs.find(p => p.lift === lift && p.weight === weight);
        if (!existing) {
            State.prs.push({ lift, weight, date: new Date().toLocaleDateString('fr-FR') });
            saveImmediate();
            // Vibration haptique
            if (navigator.vibrate) navigator.vibrate(200);
            return true;
        }
    }
    return false;
}
