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

// ─── Calcul de charge local (évite dépendance circulaire avec utils.js) ───
function calcLoadLocal(rm, pct) {
    return Math.round(rm * pct / 2.5) * 2.5;
}

// ─── FEATURE 6 : Readiness Check ──────────────────────────────────────────
function computeReadinessModifier(score) {
    if (score >= 4.0) return 0.025;
    if (score >= 3.0) return 0;
    if (score >= 2.0) return -0.05;
    return -0.10;
}

export function saveReadiness(sessionId, sleep, stress, energy) {
    const score = (sleep + stress + energy) / 3;
    const modifier = computeReadinessModifier(score);
    if (!State.sessions[sessionId]) State.sessions[sessionId] = { sets: [], loads: [], rpes: [] };
    State.sessions[sessionId].readiness = { sleep, stress, energy, score, modifier };
    saveImmediate();
    return { sleep, stress, energy, score, modifier };
}

// ─── FEATURE 7 : Résumé de Fin de Semaine ────────────────────────────────
function parseReps(repsStr) {
    if (!repsStr || repsStr === 'AMRAP') return null;
    if (repsStr.includes('-')) {
        const parts = repsStr.split('-');
        return (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    }
    return parseInt(repsStr) || null;
}

function getPrevWeekAvgRpe(weekId) {
    const idx = PROGRAM.findIndex(w => w.id === weekId);
    if (idx <= 0) return null;
    const prevWeek = PROGRAM[idx - 1];
    const allRpes = [];
    for (const session of prevWeek.sessions) {
        const sd = State.sessions[session.id] || {};
        (sd.rpes || []).forEach(r => { if (r != null) allRpes.push(r); });
    }
    return allRpes.length > 0 ? allRpes.reduce((a, b) => a + b, 0) / allRpes.length : null;
}

export function getWeekSummary(weekId) {
    const week = PROGRAM.find(w => w.id === weekId);
    if (!week) return null;

    let volume = 0;
    const allRpes = [];
    let completedSessions = 0;
    const totalSessions = week.sessions.length;

    for (const session of week.sessions) {
        const sd = State.sessions[session.id] || {};
        let setIndex = 0;
        const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets, 0);
        const doneSets = (sd.sets || []).filter(Boolean).length;
        if (doneSets >= totalSets && totalSets > 0) completedSessions++;

        for (const ex of session.exercises) {
            const midReps = parseReps(ex.reps);
            for (let si = 0; si < ex.sets; si++) {
                const idx = setIndex++;
                const done = (sd.sets || [])[idx];
                if (done) {
                    const load = (sd.loads || [])[idx] ?? (ex.lift ? calcLoadLocal(State.rm[ex.lift], ex.lo) : 0);
                    if (midReps && load) volume += load * midReps;
                }
                const rpe = (sd.rpes || [])[idx];
                if (rpe != null) allRpes.push(rpe);
            }
        }
    }

    const avgRpe = allRpes.length > 0
        ? Math.round((allRpes.reduce((a, b) => a + b, 0) / allRpes.length) * 10) / 10
        : null;

    const prevAvgRpe = getPrevWeekAvgRpe(weekId);
    const fatigueTrend = (avgRpe != null && prevAvgRpe != null)
        ? Math.round((avgRpe - prevAvgRpe) * 10) / 10
        : null;

    // PRs de la semaine (7 derniers jours)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const weekPrs = (State.prs || []).filter(pr => {
        try {
            const parts = pr.date.split('/');
            const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            return d >= weekAgo;
        } catch { return false; }
    });

    return {
        volume: Math.round(volume),
        avgRpe,
        weekPrs,
        fatigueTrend,
        completedSessions,
        totalSessions,
    };
}

// ─── FEATURE 8 : Prédiction de Max ───────────────────────────────────────
function parseMidReps(repsStr) {
    if (!repsStr || repsStr === 'AMRAP') return null;
    if (repsStr.includes('-')) {
        const parts = repsStr.split('-');
        return (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    }
    return parseInt(repsStr) || null;
}

function predict1RM(weight, midReps, rpe) {
    if (!weight || weight <= 0) return null;
    const epley = weight * (1 + midReps / 30);
    return Math.round(epley * (1 + (10 - rpe) * 0.025) / 2.5) * 2.5;
}

function median(arr) {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function getPredictions() {
    const SOURCE_WEEKS = ['s3', 's4', 's5'];
    const lifts = ['squat', 'bench', 'deadlift'];
    const result = {};

    for (const lift of lifts) {
        const e1RMs = [];

        for (const weekId of SOURCE_WEEKS) {
            const week = PROGRAM.find(w => w.id === weekId);
            if (!week) continue;

            for (const session of week.sessions) {
                const sd = State.sessions[session.id] || {};
                let setIndex = 0;

                for (const ex of session.exercises) {
                    for (let si = 0; si < ex.sets; si++) {
                        const idx = setIndex++;
                        if (ex.lift !== lift) continue;

                        const done = (sd.sets || [])[idx];
                        if (!done) continue;

                        const weight = (sd.loads || [])[idx];
                        const rpe = (sd.rpes || [])[idx];
                        if (!weight || weight <= 0) continue;

                        if (ex.isTest && ex.reps === 'AMRAP') {
                            // AMRAP : utiliser les reps saisies si disponibles
                            const amrapReps = (sd.repsAMRAP || [])[idx];
                            if (amrapReps && amrapReps > 0) {
                                const epley = weight * (1 + amrapReps / 30);
                                e1RMs.push(Math.round(epley / 2.5) * 2.5);
                            } else if (rpe != null && rpe >= 8) {
                                // Fallback : utiliser RPE 10 → tout donné
                                const e = predict1RM(weight, 1, 10);
                                if (e) e1RMs.push(e);
                            }
                        } else {
                            const midReps = parseMidReps(ex.reps);
                            if (midReps && rpe != null) {
                                const e = predict1RM(weight, midReps, rpe);
                                if (e) e1RMs.push(e);
                            }
                        }
                    }
                }
            }
        }

        const predicted = median(e1RMs);
        const n = e1RMs.length;
        const confidence = n >= 4 ? 'high' : n >= 2 ? 'medium' : n >= 1 ? 'low' : 'none';
        result[lift] = { predicted, confidence, dataPoints: n };
    }

    return result;
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
