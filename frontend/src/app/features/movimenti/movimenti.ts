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
    // Validazione base
    if (!this.nuovoMovimento.importo || !this.nuovoMovimento.descrizione || !this.nuovoMovimento.categoria) {
      alert('Per favore compila tutti i campi obbligatori!');
      return;
    }

    // TRUCCO: Siccome il DB non ha la colonna "categoria", la aggiungiamo alla descrizione
    // Esempio risultato: "[Casa] Bolletta Luce"
    const descrizioneCompleta = this.nuovoMovimento.descrizione;
    const categoria = this.nuovoMovimento.categoria;
    // 1. TRADUZIONE: Mappiamo i dati dal Form (Italiano) al Backend (Inglese)
    const movimentoDaSalvare: Transaction = {
      description: descrizioneCompleta,
      category: categoria,
      amount: Number(this.nuovoMovimento.importo),
      date: this.nuovoMovimento.data,
      // Convertiamo 'entrata'/'uscita' in 'INCOME'/'EXPENSE'
      type: this.nuovoMovimento.tipo === 'entrata' ? 'ENTRATA' : 'USCITA'
    };

    console.log('Sto inviando al server:', movimentoDaSalvare);

    // 2. INVIO AL BACKEND
    // Nota: userId è fisso a 1 per ora
    this.service.add(1, movimentoDaSalvare).subscribe({
      next: (res) => {
        console.log("Salvato con successo!", res);
        this.router.navigate(['/']); // Torna alla dashboard
      },
      error: (err) => {
        console.error("Errore nel salvataggio:", err);
        alert("Errore nel salvataggio dei dati. Il backend è acceso?");
      }
    });
  }

  annulla() {
    this.router.navigate(['/']);
  }
}
