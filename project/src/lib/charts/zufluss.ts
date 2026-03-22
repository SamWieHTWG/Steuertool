/** Chart I: Brutto-Zuflüsse vs. Fiskallast (income density + cumulative tax lines). */
import type { EChartsCoreOption } from 'echarts';
import type { Perzentil } from '$lib/data';
import { incomeKeys, taxKeys, incomeLabels, incomeColors, taxColors, density, extractArr } from '$lib/data';

export function zuflussOption(perzentile: Perzentil[], taxLabels: Record<string, string>, mini: boolean): EChartsCoreOption {
  const xLabels = perzentile.map(p => p.gruppe);

  const incomeSeries = incomeKeys.map(key => ({
    name: incomeLabels[key],
    type: 'bar' as const,
    stack: 'income',
    data: density(extractArr(perzentile, key, 'einkommen')),
    itemStyle: { color: incomeColors[key] },
    emphasis: { focus: 'series' as const },
  }));

  const taxArrays = taxKeys.map(key => density(extractArr(perzentile, key, 'steuern')));
  const taxCumSeries = taxKeys.map((key, i) => {
    const cumData = xLabels.map((_, j) => {
      let sum = 0;
      for (let k = 0; k <= i; k++) sum += taxArrays[k][j];
      return +sum.toFixed(3);
    });
    const isLast = i === taxKeys.length - 1;
    return {
      name: taxLabels[key],
      type: 'line' as const,
      data: cumData,
      lineStyle: {
        width: isLast ? 2.5 : 1,
        type: isLast ? ('solid' as const) : ('dashed' as const),
        color: isLast ? '#2c3e50' : '#666',
      },
      itemStyle: { color: taxColors[key] },
      symbol: 'none' as const,
      emphasis: { focus: 'series' as const },
    };
  });

  if (mini) {
    return {
      animation: false,
      grid: { top: 10, bottom: 10, left: 10, right: 10 },
      xAxis: { type: 'category', data: xLabels, show: false },
      yAxis: { type: 'value', show: false, max: 145 },
      series: [...incomeSeries, ...taxCumSeries].map(s => ({ ...s, emphasis: undefined })),
    };
  }

  return {
    title: { text: 'I. Brutto-Zuflüsse vs. Fiskallast', subtext: 'Dichte pro 1 % Bevölkerung', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let s = `<b>${params[0].axisValue}</b><br/>`;
        params.forEach((p: any) => {
          if (p.value > 0) s += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)} Mrd. €<br/>`;
        });
        return s;
      },
    },
    legend: { top: 60, type: 'scroll' },
    grid: { top: 120, bottom: 40, left: 60, right: 30 },
    xAxis: { type: 'category', data: xLabels, axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: 'value', name: 'Mrd. € / 1 % Bev.', max: 145 },
    series: [...incomeSeries, ...taxCumSeries],
  };
}
