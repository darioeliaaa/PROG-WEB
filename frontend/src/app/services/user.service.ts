import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * Servizio dedicato alla gestione dell'utente, della sessione e delle impostazioni.
 * Utilizza BehaviorSubject per rendere lo stato dell'utente reattivo in tutta l'app.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  // URL base per gli endpoint relativi agli utenti nel backend Spring Boot
  private apiUrl = 'http://localhost:8080/api/users';

  /**
   * Stato di login reattivo.
   * Inizializzato controllando se esiste già un'email salvata nel browser.
   */
  private loggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem('email'));
  isLoggedIn$ = this.loggedIn.asObservable(); // Stream a cui i componenti (come l'Header) si iscrivono

  // Variabili di stato interne per accesso rapido ai dati utente
  private currentUserEmail: string | null = localStorage.getItem('email');
  private currentUserId: number | null = localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null;

  /**
   * Gestione reattiva delle impostazioni utente (lingua, valuta, notifiche).
   */
  private userSettings = new BehaviorSubject<any>(null);
  userSettings$ = this.userSettings.asObservable();

  constructor(private http: HttpClient) {
    /**
     * Al caricamento del servizio, cerca impostazioni salvate localmente
     * per evitare ritardi visivi (flash) nell'interfaccia.
     */
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      this.userSettings.next(JSON.parse(savedSettings));
    }
  }

  // --- GESTIONE LOGIN/LOGOUT ---

  /**
   * Gestisce l'ingresso dell'utente salvando i dati nel browser
   * e notificando tutti i componenti tramite l'Observable.
   */
  login(id: number, email: string) {
    localStorage.setItem('email', email);
    localStorage.setItem('userId', String(id));
    this.currentUserEmail = email;
    this.currentUserId = id;
    this.loggedIn.next(true); // Emette 'true' a tutti i sottoscrittori
    this.loadUserSettings(id); // Carica le impostazioni dal server dopo il login
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
    this.http.get(`http://localhost:8080/api/settings/${userId}`).subscribe({
      next: (settings) => {
        this.userSettings.next(settings);
        // Persistenza locale per avere i dati pronti al refresh della pagina
        localStorage.setItem('userSettings', JSON.stringify(settings));
      },
      error: (err) => console.error("Errore caricamento impostazioni nel service", err)
    });
  }

  /**
   * Recupero sincrono delle impostazioni.
   * Utile per componenti che non possono aspettare una sottoscrizione asincrona.
   */
  getSettingsSync() {
    const local = localStorage.getItem('userSettings');
    return local ? JSON.parse(local) : { language: 'it', currency: 'EUR', privacyMode: false };
  }

  /**
   * Restituisce lo stato attuale del login (valore istantaneo).
   */
  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  /**
   * Aggiorna localmente le impostazioni senza attendere il server.
   * Ottimo per dare un feedback immediato alla UI (es. cambiare colore o icona notifiche).
   */
  updateLocalSettings(newSettings: any) {
    // 1. Notifica l'Observable (fa apparire/scomparire la campana subito)
    this.userSettings.next(newSettings);

    // 2. Aggiorna il localStorage (così al refresh i dati rimangono)
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  }

  /**
   * Ritorna l'email dell'utente attualmente loggato.
   */
  getCurrentUserEmail(): string | null {
    return this.currentUserEmail;
  }

  /**
   * Ritorna l'ID univoco dell'utente (fondamentale per le relazioni con i wallet).
   */
  getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  // --- GESTIONE GAMIFICATION & PROFILO ---

  /**
   * Recupera dati sulla progressione del profilo (es. percentuale completamento).
   */
  getProfileStatus(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/profile-status`);
  }

  /**
   * Invia i dati aggiornati del profilo (nome, cognome, etc.) al database.
   */
  updateProfile(userId: number, profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/update`, profileData);
  }

  /**
   * Recupera l'intero oggetto User dal server.
   * Utilizzato per popolare i moduli di modifica profilo con i dati attuali.
   */
  getUserProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }
}
