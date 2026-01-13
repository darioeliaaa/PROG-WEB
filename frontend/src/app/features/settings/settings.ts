import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from './settings.service';
import { ChangeDetectorRef } from '@angular/core';
import {UserService} from '../../services/user.service';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {

  userId: number = 6; // Usiamo l'ID 6 che abbiamo verificato funzionare

  // Struttura dati pulita (senza darkmode)
  systemSettings = {
    language: 'it',
    currency: 'EUR',
    privacyMode: false,
    budgetAlerts: true
  };

  constructor(
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,) {}

  ngOnInit(): void {
    const idLoggato = this.userService.getCurrentUserId();

    if (idLoggato) {
      this.userId = idLoggato;
      console.log("Settings: ID recuperato correttamente:", this.userId);
      this.loadRemoteSettings(); // Carica solo se l'ID esiste
    } else {
      // Invece di usare il 6, diamo un errore o reindirizziamo al login
      console.error("ERRORE: Nessun utente loggato trovato nel sistema!");
      // Opzionale: alert("Devi effettuare il login per vedere questa pagina");
      // Opzionale: this.router.navigate(['/login']);
    }
  }

  loadRemoteSettings(): void {
    this.settingsService.getSettings(this.userId).subscribe({
      next: (data) => {
        console.log("Dati dal DB:", data);

        // Assegnazione forzata
        this.systemSettings.language = data.language;
        this.systemSettings.currency = data.currency;
        this.systemSettings.privacyMode = data.privacyMode;
        this.systemSettings.budgetAlerts = data.budgetAlerts;

        // 3. Forza Angular a rinfrescare i pulsanti sulla pagina
        this.cdr.detectChanges();

        console.log("Stato finale UI:", this.systemSettings.privacyMode);
      }
    });
  }

  saveSettings(): void {
    console.log("Invio questi dati al server:", this.systemSettings);
    this.settingsService.updateSettings(this.userId, this.systemSettings).subscribe({
      next: (res) => {
        alert("Impostazioni salvate con successo!");
      },
      error: (err) => {
        console.error("Errore nel salvataggio:", err);
        alert("Errore durante il salvataggio.");
      }
    });
  }
}
