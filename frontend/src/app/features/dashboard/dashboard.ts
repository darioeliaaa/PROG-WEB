import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { InvestmentSummary } from './investment-summary/investment-summary';
import { BudgetOverview } from './budget-overview/budget-overview';
import { YearlyHistory } from './yearly-history/yearly-history';
import { Movimenti } from '../movimenti/movimenti';

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

  isLoggedIn: boolean = false;
  currentDate: Date = new Date();
  profilePercentage: number = 0;
  userSettings: any = { currency: 'EUR', privacyMode: false };
  tassoCambio: number = 1.09;

  isModalOpen: boolean = false;
  isHistoryOpen: boolean = false;

  datiMensili: any = { transactions: [], totaleEntrate: 0, totaleUscite: 0, saldo: 0 };
  transazioniTotali: any[] = [];
  recentTransactions: any[] = [];
  saldoTotaleReale: number = 0;

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private walletService: WalletService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  // Verifica lo stato di autenticazione e avvia il caricamento dei dati se l'utente è loggato
  ngOnInit() {
    this.isLoggedIn = this.userService.isLoggedIn();

    if (this.isLoggedIn) {
      this.caricaDati();
      this.checkProfileStatus();
      this.caricaImpostazioniUtente();

      this.userService.userSettings$.subscribe({
        next: (settings) => {
          if (settings) {
            this.userSettings = settings;
            this.filtraDatiLocali();
            this.calcolaSaldoTotaleAssoluto();
            this.cd.detectChanges();
          }
        }
      });
    }
  }

  // Naviga l'utente verso la pagina di login
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Applica il tasso di cambio se la valuta impostata è diversa dall'Euro
  converti(valore: number): number {
    if (this.userSettings?.currency === 'USD') {
      return valore * this.tassoCambio;
    }
    return valore;
  }

  // Sincronizza le impostazioni dell'utente (valuta, privacy) dal servizio dedicato
  caricaImpostazioniUtente() {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.userSettings = this.userService.getSettingsSync();
      this.userService.loadUserSettings(userId);
    }
  }

  // Restituisce il nome del mese e l'anno correnti formattati per l'header
  get titoloMese(): string {
    return this.currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }

  // Naviga l'utente verso la gestione del profilo
  goToProfile() {
    this.router.navigate(['/profilo']);
  }

  // Apre la modale dello storico completo delle transazioni
  openHistory() {
    this.isHistoryOpen = true;
    if (this.transazioniTotali) {
      this.ordinaTransazioni(this.transazioniTotali);
    }
  }

  // Chiude la modale dello storico
  closeHistory() {
    this.isHistoryOpen = false;
  }

  // Apre la modale per l'inserimento di una nuova transazione
  openModal() {
    this.isModalOpen = true;
  }

  // Chiude la modale di inserimento transazione
  closeModal() {
    this.isModalOpen = false;
  }

  // Aggiorna la dashboard dopo il salvataggio di un nuovo movimento
  handleTransactionSaved() {
    this.isModalOpen = false;
    this.caricaDati();
  }

  // Recupera dal server la percentuale di completamento del profilo utente
  checkProfileStatus() {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.userService.getProfileStatus(userId).subscribe({
        next: (data) => this.profilePercentage = data.completionPercentage
      });
    }
  }

  // Sposta la visualizzazione della dashboard al mese precedente o successivo
  cambiaMese(delta: number) {
    const oggi = new Date();
    const testDate = new Date(this.currentDate);

    if (delta > 0) {
      if (testDate.getFullYear() === oggi.getFullYear() &&
        testDate.getMonth() >= oggi.getMonth()) {
        return;
      }
    }
    testDate.setMonth(testDate.getMonth() + delta);
    this.currentDate = testDate;
    this.filtraDatiLocali();
  }

  // Identifica il wallet principale e ne scarica tutte le transazioni associate
  caricaDati() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    this.transazioniTotali = [];
    this.recentTransactions = [];

    this.walletService.getUserWallets(userId).subscribe({
      next: (wallets) => {
        if (!wallets || wallets.length === 0) return;

        const personalWallet = wallets.find(w => w.personal === true);
        const mainWalletId = personalWallet ? personalWallet.id : wallets[0].id;

        this.transactionService.getTransactionsByWallet(mainWalletId).subscribe({
          next: (allTransactions) => {
            this.transazioniTotali = this.ordinaTransazioni(allTransactions);
            this.calcolaSaldoTotaleAssoluto();
            this.recentTransactions = this.transazioniTotali.slice(0, 5);
            this.filtraDatiLocali();
            this.cd.detectChanges();
          },
          error: (err) => console.error("Errore transazioni:", err)
        });
      }
    });
  }

  // Ordina una lista di transazioni in ordine cronologico decrescente
  ordinaTransazioni(lista: any[]) {
    return lista.sort((a: any, b: any) => {
      const dataA = new Date(a.date).getTime();
      const dataB = new Date(b.date).getTime();
      if (dataB !== dataA) return dataB - dataA;
      return (b.id || 0) - (a.id || 0);
    });
  }

  // Calcola il saldo netto complessivo sommando entrate e sottraendo uscite
  calcolaSaldoTotaleAssoluto() {
    let tot = 0;
    this.transazioniTotali.forEach((t: any) => {
      if (t.type === 'ENTRATA') tot += Number(t.amount);
      if (t.type === 'USCITA') tot -= Number(t.amount);
    });
    this.saldoTotaleReale = tot;
  }

  // Isola le transazioni appartenenti al mese e all'anno attualmente selezionati
  filtraDatiLocali() {
    if (!this.transazioniTotali) return;
    const meseTarget = this.currentDate.getMonth();
    const annoTarget = this.currentDate.getFullYear();

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

    this.datiMensili = {
      transactions: filtered,
      totaleEntrate: entrateMese,
      totaleUscite: usciteMese,
      saldo: entrateMese - usciteMese
    };
    this.cd.detectChanges();
  }

  // Associa un'icona emoji specifica ad ogni categoria di spesa o entrata
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
