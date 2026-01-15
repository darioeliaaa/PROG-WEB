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

  // ✅ Riceve il saldo reale (assoluto) dalla Dashboard
  @Input() saldoReale: number = 0;

  totaleEntrate: number = 0;
  totaleUscite: number = 0;
  saldoAttuale: number = 0;
  userSettings: any;
  peekBalance: boolean = false;

  constructor(private userService: UserService, private cd: ChangeDetectorRef) {
    this.userSettings = this.userService.getSettingsSync();
  }

  trendData: { label: string; value: number; heightPercent: number; isCurrent: boolean }[] = [];

  ngOnInit() {
    // ASCOLTO CONTINUO: aggiorna il componente se cambiano privacy o valuta
    this.userService.userSettings$.subscribe({
      next: (settings) => {
        if (settings) {
          this.userSettings = settings;
          this.cd.detectChanges();
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // RISOLUZIONE CONFLITTO:
    // Ricalcoliamo quando cambiano le transazioni o il saldo reale passato dal padre.
    // Includiamo 'currentDate' se necessario, ma come da versione entrante,
    // i totali globali sono indipendenti dalla data selezionata.
    if (changes['tutteLeTransazioni'] || changes['saldoReale'] || changes['currentDate']) {

      // Assicuriamoci di avere i settings aggiornati per i calcoli
      this.userSettings = this.userService.getSettingsSync();

      // Utilizziamo il nuovo metodo della versione b7b2b38
      this.calcolaTotaliGlobali();
      this.calcoloTrendUltimi6Mesi();
    }
  }

  togglePeek() {
    this.peekBalance = !this.peekBalance;
  }

  // Calcolo dei totali ASSOLUTI (Indipendenti dal mese selezionato)
  calcolaTotaliGlobali(): void {
    // Sincronizziamo il saldo con quello ricevuto dall'input del padre
    this.saldoAttuale = this.saldoReale;

    this.totaleEntrate = 0;
    this.totaleUscite = 0;

    if (!this.tutteLeTransazioni) return;

    // Somma su TUTTO lo storico
    this.tutteLeTransazioni.forEach(t => {
      const importo = Number(t.amount);
      if (t.type === 'ENTRATA') this.totaleEntrate += importo;
      else if (t.type === 'USCITA') this.totaleUscite += importo;
    });
  }

  // Calcolo lo storico degli ultimi 6 mesi
  calcoloTrendUltimi6Mesi(): void {
    const mesi = 6;
    const trendTemp = [];
    let maxValoreAssoluto = 0;

    const oggi = new Date();

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

