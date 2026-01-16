import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from './settings.service';
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

  userId: number = 0;
  isSaving: boolean = false;

  // Gestione Messaggio
  message: string = '';
  isError: boolean = false;

  // Variabili Token
  recoveryToken: string = '';
  isTokenVisible: boolean = false;
  isLoadingToken: boolean = false;

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
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    const idLoggato = this.userService.getCurrentUserId();
    if (idLoggato) {
      this.userId = idLoggato;
      this.loadRemoteSettings();
    } else {
      this.router.navigate(['/login']);
    }
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  loadRemoteSettings(): void {
    this.settingsService.getSettings(this.userId).subscribe({
      next: (data) => {
        this.zone.run(() => {
          if (data) {
            this.systemSettings = { ...data };
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error(err)
    });
  }

  toggleToken() {
    if (this.isTokenVisible) {
      this.isTokenVisible = false;
      return;
    }
    this.isLoadingToken = true;
    this.userService.getUserDetails(this.userId).subscribe({
      next: (user: any) => {
        this.zone.run(() => {
          this.recoveryToken = user.resetToken;
          this.isTokenVisible = true;
          this.isLoadingToken = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => { this.isLoadingToken = false; this.cdr.detectChanges(); });
      }
    });
  }

  saveSettings(): void {
    this.isSaving = true;
    this.message = ''; //

    this.settingsService.updateSettings(this.userId, this.systemSettings).subscribe({
      next: () => this.handleResponse(false, "Impostazioni aggiornate"),
      error: (err) => {
        // Se il backend risponde 200 ma Angular lo vede come errore (problema JSON)
        if (err.status === 200) {
          this.handleResponse(false, "Impostazioni aggiornate");
        } else {
          this.handleResponse(true, "Errore durante il salvataggio");
        }
      }
    });
  }

  private handleResponse(error: boolean, text: string) {
    this.zone.run(() => {
      this.isSaving = false;
      this.isError = error;
      this.message = text;

      if (!error) {
        this.userService.updateLocalSettings(this.systemSettings);
      }

      this.cdr.detectChanges();

      // Nascondi il messaggio dopo 3 secondi proprio come un vero feedback
      setTimeout(() => {
        this.zone.run(() => {
          this.message = '';
          this.cdr.detectChanges();
        });
      }, 3000);
    });
  }
}
