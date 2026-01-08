import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// ⚠️ CONTROLLA QUESTI PERCORSI: solitamente i file finiscono con .component
import { InvestmentSummary } from './investment-summary/investment-summary';
import { BudgetOverview } from './budget-overview/budget-overview';
import { YearlyHistory } from './yearly-history/yearly-history';

import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service'; // <--- IMPORTA IL SERVICE UTENTE

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InvestmentSummary, BudgetOverview, YearlyHistory],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  currentDate: Date = new Date();

  // Inizializziamo oggetti vuoti per evitare errori nell'HTML
  datiMensili: any = { transactions: [], totaleEntrate: 0, totaleUscite: 0, saldo: 0 };
  transazioniTotali: any[] = [];

  constructor(
    private service: TransactionService,
    private userService: UserService // <--- INIETTA IL SERVICE
  ) {}

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

    // 🔴 ORA PRENDIAMO L'ID VERO DALLA MEMORIA (LOGIN)
    const userId = this.userService.getCurrentUserId();

    // Se per caso l'utente non è loggato, ci fermiamo per non causare errori
    if (!userId) {
      console.warn("Nessun utente loggato! Impossibile caricare i dati.");
      return;
    }

    console.log(`Carico dati per User ${userId}, Mese: ${mese + 1}/${anno}`);

    // CHIAMATA 1: Dati del mese (per i grafici a ciambella)
    this.service.getDataByMonth(userId, mese, anno).subscribe({
      next: (data) => {
        this.datiMensili = data;
        console.log("Dati mensili aggiornati:", data);
      },
      error: (err) => console.error("Errore caricamento mese:", err)
    });

    // CHIAMATA 2: Tutto lo storico (per il riepilogo investimenti)
    this.service.getAllTransactions(userId).subscribe({
      next: (data) => {
        this.transazioniTotali = data;
      },
      error: (err) => console.error("Errore storico:", err)
    });
  }
}
