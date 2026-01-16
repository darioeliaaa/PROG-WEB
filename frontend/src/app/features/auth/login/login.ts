import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';

// ✅ AGGIUNTO 'forgot-success'
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

  // Dati Form
  loginObj: any = { email: '', password: '' };
  registerObj: any = { username: '', email: '', password: '' };
  forgotObj: any = { email: '', code: '', newPassword: '' };

  generatedRecoveryCode: string = '';

  // Gestione Errori
  fieldErrors: { username: boolean, email: boolean } = { username: false, email: false };
  registerMessage: string = '';
  suggestedUsernames: string[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  // --- NAVIGAZIONE ---
  toggleMode() {
    this.currentView = this.currentView === 'login' ? 'register' : 'login';
    this.resetErrors();
  }

  showForgotPassword() {
    this.currentView = 'forgot';
    this.forgotObj = { email: '', code: '', newPassword: '' };
    this.resetErrors();
  }

  backToLogin() {
    this.currentView = 'login';
    this.resetErrors();
  }

  resetErrors() {
    this.registerMessage = '';
    this.fieldErrors = { username: false, email: false };
    this.suggestedUsernames = [];
  }

  // --- LOGIN ---
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

  // --- REGISTRAZIONE ---
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

  finishRegistration() {
    this.generatedRecoveryCode = '';
    this.registerObj = { username: '', email: '', password: '' };
    this.loginObj.email = this.registerObj.email;
    this.currentView = 'login';
  }

  // --- RESET PASSWORD (MODIFICATO) ---
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
        // ✅ NESSUN ALERT: Cambiamo vista e mostriamo il messaggio bello
        this.currentView = 'forgot-success';

        // Pre-compiliamo l'email nel login per comodità
        this.loginObj.email = this.forgotObj.email;
        this.loginObj.password = ''; // Reset password field
      },
      error: (err) => {
        // Qui lasciamo l'alert o un messaggio di errore rosso nel form (come preferisci)
        alert(err.error?.message || "Codice errato o email non valida.");
      }
    });
  }

  // --- HELPERS ---
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

  generateUsernameSuggestions(base: string) {
    if(!base) base = "User";
    const random = Math.floor(Math.random() * 1000);
    this.suggestedUsernames = [`${base}_${random}`, `${base}.official`, `${base}${new Date().getFullYear()}`];
  }

  selectSuggestion(s: string) {
    this.registerObj.username = s;
    this.fieldErrors.username = false;
  }

  goToLoginWithEmail() {
    this.loginObj.email = this.registerObj.email;
    this.loginObj.password = '';
    this.currentView = 'login';
    this.resetErrors();
  }

  tornaIndietro() {
    this.router.navigate(['/dashboard']);
  }
}
