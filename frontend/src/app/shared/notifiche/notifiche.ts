import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessario per usare direttive come *ngIf e *ngFor nel template
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-notifiche',
  // Specifica che il componente è standalone (non richiede un NgModule esterno)
  standalone: true,
  // Moduli necessari per il funzionamento del template HTML (gestione rotte e direttive comuni)
  imports: [CommonModule, RouterModule],
  templateUrl: './notifiche.html',
  styleUrl: './notifiche.css'
})
export class NotifichePage {

  /**
   * Array che conterrà gli oggetti notifica (es. inviti a wallet, avvisi di spesa).
   * Al momento è inizializzato vuoto; tipicamente verrà popolato da un servizio nel metodo ngOnInit.
   */
  listaNotifiche: any[] = [];

  // Iniezione del servizio Router per permettere lo spostamento tra le pagine via codice
  constructor(private router: Router) {}

  /**
   * Metodo per tornare alla Dashboard.
   * Viene solitamente collegato a un pulsante "Indietro" o alla chiusura della pagina notifiche.
   */
  backToDashboard() {
    // Navigazione programmatica verso la rotta configurata come 'dashboard'
    this.router.navigate(['/dashboard']);
  }
}
