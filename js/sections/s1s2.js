// js/sections/s1s2.js
import { renderWeekTracker, initTracker } from '../tracker.js';
import { renderWeekSummaryButton, initWeekSummaryButton, checkAutoShowSummary } from './weeksummary.js';

export function renderS1S2(meta) {
    return renderWeekTracker('s1s2', meta) + renderWeekSummaryButton('s1s2');
}

export function initS1S2() {
    initTracker('s1s2');
    initWeekSummaryButton('s1s2', 's1s2');
    checkAutoShowSummary('s1s2');
}
