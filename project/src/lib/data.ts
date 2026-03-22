/** Shared data extraction, labels, and color constants for all charts. */

export interface Perzentil {
  gruppe: string;
  zufluss: number;
  abgaben: number;
  einkommen: Record<string, number>;
  steuern: Record<string, number>;
}

// --- Keys ---

export const incomeKeys = ['transfers', 'lohn', 'gewerbe_vv', 'kap_ertrag', 'erbschaften'] as const;
export const taxKeys = ['mwst', 'est', 'kv_pv', 'kap_st', 'erbe_st', 'sonst'] as const;

// --- Labels ---

export const incomeLabels: Record<string, string> = {
  transfers: 'Transfers',
  lohn: 'Lohn / Gehalt',
  gewerbe_vv: 'Gewerbe / V&V',
  kap_ertrag: 'Kapitalertrag',
  erbschaften: 'Erbschaften',
};

// --- Colors ---

export const incomeColors: Record<string, string> = {
  transfers: '#73a2ac',
  lohn: '#547482',
  gewerbe_vv: '#91a892',
  kap_ertrag: '#c19a6b',
  erbschaften: '#a67b81',
};

export const taxColors: Record<string, string> = {
  mwst: '#aec7e8',
  est: '#1f77b4',
  kv_pv: '#2ca02c',
  kap_st: '#ff7f0e',
  erbe_st: '#d62728',
  sonst: '#9467bd',
};

// --- Netto data (not in JSON, derived externally) ---

export const netto = [23.44, 23.82, 24.04, 26.81, 28.48, 33.78, 38.95, 43.79, 47.01, 50.08, 50.21, 52.06, 55.08, 60.49, 67.14, 75.56, 88.7, 110.79, 154.06, 351.1];
export const coreLhk = [23.44, 23.82, 24.04, 26.3, 27.5, 32.5, 36.8, 39.8, 41.5, 42.2, 42.3, 42.7, 44.2, 45.7, 47.4, 49.2, 51.3, 54.5, 60.3, 71.2];
export const konsumKap = [0, 0, 0, 0.51, 0.98, 1.28, 2.15, 3.99, 5.51, 7.88, 7.91, 9.36, 10.88, 14.79, 19.74, 26.36, 37.4, 56.29, 93.76, 279.9];

// --- Helpers ---

/** Convert a per-5%-block array to per-1% density. */
export function density(arr: number[]): number[] {
  return arr.map(v => +(v / 5).toFixed(3));
}

/** Extract a nested field from each perzentil entry. */
export function extractArr(perzentile: Perzentil[], key: string, sub: 'einkommen' | 'steuern'): number[] {
  return perzentile.map(p => (p[sub] as Record<string, number>)[key] ?? 0);
}

/** Extract a top-level numeric field from each perzentil entry. */
export function extractTop(perzentile: Perzentil[], key: 'zufluss' | 'abgaben'): number[] {
  return perzentile.map(p => p[key]);
}
