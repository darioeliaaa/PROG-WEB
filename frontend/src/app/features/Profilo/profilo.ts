import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { finalize } from 'rxjs/operators'; // <--- FONDAMENTALE per gestire la fine dei caricamenti

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profilo.html',
  styleUrls: ['./profilo.css']
})
export class Profilo implements OnInit {

  // ID dell'utente loggato, recuperato dal servizio di sessione
  userId: number | null = null;

  // Stati dell'interfaccia per gestire i caricamenti e disabilitare i pulsanti
  isLoadingData = true; // Attivo durante il primo recupero dati dal server
  isSaving = false;     // Attivo durante l'invio delle modifiche (mostra spinner/disabilita bottoni)

  // Gestione dei messaggi di feedback per l'utente (successo o errore)
  message: string = '';
  isError: boolean = false;

  /**
   * Modello dati del profilo utente.
   * I nomi dei campi devono corrispondere esattamente a quelli attesi dal backend Java.
   */
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
    private cd: ChangeDetectorRef // Utilizzato per forzare il refresh della UI in operazioni asincrone
  ) {}

  /**
   * All'avvio del componente, recupera l'ID dell'utente loggato.
   * Se presente, avvia il caricamento dei dati dal server.
   */
  ngOnInit(): void {
    this.userId = this.userService.getCurrentUserId();
    if (this.userId) {
      this.loadUserData();
    } else {
      this.isLoadingData = false;
    }
  }

  /**
   * Scarica i dati del profilo dal backend.
   * Utilizza l'operatore 'finalize' per spegnere lo stato di caricamento indipendentemente dall'esito.
   */
  // In profilo.ts

  loadUserData() {
    if (!this.userId) return;

    this.userService.getUserProfile(this.userId)
      .pipe(finalize(() => {
        this.isLoadingData = false;
        this.cd.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          // Ora i dati arriveranno popolati correttamente dal Proxy!
          this.userData = data;

          // Mantieni solo il fix per la data
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

  /**
   * Gestisce l'invio del modulo (form).
   * Include controlli per prevenire invii multipli accidentali.
   */
  onSubmit() {
    if (!this.userId || this.isSaving) return;

    this.isSaving = true; // Attiva lo stato di salvataggio (spinner sul bottone)
    this.message = '';    // Pulisce eventuali messaggi di errore precedenti
    this.cd.detectChanges();

    this.userService.updateProfile(this.userId, this.userData)
      .pipe(
        // finalize assicura che il bottone venga riabilitato anche in caso di errore
        finalize(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.showFeedback('Profilo aggiornato con successo!', false);
          // Naviga verso la dashboard dopo un breve lasso di tempo per permettere la lettura del messaggio
          setTimeout(() => this.router.navigate(['/dashboard']), 1500);
        },
        error: (err) => {
          console.error('Errore salvataggio:', err);
          this.showFeedback('Errore durante il salvataggio. Riprova.', true);
        }
      });
  }

  /**
   * Helper centralizzato per gestire la comparsa dei messaggi a video.
   * @param msg Il testo del messaggio
   * @param isErr Booleano per determinare la classe CSS (successo o errore)
   */
  showFeedback(msg: string, isErr: boolean) {
    this.message = msg;
    this.isError = isErr;
    this.cd.detectChanges();
  }

  /**
   * Genera le iniziali del nome e cognome per l'avatar circolare.
   * Es. "Mario Rossi" -> "MR"
   */
  getInitials(): string {
    const n = this.userData.nome ? this.userData.nome.charAt(0) : '';
    const c = this.userData.cognome ? this.userData.cognome.charAt(0) : '';
    return (n + c).toUpperCase() || 'U';
  }

  /**
   * Ritorna alla dashboard principale tramite navigazione programmatica.
   */
  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
