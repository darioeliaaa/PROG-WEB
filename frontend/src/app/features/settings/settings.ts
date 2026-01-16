import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from './settings.service';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {

  // ID dell'utente (inizializzato a 6, ma sovrascritto dal valore reale in ngOnInit)
  userId: number = 6;

  // Stato per gestire il feedback visivo (spinner) durante le chiamate asincrone al server
  isSaving: boolean = false;

  /**
   * Modello dati per le preferenze di sistema dell'utente.
   * Viene collegato al template HTML tramite il binding bi-direzionale (ngModel).
   */
  systemSettings = {
    language: 'it',
    currency: 'EUR',
    privacyMode: false,
    budgetAlerts: true
  };

  constructor(
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef, // Utile per forzare il refresh della UI se i dati arrivano fuori dal ciclo Angular
    private userService: UserService,
    private router: Router
  ) {}

  /**
   * All'inizializzazione del componente:
   * 1. Recupera l'ID dell'utente loggato dal servizio utente.
   * 2. Se l'utente è valido, carica le sue impostazioni dal database.
   * 3. Se non è loggato, reindirizza alla pagina di login.
   */
  ngOnInit(): void {
    const idLoggato = this.userService.getCurrentUserId();

    if (idLoggato) {
      this.userId = idLoggato;
      this.loadRemoteSettings();
    } else {
      alert("Sessione scaduta o utente non trovato. Torna al login.");
      this.router.navigate(['/login']);
    }
  }

  /**
   * Navigazione programmatica per tornare alla dashboard principale.
   */
  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Recupera le impostazioni correnti dal backend tramite il SettingsService.
   * Popola il modello systemSettings con i dati ricevuti.
   */
  loadRemoteSettings(): void {
    this.settingsService.getSettings(this.userId).subscribe({
      next: (data) => {
        this.systemSettings.language = data.language;
        this.systemSettings.currency = data.currency;
        this.systemSettings.privacyMode = data.privacyMode;
        this.systemSettings.budgetAlerts = data.budgetAlerts;

        // Notifica Angular che i dati sono stati aggiornati per rinfrescare il form
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Errore nel recupero impostazioni:", err)
    });
  }

  /**
   * Invia le modifiche effettuate dall'utente al server.
   * Gestisce lo stato isSaving per disabilitare i pulsanti e mostrare il caricamento.
   */
  saveSettings(): void {
    // Attiva lo spinner per indicare l'inizio della transazione
    this.isSaving = true;

    console.log("Invio questi dati al server:", this.systemSettings);

    this.settingsService.updateSettings(this.userId, this.systemSettings).subscribe({
      next: (res) => {
        // Operazione completata: spegne lo spinner
        this.isSaving = false;

        /**
         * Sincronizzazione: aggiorna il cache locale nel UserService.
         * Questo assicura che altre parti dell'app (es. Header) reagiscano subito al cambio impostazioni.
         */
        this.userService.updateLocalSettings(this.systemSettings);
        alert("Impostazioni salvate con successo!");
      },
      error: (err) => {
        // In caso di errore: spegne lo spinner e notifica l'utente
        this.isSaving = false;
        console.error("Errore nel salvataggio:", err);
        alert("Errore durante il salvataggio.");
      }
    });
  }
}
