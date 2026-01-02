import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// I tuoi componenti figli
import { InvestmentSummary } from './investment-summary/investment-summary';
import { BudgetOverview } from './budget-overview/budget-overview';
import { YearlyHistory } from './yearly-history/yearly-history';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InvestmentSummary, BudgetOverview, YearlyHistory],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  // 1. Inizializziamo con la data di OGGI (Tempo reale)
  dataCorrente: Date = new Date();

  // 2. Funzione per formattare il testo (es. "Gennaio 2026")
  // Usiamo questo getter nell'HTML invece della Pipe per averlo subito in Italiano
  get titoloMese(): string {
    return this.dataCorrente.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }

  // 3. Logica per andare avanti e indietro
  cambiaMese(delta: number) {
    // Creiamo una copia della data (fondamentale per far capire ad Angular che è cambiata)
    const nuovaData = new Date(this.dataCorrente);

    // Aggiunge o toglie il mese (gestisce da solo il cambio anno Dicembre->Gennaio)
    nuovaData.setMonth(nuovaData.getMonth() + delta);

    // Aggiorniamo la variabile
    this.dataCorrente = nuovaData;
  }
}
