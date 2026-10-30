// Mirrors the :root tokens in App.vue for callers without a DOM (SSR, workers)
const DEFAULT_PALETTE: Readonly<Record<string, string>> = {
  '--text-light1': '#ffffff',
  '--text-dark1': '#242424',
  '--chart-color-1': '#d9ad96',
  '--chart-color-2': '#8928c9',
  '--chart-color-3': '#a7fa55',
  '--chart-color-4': '#d67840',
  '--chart-color-5': '#2388eb',
  '--chart-color-6': '#274db4',
  '--chart-color-7': '#7cf7ca',
  '--chart-color-8': '#7027b0',
  '--chart-color-9': '#e32d34',
  '--chart-color-10': '#000000',
  '--chart-color-11': '#57aee6',
  '--chart-color-12': '#ffffff',
  '--chart-color-13': '#e0ad92'
}

export function cssVariable (name: string): string {
  if (typeof document === 'undefined') return DEFAULT_PALETTE[name] ?? ''
  return getComputedStyle(document.documentElement).getPropertyValue(name)
    .trim()
}
