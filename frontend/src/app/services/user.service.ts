import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.apiUrl}/api/users`;


  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('email'));
  isLoggedIn$ = this.loggedIn.asObservable(); // Stream a cui i componenti (come l'Header) si iscrivono

  private currentUserEmail: string | null = localStorage.getItem('email');
  private currentUserId: number | null = localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null;


  private userSettings = new BehaviorSubject<any>(null);
  userSettings$ = this.userSettings.asObservable();

  constructor(private http: HttpClient) {

    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      this.userSettings.next(JSON.parse(savedSettings));
    }
  }

  // --- GESTIONE LOGIN/LOGOUT ---


  login(id: number, email: string) {
    localStorage.setItem('email', email);
    localStorage.setItem('userId', String(id));
    this.currentUserEmail = email;
    this.currentUserId = id;
    this.loggedIn.next(true);
    this.loadUserSettings(id);
  }

  /**
   * Pulisce la sessione, rimuove i dati dal localStorage e notifica lo stato 'false'.
   */
  logout() {
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    this.currentUserEmail = null;
    this.currentUserId = null;
    this.loggedIn.next(false); // Notifica la disconnessione (nasconde menu/campane)
  }

  /**
   * Recupera le impostazioni dell'utente dal database e aggiorna sia il BehaviorSubject che il cache locale.
   */
  loadUserSettings(userId: number): void {
    this.http.get(`${environment.apiUrl}/api/settings/${userId}`).subscribe({
      next: (settings) => {
        this.userSettings.next(settings);
        // Persistenza locale per avere i dati pronti al refresh della pagina
        localStorage.setItem('userSettings', JSON.stringify(settings));
      },
      error: (err) => console.error("Errore caricamento impostazioni nel service", err)
    });
  }


  getSettingsSync() {
    const local = localStorage.getItem('userSettings');
    return local ? JSON.parse(local) : { language: 'it', currency: 'EUR', privacyMode: false };
  }

  /**
   * Restituisce lo stato attuale del login
   */
  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  /**
   * Aggiorna localmente le impostazioni senza attendere il server.
   */
  updateLocalSettings(newSettings: any) {
    this.userSettings.next(newSettings);

    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  }

  getCurrentUserEmail(): string | null {
    return this.currentUserEmail;
  }


  getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  // --- GESTIONE GAMIFICATION & PROFILO ---


  getProfileStatus(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/profile-status`);
  }


  updateProfile(userId: number, profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/update`, profileData);
  }


  getUserProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }


  getUserDetails(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }
}
