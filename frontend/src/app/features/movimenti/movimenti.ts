import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// IMPORTS DEI SERVICES
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { WalletService } from '../../services/wallet.service'; // <--- FONDAMENTALE

import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-movimenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimenti.html',
  styleUrl: './movimenti.css'
})
export class Movimenti implements OnInit {

  // Oggetto legato al form HTML
  nuovoMovimento = {
    tipo: 'uscita',
    importo: null,
    descrizione: '',
    categoria: '',
    walletId: null as number | null, // <--- Qui verrà salvato l'ID selezionato
    data: new Date().toISOString().split('T')[0]
  };

  // Lista dove caricheremo i portafogli dal backend
  userWallets: any[] = [];

  constructor(
    private router: Router,
    private transactionService: TransactionService,
    private userService: UserService,
    private walletService: WalletService // <--- Iniettiamo il service
  ) {}

  ngOnInit() {
    const userId = this.userService.getCurrentUserId();
    console.log("ID Utente trovato:", userId); // <--- CONTROLLO 1

    if (userId) {
      this.walletService.getUserWallets(userId).subscribe({
        next: (wallets) => {
          console.log("RISPOSTA DAL BACKEND:", wallets); // <--- CONTROLLO 2: Cosa arriva qui?
          this.userWallets = wallets;

          if (this.userWallets.length > 0) {
            this.nuovoMovimento.walletId = this.userWallets[0].id;
            console.log("Wallet selezionato ID:", this.nuovoMovimento.walletId);
          } else {
            console.warn("Array wallet vuoto! L'utente non ha portafogli collegati nel DB.");
          }
        },
        error: (err:any) => console.error("ERRORE CHIAMATA:", err) // <--- CONTROLLO 3: È rosso?
      });
    }
  }

  salva() {
    // Controllo validazione: il walletId è obbligatorio ora!
    if (!this.nuovoMovimento.importo ||
      !this.nuovoMovimento.descrizione ||
      !this.nuovoMovimento.categoria ||
      !this.nuovoMovimento.walletId) {
      alert('Per favore compila tutti i campi, incluso il Portafoglio!');
      return;
    }

    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    // Prepariamo l'oggetto Transaction (Il backend si aspetta i nomi in inglese)
    const movimentoDaSalvare: Transaction = {
      description: this.nuovoMovimento.descrizione,
      category: this.nuovoMovimento.categoria,
      amount: Number(this.nuovoMovimento.importo),
      date: this.nuovoMovimento.data,
      type: this.nuovoMovimento.tipo === 'entrata' ? 'ENTRATA' : 'USCITA'
    };

    console.log(`Salvataggio su Wallet ID: ${this.nuovoMovimento.walletId}`);

    // CHIAMATA AL BACKEND
    // Passiamo userId, walletId e l'oggetto transazione
    this.transactionService.add(userId, this.nuovoMovimento.walletId, movimentoDaSalvare).subscribe({
      next: (res) => {
        console.log("Transazione salvata!", res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error("Errore salvataggio:", err);
        alert("Errore durante il salvataggio. Controlla che il backend sia attivo.");
      }
    });
  }

  annulla() {
    this.router.navigate(['/dashboard']);
  }
}
