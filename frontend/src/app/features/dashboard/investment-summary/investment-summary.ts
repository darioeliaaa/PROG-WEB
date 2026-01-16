import { Component, Input, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-investment-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-summary.html',
  styleUrl: './investment-summary.css',
})
export class InvestmentSummary implements OnInit, OnChanges {

  @Input() currentDate!: Date;
  @Input() tutteLeTransazioni: any[] = [];
  @Input() saldoReale: number = 0;
  @Input() totaleEntrate: number = 0;
  @Input() totaleUscite: number = 0;
  @Input() saldoAttuale: number = 0;
  @Input() userSettings: any;

  peekBalance: boolean = false;
  trendData: { label: string; value: number; heightPercent: number; isCurrent: boolean }[] = [];

  // Recupera i settings iniziali in modo sincrono per evitare lag al caricamento
  constructor(private userService: UserService, private cd: ChangeDetectorRef) {
    this.userSettings = this.userService.getSettingsSync();
  }

  // Si sottoscrive ai cambiamenti delle impostazioni per aggiornare valuta o privacy in tempo reale
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

  // Intercetta i cambiamenti negli input (nuove transazioni o cambio data) per ricalcolare i dati
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tutteLeTransazioni'] || changes['saldoReale'] || changes['currentDate']) {
      this.userSettings = this.userService.getSettingsSync();
      this.calcolaTotaliGlobali();
      this.calcoloTrendUltimi6Mesi();
    }
  }

  // Inverte lo stato di visibilità del saldo (mostra/nascondi cifre)
  togglePeek() {
    this.peekBalance = !this.peekBalance;
  }

  // Somma entrate e uscite di tutto lo storico transazioni applicando l'eventuale cambio valuta
  calcolaTotaliGlobali(): void {
    this.saldoAttuale = this.saldoReale;
    this.totaleEntrate = 0;
    this.totaleUscite = 0;

    if (!this.tutteLeTransazioni) return;
    const multiplier = this.userSettings?.currency === 'USD' ? 1.09 : 1;

    this.tutteLeTransazioni.forEach(t => {
      const importoConvertito = Number(t.amount) * multiplier;
      if (t.type === 'ENTRATA') this.totaleEntrate += importoConvertito;
      else if (t.type === 'USCITA') this.totaleUscite += importoConvertito;
    });
  }

  // Elabora i saldi mensili dell'ultimo semestre per generare le altezze proporzionali delle barre nel mini-chart
  // ... dentro investment-summary.ts

  calcoloTrendUltimi6Mesi(): void {
    const mesi = 6;
    const trendTemp = [];

    // Usiamo la data selezionata nella dashboard come riferimento
    const dataRiferimento = new Date(this.currentDate);
    const multiplier = this.userSettings?.currency === 'USD' ? 1.09 : 1;

    // Troviamo il valore massimo per scalare le barre graficamente
    let maxValoreAssoluto = 0;

    for (let i = mesi - 1; i >= 0; i--) {
      // 1. Calcoliamo la data "limite" (L'ultimo giorno del mese che stiamo analizzando)
      // Esempio: se siamo a Maggio e i=1 (Aprile), prendiamo il 30 Aprile alle 23:59:59
      const dataLimite = new Date(dataRiferimento.getFullYear(), dataRiferimento.getMonth() - i + 1, 0, 23, 59, 59);

      // Per l'etichetta del grafico (es. "Apr")
      const dataEtichetta = new Date(dataRiferimento.getFullYear(), dataRiferimento.getMonth() - i, 1);

      // 2. CALCOLO SALDO PROGRESSIVO (CUMULATIVO)
      // Sommiamo TUTTE le transazioni avvenute PRIMA o DURANTE quella data limite
      let saldoAlMomento = 0;

      this.tutteLeTransazioni.forEach(t => {
        const dataTransazione = new Date(t.date);

        // Se la transazione è avvenuta entro la fine di quel mese, la contiamo nel saldo
        if (dataTransazione.getTime() <= dataLimite.getTime()) {
          const valoreConvertito = Number(t.amount) * multiplier;
          if (t.type === 'ENTRATA') saldoAlMomento += valoreConvertito;
          if (t.type === 'USCITA') saldoAlMomento -= valoreConvertito;
        }
      });

      // Aggiorniamo il massimo per il calcolo delle barre percentuali
      if (Math.abs(saldoAlMomento) > maxValoreAssoluto) maxValoreAssoluto = Math.abs(saldoAlMomento);

      trendTemp.push({
        label: dataEtichetta.toLocaleString('it-IT', { month: 'short' }),
        value: saldoAlMomento,
        heightPercent: 0,
        isCurrent: i === 0
      });
    }

    // 3. Calcolo altezze barre (Normalizzazione)
    this.trendData = trendTemp.map(item => {
      let percent = 0;
      if (maxValoreAssoluto > 0) {
        // Usiamo il valore assoluto rispetto al massimo trovato nel periodo
        percent = (Math.abs(item.value) / maxValoreAssoluto) * 100;
      }
      // Assicuriamo una minima visibilità alla barra (es. 5%) se non è zero
      if (item.value !== 0 && percent < 5) percent = 5;

      return { ...item, heightPercent: percent };
    });
  }
}
