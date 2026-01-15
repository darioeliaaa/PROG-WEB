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

  userId: number = 6;

  // ✅ AGGIUNTO: Questa variabile serve per gestire lo spinner nel pulsante
  isSaving: boolean = false;

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
    private router: Router
  ) {}

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

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  loadRemoteSettings(): void {
    this.settingsService.getSettings(this.userId).subscribe({
      next: (data) => {
        this.systemSettings.language = data.language;
        this.systemSettings.currency = data.currency;
        this.systemSettings.privacyMode = data.privacyMode;
        this.systemSettings.budgetAlerts = data.budgetAlerts;

        this.cdr.detectChanges();
      },
      error: (err) => console.error("Errore nel recupero impostazioni:", err)
    });
  }

  saveSettings(): void {
    // ✅ 1. Attiviamo lo spinner
    this.isSaving = true;

    console.log("Invio questi dati al server:", this.systemSettings);

    this.settingsService.updateSettings(this.userId, this.systemSettings).subscribe({
      next: (res) => {
        // ✅ 2. Spegniamo lo spinner (Successo)
        this.isSaving = false;
        this.userService.updateLocalSettings(this.systemSettings);
        alert("Impostazioni salvate con successo!");
      },
      error: (err) => {
        // ✅ 3. Spegniamo lo spinner (Errore)
        this.isSaving = false;
        console.error("Errore nel salvataggio:", err);
        alert("Errore durante il salvataggio.");
      }
    });
  }
}
