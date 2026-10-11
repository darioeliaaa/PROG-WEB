// Grafica "da banconota": rosette e fasce guilloché calcolate in SVG, microtesto.
// Solo decorazione: nessuna logica dell'app passa di qui. Le regole CSS stanno in styles.css.
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type Tone = 'iris' | 'ink' | 'paper';

let seq = 0;

/** Curva polare r(t) = a + b·cos(m·t + fase): sovrapposte con fasi diverse fanno il reticolo delle rosette. */
function ring(a: number, b: number, m: number, phase: number, samples: number): string {
  let d = '';
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    const r = a + b * Math.cos(m * t + phase);
    d += (i ? 'L' : 'M') + (r * Math.cos(t)).toFixed(1) + ' ' + (r * Math.sin(t)).toFixed(1);
  }
  return d + 'Z';
}

interface Layer { a: number; b: number; m: number; curves: number; samples: number; w: number }

const PRESETS: Record<string, Layer[]> = {
  // rosetta grande: tre corone intrecciate
  full: [
    { a: 82, b: 11, m: 18, curves: 6, samples: 540, w: 0.45 },
    { a: 56, b: 15, m: 12, curves: 6, samples: 420, w: 0.5 },
    { a: 26, b: 15, m: 8, curves: 4, samples: 300, w: 0.55 },
  ],
  // rosetta per le card: più leggera
  small: [
    { a: 78, b: 16, m: 14, curves: 5, samples: 360, w: 0.7 },
    { a: 40, b: 18, m: 9, curves: 4, samples: 240, w: 0.75 },
  ],
  // marchio del logo: pochi tratti, leggibile a 32px
  mark: [
    { a: 70, b: 22, m: 8, curves: 3, samples: 220, w: 3.2 },
  ],
};

const cache = new Map<string, { d: string; w: number }[]>();
function rosette(preset: string) {
  let paths = cache.get(preset);
  if (!paths) {
    paths = [];
    for (const l of PRESETS[preset] ?? PRESETS['full']) {
      for (let i = 0; i < l.curves; i++) {
        paths.push({ d: ring(l.a, l.b, l.m, (Math.PI * 2 * i) / l.curves, l.samples), w: l.w });
      }
    }
    cache.set(preset, paths);
  }
  return paths;
}

/** Rosetta guilloché. tone: iris (arcobaleno delle banconote), ink o paper (colore del testo). */
@Component({
  selector: 'mm-rosette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="-100 -100 200 200" aria-hidden="true" [class.mm-spin]="spin()">
      @if (tone() === 'iris') {
        <defs>
          <linearGradient [attr.id]="gid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="var(--iris-1)" />
            <stop offset=".35" stop-color="var(--iris-2)" />
            <stop offset=".7" stop-color="var(--iris-3)" />
            <stop offset="1" stop-color="var(--iris-4)" />
          </linearGradient>
        </defs>
      }
      <g fill="none" [attr.stroke]="tone() === 'iris' ? 'url(#' + gid + ')' : 'currentColor'">
        @for (p of paths(); track $index) {
          <path [attr.d]="p.d" [attr.stroke-width]="p.w" />
        }
      </g>
    </svg>
  `,
})
export class Rosette {
  readonly preset = input<'full' | 'small' | 'mark'>('full');
  readonly tone = input<Tone>('iris');
  readonly spin = input(false);
  protected readonly gid = 'mm-iris-' + ++seq;
  protected readonly paths = computed(() => rosette(this.preset()));
}

/** Fascia di onde intrecciate, lo sfondo delle "banconote". */
@Component({
  selector: 'mm-guilloche',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
      @if (tone() === 'iris') {
        <defs>
          <linearGradient [attr.id]="gid" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="var(--iris-1)" />
            <stop offset=".35" stop-color="var(--iris-2)" />
            <stop offset=".7" stop-color="var(--iris-3)" />
            <stop offset="1" stop-color="var(--iris-4)" />
          </linearGradient>
        </defs>
      }
      <g fill="none" [attr.stroke]="tone() === 'iris' ? 'url(#' + gid + ')' : 'currentColor'">
        @for (d of waves(); track $index) {
          <path [attr.d]="d" stroke-width=".7" vector-effect="non-scaling-stroke" />
        }
      </g>
    </svg>
  `,
})
export class Guilloche {
  readonly tone = input<Tone>('ink');
  readonly count = input(18);
  /** Cambia la forma dell'intreccio, così due card vicine non sono identiche */
  readonly seed = input(0);
  protected readonly gid = 'mm-band-' + ++seq;

  protected readonly waves = computed(() => {
    const n = this.count();
    const s = this.seed();
    const k1 = 200 + (s % 5) * 30;
    const k2 = 470 + (s % 3) * 60;
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const f = (Math.PI * 2 * i) / n;
      let d = '';
      for (let x = 0; x <= 400; x += 3) {
        const env = 0.55 + 0.45 * Math.sin((Math.PI * 2 * x) / k2 + f / 2 + s);
        const y = 60 + 38 * env * Math.sin((Math.PI * 2 * x) / k1 + f) + 8 * Math.sin((Math.PI * 2 * x) / 90 - f);
        d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
      }
      out.push(d);
    }
    return out;
  });
}

/** Riga di microtesto ripetuto, come sui bordi delle banconote. */
@Component({
  selector: 'mm-microtext',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span aria-hidden="true">{{ repeated() }}</span>`,
})
export class Microtext {
  readonly text = input('MONEYMIND');
  protected readonly repeated = computed(() => Array(60).fill(this.text()).join(' · '));
}
