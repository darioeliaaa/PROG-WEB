import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  // True = Mostra Login, False = Mostra Registrazione
  isLoginMode: boolean = true;

  // Oggetti per i dati dei form
  loginObj: any = { email: '', password: '' };
  registerObj: any = { username: '', email: '', password: '' };

  // Flag per gli errori specifici (per i bordi rossi)
  fieldErrors: { username: boolean, email: boolean } = { username: false, email: false };

  // Messaggi di stato
  registerMessage: string = ''; // Messaggi verdi (successo) o generici
  suggestedUsernames: string[] = []; // Array per i suggerimenti

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  // Cambio tra Login e Register
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.resetErrors();
  }

  // Pulisce tutti gli stati di errore e i messaggi
  resetErrors() {
    this.registerMessage = '';
    this.fieldErrors = { username: false, email: false };
    this.suggestedUsernames = [];
  }

  // --- LOGICA LOGIN ---
  onLogin() {
    this.resetErrors();
    console.log("1. Pulsante Login cliccato");

    this.http.post('http://localhost:8080/api/users/login', this.loginObj).subscribe({
      next: (res: any) => {
        console.log("2. Risposta ricevuta dal server:", res);

        if (res && res.id) {
          // SALVATAGGIO IMMEDIATO
          const userData = JSON.stringify({ id: res.id, email: res.email });
          localStorage.setItem('user', userData);

          console.log("3. LocalStorage aggiornato con:", localStorage.getItem('user'));

          // Aggiorniamo il servizio e navighiamo
          this.userService.login(res.id, res.email);

          // Piccola pausa per essere sicuri che il browser scriva sul disco
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 100);
        } else {
          console.error("Errore: Il server non ha inviato l'ID");
          alert('Errore interno: dati utente non validi.');
        }
      },
      error: (err) => {
        console.error("Errore chiamata HTTP:", err);
        alert('Email o password non corretti.');
      }
    });
  }

  // --- LOGICA REGISTRAZIONE INTELLIGENTE ---
  onRegister() {
    this.resetErrors();

    // Validazione base
    if (!this.registerObj.username || !this.registerObj.email || !this.registerObj.password) {
      this.registerMessage = 'Compila tutti i campi.';
      return;
    }

    const userToSend = {
      username: this.registerObj.username,
      email: this.registerObj.email,
      password: this.registerObj.password,
    };

    this.http.post('http://localhost:8080/api/users/register', userToSend).subscribe({
      next: (res: any) => {
        // SUCCESSO
        this.registerMessage = 'Account creato! Login automatico...';
        this.cdr.detectChanges();

        // Magic UX: Copia SOLO l'email nel login (Sicurezza: password vuota)
        this.loginObj.email = this.registerObj.email;
        this.loginObj.password = ''; // Resettiamo la password per sicurezza

        // Attendi 1.5s e vai al login
        setTimeout(() => {
          this.isLoginMode = true;
          this.registerMessage = '';
          // Pulisci il form di registrazione
          this.registerObj = { username: '', email: '', password: '' };
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err) => {
        console.error("Errore Backend:", err);

        // --- ANALISI INTELLIGENTE DELL'ERRORE ---
        let errorBody = '';
        if (err.error && typeof err.error === 'string') errorBody = err.error.toLowerCase();
        else if (err.error && err.error.message) errorBody = err.error.message.toLowerCase();
        else if (err.error && err.error.field) errorBody = err.error.field.toLowerCase(); // Se usi il controller Java nuovo
        else if (err.message) errorBody = err.message.toLowerCase();

        // 1. CASO: USERNAME GIA' PRESO
        if (errorBody.includes('username') || errorBody.includes('uk') || err.status === 409) {
          this.fieldErrors.username = true;
          this.generateUsernameSuggestions(this.registerObj.username);
        }

        // 2. CASO: EMAIL GIA' PRESA
        if (errorBody.includes('email')) {
          this.fieldErrors.email = true;
          this.fieldErrors.username = false;
        }

        // 3. FALLBACK
        if (!this.fieldErrors.username && !this.fieldErrors.email) {
          this.fieldErrors.username = true;
          this.generateUsernameSuggestions(this.registerObj.username);
          this.registerMessage = "Errore: dati non validi o già in uso.";
        }

        this.cdr.detectChanges();
      }
    });
  }

  // --- FUNZIONI DI SUPPORTO UX ---

  generateUsernameSuggestions(base: string) {
    if(!base) base = "User";
    const random = Math.floor(Math.random() * 1000);
    const year = new Date().getFullYear();

    this.suggestedUsernames = [
      `${base}_${random}`,
      `${base}.official`,
      `${base}${year}`
    ];
  }

  selectSuggestion(suggestion: string) {
    this.registerObj.username = suggestion;
    this.fieldErrors.username = false;
    this.suggestedUsernames = [];
    this.registerMessage = '';
  }

  // Clic su "Vuoi accedere invece?": va al login con SOLO email
  goToLoginWithEmail() {
    this.loginObj.email = this.registerObj.email;
    this.loginObj.password = ''; // Assicuro che la password sia vuota
    this.isLoginMode = true;
    this.resetErrors();
  }

  tornaIndietro() {
    this.router.navigate(['/dashboard']);
  }
}
