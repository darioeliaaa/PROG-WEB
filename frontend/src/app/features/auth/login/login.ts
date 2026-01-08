import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  loginObj: any = {
    email: '',
    password: ''
  };

  registerObj: any = {
    username: '', // Attenzione: Assicurati che il backend si aspetti 'username' o 'name'
    email: '',
    password: ''
  };

  errorMessage: string = '';
  registerMessage: string = '';

  isRegisterError: boolean = false;

  constructor(private router: Router, private http: HttpClient, private userService: UserService) {}

  onLogin() {
    this.errorMessage = '';

    if (this.loginObj.email.trim() == '' || this.loginObj.password.trim() == '') {
      this.errorMessage = 'Compila tutti i campi per accedere!';
      return;
    }

    this.http.post('http://localhost:8080/api/users/login', this.loginObj).subscribe({
      next: (res: any) => {
        // CORREZIONE FONDAMENTALE QUI SOTTO:
        // Controlliamo che la risposta contenga l'ID
        if (res && res.id) {
          console.log("Login successo! ID ricevuto dal backend:", res.id);

          // Passiamo ENTRAMBI i parametri al service: ID ed Email
          this.userService.login(res.id, res.email);

          this.router.navigate(['/dashboard']); // O '/' a seconda delle tue rotte
        } else {
          this.errorMessage = 'Email o password errati (o nessun ID ricevuto)';
        }
      },
      error: (err) => {
        console.error("Errore login:", err);
        this.errorMessage = 'Credenziali non valide o errore server.';
      }
    });
  }

  onRegister() {
    this.registerMessage = '';
    this.isRegisterError = false;

    if (!this.registerObj.username ||
      !this.registerObj.email ||
      !this.registerObj.password) {

      this.registerMessage = 'Tutti i campi sono obbligatori!';
      this.isRegisterError = true;
      return;
    }

    // Mappatura oggetto per il backend
    // Verifica nel backend (User.java) se il campo si chiama 'name' o 'username'
    const userToSend = {
      name: this.registerObj.username, // Spesso in Spring il campo è 'name'
      email: this.registerObj.email,
      password: this.registerObj.password,
    };

    this.http.post('http://localhost:8080/api/users/register', userToSend).subscribe({
      next: (res: any) => {
        this.isRegisterError = false;
        this.registerMessage = 'Registrazione avvenuta con successo! Fai il login.';
        // Puliamo i campi
        this.registerObj = { username: '', email: '', password: '' };
      },
      error: (err) => {
        this.isRegisterError = true;
        this.registerMessage = 'Errore: email già esistente o dati non validi.';
      }
    });
  }

  tornaIndietro() {
    this.router.navigate(['/dashboard']);
  }
}
