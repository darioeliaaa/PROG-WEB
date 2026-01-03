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

  dataCorrente: Date = new Date();
  datiMensili: any = null;
  transazioniAnnuali: any[] = [];

  constructor(private service: TransactionService) {
    this.aggiornaDati();
  }

  get titoloMese(): string {
    return this.dataCorrente.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }

  cambiaMese(delta: number) {
    const nuovaData = new Date(this.dataCorrente);
    nuovaData.setMonth(nuovaData.getMonth() + delta);
    this.dataCorrente = nuovaData;
    this.aggiornaDati();
  }

  aggiornaDati() {
    const mese = this.dataCorrente.getMonth();
    const anno = this.dataCorrente.getFullYear();

    this.datiMensili = this.service.getDataByMonth(mese, anno);

    this.transazioniAnnuali = this.service.getDataByYear(anno);
  }
}
