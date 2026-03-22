<script lang="ts">
  import Carousel from '$lib/components/Carousel.svelte';
  import ChartModal from '$lib/components/ChartModal.svelte';

  export let data: any;
  const { perzentile, meta } = data.data;
  const taxLabels: Record<string, string> = meta.labels.steuern;

  let modalOpen = false;
  let modalChartIndex = 0;

  function openChart(e: CustomEvent<number>) {
    modalChartIndex = e.detail;
    modalOpen = true;
  }
</script>

<main>
  <header>
    <h1>Steuerverteilung in Deutschland</h1>
    <p class="subtitle">Zuflüsse, Abgaben und Nettoeinkommen nach Einkommensperzentilen · alle Werte in Mrd. EUR / Jahr</p>
    <p class="hint">Diagramm anklicken zum Vergrößern</p>
  </header>

  <div class="carousel-fullwidth">
    <Carousel {perzentile} {taxLabels} on:select={openChart} />
  </div>

  <footer>
    <p>Datengrundlage: Kapital.xlsx · Keine politische Wertung – ausschließlich rechnerische Darstellung</p>
  </footer>
</main>

{#if modalOpen}
  <ChartModal
    chartIndex={modalChartIndex}
    {perzentile}
    {taxLabels}
    on:close={() => modalOpen = false}
  />
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

  .carousel-fullwidth {
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }

  footer {
    text-align: center;
    color: #999;
    font-size: 0.8rem;
    margin-top: 1rem;
  }
</style>
