/** Chart II: Effektive Abgabenquote (stacked tax rate bars with total label). */
import type { EChartsCoreOption } from 'echarts';
import type { Perzentil } from '$lib/data';
import { taxKeys, taxColors, extractArr, extractTop } from '$lib/data';

export function abgabenquoteOption(perzentile: Perzentil[], taxLabels: Record<string, string>, mini: boolean): EChartsCoreOption {
  const xLabels = perzentile.map(p => p.gruppe);
  const zuflussArr = extractTop(perzentile, 'zufluss');

  const taxRateSeries = taxKeys.map(key => {
    const raw = extractArr(perzentile, key, 'steuern');
    return {
      name: taxLabels[key],
      type: 'bar' as const,
      stack: 'rate',
      data: raw.map((v, i) => +(v / zuflussArr[i] * 100).toFixed(2)),
      itemStyle: { color: taxColors[key] },
      emphasis: { focus: 'series' as const },
    };
  });

  if (mini) {
    return {
      animation: false,
      grid: { top: 10, bottom: 10, left: 10, right: 10 },
      xAxis: { type: 'category', data: xLabels, show: false },
      yAxis: { type: 'value', show: false, max: 75 },
      series: taxRateSeries.map(s => ({ ...s, emphasis: undefined })),
    };
  }

  const totalQuote = xLabels.map((_, i) => {
    let sum = 0;
    taxKeys.forEach(key => { sum += extractArr(perzentile, key, 'steuern')[i]; });
    return +(sum / zuflussArr[i] * 100).toFixed(1);
  });

  return {
    title: { text: 'II. Effektive Abgabenquote', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let s = `<b>${params[0].axisValue}</b><br/>`;
        let total = 0;
        params.forEach((p: any) => {
          if (p.value > 0) {
            s += `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)} %<br/>`;
            total += p.value;
          }
        });
        s += `<b>Gesamt: ${total.toFixed(1)} %</b>`;
        return s;
      },
    },
    legend: { top: 35, type: 'scroll' },
    grid: { top: 80, bottom: 40, left: 60, right: 30 },
    xAxis: { type: 'category', data: xLabels, axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: 'value', name: 'Abgabenquote (%)', max: 75, axisLabel: { formatter: '{value} %' } },
    series: [
      ...taxRateSeries,
      {
        name: 'Gesamt',
        type: 'line' as const,
        data: totalQuote,
        lineStyle: { width: 0 },
        symbol: 'none',
        label: {
          show: true,
          position: 'top' as const,
          formatter: (p: any) => `${p.value} %`,
          fontSize: 9,
          fontWeight: 'bold' as const,
          color: '#333',
        },
        itemStyle: { color: 'transparent' },
        tooltip: { show: false },
      },
    ],
  };
}
