import { Component, Input, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-investment-summary-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-summary-wallet.html',
  styleUrl: './investment-summary-wallet.css',
})
export class InvestmentSummaryWallet implements OnInit, OnChanges {

  @Input() currentDate!: Date;
  @Input() tutteLeTransazioni: any[] = [];
  @Input() saldoReale: number = 0;

  totaleEntrate: number = 0;
  totaleUscite: number = 0;
  saldoAttuale: number = 0;
  userSettings: any;
  peekBalance: boolean = false;
  trendData: { label: string; value: number; heightPercent: number; isCurrent: boolean }[] = [];

  // Inizializza le impostazioni utente in modo sincrono per evitare flash di dati non formattati
  constructor(private userService: UserService, private cd: ChangeDetectorRef) {
    this.userSettings = this.userService.getSettingsSync();
  }

  // Resta in ascolto di modifiche globali alle impostazioni come la valuta o la modalità privacy
  ngOnInit() {
    this.userService.userSettings$.subscribe({
      next: (settings) => {
        if (settings) {
          this.userSettings = settings;
          this.cd.detectChanges();
        }
      }
    });
  }

  // Monitora gli input e ricalcola totali e trend ogni volta che le transazioni o il saldo vengono aggiornati
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tutteLeTransazioni'] || changes['saldoReale'] || changes['currentDate']) {
      this.userSettings = this.userService.getSettingsSync();
      this.calcolaTotaliGlobali();
      this.calcoloTrendUltimi6Mesi();
    }
  }

  // Alterna la visibilità dei numeri sensibili nel template
  togglePeek() {
    this.peekBalance = !this.peekBalance;
  }

  // Esegue la somma algebrica di tutte le transazioni per determinare i volumi totali di entrata e uscita
  calcolaTotaliGlobali(): void {
    this.saldoAttuale = this.saldoReale;
    this.totaleEntrate = 0;
    this.totaleUscite = 0;

    if (!this.tutteLeTransazioni) return;

    this.tutteLeTransazioni.forEach(t => {
      const importo = Number(t.amount);
      if (t.type === 'ENTRATA') this.totaleEntrate += importo;
      else if (t.type === 'USCITA') this.totaleUscite += importo;
    });
  }

  // Genera lo storico mensile degli ultimi 6 mesi calcolando le altezze relative per il mini-chart
  // ... dentro investment-summary.ts

  // ... dentro investment-summary-wallet.ts

  calcoloTrendUltimi6Mesi(): void {
    const mesi = 6;
    const trendTemp = [];
    const dataRiferimento = new Date(this.currentDate);
    let maxValoreAssoluto = 0;

    for (let i = mesi - 1; i >= 0; i--) {
      // Ultimo istante del mese analizzato
      const dataLimite = new Date(dataRiferimento.getFullYear(), dataRiferimento.getMonth() - i + 1, 0, 23, 59, 59);
      const dataEtichetta = new Date(dataRiferimento.getFullYear(), dataRiferimento.getMonth() - i, 1);

      // SALDO PROGRESSIVO
      let saldoAlMomento = 0;

      this.tutteLeTransazioni.forEach(t => {
        const dataTransazione = new Date(t.date);

        // Somma tutto ciò che è accaduto fino a quel momento
        if (dataTransazione.getTime() <= dataLimite.getTime()) {
          const importo = Number(t.amount);
          if (t.type === 'ENTRATA') saldoAlMomento += importo;
          if (t.type === 'USCITA') saldoAlMomento -= importo;
        }
      });

      if (Math.abs(saldoAlMomento) > maxValoreAssoluto) maxValoreAssoluto = Math.abs(saldoAlMomento);

      trendTemp.push({
        label: dataEtichetta.toLocaleString('it-IT', { month: 'short' }),
        value: saldoAlMomento,
        heightPercent: 0,
        isCurrent: i === 0
      });
    }

    this.trendData = trendTemp.map(item => {
      let percent = 0;
      if (maxValoreAssoluto > 0) {
        percent = (Math.abs(item.value) / maxValoreAssoluto) * 100;
      }
      if (item.value !== 0 && percent < 5) percent = 5;

      return { ...item, heightPercent: percent };
    });
  }
}
