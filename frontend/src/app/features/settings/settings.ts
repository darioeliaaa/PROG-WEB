import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from './settings.service';
import { ChangeDetectorRef } from '@angular/core';
import {UserService} from '../../services/user.service';
import { Router } from '@angular/router';


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
    private userService: UserService,
    private router: Router) {}

  ngOnInit(): void {
    const idLoggato = this.userService.getCurrentUserId();

    if (idLoggato) {
      this.userId = idLoggato;
      this.loadRemoteSettings();
    } else {
      // Se non c'è l'ID, lo rimandiamo al login
      alert("Sessione scaduta o utente non trovato. Torna al login.");
      this.router.navigate(['/login']);
    }
  }
  backToDashboard() {
    this.router.navigate(['/dashboard']); // Controlla che il path sia corretto
  }

  loadRemoteSettings(): void {
    this.settingsService.getSettings(this.userId).subscribe({
      next: (data) => {
        // Assegnazione pulita
        this.systemSettings.language = data.language;
        this.systemSettings.currency = data.currency;
        this.systemSettings.privacyMode = data.privacyMode;
        this.systemSettings.budgetAlerts = data.budgetAlerts;

        // Forza il refresh della grafica
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Errore nel recupero impostazioni:", err)
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
