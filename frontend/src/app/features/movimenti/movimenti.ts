import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-movimenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimenti.html',
  styleUrl: './movimenti.css'
})
export class Movimenti {

  // Manteniamo l'oggetto del form in ITALIANO per compatibilità con il tuo HTML
  nuovoMovimento = {
    tipo: 'uscita',      // 'entrata' o 'uscita'
    importo: null,
    descrizione: '',
    categoria: '',       // <--- Aggiunto questo campo che mancava!
    data: new Date().toISOString().split('T')[0]
  };

  constructor(
    private router: Router,
    private service: TransactionService
  ) {}

  salva() {
    // 1. Validazione
    if (!this.nuovoMovimento.importo || !this.nuovoMovimento.descrizione || !this.nuovoMovimento.categoria) {
      alert('Per favore compila tutti i campi obbligatori!');
      return;
    }

    // 2. Preparazione dati
    const movimentoDaSalvare: Transaction = {
      description: this.nuovoMovimento.descrizione,
      category: this.nuovoMovimento.categoria,
      amount: Number(this.nuovoMovimento.importo),
      date: this.nuovoMovimento.data,
      type: this.nuovoMovimento.tipo === 'entrata' ? 'ENTRATA' : 'USCITA'
    };

    // 3. RECUPERO DELL'ID UTENTE (La parte magica ✨)
    const userString = localStorage.getItem('user');

    if (!userString) {
      alert("Errore: Non sembri essere loggato!");
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userString);
    const userId = user.id; // Qui prende 2, 3, o quello che è!

    console.log(`Sto salvando per l'utente ID: ${userId}`, movimentoDaSalvare);

    // 4. INVIO AL BACKEND (Con l'ID giusto!)
    this.service.add(userId, movimentoDaSalvare).subscribe({
      next: (res) => {
        console.log("Salvato con successo!", res);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error("Errore nel salvataggio:", err);
        alert("Errore nel salvataggio. Controlla la console.");
      }
    });
  }

  annulla() {
    this.router.navigate(['/']);
  }
}
