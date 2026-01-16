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

  // ✅ NUOVO: Variabile per gestire lo stato di login
  isLoggedIn: boolean = false;

  currentDate: Date = new Date();
  profilePercentage: number = 0;
  userSettings: any = { currency: 'EUR', privacyMode: false };
  tassoCambio: number = 1.09; // 1 EUR = 1.09 USD (Valore attuale)

  // Modali
  isModalOpen: boolean = false;
  isHistoryOpen: boolean = false;

  // Dati (Inizializzati vuoti per l'utente non loggato)
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

  ngOnInit() {
    // 1. CONTROLLO IMMEDIATO DELLO STATO DI LOGIN
    this.isLoggedIn = this.userService.isLoggedIn();

    // 2. CARICA I DATI **SOLO** SE L'UTENTE È LOGGATO
    if (this.isLoggedIn) {

      this.caricaDati();
      this.checkProfileStatus();
      this.caricaImpostazioniUtente();

      // Sottoscrizione per aggiornamenti live delle impostazioni
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
    // SE NON È LOGGATO: Non facciamo nulla.
    // Le variabili restano vuote/zero e non partono chiamate API che darebbero errore.
  }

  // ✅ NUOVO: Metodo per il bottone "Accedi" dell'overlay
  goToLogin() {
    this.router.navigate(['/login']);
  }
  // Metodo per convertire i valori al volo
  converti(valore: number): number {
    if (this.userSettings?.currency === 'USD') {
      return valore * this.tassoCambio;
    }
    return valore;
  }

  caricaImpostazioniUtente() {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.userSettings = this.userService.getSettingsSync();
      this.userService.loadUserSettings(userId);
    }
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
      this.ordinaTransazioni(this.transazioniTotali);
    }
  }
  closeHistory() { this.isHistoryOpen = false; }

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }
  handleTransactionSaved() {
    this.isModalOpen = false;
    this.caricaDati();
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

  caricaDati() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    // Puliamo i dati vecchi per evitare che si vedano durante il caricamento
    this.transazioniTotali = [];
    this.recentTransactions = [];

    this.walletService.getUserWallets(userId).subscribe({
      next: (wallets) => {
        if (!wallets || wallets.length === 0) return;

        // --- FIX CRUCIALE ---
        // Cerchiamo il wallet che ha personal === true
        const personalWallet = wallets.find(w => w.personal === true);

        // Se lo troviamo usiamo quello, altrimenti per sicurezza prendiamo il primo
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

  // Helper per ordinare (Data + ID per spareggio)
  ordinaTransazioni(lista: any[]) {
    return lista.sort((a: any, b: any) => {
      const dataA = new Date(a.date).getTime();
      const dataB = new Date(b.date).getTime();
      if (dataB !== dataA) return dataB - dataA;
      return (b.id || 0) - (a.id || 0);
    });
  }

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
