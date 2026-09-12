import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Wallet } from '../models/wallet.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class WalletService {
  private apiUrl = `${environment.apiUrl}/api/wallets`;

  private http = inject(HttpClient);


  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Recupera tutti i wallet associati a uno specifico ID utente.
   */
  getUserWallets(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Rinomina un wallet esistente. Richiede l'ID dell'admin per i permessi.
   */
  renameWallet(walletId: number, adminId: number, newName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${walletId}/rename?adminId=${adminId}&newName=${newName}`, {});
  }

  /**
   * Aggiorna le impostazioni del wallet (budget o limite trasferimento).
   * Costruisce l'URL dinamicamente in base ai parametri forniti.
   */
  updateSettings(walletId: number, adminId: number, budget: number, maxTransfer: number): Observable<any> {
    let url = `${this.apiUrl}/${walletId}/settings?adminId=${adminId}`;
    if (budget != null) url += `&budget=${budget}`;
    if (maxTransfer != null) url += `&maxTransfer=${maxTransfer}`;
    return this.http.put(url, {});
  }

  /**
   * Sovrascrive i limiti (budget e trasferimento massimo) del wallet.
   */
  updateWalletLimits(adminId: number, walletId: number, budget: number, maxTransfer: number): Observable<any> {
    const url = `${this.apiUrl}/${walletId}/settings?adminId=${adminId}&budget=${budget}&maxTransfer=${maxTransfer}`;
    return this.http.put(url, {});
  }

  /**
   * Rimuove un membro specifico da un wallet condiviso.
   */
  removeMember(walletId: number, adminId: number, memberId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${walletId}/remove-member/${memberId}?adminId=${adminId}`);
  }

  /**
   * Crea un nuovo wallet per l'utente specificato.
   * Utilizza encodeURIComponent per gestire in sicurezza caratteri speciali nel nome.
   */
  createWallet(userId: number, walletName: string): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/user/${userId}/create?walletName=${encodeURIComponent(walletName)}`, {});
  }

  /**
   * Permette a un utente di unirsi a un wallet tramite un codice di invito univoco.
   */
  joinWalletByCode(inviteCode: string, userId: number): Observable<Wallet> {
    return this.http.post<Wallet>(
      `${this.apiUrl}/join-by-code?inviteCode=${inviteCode}&userId=${userId}`,
      {}
    );
  }

  joinWallet(walletId: number, userId: number): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/${walletId}/join?userId=${userId}`, {});
  }

  /**
   * Recupera i dettagli completi di un singolo wallet tramite il suo ID.
   */
  getWalletById(walletId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${walletId}`);
  }

  /**
   * Elimina permanentemente un wallet. Operazione riservata all'amministratore.
   */
  deleteWallet(walletId: number, adminId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${walletId}?adminId=${adminId}`);
  }

  openWallet(walletId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${walletId}/open?userId=${userId}`, {});
  }

  /**
   * Gestisce il trasferimento di fondi tra due wallet diversi.
   */
  transferMoney(userId: number, fromId: number, toId: number, amount: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/transfer?userId=${userId}&fromId=${fromId}&toId=${toId}&amount=${amount}`,
      {}
    );
  }

  /**
   * Trasferisce la proprietà (ruolo admin) di un wallet a un altro utente.
   */
  transferOwnership(walletId: number, currentAdminId: number, newAdminId: number): Observable<any> {
    const url = `${this.apiUrl}/${walletId}/transfer-ownership`;

    return this.http.put(url, {}, {
      headers: this.getHeaders(), 
      params: {
        currentAdminId: currentAdminId.toString(),
        newAdminId: newAdminId.toString()
      }
    });
  }
}
