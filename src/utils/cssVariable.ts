// Mirrors the :root tokens (src/assets/css/_tokens.scss + the chart palette in App.vue)
// for callers without a DOM (SSR, workers).
const DEFAULT_PALETTE: Readonly<Record<string, string>> = {
  '--fg': '#e6edf7',
  '--chart-color-1': '#7aa2f7',
  '--chart-color-2': '#bb9af7',
  '--chart-color-3': '#9ece6a',
  '--chart-color-4': '#ff9e64',
  '--chart-color-5': '#4d8dff',
  '--chart-color-6': '#2f6fe0',
  '--chart-color-7': '#7dcfff',
  '--chart-color-8': '#b48ead',
  '--chart-color-9': '#f87171',
  '--chart-color-10': '#1e2c44',
  '--chart-color-11': '#6cb6ff',
  '--chart-color-12': '#e6edf7',
  '--chart-color-13': '#e0af68'
}

export function cssVariable (name: string): string {
  if (typeof document === 'undefined') return DEFAULT_PALETTE[name] ?? ''
  return getComputedStyle(document.documentElement).getPropertyValue(name)
    .trim()
}
