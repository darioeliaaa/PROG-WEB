import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  nuovoMovimento = {
    tipo: 'uscita',
    importo: null,
    descrizione: '',
    categoria: '',
    walletId: null as number | null, // Sarà impostato automaticamente
    data: new Date().toISOString().split('T')[0]
  };

  userWallets: any[] = [];

  constructor(
    private router: Router,
    private transactionService: TransactionService,
    private userService: UserService,
    private walletService: WalletService
  ) {}

  ngOnInit() {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.walletService.getUserWallets(userId).subscribe({
        next: (wallets) => {
          this.userWallets = wallets;

          if (this.userWallets.length > 0) {
            // LOGICA AUTOMATICA:
            // Cerca il wallet flaggato come "personal", altrimenti prendi il primo della lista
            const personalWallet = this.userWallets.find(w => w.personal === true);

            if (personalWallet) {
              this.nuovoMovimento.walletId = personalWallet.id;
            } else {
              this.nuovoMovimento.walletId = this.userWallets[0].id;
            }

            // console.log("Wallet automatico impostato ID:", this.nuovoMovimento.walletId);
          }
        },
        error: (err:any) => console.error("Errore caricamento wallet:", err)
      });
    }
  }

  salva() {
    // Rimosso controllo walletId manuale, tanto è automatico
    if (!this.nuovoMovimento.importo || !this.nuovoMovimento.descrizione || !this.nuovoMovimento.categoria) {
      alert('Per favore compila tutti i campi.');
      return;
    }

    // Sicurezza: se per qualche motivo il wallet non c'è (es. errore rete), blocca
    if (!this.nuovoMovimento.walletId) {
      alert("Errore: Nessun portafoglio trovato.");
      return;
    }

    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    const movimentoDaSalvare: Transaction = {
      description: this.nuovoMovimento.descrizione,
      category: this.nuovoMovimento.categoria,
      amount: Number(this.nuovoMovimento.importo),
      date: this.nuovoMovimento.data,
      type: this.nuovoMovimento.tipo === 'entrata' ? 'ENTRATA' : 'USCITA'
    };

    this.transactionService.add(userId, this.nuovoMovimento.walletId, movimentoDaSalvare).subscribe({
      next: (res) => {
        this.saved.emit();
        this.close.emit();
        this.nuovoMovimento.importo = null;
        this.nuovoMovimento.descrizione = '';
      },
      error: (err) => {
        console.error("Errore salvataggio:", err);
        alert("Errore salvataggio.");
      }
    });
  }

  annulla() {
    this.close.emit();
  }
}
