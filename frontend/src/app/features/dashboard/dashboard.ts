import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // ✅ Import necessario per la navigazione

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

  // ✅ NUOVO: Variabile per la Gamification
  profilePercentage: number = 100; // Iniziamo da 100 per non mostrare la barra finché non carica

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private walletService: WalletService,
    private cd: ChangeDetectorRef,
    private router: Router // ✅ Iniettiamo il Router
  ) {}

  ngOnInit() {
    this.caricaDati();
    this.checkProfileStatus(); // ✅ Avviamo il controllo profilo
  }

  // ✅ NUOVO: Controlla la percentuale di completamento
  checkProfileStatus() {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.userService.getProfileStatus(userId).subscribe({
        next: (data) => {
          this.profilePercentage = data.completionPercentage;
          // Se la percentuale cambia, forziamo l'aggiornamento UI (utile con OnPush o async)
          this.cd.detectChanges();
        },
        error: (err) => console.error("Errore recupero status profilo:", err)
      });
    }
  }

  // ✅ NUOVO: Naviga alla pagina di modifica
  goToProfile() {
    this.router.navigate(['/profilo']);
  }

  get titoloMese(): string {
    return this.currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }

  cambiaMese(delta: number) {
    const nuovaData = new Date(this.currentDate);
    nuovaData.setMonth(nuovaData.getMonth() + delta);
    this.currentDate = nuovaData;

    this.filtraDatiLocali();
  }

  caricaDati() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    this.walletService.getWalletsByUser(userId).subscribe({
      next: (wallets) => {
        if (!wallets || wallets.length === 0) {
          console.warn("Nessun wallet trovato.");
          return;
        }

        const mainWalletId = wallets[0].id;

        this.transactionService.getTransactionsByWallet(mainWalletId).subscribe({
          next: (allTransactions) => {
            this.transazioniTotali = allTransactions;
            this.filtraDatiLocali();
          },
          error: (err) => console.error("Errore download transazioni:", err)
        });
      },
      error: (err) => console.error("Errore caricamento wallet:", err)
    });
  }

  filtraDatiLocali() {
    if (!this.transazioniTotali) return;

    const meseTarget = this.currentDate.getMonth();
    const annoTarget = this.currentDate.getFullYear();

    const filtered = this.transazioniTotali.filter((t: any) => {
      const d = new Date(t.date);
      return d.getMonth() === meseTarget && d.getFullYear() === annoTarget;
    });

    let entrate = 0;
    let uscite = 0;

    filtered.forEach((t: any) => {
      if (t.type === 'ENTRATA') entrate += Number(t.amount);
      if (t.type === 'USCITA') uscite += Number(t.amount);
    });

    this.datiMensili = {
      transactions: filtered,
      totaleEntrate: entrate,
      totaleUscite: uscite,
      saldo: entrate - uscite
    };

    this.cd.detectChanges();
  }
}
