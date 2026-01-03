import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-movimenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimenti.html',
  styleUrl: './movimenti.css'
})
export class Movimenti {

  nuovoMovimento: any = {
    tipo: 'uscita',
    importo: null,
    descrizione: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0]
  };

  constructor(
    private router: Router,
    private service: TransactionService
  ) {}

  salva() {

    if (!this.nuovoMovimento.importo || !this.nuovoMovimento.descrizione || !this.nuovoMovimento.categoria) {
      alert('Per favore compila tutti i campi obbligatori!');
      return;
    }


    const movimentoDaSalvare = {
      ...this.nuovoMovimento,
      importo: Number(this.nuovoMovimento.importo)
    };

    console.log('Sto salvando:', movimentoDaSalvare);

    this.service.add(movimentoDaSalvare);

    this.router.navigate(['/']);
  }

  annulla() {
    this.router.navigate(['/']);
  }
}
