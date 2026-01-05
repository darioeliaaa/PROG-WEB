import { Component, OnInit } from '@angular/core';
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
export class Dashboard implements OnInit {

  currentDate: Date = new Date();

  // Inizializziamo a null o oggetti vuoti per evitare errori nell'HTML mentre carica
  datiMensili: any = { transactions: [], totaleEntrate: 0, totaleUscite: 0, saldo: 0 };
  transazioniTotali: any[] = [];

  constructor(private service: TransactionService) {}

  // Usiamo ngOnInit per caricare i dati all'avvio
  ngOnInit() {
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
    const userId = 1; // ID fisso per ora

    // CHIAMATA ASINCRONA 1: Dati del mese
    this.service.getDataByMonth(userId, mese, anno).subscribe({
      next: (data) => {
        this.datiMensili = data;
        console.log("Dati mensili caricati:", data);
      },
      error: (err) => console.error("Errore caricamento mese:", err)
    });

    // CHIAMATA ASINCRONA 2: Tutto lo storico
    this.service.getAllTransactions(userId).subscribe({
      next: (data) => {
        this.transazioniTotali = data;
      },
      error: (err) => console.error("Errore storico:", err)
    });
  }
}
