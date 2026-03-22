/** Central registry: maps chart ID → option builder. */
import type { EChartsCoreOption } from 'echarts';
import type { Perzentil } from '$lib/data';
import { zuflussOption } from './zufluss';
import { abgabenquoteOption } from './abgabenquote';
import { freiesKapitalOption } from './freieskapital';

export { chartSlides } from './types';
export type { SlideInfo } from './types';

export function getChartOption(
  index: number,
  perzentile: Perzentil[],
  taxLabels: Record<string, string>,
  mini = false,
): EChartsCoreOption {
  switch (index) {
    case 0: return zuflussOption(perzentile, taxLabels, mini);
    case 1: return abgabenquoteOption(perzentile, taxLabels, mini);
    case 2: return freiesKapitalOption(perzentile, mini);
    default: throw new Error(`Unknown chart index: ${index}`);
  }
}
