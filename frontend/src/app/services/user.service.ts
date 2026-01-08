import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('email'));
  isLoggedIn$ = this.loggedIn.asObservable();

  private currentUserEmail: string | null = localStorage.getItem('email');
  // NUOVO: Recuperiamo anche l'ID se c'è
  private currentUserId: number | null = localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null;

  constructor() {}

  // MODIFICA: La login ora deve ricevere anche l'ID (dal backend)
  login(id: number, email: string) {
    localStorage.setItem('email', email);
    localStorage.setItem('userId', String(id)); // Salviamo l'ID come stringa

    this.currentUserEmail = email;
    this.currentUserId = id;

    this.loggedIn.next(true);
  }

  logout() {
    localStorage.removeItem('email');
    localStorage.removeItem('userId'); // Puliamo tutto

    this.currentUserEmail = null;
    this.currentUserId = null;

    this.loggedIn.next(false);
  }

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getCurrentUserEmail(): string | null {
    return this.currentUserEmail;
  }

  // NUOVO: Metodo per dare l'ID ai componenti
  getCurrentUserId(): number | null {
    return this.currentUserId;
  }
}
