import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  private currentUserEmail: string | null = null;

  constructor() {
    const email = localStorage.getItem('email');
    if (email) {
      this.currentUserEmail = email;
      this.loggedIn.next(true);
    }
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

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  getCurrentUserEmail(): string | null {
    return this.currentUserEmail;
  }
}
