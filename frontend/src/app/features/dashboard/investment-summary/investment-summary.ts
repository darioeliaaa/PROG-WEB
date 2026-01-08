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

  totaleEntrate: number = 0;
  totaleUscite: number = 0;
  saldoAttuale: number = 0;

  // NUOVO: Array per contenere i dati degli ultimi 6 mesi
  trendData: { label: string; value: number; heightPercent: number; isCurrent: boolean }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    // Ricalcola tutto ogni volta che cambiano i dati o la data
    if (changes['currentDate'] || changes['tutteLeTransazioni']) {
      this.calcoloPatrimonioAttuale();
      this.calcoloTrendUltimi6Mesi();
    }
  }

  // 1. Calcolo del saldo ad oggi (quello che avevi già)
  calcoloPatrimonioAttuale(): void {
    const datiAdOggi = this.calcoloSaldoAllaData(this.currentDate);
    this.totaleEntrate = datiAdOggi.entrate;
    this.totaleUscite = datiAdOggi.uscite;
    this.saldoAttuale = datiAdOggi.saldo;
  }

  // 2. NUOVO: Calcolo lo storico degli ultimi 6 mesi
  calcoloTrendUltimi6Mesi(): void {
    const mesi = 6;
    const trendTemp = [];
    let maxSaldo = 0;

    // Ciclo per gli ultimi 6 mesi (da -5 a 0)
    for (let i = mesi - 1; i >= 0; i--) {
      const dataTarget = new Date(this.currentDate);
      dataTarget.setMonth(dataTarget.getMonth() - i);

      // Impostiamo la data all'ultimo giorno di quel mese per prendere tutte le transazioni
      // (trick: giorno 0 del mese successivo = ultimo giorno mese corrente)
      const fineMese = new Date(dataTarget.getFullYear(), dataTarget.getMonth() + 1, 0);

      const risultato = this.calcoloSaldoAllaData(fineMese);

      // Salviamo il saldo massimo trovato per calcolare le percentuali delle barre
      if (risultato.saldo > maxSaldo) maxSaldo = risultato.saldo;

      trendTemp.push({
        label: fineMese.toLocaleString('it-IT', { month: 'short' }), // "gen", "feb"
        value: risultato.saldo,
        heightPercent: 0, // Lo calcoliamo dopo
        isCurrent: i === 0 // L'ultimo è il mese corrente
      });
    }

    // Normalizziamo le altezze (La barra più alta sarà 100%)
    this.trendData = trendTemp.map(item => ({
      ...item,
      heightPercent: maxSaldo > 0 ? (item.value / maxSaldo) * 100 : 0
    }));
  }

  // Funzione Helper: Calcola il saldo accumulato fino a una certa data
  private calcoloSaldoAllaData(dataLimite: Date) {
    let entrate = 0;
    let uscite = 0;

    if (!this.tutteLeTransazioni) return { entrate: 0, uscite: 0, saldo: 0 };

    this.tutteLeTransazioni.forEach(t => {
      const dataT = new Date(t.date);
      // Se la transazione è successiva alla data limite, ignorala
      if (dataT > dataLimite) return;

      const importo = Number(t.amount);
      if (t.type === 'ENTRATA') entrate += importo;
      else if (t.type === 'USCITA') uscite += importo;
    });

    return { entrate, uscite, saldo: entrate - uscite };
  }
}
