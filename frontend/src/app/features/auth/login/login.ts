import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';

type ViewState = 'login' | 'register' | 'register-success' | 'forgot' | 'forgot-success';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  currentView: ViewState = 'login';
  loginObj: any = { email: '', password: '' };
  registerObj: any = { username: '', email: '', password: '' };
  forgotObj: any = { email: '', code: '', newPassword: '' };
  generatedRecoveryCode: string = '';
  fieldErrors: { username: boolean, email: boolean } = { username: false, email: false };
  registerMessage: string = '';
  suggestedUsernames: string[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  // Alterna la visualizzazione tra il form di login e quello di registrazione
  toggleMode() {
    this.currentView = this.currentView === 'login' ? 'register' : 'login';
    this.resetErrors();
  }

  // Attiva la vista per il recupero della password dimenticata
  showForgotPassword() {
    this.currentView = 'forgot';
    this.forgotObj = { email: '', code: '', newPassword: '' };
    this.resetErrors();
  }

  // Riporta l'utente alla schermata di login principale
  backToLogin() {
    this.currentView = 'login';
    this.resetErrors();
  }

  // Pulisce tutti i messaggi di errore e i suggerimenti attivi nei form
  resetErrors() {
    this.registerMessage = '';
    this.fieldErrors = { username: false, email: false };
    this.suggestedUsernames = [];
  }

  // Gestisce la chiamata API per l'autenticazione dell'utente
  onLogin() {
    this.http.post('http://localhost:8080/api/users/login', this.loginObj).subscribe({
      next: (res: any) => {
        if (res && res.id) {
          localStorage.setItem('user', JSON.stringify({ id: res.id, email: res.email }));
          this.userService.login(res.id, res.email);
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => alert('Email o password non corretti.')
    });
  }

  // Invia i dati di registrazione al server e gestisce la risposta o il token di reset
  onRegister() {
    this.resetErrors();

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
        if (res.resetToken) {
          this.generatedRecoveryCode = res.resetToken;
          this.currentView = 'register-success';
        } else {
          this.currentView = 'login';
        }
        this.cdr.detectChanges();
      },
      error: (err) => this.handleRegisterError(err)
    });
  }

  // Conclude la procedura di registrazione pulendo i dati temporanei e tornando al login
  finishRegistration() {
    this.generatedRecoveryCode = '';
    this.registerObj = { username: '', email: '', password: '' };
    this.loginObj.email = this.registerObj.email;
    this.currentView = 'login';
  }

  // Invia la richiesta di reset password utilizzando il codice di recupero fornito
  onResetPassword() {
    if (!this.forgotObj.email || !this.forgotObj.code || !this.forgotObj.newPassword) {
      alert("Compila tutti i campi.");
      return;
    }

    const body = {
      email: this.forgotObj.email,
      code: this.forgotObj.code,
      newPassword: this.forgotObj.newPassword
    };

    this.http.post('http://localhost:8080/api/users/reset-password', body).subscribe({
      next: (res: any) => {
        this.currentView = 'forgot-success';
        this.loginObj.email = this.forgotObj.email;
        this.loginObj.password = '';
      },
      error: (err) => {
        alert(err.error?.message || "Codice errato o email non valida.");
      }
    });
  }

  // Analizza l'errore di registrazione per evidenziare se il problema è lo username o l'email
  handleRegisterError(err: any) {
    let errorBody = '';
    if (err.error && typeof err.error === 'string') errorBody = err.error.toLowerCase();
    else if (err.error && err.error.message) errorBody = err.error.message.toLowerCase();

    if (errorBody.includes('username') || err.status === 409) {
      this.fieldErrors.username = true;
      this.generateUsernameSuggestions(this.registerObj.username);
    }
    if (errorBody.includes('email')) {
      this.fieldErrors.email = true;
    }
    this.cdr.detectChanges();
  }

  // Crea una lista di alternative disponibili se lo username scelto è già occupato
  generateUsernameSuggestions(base: string) {
    if(!base) base = "User";
    const random = Math.floor(Math.random() * 1000);
    this.suggestedUsernames = [`${base}_${random}`, `${base}.official`, `${base}${new Date().getFullYear()}`];
  }

  // Applica lo username suggerito selezionato al form di registrazione
  selectSuggestion(s: string) {
    this.registerObj.username = s;
    this.fieldErrors.username = false;
  }

  // Reindirizza al login mantenendo l'email inserita durante il tentativo di registrazione
  goToLoginWithEmail() {
    this.loginObj.email = this.registerObj.email;
    this.loginObj.password = '';
    this.currentView = 'login';
    this.resetErrors();
  }

  // Naviga l'utente verso la dashboard principale
  tornaIndietro() {
    this.router.navigate(['/dashboard']);
  }
}
