<script lang="ts">
  export let data: any;

  const { haupttabelle, meta } = data.data;

  const INCOME_COLORS: Record<string, string> = {
    lohn:       '#4a90d9',
    gewerbe_vv: '#7b61ff',
    kap_ertrag: '#f5a623',
    erbschaften:'#d0021b',
    transfers:  '#7ed321',
  };

  const TAX_COLORS: Record<string, string> = {
    mwst:    '#e8a838',
    est:     '#c0392b',
    kv_pv:   '#2980b9',
    kap_st:  '#8e44ad',
    erbe_st: '#e74c3c',
    sonst:   '#7f8c8d',
  };

  const MAX_ZUFLUSS = Math.max(...haupttabelle.map((g: any) => g.zufluss));

  function barWidth(val: number) {
    return (val / MAX_ZUFLUSS) * 100;
  }

  function taxRate(g: any) {
    return g.zufluss > 0 ? ((g.abgaben / g.zufluss) * 100).toFixed(1) : '0';
  }
</script>

<main>
  <h1>Steuerbelastung nach Einkommensgruppe</h1>
  <p class="subtitle">Zuflüsse und Abgaben in Mrd. EUR / Jahr · alle Werte gerundet</p>

  <div class="legend-row">
    <div class="legend">
      <strong>Einkommen</strong>
      {#each Object.entries(meta.labels.einkommen) as [key, label]}
        <span class="dot" style="background:{INCOME_COLORS[key]}"></span>{label}
      {/each}
    </div>
    <div class="legend">
      <strong>Steuern & Abgaben</strong>
      {#each Object.entries(meta.labels.steuern) as [key, label]}
        <span class="dot" style="background:{TAX_COLORS[key]}"></span>{label}
      {/each}
    </div>
  </div>

  <div class="chart">
    {#each haupttabelle as g}
      <div class="row">
        <div class="label">{g.gruppe}</div>

        <div class="bars">
          <!-- Income bar -->
          <div class="bar-track income" style="width:{barWidth(g.zufluss)}%">
            {#each Object.entries(g.einkommen) as [key, val]}
              {#if (val as number) > 0}
                <div
                  class="segment"
                  style="flex:{val};background:{INCOME_COLORS[key]}"
                  title="{meta.labels.einkommen[key]}: {val} Mrd."
                ></div>
              {/if}
            {/each}
          </div>

          <!-- Tax bar -->
          <div class="bar-track tax" style="width:{barWidth(g.abgaben)}%">
            {#each Object.entries(g.steuern) as [key, val]}
              {#if (val as number) > 0}
                <div
                  class="segment"
                  style="flex:{val};background:{TAX_COLORS[key]}"
                  title="{meta.labels.steuern[key]}: {val} Mrd."
                ></div>
              {/if}
            {/each}
          </div>
        </div>

        <div class="stats">
          <span class="zufluss">{g.zufluss} Mrd.</span>
          <span class="rate">{taxRate(g)} % Abgaben</span>
        </div>
      </div>
    {/each}
  </div>
</main>

<style>
  main {
    max-width: 960px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  h1 {
    font-size: 1.6rem;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    color: #666;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .legend-row {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
    font-size: 0.82rem;
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .chart {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .row {
    display: grid;
    grid-template-columns: 70px 1fr 110px;
    align-items: center;
    gap: 0.75rem;
  }

  .label {
    font-weight: 600;
    font-size: 0.88rem;
    text-align: right;
  }

  .bars {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .bar-track {
    display: flex;
    height: 18px;
    border-radius: 3px;
    overflow: hidden;
    min-width: 2px;
  }

  .segment {
    height: 100%;
    transition: flex 0.3s;
  }

  .stats {
    display: flex;
    flex-direction: column;
    font-size: 0.8rem;
    gap: 2px;
  }

  .zufluss {
    color: #333;
  }

  .rate {
    color: #c0392b;
    font-weight: 600;
  }
</style>
