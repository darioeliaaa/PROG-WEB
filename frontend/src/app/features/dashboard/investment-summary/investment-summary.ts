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
  @Input() transazioniAnno: any[] = [];

  totalBalance: number = 0;
  monthlyInvested: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentDate'] || changes['transazioniAnno']) {
      this.calcolaPatrimonio();
    }
  }

  calcolaPatrimonio() {
    if (!this.transazioniAnno) return;

    const meseCorrenteIdx = this.currentDate.getMonth();

    const investimenti = this.transazioniAnno.filter(t =>
      t.categoria === 'investimenti' && t.tipo === 'uscita'
    );

    this.totalBalance = investimenti
      .filter(t => {
        const parts = t.data.split('-');
        const tMese = Number(parts[1]) - 1;
        return tMese <= meseCorrenteIdx;
      })
      .reduce((acc, curr) => acc + curr.importo, 0);

    this.monthlyInvested = investimenti
      .filter(t => {
        const parts = t.data.split('-');
        const tMese = Number(parts[1]) - 1;
        return tMese === meseCorrenteIdx;
      })
      .reduce((acc, curr) => acc + curr.importo, 0);
  }
}
