import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    username: '',
    email: '',
    password: ''
  };

  errorMessage: string = '';
  registerMessage: string = '';

  isRegisterError: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  onLogin() {
    this.errorMessage = '';

    if (this.loginObj.email.trim() == '' || this.loginObj.password.trim() == '') {
      this.errorMessage = 'Compila tutti i campi per accedere!';
      return;
    }

    this.http.post('http://localhost:8080/api/users/login', this.loginObj).subscribe({
      next: (res: any) => {
        console.log('Login riuscito!', res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Email o Password errati';
        } else {
          this.errorMessage = 'Errore di connessione.';
        }
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

    const userToSend = {
      username: this.registerObj.username,
      email: this.registerObj.email,
      password: this.registerObj.password,
    };

    this.http.post('http://localhost:8080/api/users/register', userToSend).subscribe({
      next: (res: any) => {
        this.isRegisterError = false;
        this.registerMessage = 'Registrazione avvenuta con successo! Fai il login.';

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
