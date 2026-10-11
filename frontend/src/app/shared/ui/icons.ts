// Icone dell'interfaccia (tratto 1.8, stile lineare) e icone delle categorie di spesa.
// Sostituiscono Font Awesome e le emoji: stesso peso ovunque, nitide a ogni misura.
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  | 'grid' | 'wallet' | 'users' | 'home' | 'chart' | 'briefcase' | 'chevron-down' | 'chevron-left'
  | 'chevron-right' | 'plus' | 'eye' | 'eye-off' | 'arrow-up' | 'arrow-down' | 'arrow-left' | 'arrow-right'
  | 'settings' | 'star' | 'trash' | 'logout' | 'login' | 'user' | 'close' | 'shield' | 'check' | 'lock'
  | 'trend-up' | 'trend-down' | 'calendar' | 'key' | 'globe' | 'bolt' | 'sparkle' | 'crown' | 'news' | 'coins';

/** Icona lineare dell'interfaccia: <mm-icon name="wallet" /> */
@Component({
  selector: 'mm-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (name()) {
        @case ('grid') { <rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /> }
        @case ('wallet') { <path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6" /><path d="M16.5 14h.01" /> }
        @case ('users') { <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" /><circle cx="9" cy="7.5" r="3.5" /><path d="M22 20v-1.5a4 4 0 0 0-3-3.87" /><path d="M16 4.13a3.5 3.5 0 0 1 0 6.75" /> }
        @case ('home') { <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" /><path d="M10 21v-6h4v6" /> }
        @case ('chart') { <path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m7 15 4-4 3 3 6-7" /> }
        @case ('briefcase') { <rect x="2.5" y="7" width="19" height="13" rx="2" /><path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" /><path d="M2.5 13h19" /> }
        @case ('chevron-down') { <path d="m6 9 6 6 6-6" /> }
        @case ('chevron-left') { <path d="m15 18-6-6 6-6" /> }
        @case ('chevron-right') { <path d="m9 18 6-6-6-6" /> }
        @case ('plus') { <path d="M12 5v14M5 12h14" /> }
        @case ('eye') { <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /> }
        @case ('eye-off') { <path d="M9.9 4.2A9.8 9.8 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M14.1 14.1a3 3 0 0 1-4.2-4.2" /><path d="m2 2 20 20" /> }
        @case ('arrow-up') { <path d="M7 17 17 7M8 7h9v9" /> }
        @case ('arrow-down') { <path d="M7 7l10 10M17 8v9H8" /> }
        @case ('arrow-left') { <path d="M19 12H5M11 18l-6-6 6-6" /> }
        @case ('arrow-right') { <path d="M5 12h14M13 6l6 6-6 6" /> }
        @case ('settings') { <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /> }
        @case ('star') { <path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6l-5.8 3.1 1.1-6.5L2.6 9.6l6.5-.9L12 2.8Z" /> }
        @case ('trash') { <path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M19 6l-.9 13.1A2 2 0 0 1 16.1 21H7.9a2 2 0 0 1-2-1.9L5 6" /><path d="M10 11v6M14 11v6" /> }
        @case ('logout') { <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /> }
        @case ('login') { <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5M15 12H3" /> }
        @case ('user') { <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /> }
        @case ('close') { <path d="M18 6 6 18M6 6l12 12" /> }
        @case ('shield') { <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /> }
        @case ('check') { <path d="M20 6 9 17l-5-5" /> }
        @case ('lock') { <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" /> }
        @case ('trend-up') { <path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /> }
        @case ('trend-down') { <path d="m3 7 6 6 4-4 8 8" /><path d="M15 17h6v-6" /> }
        @case ('calendar') { <rect x="3" y="4.5" width="18" height="16.5" rx="2" /><path d="M16 3v3M8 3v3M3 10h18" /> }
        @case ('key') { <circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.7 12.3 9.8-9.8M17 6l3 3M15 8l2 2" /> }
        @case ('globe') { <circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5a14.5 14.5 0 0 1 0 19M12 2.5a14.5 14.5 0 0 0 0 19" /> }
        @case ('bolt') { <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /> }
        @case ('sparkle') { <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M6.3 17.7l2.8-2.8M14.9 9.1l2.8-2.8" /> }
        @case ('crown') { <path d="m3 7 4.5 4L12 5l4.5 6L21 7l-2 12H5L3 7Z" /> }
        @case ('news') { <path d="M4 4h13a1 1 0 0 1 1 1v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V4Z" /><path d="M18 8h2a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2M8 8h6M8 12h6M8 16h4" /> }
        @case ('coins') { <circle cx="9" cy="9" r="6" /><path d="M18.1 10.4A6 6 0 1 1 10.4 18.1M8 7h1.5v4" /> }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
}

/** Colori e icone delle categorie: i colori delle banconote in euro. */
export const CATEGORIE: Record<string, { color: string; label: string; icon: string }> = {
  casa:         { color: '#C4524C', label: 'Casa',         icon: 'M3 10.5 12 3l9 7.5M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 21v-6h4v6' },
  spesa:        { color: '#D9822F', label: 'Spesa',        icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0' },
  svago:        { color: '#7B5BC2', label: 'Svago',        icon: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2ZM13 5v2M13 17v2M13 11v2' },
  salute:       { color: '#3B9563', label: 'Salute',       icon: 'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z' },
  stipendio:    { color: '#2F6DB5', label: 'Stipendio',    icon: 'M2.5 7h19v13h-19zM8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M2.5 13h19' },
  investimenti: { color: '#B8911F', label: 'Investimenti', icon: 'm3 17 6-6 4 4 8-8M15 7h6v6' },
  trasporti:    { color: '#23877D', label: 'Trasporti',    icon: 'M5 17h14M6 17V9l2-4h8l2 4v8M5 12h14M7 20v-3M17 20v-3' },
  auto:         { color: '#23877D', label: 'Auto',         icon: 'M5 17h14M6 17V9l2-4h8l2 4v8M5 12h14M7 20v-3M17 20v-3' },
  bollette:     { color: '#C9A227', label: 'Bollette',     icon: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z' },
  abbonamenti:  { color: '#4C6FD1', label: 'Abbonamenti',  icon: 'M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3' },
  extra:        { color: '#1E8A6A', label: 'Extra',        icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  altro:        { color: '#7D8683', label: 'Altro',        icon: 'M4 2h16v20l-3-2-3 2-2-2-2 2-3-2-3 2V2ZM8 7h8M8 11h8M8 15h5' },
};

export function categoria(nome: string | null | undefined) {
  const key = (nome || '').toLowerCase().trim();
  if (CATEGORIE[key]) return CATEGORIE[key];
  const found = Object.keys(CATEGORIE).find((k) => key.includes(k));
  return found ? CATEGORIE[found] : { ...CATEGORIE['altro'], label: nome || 'Altro' };
}

/** Colore di una categoria per i grafici. */
export function coloreCategoria(nome: string): string {
  return categoria(nome).color;
}

/** Pastiglia colorata con l'icona della categoria: <mm-cat-icon [category]="t.category" /> */
@Component({
  selector: 'mm-cat-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--cat]': 'info().color' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path [attr.d]="info().icon" />
    </svg>
  `,
})
export class CategoryIcon {
  readonly category = input<string | null | undefined>('');
  protected readonly info = computed(() => categoria(this.category()));
}
