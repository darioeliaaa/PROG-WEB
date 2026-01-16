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
  calcoloTrendUltimi6Mesi(): void {
    const mesi = 6;
    const trendTemp = [];
    let maxValoreAssoluto = 0;

    const oggi = new Date();
    const multiplier = this.userSettings?.currency === 'USD' ? 1.09 : 1;

    for (let i = mesi - 1; i >= 0; i--) {
      const dataTarget = new Date(oggi.getFullYear(), oggi.getMonth() - i, 1);
      const mese = dataTarget.getMonth();
      const anno = dataTarget.getFullYear();

      const transazioniMese = this.tutteLeTransazioni.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === mese && d.getFullYear() === anno;
      });

      let saldoMese = 0;
      transazioniMese.forEach(t => {
        const valoreConvertito = Number(t.amount) * multiplier;
        if(t.type === 'ENTRATA') saldoMese += valoreConvertito;
        if(t.type === 'USCITA') saldoMese -= valoreConvertito;
      });

      if (Math.abs(saldoMese) > maxValoreAssoluto) maxValoreAssoluto = Math.abs(saldoMese);

      trendTemp.push({
        label: dataTarget.toLocaleString('it-IT', { month: 'short' }),
        value: saldoMese,
        heightPercent: 0,
        isCurrent: i === 0
      });
    }

    this.trendData = trendTemp.map(item => {
      let percent = 0;
      if (maxValoreAssoluto > 0) {
        percent = (Math.abs(item.value) / maxValoreAssoluto) * 100;
      }
      if (item.value !== 0 && percent < 10) percent = 10;

      return { ...item, heightPercent: percent };
    });
  }
}
