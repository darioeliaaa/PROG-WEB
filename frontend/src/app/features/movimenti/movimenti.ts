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
    tipo: 'uscita',
    importo: null,
    descrizione: '',
    categoria: '',
    walletId: null as number | null,
    data: new Date().toISOString().split('T')[0]
  };

  personalWalletId: number | null = null;
  isPersonalDashboard: boolean = false;

  // ✅ NUOVI CAMPI PER I LIMITI
  minLoadLimit: number = 0;   // Sarebbe il tuo 'monthly_budget'
  maxSpendLimit: number = 0;  // Sarebbe il tuo 'max_transfer_limit'

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private walletService: WalletService
  ) {}

  ngOnInit() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    // 1. Trova il Wallet Personale (per sapere se siamo nel contesto "Mio Portafoglio")
    this.walletService.getUserWallets(userId).subscribe(wallets => {
      const personal = wallets.find(w => w.personal === true);
      if (personal) this.personalWalletId = personal.id;

      // 2. Determina il contesto e SCARICA I LIMITI
      if (this.walletId) {
        // --- SIAMO IN UN WALLET CONDIVISO ---
        this.isPersonalDashboard = false;
        this.nuovoMovimento.walletId = this.walletId;

        // 🔥 CHIAMATA FONDAMENTALE: Scarichiamo i dettagli del wallet per leggere i limiti
        this.walletService.getWalletById(this.walletId).subscribe({
          next: (walletData: any) => {
            // Assegno i limiti (se sono null nel DB, metto 0 o un valore altissimo)
            this.minLoadLimit = walletData.monthlyBudget || 0;
            this.maxSpendLimit = walletData.maxTransferLimit || 999999;
          },
          error: (err) => console.error("Impossibile leggere i limiti del wallet", err)
        });

      } else {
        // --- SIAMO NEL PORTAFOGLIO PERSONALE ---
        this.isPersonalDashboard = true;
        this.nuovoMovimento.walletId = this.personalWalletId;
        // Nel portafoglio personale di solito non ci sono limiti, ma puoi impostarli se vuoi
      }
    });
  }

  salva() {
    if (!this.nuovoMovimento.importo || !this.nuovoMovimento.categoria) {
      alert('Compila importo e categoria.');
      return;
    }

    const userId = this.userService.getCurrentUserId();
    if (!userId || !this.nuovoMovimento.walletId || !this.personalWalletId) {
      alert("Errore dati. Riprova.");
      return;
    }

    const importo = Number(this.nuovoMovimento.importo);

    // =========================================================
    // 🛑 CONTROLLI LIMITI (Solo per Wallet Condivisi)
    // =========================================================
    if (!this.isPersonalDashboard) {

      // 1. CONTROLLO RICARICA MINIMA (Entrata)
      // "monthly_budget rappresenta la somma minima che un utente deve caricare"
      if (this.nuovoMovimento.tipo === 'entrata' && this.minLoadLimit > 0) {
        if (importo < this.minLoadLimit) {
          alert(`⚠️ Importo troppo basso!\n\nIn questo wallet la ricarica minima è di ${this.minLoadLimit} €.`);
          return; // Blocca tutto
        }
      }

      // 2. CONTROLLO PRELIEVO MASSIMO (Uscita/Spesa)
      // "max_transfer_limit rappresenta la somma massima che un utente può prelevare"
      if (this.nuovoMovimento.tipo === 'uscita' && this.maxSpendLimit > 0) {
        if (importo > this.maxSpendLimit) {
          alert(`⚠️ Importo troppo alto!\n\nIl limite massimo di spesa per singola operazione è ${this.maxSpendLimit} €.`);
          return; // Blocca tutto
        }
      }
    }

    // =========================================================
    // LOGICA DI SALVATAGGIO (Resta invariata)
    // =========================================================

    if (this.isPersonalDashboard) {
      const tipoReale = (this.nuovoMovimento.tipo === 'entrata') ? 'ENTRATA' : 'USCITA';
      this.salvaTransazioneDB(tipoReale);
    }
    else {
      // Wallet Condiviso
      if (this.nuovoMovimento.tipo === 'entrata') {
        // Entrata = Trasferimento DA Personale A Qui
        this.walletService.transferMoney(userId, this.personalWalletId, this.nuovoMovimento.walletId, importo)
          .subscribe({
            next: () => this.concludi(),
            error: () => alert("Saldo insufficiente nel tuo Portafoglio Personale!")
          });
      }
      else {
        // Uscita = Spesa normale
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
        next: () => this.concludi(),
        error: (err) => console.error(err)
      });
  }

  concludi() {
    this.saved.emit();
    this.close.emit();
    this.nuovoMovimento.importo = null;
    this.nuovoMovimento.descrizione = '';
    this.nuovoMovimento.categoria = '';
    this.nuovoMovimento.tipo = 'uscita';
  }

  annulla() {
    this.close.emit();
  }
}
