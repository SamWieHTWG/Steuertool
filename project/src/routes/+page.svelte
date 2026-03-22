<script lang="ts">
  import { onMount, tick } from 'svelte';
  import * as echarts from 'echarts';
  import Swiper from 'swiper';
  import { EffectCoverflow } from 'swiper/modules';
  import 'swiper/css';
  import 'swiper/css/effect-coverflow';

  export let data: any;
  const { perzentile, meta } = data.data;

  const xLabels = perzentile.map((p: any) => p.gruppe);
  const density = (arr: number[]) => arr.map(v => +(v / 5).toFixed(3));

  const incomeKeys = ['transfers', 'lohn', 'gewerbe_vv', 'kap_ertrag', 'erbschaften'] as const;
  const taxKeys = ['mwst', 'est', 'kv_pv', 'kap_st', 'erbe_st', 'sonst'] as const;

  const incomeColors: Record<string, string> = {
    transfers:  '#73a2ac',
    lohn:       '#547482',
    gewerbe_vv: '#91a892',
    kap_ertrag: '#c19a6b',
    erbschaften:'#a67b81',
  };
  const incomeLabels: Record<string, string> = {
    transfers: 'Transfers',
    lohn: 'Lohn / Gehalt',
    gewerbe_vv: 'Gewerbe / V&V',
    kap_ertrag: 'Kapitalertrag',
    erbschaften: 'Erbschaften',
  };

  const taxColors: Record<string, string> = {
    mwst:    '#aec7e8',
    est:     '#1f77b4',
    kv_pv:   '#2ca02c',
    kap_st:  '#ff7f0e',
    erbe_st: '#d62728',
    sonst:   '#9467bd',
  };
  const taxLabels: Record<string, string> = meta.labels.steuern;

  function extractArr(key: string, sub: string): number[] {
    return perzentile.map((p: any) => p[sub][key] ?? 0);
  }
  function extractTop(key: string): number[] {
    return perzentile.map((p: any) => p[key] ?? 0);
  }

  const netto =     [23.44, 23.82, 24.04, 26.81, 28.48, 33.78, 38.95, 43.79, 47.01, 50.08, 50.21, 52.06, 55.08, 60.49, 67.14, 75.56, 88.7, 110.79, 154.06, 351.1];
  const coreLhk =   [23.44, 23.82, 24.04, 26.3, 27.5, 32.5, 36.8, 39.8, 41.5, 42.2, 42.3, 42.7, 44.2, 45.7, 47.4, 49.2, 51.3, 54.5, 60.3, 71.2];
  const konsumKap = [0, 0, 0, 0.51, 0.98, 1.28, 2.15, 3.99, 5.51, 7.88, 7.91, 9.36, 10.88, 14.79, 19.74, 26.36, 37.4, 56.29, 93.76, 279.9];

  const baseSlides = [
    { id: 0, title: 'Brutto-Zuflüsse', subtitle: 'Zuflüsse vs. Fiskallast' },
    { id: 1, title: 'Abgabenquote', subtitle: 'Effektive Steuerbelastung' },
    { id: 2, title: 'Freies Kapital', subtitle: 'Netto-Verteilung' },
  ];
  // Duplicate slides so the carousel looks full and loops smoothly
  const slides = [...baseSlides, ...baseSlides, ...baseSlides];

  let modalOpen = false;
  let modalChartIndex = 0;
  let modalChartEl: HTMLDivElement;
  let modalChartInstance: echarts.ECharts | null = null;
  let swiperEl: HTMLDivElement;
  let swiperInstance: Swiper | null = null;

  function getChartOption(index: number, mini = false): echarts.EChartsCoreOption {
    const gridBase = mini ? { top: 10, bottom: 10, left: 10, right: 10 } : undefined;

    if (index === 0) {
      const incomeSeries = incomeKeys.map(key => ({
        name: incomeLabels[key], type: 'bar' as const, stack: 'income',
        data: density(extractArr(key, 'einkommen')),
        itemStyle: { color: incomeColors[key] },
        emphasis: { focus: 'series' as const },
      }));
      const taxArrays = taxKeys.map(key => density(extractArr(key, 'steuern')));
      const taxCumSeries = taxKeys.map((key, i) => {
        const cumData = xLabels.map((_: any, j: number) => {
          let sum = 0;
          for (let k = 0; k <= i; k++) sum += taxArrays[k][j];
          return +sum.toFixed(3);
        });
        const isLast = i === taxKeys.length - 1;
        return {
          name: taxLabels[key], type: 'line' as const, data: cumData,
          lineStyle: { width: isLast ? 2.5 : 1, type: isLast ? 'solid' as const : 'dashed' as const, color: isLast ? '#2c3e50' : '#666' },
          itemStyle: { color: taxColors[key] }, symbol: 'none' as const, emphasis: { focus: 'series' as const },
        };
      });
      return mini ? {
        animation: false, grid: gridBase,
        xAxis: { type: 'category', data: xLabels, show: false },
        yAxis: { type: 'value', show: false, max: 145 },
        series: [...incomeSeries, ...taxCumSeries].map(s => ({ ...s, emphasis: undefined })),
      } : {
        title: { text: 'I. Brutto-Zuflüsse vs. Fiskallast', subtext: 'Dichte pro 1 % Bevölkerung', left: 'center' },
        tooltip: { trigger: 'axis', formatter: (params: any) => {
          let s = `<b>${params[0].axisValue}</b><br/>`;
          params.forEach((p: any) => { if (p.value > 0) s += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)} Mrd. €<br/>`; });
          return s;
        }},
        legend: { top: 60, type: 'scroll' },
        grid: { top: 120, bottom: 40, left: 60, right: 30 },
        xAxis: { type: 'category', data: xLabels, axisLabel: { rotate: 45, fontSize: 10 } },
        yAxis: { type: 'value', name: 'Mrd. € / 1 % Bev.', max: 145 },
        series: [...incomeSeries, ...taxCumSeries],
      };
    }

    if (index === 1) {
      const zuflussArr = extractTop('zufluss');
      const taxRateSeries = taxKeys.map(key => {
        const raw = extractArr(key, 'steuern');
        return {
          name: taxLabels[key], type: 'bar' as const, stack: 'rate',
          data: raw.map((v: number, i: number) => +(v / zuflussArr[i] * 100).toFixed(2)),
          itemStyle: { color: taxColors[key] }, emphasis: { focus: 'series' as const },
        };
      });
      const totalQuote = xLabels.map((_: any, i: number) => {
        let sum = 0;
        taxKeys.forEach(key => { sum += extractArr(key, 'steuern')[i]; });
        return +(sum / zuflussArr[i] * 100).toFixed(1);
      });
      return mini ? {
        animation: false, grid: gridBase,
        xAxis: { type: 'category', data: xLabels, show: false },
        yAxis: { type: 'value', show: false, max: 75 },
        series: taxRateSeries.map(s => ({ ...s, emphasis: undefined })),
      } : {
        title: { text: 'II. Effektive Abgabenquote', left: 'center' },
        tooltip: { trigger: 'axis', formatter: (params: any) => {
          let s = `<b>${params[0].axisValue}</b><br/>`; let total = 0;
          params.forEach((p: any) => { if (p.value > 0) { s += `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)} %<br/>`; total += p.value; } });
          s += `<b>Gesamt: ${total.toFixed(1)} %</b>`; return s;
        }},
        legend: { top: 35, type: 'scroll' },
        grid: { top: 80, bottom: 40, left: 60, right: 30 },
        xAxis: { type: 'category', data: xLabels, axisLabel: { rotate: 45, fontSize: 10 } },
        yAxis: { type: 'value', name: 'Abgabenquote (%)', max: 75, axisLabel: { formatter: '{value} %' } },
        series: [ ...taxRateSeries, {
          name: 'Gesamt', type: 'line' as const, data: totalQuote, lineStyle: { width: 0 }, symbol: 'none',
          label: { show: true, position: 'top' as const, formatter: (p: any) => `${p.value} %`, fontSize: 9, fontWeight: 'bold' as const, color: '#333' },
          itemStyle: { color: 'transparent' }, tooltip: { show: false },
        }],
      };
    }

    return mini ? {
      animation: false, grid: gridBase,
      xAxis: { type: 'category', data: xLabels, show: false },
      yAxis: { type: 'value', show: false, max: 400 },
      series: [
        { name: 'Core', type: 'bar', stack: 'n', data: coreLhk, itemStyle: { color: '#95a5a6', opacity: 0.3 } },
        { name: 'Frei', type: 'bar', stack: 'n', data: konsumKap, itemStyle: { color: '#27ae60' } },
      ],
    } : {
      title: { text: 'III. Netto-Verteilung: Lebenshaltung vs. Freies Kapital', left: 'center' },
      tooltip: { trigger: 'axis', formatter: (params: any) => {
        const i = params[0].dataIndex;
        let s = `<b>${params[0].axisValue}</b><br/>`;
        s += `${params[0].marker} Core-Lebenshaltung: ${coreLhk[i].toFixed(1)} Mrd. €<br/>`;
        s += `${params[1].marker} Freies Kapital: ${konsumKap[i].toFixed(1)} Mrd. €<br/>`;
        s += `<b>Netto gesamt: ${netto[i].toFixed(1)} Mrd. €</b>`; return s;
      }},
      legend: { top: 35 },
      grid: { top: 80, bottom: 40, left: 60, right: 30 },
      xAxis: { type: 'category', data: xLabels, axisLabel: { rotate: 45, fontSize: 10 } },
      yAxis: { type: 'value', name: 'Mrd. €', max: 400 },
      series: [
        { name: 'Core-Lebenshaltung', type: 'bar', stack: 'netto', data: coreLhk, itemStyle: { color: '#95a5a6', opacity: 0.3 }, emphasis: { focus: 'series' } },
        { name: 'Freies Kapital', type: 'bar', stack: 'netto', data: konsumKap, itemStyle: { color: '#27ae60' }, emphasis: { focus: 'series' },
          label: { show: true, position: 'top' as const, formatter: (p: any) => p.value > 0 ? `${p.value.toFixed(1)}` : '', fontSize: 9, fontWeight: 'bold' as const, color: '#1e8449' }
        },
      ],
    };
  }

  function renderThumbnail(container: HTMLElement, chartIndex: number) {
    const mini = echarts.init(container);
    mini.setOption(getChartOption(chartIndex, true));
    return mini;
  }

  async function openModal(chartIndex: number) {
    modalChartIndex = chartIndex;
    modalOpen = true;
    await tick();
    if (!modalChartEl) return;
    if (modalChartInstance) modalChartInstance.dispose();
    modalChartInstance = echarts.init(modalChartEl);
    modalChartInstance.setOption(getChartOption(modalChartIndex));
  }

  function closeModal() {
    modalOpen = false;
    if (modalChartInstance) {
      modalChartInstance.dispose();
      modalChartInstance = null;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && modalOpen) closeModal();
  }

  function handleSlideClick(chartId: number) {
    openModal(chartId);
  }

  onMount(() => {
    // Render thumbnails into each slide
    const thumbContainers = swiperEl.querySelectorAll<HTMLElement>('.thumb-chart');
    const minis: echarts.ECharts[] = [];
    thumbContainers.forEach((el) => {
      const idx = parseInt(el.dataset.chartId ?? '0');
      minis.push(renderThumbnail(el, idx));
    });

    swiperInstance = new Swiper(swiperEl, {
      modules: [EffectCoverflow],
      effect: 'coverflow',
      grabCursor: false,
      centeredSlides: true,
      slidesPerView: 'auto',
      initialSlide: 4,
      loop: true,
      coverflowEffect: {
        rotate: 30,
        stretch: 0,
        depth: 200,
        modifier: 1,
        slideShadows: true,
      },
    });

    const onResize = () => {
      minis.forEach(m => m.resize());
      if (modalChartInstance) modalChartInstance.resize();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (modalChartInstance) modalChartInstance.dispose();
      minis.forEach(m => m.dispose());
      if (swiperInstance) swiperInstance.destroy();
    };
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<main>
  <header>
    <h1>Steuerverteilung in Deutschland</h1>
    <p class="subtitle">Zuflüsse, Abgaben und Nettoeinkommen nach Einkommensperzentilen · alle Werte in Mrd. EUR / Jahr</p>
    <p class="hint">Diagramm anklicken zum Vergrößern</p>
  </header>

  <!-- Swiper Carousel -->
  <div class="swiper" bind:this={swiperEl}>
    <div class="swiper-wrapper">
      {#each slides as slide}
        <div class="swiper-slide" on:click={() => handleSlideClick(slide.id)}>
          <div class="slide-card">
            <div class="thumb-chart" data-chart-id={slide.id}></div>
            <div class="slide-label">
              <span class="slide-title">{slide.title}</span>
              <span class="slide-subtitle">{slide.subtitle}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <footer>
    <p>Datengrundlage: Kapital.xlsx · Keine politische Wertung – ausschließlich rechnerische Darstellung</p>
  </footer>
</main>

<!-- Modal Overlay -->
{#if modalOpen}
  <div class="modal-backdrop" on:click={closeModal}>
    <div class="modal" on:click|stopPropagation>
      <button class="modal-close" on:click={closeModal} aria-label="Schließen">&times;</button>
      <div class="modal-chart" bind:this={modalChartEl}></div>
    </div>
  </div>
{/if}

<style>
  main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1rem 3rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  header {
    text-align: center;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 2rem;
    margin: 0 0 0.3rem;
    font-weight: 700;
  }

  .subtitle {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }

  .hint {
    color: #999;
    font-size: 0.8rem;
    margin: 0.8rem 0 0;
    font-style: italic;
  }

  /* --- Swiper Carousel --- */
  .swiper {
    width: 100%;
    padding: 2.5rem 0 3.5rem;
    overflow: hidden;
  }

  .swiper-slide {
    width: 400px;
    height: auto;
    transition: transform 0.4s;
  }

  .slide-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    transition: box-shadow 0.3s, transform 0.3s;
  }

  .slide-card:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.22);
    transform: translateY(-4px);
  }

  :global(.swiper-slide-active) .slide-card {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.28);
  }

  .thumb-chart {
    width: 100%;
    height: 260px;
    background: #fff;
  }

  .slide-label {
    background: linear-gradient(135deg, #2a9d6e, #1e8449);
    padding: 0.7rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .slide-title {
    color: white;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
  }

  .slide-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.78rem;
  }

  /* Slide shadows from coverflow */
  :global(.swiper-slide-shadow-left),
  :global(.swiper-slide-shadow-right) {
    border-radius: 12px;
  }

  /* --- Modal --- */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.25s ease-out;
  }

  .modal {
    position: relative;
    background: #fff;
    border-radius: 16px;
    width: 92vw;
    max-width: 1200px;
    height: 80vh;
    max-height: 750px;
    padding: 1.5rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .modal-close {
    position: absolute;
    top: 0.75rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    color: #666;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
    z-index: 10;
  }

  .modal-close:hover {
    background: #f0f0f0;
    color: #333;
  }

  .modal-chart {
    width: 100%;
    height: 100%;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  footer {
    text-align: center;
    color: #999;
    font-size: 0.8rem;
    margin-top: 1rem;
  }
</style>
