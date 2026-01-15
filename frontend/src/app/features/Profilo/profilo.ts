import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { finalize } from 'rxjs/operators'; // <--- FONDAMENTALE

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profilo.html',
  styleUrls: ['./profilo.css']
})
export class Profilo implements OnInit {

  userId: number | null = null;

  // Stati dell'interfaccia
  isLoadingData = true; // Caricamento iniziale
  isSaving = false;     // Salvataggio in corso

  // Messaggistica
  message: string = '';
  isError: boolean = false;

  userData: any = {
    nome: '',
    cognome: '',
    sesso: '',
    dataDiNascita: '',
    telefono: '',
    indirizzo: ''
  };

  constructor(
    private userService: UserService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = this.userService.getCurrentUserId();
    if (this.userId) {
      this.loadUserData();
    } else {
      this.isLoadingData = false;
    }
  }

  // Scarica i dati all'avvio
  loadUserData() {
    if (!this.userId) return;

    this.userService.getUserProfile(this.userId)
      .pipe(finalize(() => {
        this.isLoadingData = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.userData = data;

          // FIX DATA: Java manda "yyyy-MM-ddTHH:mm:ss", HTML vuole solo "yyyy-MM-dd"
          if (this.userData.dataDiNascita && this.userData.dataDiNascita.includes('T')) {
            this.userData.dataDiNascita = this.userData.dataDiNascita.split('T')[0];
          }
        },
        error: (err) => {
          console.error('Errore caricamento profilo:', err);
          this.showFeedback('Errore nel caricamento dei dati.', true);
        }
      });
  }

  // Salva le modifiche
  onSubmit() {
    if (!this.userId || this.isSaving) return;

    this.isSaving = true;
    this.message = ''; // Resetta messaggi precedenti
    this.cd.detectChanges(); // Blocca visivamente il bottone

    this.userService.updateProfile(this.userId, this.userData)
      .pipe(
        // Questo blocco viene eseguito SEMPRE, sia successo che errore
        finalize(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.showFeedback('Profilo aggiornato con successo!', false);
          // Redirect dopo 1.5 secondi
          setTimeout(() => this.router.navigate(['/dashboard']), 1500);
        },
        error: (err) => {
          console.error('Errore salvataggio:', err);
          this.showFeedback('Errore durante il salvataggio. Riprova.', true);
        }
      });
  }

  // Helper per mostrare messaggi
  showFeedback(msg: string, isErr: boolean) {
    this.message = msg;
    this.isError = isErr;
    this.cd.detectChanges();
  }

  // Helper per le iniziali dell'avatar (Es. Mario Rossi -> MR)
  getInitials(): string {
    const n = this.userData.nome ? this.userData.nome.charAt(0) : '';
    const c = this.userData.cognome ? this.userData.cognome.charAt(0) : '';
    return (n + c).toUpperCase() || 'U';
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
