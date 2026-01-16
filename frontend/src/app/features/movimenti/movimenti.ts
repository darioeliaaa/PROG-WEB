import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { WalletService } from '../../services/wallet.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-movimenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimenti.html',
  styleUrl: './movimenti.css'
})
export class Movimenti implements OnInit {

  @Input() walletId?: number;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  nuovoMovimento = {
    tipo: 'entrata',
    importo: null,
    descrizione: '',
    categoria: '',
    walletId: null as number | null,
    data: new Date().toISOString().split('T')[0]
  };

  personalWalletId: number | null = null;
  isPersonalDashboard: boolean = false;

  // Stati UI
  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Limiti & Saldo
  minLoadLimit: number = 0;
  maxSpendLimit: number = 0;
  currentBalance: number = 0;

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private walletService: WalletService
  ) {}

  ngOnInit() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    this.walletService.getUserWallets(userId).subscribe(wallets => {
      const personal = wallets.find(w => w.personal === true);
      if (personal) this.personalWalletId = personal.id;

      if (this.walletId) {
        this.isPersonalDashboard = false;
        this.nuovoMovimento.walletId = this.walletId;

        this.walletService.getWalletById(this.walletId).subscribe({
          next: (walletData: any) => {
            this.minLoadLimit = walletData.monthlyBudget || 0;
            this.maxSpendLimit = walletData.maxTransferLimit || 0;
          },
          error: (err) => console.error("Errore limiti wallet", err)
        });

      } else {
        this.isPersonalDashboard = true;
        this.nuovoMovimento.walletId = this.personalWalletId;
      }

      if (this.nuovoMovimento.walletId) {
        this.calcolaSaldoDisponibile(this.nuovoMovimento.walletId);
      }
    });
  }

  calcolaSaldoDisponibile(wId: number) {
    this.transactionService.getTransactionsByWallet(wId).subscribe({
      next: (txs) => {
        let entrate = 0;
        let uscite = 0;
        txs.forEach((t: any) => {
          if (t.type === 'ENTRATA') entrate += Number(t.amount);
          if (t.type === 'USCITA') uscite += Number(t.amount);
        });
        this.currentBalance = entrate - uscite;
      }
    });
  }

  salva() {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.nuovoMovimento.importo || !this.nuovoMovimento.categoria) {
      this.errorMessage = "Compila importo e categoria.";
      return;
    }

    const userId = this.userService.getCurrentUserId();
    if (!userId || !this.nuovoMovimento.walletId) {
      this.errorMessage = "Errore critico: Wallet non identificato.";
      return;
    }

    const importo = Number(this.nuovoMovimento.importo);

    // CONTROLLO SALDO NEGATIVO
    if (this.nuovoMovimento.tipo === 'uscita') {
      if (importo > this.currentBalance) {
        this.errorMessage = `Saldo insufficiente! Hai disponibile solo ${this.currentBalance.toFixed(2)} €`;
        return;
      }
    }

    // CONTROLLI LIMITI
    if (!this.isPersonalDashboard) {
      if (this.nuovoMovimento.tipo === 'entrata' && this.minLoadLimit > 0) {
        if (importo < this.minLoadLimit) {
          this.errorMessage = `Importo troppo basso! Minimo richiesto: ${this.minLoadLimit} €.`;
          return;
        }
      }

      if (this.nuovoMovimento.tipo === 'uscita' && this.maxSpendLimit > 0) {
        if (importo > this.maxSpendLimit) {
          this.errorMessage = `Superi il limite di prelievo singolo (${this.maxSpendLimit} €).`;
          return;
        }
      }
    }

    this.isLoading = true; // Blocca solo il click, non cambia il testo

    // LOGICA SALVATAGGIO
    if (this.isPersonalDashboard) {
      const tipoReale = (this.nuovoMovimento.tipo === 'entrata') ? 'ENTRATA' : 'USCITA';
      this.salvaTransazioneDB(tipoReale);
    }
    else {
      // Wallet Condiviso
      if (this.nuovoMovimento.tipo === 'entrata') {
        this.walletService.transferMoney(userId, this.personalWalletId!, this.nuovoMovimento.walletId, importo)
          .subscribe({
            next: () => this.handleSuccess(),
            error: () => {
              this.isLoading = false;
              this.errorMessage = "Non hai abbastanza soldi nel tuo Wallet Personale!";
            }
          });
      }
      else {
        this.salvaTransazioneDB('USCITA');
      }
    }
  }

  salvaTransazioneDB(tipo: 'ENTRATA' | 'USCITA') {
    const tx: Transaction = {
      description: this.nuovoMovimento.descrizione || (tipo === 'ENTRATA' ? 'Deposito' : 'Spesa'),
      category: this.nuovoMovimento.categoria,
      amount: Number(this.nuovoMovimento.importo),
      date: this.nuovoMovimento.data,
      type: tipo
    };

    this.transactionService.add(this.userService.getCurrentUserId()!, this.nuovoMovimento.walletId!, tx)
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.errorMessage = "Errore durante il salvataggio.";
        }
      });
  }

  handleSuccess() {
    this.isLoading = false;
    this.successMessage = "Fatto!";

    // Mostra il check verde e chiudi rapidamente
    setTimeout(() => {
      this.concludi();
    }, 500);
  }

  concludi() {
    this.saved.emit();
    this.close.emit();
    this.resetForm();
  }

  resetForm() {
    this.nuovoMovimento.importo = null;
    this.nuovoMovimento.descrizione = '';
    this.nuovoMovimento.categoria = '';
    this.nuovoMovimento.tipo = 'uscita';
    this.successMessage = null;
    this.errorMessage = null;
    this.currentBalance = 0;
  }

  annulla() {
    this.close.emit();
  }
}
