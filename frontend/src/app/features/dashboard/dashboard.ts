import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componenti figli
import { InvestmentSummary } from './investment-summary/investment-summary';
import { BudgetOverview } from './budget-overview/budget-overview';
import { YearlyHistory } from './yearly-history/yearly-history';

// Services
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InvestmentSummary, BudgetOverview, YearlyHistory],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  currentDate: Date = new Date();

  // Dati per il grafico a Ciambella (Mese corrente)
  datiMensili: any = { transactions: [], totaleEntrate: 0, totaleUscite: 0, saldo: 0 };

  // Dati per lo Storico Annuale (Tutto)
  transazioniTotali: any[] = [];

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private walletService: WalletService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.caricaDati();
  }

  get titoloMese(): string {
    return this.currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }

  cambiaMese(delta: number) {
    const nuovaData = new Date(this.currentDate);
    nuovaData.setMonth(nuovaData.getMonth() + delta);
    this.currentDate = nuovaData;

    // Ricalcoliamo i dati locali senza richiamare il backend
    this.filtraDatiLocali();
  }

  caricaDati() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    // 1. Otteniamo i Wallet dell'utente
    this.walletService.getUserWallets(userId).subscribe({
      next: (wallets) => {
        if (!wallets || wallets.length === 0) {
          console.warn("Nessun wallet trovato.");
          return;
        }

        // Prendiamo il primo wallet (quello personale)
        const mainWalletId = wallets[0].id;
        console.log(`Caricamento dati per Wallet ID: ${mainWalletId}`);

        // 2. Scarichiamo TUTTE le transazioni di questo wallet
        this.transactionService.getTransactionsByWallet(mainWalletId).subscribe({
          next: (allTransactions) => {
            console.log("Transazioni trovate:", allTransactions.length);

            // Salviamo tutto lo storico (serve al grafico annuale)
            this.transazioniTotali = allTransactions;

            // 3. Filtriamo per la view mensile (serve alla ciambella)
            this.filtraDatiLocali();
          },
          error: (err) => console.error("Errore download transazioni:", err)
        });
      },
      error: (err:any) => console.error("Errore caricamento wallet:", err)
    });
  }

  filtraDatiLocali() {
    if (!this.transazioniTotali) return;

    const meseTarget = this.currentDate.getMonth();
    const annoTarget = this.currentDate.getFullYear();

    // Filtra solo le spese del mese visualizzato
    const filtered = this.transazioniTotali.filter((t: any) => {
      const d = new Date(t.date);
      return d.getMonth() === meseTarget && d.getFullYear() === annoTarget;
    });

    // Calcola totali al volo
    let entrate = 0;
    let uscite = 0;

    filtered.forEach((t: any) => {
      if (t.type === 'ENTRATA') entrate += Number(t.amount);
      if (t.type === 'USCITA') uscite += Number(t.amount);
    });

    // Aggiorna l'oggetto per i grafici
    this.datiMensili = {
      transactions: filtered,
      totaleEntrate: entrate,
      totaleUscite: uscite,
      saldo: entrate - uscite
    };

    this.cd.detectChanges(); // Aggiorna la vista
  }
}
