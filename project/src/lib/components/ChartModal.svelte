<script lang="ts">
  import { onMount, createEventDispatcher, tick } from 'svelte';
  import * as echarts from 'echarts';
  import { getChartOption } from '$lib/charts';
  import type { Perzentil } from '$lib/data';

  export let chartIndex: number;
  export let perzentile: Perzentil[];
  export let taxLabels: Record<string, string>;

  const dispatch = createEventDispatcher<{ close: void }>();

  let chartEl: HTMLDivElement;
  let chartInstance: echarts.ECharts | null = null;

  function close() {
    dispatch('close');
  }

  onMount(async () => {
    await tick();
    if (!chartEl) return;
    chartInstance = echarts.init(chartEl);
    chartInstance.setOption(getChartOption(chartIndex, perzentile, taxLabels));

    const onResize = () => chartInstance?.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      chartInstance?.dispose();
    };
  });
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && close()} />

<div class="backdrop" on:click={close}>
  <div class="modal" on:click|stopPropagation>
    <button class="close-btn" on:click={close} aria-label="Schließen">&times;</button>
    <div class="chart" bind:this={chartEl}></div>
  </div>
</div>

<style>
  .backdrop {
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

  .close-btn {
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

  .close-btn:hover {
    background: #f0f0f0;
    color: #333;
  }

  .chart {
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
</style>
