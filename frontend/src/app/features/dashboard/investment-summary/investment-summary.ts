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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentDate']) {
      const nuovoMese = this.currentDate;

      console.log('InvestmentSummary ha ricevuto il nuovo mese:', nuovoMese);

      // QUI SOTTO devi chiamare la tua logica per aggiornare i numeri.
      // Esempio: this.calcolaInvestimenti(nuovoMese);
    }
  }
  calcolaInvestimenti(data: Date) {
    // Logica finta per ora
    console.log(`Sto scaricando gli investimenti di ${data.getMonth() + 1}/${data.getFullYear()}...`);
  }

}
