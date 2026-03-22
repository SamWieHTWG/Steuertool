/** Chart III: Netto-Verteilung — Core-Lebenshaltung vs. Freies Kapital. */
import type { EChartsCoreOption } from 'echarts';
import type { Perzentil } from '$lib/data';
import { netto, coreLhk, konsumKap } from '$lib/data';

export function freiesKapitalOption(perzentile: Perzentil[], mini: boolean): EChartsCoreOption {
  const xLabels = perzentile.map(p => p.gruppe);

  if (mini) {
    return {
      animation: false,
      grid: { top: 10, bottom: 10, left: 10, right: 10 },
      xAxis: { type: 'category', data: xLabels, show: false },
      yAxis: { type: 'value', show: false, max: 400 },
      series: [
        { name: 'Core', type: 'bar', stack: 'n', data: coreLhk, itemStyle: { color: '#95a5a6', opacity: 0.3 } },
        { name: 'Frei', type: 'bar', stack: 'n', data: konsumKap, itemStyle: { color: '#27ae60' } },
      ],
    };
  }

  return {
    title: { text: 'III. Netto-Verteilung: Lebenshaltung vs. Freies Kapital', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const i = params[0].dataIndex;
        let s = `<b>${params[0].axisValue}</b><br/>`;
        s += `${params[0].marker} Core-Lebenshaltung: ${coreLhk[i].toFixed(1)} Mrd. €<br/>`;
        s += `${params[1].marker} Freies Kapital: ${konsumKap[i].toFixed(1)} Mrd. €<br/>`;
        s += `<b>Netto gesamt: ${netto[i].toFixed(1)} Mrd. €</b>`;
        return s;
      },
    },
    legend: { top: 35 },
    grid: { top: 80, bottom: 40, left: 60, right: 30 },
    xAxis: { type: 'category', data: xLabels, axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: 'value', name: 'Mrd. €', max: 400 },
    series: [
      {
        name: 'Core-Lebenshaltung',
        type: 'bar',
        stack: 'netto',
        data: coreLhk,
        itemStyle: { color: '#95a5a6', opacity: 0.3 },
        emphasis: { focus: 'series' },
      },
      {
        name: 'Freies Kapital',
        type: 'bar',
        stack: 'netto',
        data: konsumKap,
        itemStyle: { color: '#27ae60' },
        emphasis: { focus: 'series' },
        label: {
          show: true,
          position: 'top' as const,
          formatter: (p: any) => (p.value > 0 ? `${p.value.toFixed(1)}` : ''),
          fontSize: 9,
          fontWeight: 'bold' as const,
          color: '#1e8449',
        },
      },
    ],
  };
}
