export interface SlideInfo {
  id: number;
  title: string;
  subtitle: string;
}

export const chartSlides: SlideInfo[] = [
  { id: 0, title: 'Brutto-Zuflüsse', subtitle: 'Zuflüsse vs. Fiskallast' },
  { id: 1, title: 'Abgabenquote', subtitle: 'Effektive Steuerbelastung' },
  { id: 2, title: 'Freies Kapital', subtitle: 'Netto-Verteilung' },
];
