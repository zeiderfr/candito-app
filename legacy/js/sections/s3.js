// js/sections/s3.js
import { renderWeekTracker, initTracker } from '../tracker.js';
import { renderWeekSummaryButton, initWeekSummaryButton, checkAutoShowSummary } from './weeksummary.js';

export function renderS3(meta) {
    return renderWeekTracker('s3', meta) + renderWeekSummaryButton('s3');
}

export function initS3() {
    initTracker('s3');
    initWeekSummaryButton('s3', 's3');
    checkAutoShowSummary('s3');
}
