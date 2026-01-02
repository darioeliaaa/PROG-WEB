import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Serve per gli input
import { Router, RouterModule } from '@angular/router'; // Serve per navigare

@Component({
  selector: 'app-movimenti',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movimenti.html',
  styleUrl: './movimenti.css'
})
export class Movimenti {

  // I dati che l'utente sta inserendo
  nuovoMovimento = {
    tipo: 'uscita', // Di default è un'uscita
    descrizione: '',
    importo: null,
    data: new Date().toISOString().split('T')[0], // Mette la data di oggi in automatico
    categoria: ''
  };

  constructor(private router: Router) {}

  salva() {
    console.log('Sto salvando:', this.nuovoMovimento);
    // Qui in futuro metterai la chiamata al server/database

    // Dopo aver salvato, torna alla dashboard
    this.router.navigate(['/']);
  }

  annulla() {
    this.router.navigate(['/']); // Torna indietro senza salvare
  }
}
