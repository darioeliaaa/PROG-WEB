import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service'; // <--- Importa il tuo service
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-movimenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimenti.html',
  styleUrl: './movimenti.css'
})
export class Movimenti {

  nuovoMovimento = {
    tipo: 'uscita',
    importo: null,
    descrizione: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0]
  };

  constructor(
    private router: Router,
    private transactionService: TransactionService,
    private userService: UserService // <--- Iniettalo qui
  ) {}

  salva() {
    if (!this.nuovoMovimento.importo || !this.nuovoMovimento.descrizione || !this.nuovoMovimento.categoria) {
      alert('Per favore compila tutti i campi obbligatori!');
      return;
    }

    // 1. CHIEDIAMO L'ID AL USER SERVICE
    const userId = this.userService.getCurrentUserId();

    // Se l'utente non è loggato (userId è null), lo blocchiamo
    if (!userId) {
      alert("Errore: Non risulti loggato. Effettua il login.");
      this.router.navigate(['/login']); // O dove hai la pagina di login
      return;
    }

    const movimentoDaSalvare: Transaction = {
      description: this.nuovoMovimento.descrizione,
      category: this.nuovoMovimento.categoria,
      amount: Number(this.nuovoMovimento.importo),
      date: this.nuovoMovimento.data,
      type: this.nuovoMovimento.tipo === 'entrata' ? 'ENTRATA' : 'USCITA'
    };

    console.log(`Salvataggio per User ID ${userId}:`, movimentoDaSalvare);

    // 2. USIAMO L'ID RECUPERATO
    this.transactionService.add(userId, movimentoDaSalvare).subscribe({
      next: (res) => {
        console.log("Salvato!", res);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error("Errore:", err);
        alert("Errore nel salvataggio.");
      }
    });
  }

  annulla() {
    this.router.navigate(['/']);
  }
}
