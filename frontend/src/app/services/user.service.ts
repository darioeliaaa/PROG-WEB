import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // URL del Backend
  private apiUrl = 'http://localhost:8080/api/users';

  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('email'));
  isLoggedIn$ = this.loggedIn.asObservable();

  private currentUserEmail: string | null = localStorage.getItem('email');
  private currentUserId: number | null = localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null;

  constructor(private http: HttpClient) {}

  // --- GESTIONE LOGIN/LOGOUT ---
  login(id: number, email: string) {
    localStorage.setItem('email', email);
    localStorage.setItem('userId', String(id));
    this.currentUserEmail = email;
    this.currentUserId = id;
    this.loggedIn.next(true);
  }

  logout() {
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
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

  getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  // --- GESTIONE GAMIFICATION & PROFILO ---

  // 1. Ottieni la percentuale (funziona già)
  getProfileStatus(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/profile-status`);
  }

  // 2. Aggiorna i dati (funziona già)
  updateProfile(userId: number, profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/update`, profileData);
  }

  // ✅ 3. SCARICA I DATI DEL PROFILO (Mancava questo!)
  // Serve per riempire il form quando apri la pagina
  getUserProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }
}
