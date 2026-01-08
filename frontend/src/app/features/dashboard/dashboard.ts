import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvestmentSummary } from './investment-summary/investment-summary';
import { BudgetOverview } from './budget-overview/budget-overview';
import { YearlyHistory } from './yearly-history/yearly-history';

import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InvestmentSummary, BudgetOverview, YearlyHistory],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  currentDate: Date = new Date();

  datiMensili: any = { transactions: [], totaleEntrate: 0, totaleUscite: 0, saldo: 0 };
  transazioniTotali: any[] = [];

  constructor(
    private service: TransactionService,
    private userService: UserService,
    private cd: ChangeDetectorRef // <--- Questa è la parte magica per il refresh
  ) {}

  ngOnInit() {
    // Timeout per sicurezza
    setTimeout(() => {
      this.aggiornaDati();
    }, 100);
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
    const userId = this.userService.getCurrentUserId();

    if (!userId) return;

    // 1. Dati del Mese
    this.service.getDataByMonth(userId, mese, anno).subscribe({
      next: (data) => {
        this.datiMensili = data;
        this.cd.detectChanges(); // <--- Forza l'aggiornamento grafico
      },
      error: (err) => console.error(err)
    });

    // 2. Storico Totale
    this.service.getAllTransactions(userId).subscribe({
      next: (data) => {
        this.transazioniTotali = data;
        this.cd.detectChanges(); // <--- Forza l'aggiornamento grafico
      },
      error: (err) => console.error(err)
    });
  }
}
