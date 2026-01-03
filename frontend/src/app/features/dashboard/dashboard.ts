import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentSummary } from './investment-summary/investment-summary';
import { BudgetOverview } from './budget-overview/budget-overview';
import { YearlyHistory } from './yearly-history/yearly-history';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InvestmentSummary, BudgetOverview, YearlyHistory],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  currentDate: Date = new Date();
  datiMensili: any = null;
  transazioniTotali: any[] = [];

  constructor(private service: TransactionService) {
    this.aggiornaDati();
  }

  get titoloMese(): string {
    return this.currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }

  cambiaMese(delta: number) {
    const nuovaData = new Date(this.currentDate);
    nuovaData.setMonth(nuovaData.getMonth() + delta);
    this.currentDate = nuovaData;
    this.aggiornaDati();
  }

  aggiornaDati() {
    const mese = this.currentDate.getMonth();
    const anno = this.currentDate.getFullYear();

    this.datiMensili = this.service.getDataByMonth(mese, anno);

    this.transazioniTotali = this.service.getAllTransactions();
  }
}
