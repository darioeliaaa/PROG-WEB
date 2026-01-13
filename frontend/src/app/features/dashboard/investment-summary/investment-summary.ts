import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-investment-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-summary.html',
  styleUrl: './investment-summary.css',
})
export class InvestmentSummary implements OnChanges {

  @Input() currentDate!: Date;
  @Input() tutteLeTransazioni: any[] = [];

  // ✅ NUOVO INPUT: Riceve il saldo reale (assoluto) dalla Dashboard
  @Input() saldoReale: number = 0;

  totaleEntrate: number = 0;
  totaleUscite: number = 0;
  // Non serve calcolarlo qui se usiamo quello passato dal padre,
  // ma per sicurezza lo aggiorniamo nel metodo sotto.
  saldoAttuale: number = 0;

  trendData: { label: string; value: number; heightPercent: number; isCurrent: boolean }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    // Ricalcola se cambiano le transazioni o il saldo passato
    // NOTA: Non ricalcoliamo sui cambi di 'currentDate' per mantenere i totali fissi!
    if (changes['tutteLeTransazioni'] || changes['saldoReale']) {
      this.calcolaTotaliGlobali();
      this.calcoloTrendUltimi6Mesi();
    }
  }

  // 1. Calcolo dei totali ASSOLUTI (Indipendenti dal mese selezionato)
  calcolaTotaliGlobali(): void {
    // Usiamo il saldo passato dal padre per coerenza massima
    this.saldoAttuale = this.saldoReale;

    this.totaleEntrate = 0;
    this.totaleUscite = 0;

    if (!this.tutteLeTransazioni) return;

    // Somma su TUTTO lo storico senza guardare le date
    this.tutteLeTransazioni.forEach(t => {
      const importo = Number(t.amount);
      if (t.type === 'ENTRATA') this.totaleEntrate += importo;
      else if (t.type === 'USCITA') this.totaleUscite += importo;
    });
  }

  // 2. Calcolo lo storico degli ultimi 6 mesi (Rispetto a OGGI, non alla data selezionata)
  calcoloTrendUltimi6Mesi(): void {
    const mesi = 6;
    const trendTemp = [];
    let maxValoreAssoluto = 0; // Per scalare le barre (usiamo valore assoluto per gestire anche saldi negativi)

    // Usiamo OGGI come ancora, così il grafico non cambia se navighi indietro
    const oggi = new Date();

    for (let i = mesi - 1; i >= 0; i--) {
      // Calcoliamo il mese target partendo da oggi
      const dataTarget = new Date(oggi.getFullYear(), oggi.getMonth() - i, 1);

      const mese = dataTarget.getMonth();
      const anno = dataTarget.getFullYear();

      // Filtriamo le transazioni ESCLUSIVAMENTE di quel mese
      // (Qui calcoliamo il flusso di cassa mensile per il grafico, non il saldo accumulato)
      const transazioniMese = this.tutteLeTransazioni.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === mese && d.getFullYear() === anno;
      });

      // Calcolo saldo DEL MESE (Entrate - Uscite di quel mese)
      let saldoMese = 0;
      transazioniMese.forEach(t => {
        if(t.type === 'ENTRATA') saldoMese += Number(t.amount);
        if(t.type === 'USCITA') saldoMese -= Number(t.amount);
      });

      if (Math.abs(saldoMese) > maxValoreAssoluto) maxValoreAssoluto = Math.abs(saldoMese);

      trendTemp.push({
        label: dataTarget.toLocaleString('it-IT', { month: 'short' }),
        value: saldoMese,
        heightPercent: 0,
        isCurrent: i === 0
      });
    }

    // Normalizziamo le altezze
    this.trendData = trendTemp.map(item => {
      let percent = 0;
      if (maxValoreAssoluto > 0) {
        percent = (Math.abs(item.value) / maxValoreAssoluto) * 100;
      }
      // Un minimo di altezza per le barre visibili ma piccole
      if (item.value !== 0 && percent < 10) percent = 10;

      return {
        ...item,
        heightPercent: percent
      };
    });
  }
}
