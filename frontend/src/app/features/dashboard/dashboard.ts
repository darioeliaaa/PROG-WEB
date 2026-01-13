import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Componenti figli
import { InvestmentSummary } from './investment-summary/investment-summary';
import { BudgetOverview } from './budget-overview/budget-overview';
import { YearlyHistory } from './yearly-history/yearly-history';
import { Movimenti } from '../movimenti/movimenti';

// Services
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InvestmentSummary, BudgetOverview, YearlyHistory, Movimenti],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  currentDate: Date = new Date();
  profilePercentage: number = 0;

  // Modali
  isModalOpen: boolean = false;
  isHistoryOpen: boolean = false;

  // Dati
  datiMensili: any = { transactions: [], totaleEntrate: 0, totaleUscite: 0, saldo: 0 };

  // Contenitori Dati
  transazioniTotali: any[] = [];
  recentTransactions: any[] = [];

  // ✅ NUOVO: Variabile per il saldo che non cambia col mese
  saldoTotaleReale: number = 0;

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private walletService: WalletService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.caricaDati();
    this.checkProfileStatus();
  }

  get titoloMese(): string {
    return this.currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }

  goToProfile() {
    this.router.navigate(['/profilo']);
  }

  // --- GESTIONE MODALI ---
  openHistory() {
    this.isHistoryOpen = true;
    if (this.transazioniTotali) {
      this.transazioniTotali.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  }
  closeHistory() { this.isHistoryOpen = false; }

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }
  handleTransactionSaved() {
    this.isModalOpen = false;
    this.caricaDati(); // Ricarica tutto quando salvi
  }

  // --- LOGICA DATI ---
  checkProfileStatus() {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.userService.getProfileStatus(userId).subscribe({
        next: (data) => this.profilePercentage = data.completionPercentage
      });
    }
  }

  // ✅ FIX: BLOCCO DATE FUTURE
  cambiaMese(delta: number) {
    const oggi = new Date();
    const testDate = new Date(this.currentDate);

    // Se proviamo ad andare avanti (delta > 0)
    if (delta > 0) {
      // Controlliamo se siamo già nel mese corrente (o futuro)
      if (testDate.getFullYear() === oggi.getFullYear() &&
        testDate.getMonth() >= oggi.getMonth()) {
        return; // BLOCCA: Non andare nel futuro
      }
    }

    // Se tutto ok, cambia mese
    testDate.setMonth(testDate.getMonth() + delta);
    this.currentDate = testDate;
    this.filtraDatiLocali(); // Aggiorna solo i grafici mensili
  }

  caricaDati() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    this.walletService.getUserWallets(userId).subscribe({
      next: (wallets) => {
        if (!wallets || wallets.length === 0) return;
        const mainWalletId = wallets[0].id;

        this.transactionService.getTransactionsByWallet(mainWalletId).subscribe({
          next: (allTransactions) => {
            // 1. Salviamo TUTTE le transazioni
            this.transazioniTotali = allTransactions.sort((a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            // ✅ 2. CALCOLO SALDO REALE (Totale assoluto, indipendente dal mese)
            this.calcolaSaldoTotaleAssoluto();

            // 3. Estrai ultimi 5 movimenti
            this.recentTransactions = this.transazioniTotali.slice(0, 5);

            // 4. Filtra i dati per i grafici del mese corrente
            this.filtraDatiLocali();
          },
          error: (err) => console.error("Errore transazioni:", err)
        });
      }
    });
  }

  // ✅ NUOVA FUNZIONE: Calcola il saldo su TUTTO lo storico
  calcolaSaldoTotaleAssoluto() {
    let tot = 0;
    this.transazioniTotali.forEach((t: any) => {
      if (t.type === 'ENTRATA') tot += Number(t.amount);
      if (t.type === 'USCITA') tot -= Number(t.amount);
    });
    this.saldoTotaleReale = tot;
  }

  filtraDatiLocali() {
    if (!this.transazioniTotali) return;
    const meseTarget = this.currentDate.getMonth();
    const annoTarget = this.currentDate.getFullYear();

    // Filtra SOLO per i grafici mensili
    const filtered = this.transazioniTotali.filter((t: any) => {
      const d = new Date(t.date);
      return d.getMonth() === meseTarget && d.getFullYear() === annoTarget;
    });

    let entrateMese = 0;
    let usciteMese = 0;

    filtered.forEach((t: any) => {
      if (t.type === 'ENTRATA') entrateMese += Number(t.amount);
      if (t.type === 'USCITA') usciteMese += Number(t.amount);
    });

    // Questi dati servono SOLO ai grafici del mese (app-budget-overview)
    this.datiMensili = {
      transactions: filtered,
      totaleEntrate: entrateMese,
      totaleUscite: usciteMese,
      saldo: entrateMese - usciteMese // Questo è il flusso di cassa mensile, non il saldo totale
    };

    this.cd.detectChanges();
  }

  getCategoryIcon(category: string): string {
    const cat = category ? category.toLowerCase() : '';
    if (cat.includes('casa')) return '🏠';
    if (cat.includes('spesa')) return '🛒';
    if (cat.includes('svago')) return '🎉';
    if (cat.includes('auto')) return '🚗';
    if (cat.includes('salute')) return '❤️';
    if (cat.includes('stipendio')) return '💰';
    return '📄';
  }
}
