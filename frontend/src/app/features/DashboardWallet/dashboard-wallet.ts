import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// --- IMPORTIAMO I COMPONENTI SPECIFICI WALLET ---
// Assicurati che i percorsi puntino ai file che mi hai appena mandato
import { InvestmentSummaryWallet } from './investment-summary-wallet/investment-summary-wallet';
import { BudgetOverviewWallet } from './budget-overview-wallet/budget-overview-wallet';
import { YearlyHistoryWallet } from './yearly-history-wallet/yearly-history-wallet';
import { Movimenti} from '../movimenti/movimenti'; // Questo rimane quello generico per l'input?

// Services e Modelli
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard-wallet',
  standalone: true,
  // Importiamo le classi definite nei tuoi file wallet
  imports: [CommonModule, InvestmentSummaryWallet, BudgetOverviewWallet, YearlyHistoryWallet, Movimenti],
  templateUrl: './dashboardWallet.html',
  styleUrl: './dashboardWallet.css'// Riusiamo il CSS base per il layout griglia
})
export class DashboardWallet implements OnInit {

  walletId!: number;
  walletName: string = 'Caricamento...';
  inviteCode: string = '';
  currentDate: Date = new Date();

  // Dati
  datiMensili: any = { transactions: [], totaleEntrate: 0, totaleUscite: 0, saldo: 0 };
  transazioniTotali: Transaction[] = []; // Per InvestmentSummary e YearlyHistory
  recentTransactions: Transaction[] = [];
  saldoTotaleReale: number = 0; // Per InvestmentSummary

  // Stati UI
  isModalOpen: boolean = false;
  isHistoryOpen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private walletService: WalletService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.walletId = +id;
        this.caricaDatiWallet();
      }
    });
  }

  caricaDatiWallet() {
    // 1. Info Wallet
    this.walletService.getWalletById(this.walletId).subscribe({
      next: (w) => {
        this.walletName = w.name;
        this.inviteCode = w.inviteCode;
      },
      error: () => this.walletName = "Wallet non trovato"
    });

    // 2. Transazioni Wallet
    this.transactionService.getTransactionsByWallet(this.walletId).subscribe({
      next: (transactions) => {
        this.transazioniTotali = this.ordinaTransazioni(transactions);

        // Calcoli per i componenti figli
        this.calcolaSaldoTotaleAssoluto();
        this.recentTransactions = this.transazioniTotali.slice(0, 5);
        this.filtraDatiLocali(); // Prepara dati mese corrente

        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // --- LOGICA DI CALCOLO (Identica alla dashboard principale) ---

  calcolaSaldoTotaleAssoluto() {
    let tot = 0;
    this.transazioniTotali.forEach((t: any) => {
      // Conversione sicura a number
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

    // Oggetto atteso da <app-budget-overview-wallet>
    this.datiMensili = {
      transactions: filtered,
      totaleEntrate: entrate,
      totaleUscite: uscite,
      saldo: entrate - uscite
    };
  }

  cambiaMese(delta: number) {
    const nextDate = new Date(this.currentDate);
    // Controllo futuro opzionale
    const oggi = new Date();
    if (delta > 0 && nextDate.getFullYear() === oggi.getFullYear() && nextDate.getMonth() >= oggi.getMonth()) return;

    nextDate.setMonth(nextDate.getMonth() + delta);
    this.currentDate = nextDate;
    this.filtraDatiLocali();
  }

  ordinaTransazioni(lista: any[]) {
    return lista.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // --- UI HELPERS ---
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

  // Modali
  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }
  handleTransactionSaved() { this.closeModal(); this.caricaDatiWallet(); }

  openHistory() { this.isHistoryOpen = true; }
  closeHistory() { this.isHistoryOpen = false; }
}

