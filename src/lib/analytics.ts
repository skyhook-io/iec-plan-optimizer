import posthog from 'posthog-js';

export function trackAnalysisRun(source: 'csv_upload' | 'stored_data' | 'manual_input') {
  posthog.capture('analysis_run', { source });
}

export function trackSkyhookClick() {
  posthog.capture('skyhook_click');
}
