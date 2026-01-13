import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Componenti figli
import { InvestmentSummary } from './investment-summary/investment-summary';
import { BudgetOverview } from './budget-overview/budget-overview';
import { YearlyHistory } from './yearly-history/yearly-history';

// ✅ NOVITÀ: Importiamo il componente Movimenti per usarlo nel modale
import { Movimenti } from '../movimenti/movimenti';

// Services
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // ✅ NOVITÀ: Aggiungi 'Movimenti' qui negli imports
  imports: [CommonModule, InvestmentSummary, BudgetOverview, YearlyHistory, Movimenti],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  currentDate: Date = new Date();
  profilePercentage: number = 0;
  userSettings: any = { currency: 'EUR', privacyMode: false };

  // Variabile per gestire l'apertura/chiusura del modale
  isModalOpen: boolean = false; // ✅ NOVITÀ

  // Dati grafici
  datiMensili: any = { transactions: [], totaleEntrate: 0, totaleUscite: 0, saldo: 0 };
  transazioniTotali: any[] = [];

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
    this.userService.userSettings$.subscribe({
      next: (settings) => {
        if (settings) {
          this.userSettings = settings;
          console.log("Dashboard: Impostazioni aggiornate in tempo reale!", settings);
          this.cd.detectChanges(); // Forza Angular a ridisegnare la pagina
        }
      }
    });

    // Caricamento iniziale (per sicurezza)
    this.caricaImpostazioniUtente();
  }
  caricaImpostazioniUtente() {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      // Carichiamo le impostazioni dal service
      this.userSettings = this.userService.getSettingsSync();

      // Opzionale: restiamo in ascolto di cambiamenti live
      this.userService.loadUserSettings(userId);
    }
  }

  get titoloMese(): string {
    return this.currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }

  // --- GESTIONE MODALE (POPUP) --- ✅ NOVITÀ

  openModal() {
    this.isModalOpen = true; // Apre il popup
  }

  closeModal() {
    this.isModalOpen = false; // Chiude il popup
  }

  // Chiamata quando il componente figlio <app-movimenti> emette l'evento (saved)
  handleTransactionSaved() {
    this.isModalOpen = false; // Chiudi modale
    this.caricaDati(); // Ricarica tutti i dati e aggiorna i grafici!
  }

  // --------------------------------

  checkProfileStatus() {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.userService.getProfileStatus(userId).subscribe({
        next: (data) => {
          this.profilePercentage = data.completionPercentage;
        },
        error: (err) => console.error("Errore stato profilo:", err)
      });
    }
  }

  goToProfile() {
    this.router.navigate(['/profilo']);
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

    this.walletService.getUserWallets(userId).subscribe({
      next: (wallets) => {
        if (!wallets || wallets.length === 0) {
          console.warn("Nessun wallet trovato.");
          return;
        }

        const mainWalletId = wallets[0].id;

        this.transactionService.getTransactionsByWallet(mainWalletId).subscribe({
          next: (allTransactions) => {
            this.transazioniTotali = allTransactions;
            this.filtraDatiLocali(); // Aggiorna i calcoli
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
