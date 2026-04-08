// js/sections/s4.js
import { renderWeekTracker, initTracker } from '../tracker.js';
import { renderWeekSummaryButton, initWeekSummaryButton, checkAutoShowSummary } from './weeksummary.js';

export function renderS4(meta) {
    return renderWeekTracker('s4', meta) + renderWeekSummaryButton('s4');
}

export function initS4() {
    initTracker('s4');
    initWeekSummaryButton('s4', 's4');
    checkAutoShowSummary('s4');
}
