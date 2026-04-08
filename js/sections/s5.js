// js/sections/s5.js
import { renderWeekTracker, initTracker } from '../tracker.js';
import { renderWeekSummaryButton, initWeekSummaryButton, checkAutoShowSummary } from './weeksummary.js';

export function renderS5(meta) {
    return renderWeekTracker('s5', meta) + renderWeekSummaryButton('s5');
}

export function initS5() {
    initTracker('s5');
    initWeekSummaryButton('s5', 's5');
    checkAutoShowSummary('s5');
}
