<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as echarts from 'echarts';
  import Swiper from 'swiper';
  import { EffectCoverflow } from 'swiper/modules';
  import 'swiper/css';
  import 'swiper/css/effect-coverflow';
  import { getChartOption, chartSlides } from '$lib/charts';
  import type { Perzentil } from '$lib/data';

  export let perzentile: Perzentil[];
  export let taxLabels: Record<string, string>;

  const dispatch = createEventDispatcher<{ select: number }>();

  // Triple the slides so the carousel looks full with loop enabled
  const slides = [...chartSlides, ...chartSlides, ...chartSlides];

  let swiperEl: HTMLDivElement;
  let swiperInstance: Swiper | null = null;
  let minis: echarts.ECharts[] = [];

  onMount(() => {
    const thumbContainers = swiperEl.querySelectorAll<HTMLElement>('.thumb-chart');
    thumbContainers.forEach((el) => {
      const idx = parseInt(el.dataset.chartId ?? '0');
      const mini = echarts.init(el);
      mini.setOption(getChartOption(idx, perzentile, taxLabels, true));
      minis.push(mini);
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

    const onResize = () => minis.forEach(m => m.resize());
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      minis.forEach(m => m.dispose());
      if (swiperInstance) swiperInstance.destroy();
    };
  });
</script>

<div class="swiper" bind:this={swiperEl}>
  <div class="swiper-wrapper">
    {#each slides as slide}
      <div class="swiper-slide" on:click={() => dispatch('select', slide.id)}>
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
  <div class="fog fog-left"></div>
  <div class="fog fog-right"></div>
</div>

<style>
  .swiper {
    width: 100%;
    padding: 2.5rem 0 3.5rem;
    overflow: hidden;
    position: relative;
  }

  .fog {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 12%;
    z-index: 10;
    pointer-events: none;
  }

  .fog-left {
    left: 0;
    background: linear-gradient(to right, #f8f9fa, transparent);
  }

  .fog-right {
    right: 0;
    background: linear-gradient(to left, #f8f9fa, transparent);
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

  :global(.swiper-slide-shadow-left),
  :global(.swiper-slide-shadow-right) {
    border-radius: 12px;
  }
</style>
