import { Component } from '@angular/core';
import { Router } from '@angular/router'; // 1. Importa il Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  // 2. Inietta il router nel costruttore
  constructor(private router: Router) {}

  // 3. Crea questa funzione
  tornaIndietro() {
    this.router.navigate(['/dashboard']);
  }
}
