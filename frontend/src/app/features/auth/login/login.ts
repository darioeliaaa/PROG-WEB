import { Component, NgZone } from '@angular/core';
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

  // ✅ NUOVO: Messaggio errore password
  passwordError: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
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
    this.passwordError = ''; // Reset errore password
  }

  // --- ✅ NUOVO: VALIDAZIONE PASSWORD FORTE ---
  checkPasswordStrength(password: string) {
    if (!password) {
      this.passwordError = '';
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= 8;

    if (!isValidLength) {
      this.passwordError = "Almeno 8 caratteri.";
      return false;
    }
    if (!hasUpperCase) {
      this.passwordError = "Manca una maiuscola.";
      return false;
    }
    if (!hasNumbers) {
      this.passwordError = "Manca un numero.";
      return false;
    }
    // Opzionale: se vuoi forzare anche il carattere speciale scommenta sotto
    /*
    if (!hasSpecial) {
      this.passwordError = "Manca un carattere speciale (!@#$).";
      return false;
    }
    */

    this.passwordError = ''; // Tutto ok
    return true;
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

    // 1. Validazione Password
    if (!this.checkPasswordStrength(this.registerObj.password)) {
      return;
    }

    // 2. Validazione Campi vuoti
    if (!this.registerObj.username || !this.registerObj.email) {
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

        // ✅ SOLUZIONE: Usiamo NgZone per forzare l'aggiornamento grafico IMMEDIATO
        this.zone.run(() => {
          if (res.resetToken) {
            this.generatedRecoveryCode = res.resetToken;
            this.currentView = 'register-success';
          } else {
            this.currentView = 'login';
          }
          // Per sicurezza, lasciamo anche il cdr, ma NgZone fa il lavoro grosso
          this.cdr.detectChanges();
        });

      },
      error: (err) => {
        // Anche l'errore va gestito nella zone per mostrare subito il bordo rosso
        this.zone.run(() => {
          this.handleRegisterError(err);
        });
      }
    });
  }

  finishRegistration() {
    // 1. Salviamo l'email PRIMA di resettare l'oggetto di registrazione
    const emailToSave = this.registerObj.email;

    // 2. Puliamo i dati sensibili della registrazione
    this.generatedRecoveryCode = '';
    this.registerObj = { username: '', email: '', password: '' };

    // 3. Impostiamo l'email nel login
    this.loginObj.email = emailToSave;
    this.loginObj.password = ''; // La password ovviamente va lasciata vuota per sicurezza

    // 4. Forziamo il cambio vista e l'aggiornamento UI
    this.zone.run(() => {
      this.currentView = 'login';
      this.cdr.detectChanges(); // Forza Angular a leggere il nuovo valore di loginObj.email
    });
  }

  // --- RESET PASSWORD ---
  onResetPassword() {
    // 1. Controllo Password Sicura
    if (!this.checkPasswordStrength(this.forgotObj.newPassword)) {
      return;
    }

    // 2. Controllo Campi Vuoti
    if (!this.forgotObj.email || !this.forgotObj.code) {
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

        // ✅ FIX: Usiamo NgZone per aggiornare subito la schermata
        this.zone.run(() => {
          this.currentView = 'forgot-success';

          // Pre-compiliamo la mail per il login
          this.loginObj.email = this.forgotObj.email;
          this.loginObj.password = '';

          this.cdr.detectChanges(); // Sicurezza extra
        });

      },
      error: (err) => {
        // Anche l'alert o i messaggi di errore meglio gestirli nella zone
        this.zone.run(() => {
          alert(err.error?.message || "Codice errato o email non valida.");
        });
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
