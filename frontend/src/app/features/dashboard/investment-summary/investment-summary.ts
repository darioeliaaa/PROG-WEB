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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentDate'] || changes['tutteLeTransazioni']) {
      this.calcoloPatrimonio();
    }
  }

  calcoloPatrimonio(): void {
    if (!this.tutteLeTransazioni) return;

    let tempEntrate = 0;
    let tempUscite = 0;

    const dataLimite = new Date(this.currentDate);

    this.tutteLeTransazioni.forEach(transazione => {

      const dataTransazione = new Date(transazione.data);

      if (dataTransazione > dataLimite) {
        return;
      }

      const importo = Number(transazione.importo);
      if (isNaN(importo)) return;

      const tipo = (transazione.tipo || '').toLowerCase();

      if (tipo === 'entrata') {
        tempEntrate += importo;
      }
      else if (tipo === 'uscita') {
        tempUscite += importo;
      }
    });

    this.totaleEntrate = tempEntrate;
    this.totaleUscite = tempUscite;

    // Il saldo ora conterrà i 100.000€ del 2025 anche se siamo nel 2026
    this.saldoAttuale = this.totaleEntrate - this.totaleUscite;

    console.log('--- PATRIMONIO AGGIORNATO ---');
    console.log('Data riferimento:', dataLimite.toLocaleDateString());
    console.log('Saldo Totale:', this.saldoAttuale);
  }
}
