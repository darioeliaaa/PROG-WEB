import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Componenti Figli
import { InvestmentSummaryWallet } from './investment-summary-wallet/investment-summary-wallet';
import { BudgetOverviewWallet } from './budget-overview-wallet/budget-overview-wallet';
import { YearlyHistoryWallet } from './yearly-history-wallet/yearly-history-wallet';
import { Movimenti} from '../movimenti/movimenti';

// Services e Modelli
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { UserService } from '../../services/user.service';
import { Transaction } from '../../models/transaction.model';
import { Wallet } from '../../models/wallet.model';

@Component({
  selector: 'app-dashboard-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, InvestmentSummaryWallet, BudgetOverviewWallet, YearlyHistoryWallet, Movimenti],
  templateUrl: './dashboardWallet.html',
  styleUrl: './dashboardWallet.css'
})
export class DashboardWallet implements OnInit {

  walletId!: number;
  wallet?: Wallet;
  currentDate: Date = new Date();
  currentUserId: number | null = null;
  isAdmin: boolean = false;

  // Dati Grafici
  datiMensili: any = { transactions: [], totaleEntrate: 0, totaleUscite: 0, saldo: 0 };
  transazioniTotali: Transaction[] = [];
  recentTransactions: Transaction[] = [];
  saldoTotaleReale: number = 0;

  // Stati Modali
  isModalOpen: boolean = false;
  isHistoryOpen: boolean = false;
  isSettingsOpen: boolean = false;
  successMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private walletService: WalletService,
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const uId = this.userService.getCurrentUserId();
    this.currentUserId = uId ? uId : Number(localStorage.getItem('userId'));

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.walletId = +id;
        this.caricaDatiWallet();
      }
    });
  }

  caricaDatiWallet() {
    this.walletService.getWalletById(this.walletId).subscribe({
      next: (w) => {
        this.wallet = w;
        this.checkAdminStatus();
      },
      error: () => console.error("Wallet non trovato")
    });

    this.transactionService.getTransactionsByWallet(this.walletId).subscribe({
      next: (transactions) => {
        this.transazioniTotali = this.ordinaTransazioni(transactions);
        this.calcolaSaldoTotaleAssoluto();
        this.recentTransactions = this.transazioniTotali.slice(0, 5);
        this.filtraDatiLocali();
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  checkAdminStatus() {
    if (this.wallet && this.currentUserId) {
      const adminId = this.wallet.admin?.id || (this.wallet as any).adminId;
      this.isAdmin = (adminId == this.currentUserId);
      this.cd.detectChanges();
    }
  }

  // --- LOGICA GESTIONE WALLET (ADMIN) ---

  openSettings() { this.isSettingsOpen = true; this.successMessage = null; }
  closeSettings() { this.isSettingsOpen = false; this.successMessage = null; }

  showSuccess(msg: string) {
    this.successMessage = msg;
    this.cd.detectChanges();
  }

  saveSettings() {
    if (!this.isAdmin || !this.currentUserId || !this.wallet) return;

    this.walletService.updateWalletLimits(
      this.currentUserId,
      this.walletId,
      this.wallet.monthlyBudget || 0,
      this.wallet.maxTransferLimit || 0
    ).subscribe({
      next: () => {
        this.showSuccess("Impostazioni aggiornate!");
        setTimeout(() => {
          this.closeSettings();
          this.caricaDatiWallet();
        }, 1500);
      },
      error: (err) => alert("Errore salvataggio: " + err.message)
    });
  }

  promoteMember(memberId: number, memberName: string) {
    if (!confirm(`Sei sicuro di voler nominare ${memberName} come Amministratore?\n\nATTENZIONE: Perderai i privilegi di admin su questo wallet.`)) return;

    if (!this.currentUserId) return;

    this.walletService.transferOwnership(this.walletId, this.currentUserId, memberId).subscribe({
      next: () => {
        this.showSuccess(`👑 ${memberName} è ora Admin!`);
        setTimeout(() => {
          this.closeSettings();
          this.caricaDatiWallet();
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        alert("Errore durante il cambio admin: " + (err.error?.message || err.message));
      }
    });
  }

  removeMember(memberId: number) {
    if (!confirm("Vuoi davvero rimuovere questo utente dal wallet?")) return;
    if (!this.currentUserId) return;

    this.walletService.removeMember(this.walletId, this.currentUserId, memberId).subscribe({
      next: () => {
        if (this.wallet && this.wallet.members) {
          this.wallet.members = this.wallet.members.filter(m => m.id !== memberId);
        }
        this.cd.detectChanges();
      },
      error: (err) => alert("Errore durante la rimozione: " + err.message)
    });
  }

  deleteWallet() {
    if (!confirm("ATTENZIONE: Eliminazione irreversibile. Continuare?") || !this.currentUserId) return;

    this.walletService.deleteWallet(this.walletId, this.currentUserId).subscribe({
      next: () => {
        this.router.navigate(['/wallet']);
      },
      error: (err) => alert("Errore eliminazione: " + err.message)
    });
  }

  // --- CALCOLI E HELPERS ---
  calcolaSaldoTotaleAssoluto() {
    let tot = 0;
    this.transazioniTotali.forEach((t: any) => {
      const val = Number(t.amount);
      if (t.type === 'ENTRATA') tot += val;
      if (t.type === 'USCITA') tot -= val;
    });
    this.saldoTotaleReale = tot;
  }

  filtraDatiLocali() {
    if (!this.transazioniTotali) return;
    const mese = this.currentDate.getMonth();
    const anno = this.currentDate.getFullYear();
    const filtered = this.transazioniTotali.filter((t: any) => {
      const d = new Date(t.date);
      return d.getMonth() === mese && d.getFullYear() === anno;
    });
    let entrate = 0, uscite = 0;
    filtered.forEach((t: any) => {
      const val = Number(t.amount);
      if (t.type === 'ENTRATA') entrate += val;
      if (t.type === 'USCITA') uscite += val;
    });
    this.datiMensili = { transactions: filtered, totaleEntrate: entrate, totaleUscite: uscite, saldo: entrate - uscite };
  }

  cambiaMese(delta: number) {
    const nextDate = new Date(this.currentDate);
    const oggi = new Date();
    if (delta > 0 && nextDate.getFullYear() === oggi.getFullYear() && nextDate.getMonth() >= oggi.getMonth()) return;
    nextDate.setMonth(nextDate.getMonth() + delta);
    this.currentDate = nextDate;
    this.filtraDatiLocali();
  }

  ordinaTransazioni(lista: any[]) {
    return lista.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  get titoloMese(): string {
    return this.currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
  }

  getCategoryIcon(c: string): string {
    const cat = (c || '').toLowerCase();
    if (cat.includes('spesa')) return '🛒';
    if (cat.includes('casa')) return '🏠';
    if (cat.includes('auto')) return '🚗';
    if (cat.includes('svago')) return '🎉';
    return '📄';
  }

  goBack() { this.router.navigate(['/wallet']); }
  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }
  handleTransactionSaved() { this.closeModal(); this.caricaDatiWallet(); }
  openHistory() { this.isHistoryOpen = true; }
  closeHistory() { this.isHistoryOpen = false; }
}
