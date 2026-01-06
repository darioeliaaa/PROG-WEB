import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // 🔴 CORREZIONE QUI:
  // Invece di 'false', controlliamo SUBITO se c'è l'email salvata.
  // !! serve a convertire la stringa in true/false.
  // In questo modo l'app nasce già nello stato corretto!
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('email'));

  isLoggedIn$ = this.loggedIn.asObservable();

  // Recuperiamo anche l'email subito
  private currentUserEmail: string | null = localStorage.getItem('email');

  constructor() {
    // Il costruttore ora può restare vuoto perché abbiamo fatto tutto sopra ^
  }

  login(email: string) {
    localStorage.setItem('email', email);
    this.currentUserEmail = email;
    this.loggedIn.next(true);
  }

  logout() {
    localStorage.removeItem('email');
    this.currentUserEmail = null;
    this.loggedIn.next(false);
  }

  // Funzione utile per l'Header
  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getCurrentUserEmail(): string | null {
    return this.currentUserEmail;
  }
}
