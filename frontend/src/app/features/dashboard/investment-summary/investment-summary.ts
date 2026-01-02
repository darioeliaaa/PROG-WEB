import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; // Utile per formattare date nell'HTML

@Component({
  selector: 'app-investment-summary',
  standalone: true, // Aggiunto per coerenza con la dashboard
  imports: [CommonModule],
  templateUrl: './investment-summary.html',
  styleUrl: './investment-summary.css',
})
export class InvestmentSummary implements OnChanges {

  // 1. Qui ricevi la data dalla Dashboard (dal file dashboard.html)
  @Input() currentDate!: Date;

  // 2. Questa funzione parte AUTOMATICAMENTE ogni volta che cambi mese
  ngOnChanges(changes: SimpleChanges) {
    // Controlliamo se è cambiata proprio la proprietà 'currentDate'
    if (changes['currentDate']) {
      const nuovoMese = this.currentDate;

      console.log('InvestmentSummary ha ricevuto il nuovo mese:', nuovoMese);

      // QUI SOTTO devi chiamare la tua logica per aggiornare i numeri.
      // Esempio: this.calcolaInvestimenti(nuovoMese);
    }
  }

  // Esempio di funzione che userai
  calcolaInvestimenti(data: Date) {
    // Logica finta per ora
    console.log(`Sto scaricando gli investimenti di ${data.getMonth() + 1}/${data.getFullYear()}...`);
  }

}
