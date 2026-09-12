import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // L'URL deve corrispondere a quello che abbiamo scritto nel Controller Java
  private apiUrl = `${environment.apiUrl}/api/settings`;

  constructor(private http: HttpClient) {}

  // Recupera le impostazioni dal database
  getSettings(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  // Salva le impostazioni nel database
  updateSettings(userId: number, settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, settings);
  }
}
