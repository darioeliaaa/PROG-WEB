import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Wallet } from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private apiUrl = 'http://localhost:8080/api/wallets';
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserWallets(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  renameWallet(walletId: number, adminId: number, newName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${walletId}/rename?adminId=${adminId}&newName=${newName}`, {});
  }

  updateSettings(walletId: number, adminId: number, budget: number, maxTransfer: number): Observable<any> {
    let url = `${this.apiUrl}/${walletId}/settings?adminId=${adminId}`;
    if (budget != null) url += `&budget=${budget}`;
    if (maxTransfer != null) url += `&maxTransfer=${maxTransfer}`;
    return this.http.put(url, {});
  }

  updateWalletLimits(adminId: number, walletId: number, budget: number, maxTransfer: number): Observable<any> {
    const url = `${this.apiUrl}/${walletId}/settings?adminId=${adminId}&budget=${budget}&maxTransfer=${maxTransfer}`;
    return this.http.put(url, {});
  }

  removeMember(walletId: number, adminId: number, memberId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${walletId}/remove-member/${memberId}?adminId=${adminId}`);
  }

  createWallet(userId: number, walletName: string): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/user/${userId}/create?walletName=${encodeURIComponent(walletName)}`, {});
  }

  joinWalletByCode(inviteCode: string, userId: number): Observable<Wallet> {
    return this.http.post<Wallet>(
      `${this.apiUrl}/join-by-code?inviteCode=${inviteCode}&userId=${userId}`,
      {}
    );
  }

  joinWallet(walletId: number, userId: number): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/${walletId}/join?userId=${userId}`, {});
  }

  getWalletById(walletId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${walletId}`);
  }

  deleteWallet(walletId: number, adminId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${walletId}?adminId=${adminId}`);
  }

  openWallet(walletId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${walletId}/open?userId=${userId}`, {});
  }

  transferMoney(userId: number, fromId: number, toId: number, amount: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/transfer?userId=${userId}&fromId=${fromId}&toId=${toId}&amount=${amount}`,
      {}
    );
  }

  // ✅ METODO CORRETTO (Senza duplicati o errori di URL)
  transferOwnership(walletId: number, currentAdminId: number, newAdminId: number): Observable<any> {
    // URL Corretto: apiUrl + /id + /endpoint (non ripetere /wallets!)
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
