import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Wallet } from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private apiUrl = 'http://localhost:8080/api/wallets';
  private http = inject(HttpClient);

  getUserWallets(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  renameWallet(walletId: number, adminId: number, newName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${walletId}/rename?adminId=${adminId}&newName=${newName}`, {});
  }

  updateBudget(walletId: number, adminId: number, budget: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${walletId}/budget?adminId=${adminId}&budget=${budget}`, {});
  }

  removeMember(walletId: number, adminId: number, memberId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${walletId}/remove-member/${memberId}?adminId=${adminId}`);
  }

  createWallet(userId: number, walletName: string): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/user/${userId}/create?walletName=${encodeURIComponent(walletName)}`, {});
  }

  // ✅ Join by Code (Nuovo metodo sicuro con codice invito)
  joinWalletByCode(inviteCode: string, userId: number): Observable<Wallet> {
    return this.http.post<Wallet>(
      `${this.apiUrl}/join-by-code?inviteCode=${inviteCode}&userId=${userId}`,
      {}
    );
  }

  // ✅ METODO AGGIUNTO (Risolve l'errore TS2339)
  // Serve per la funzione legacy enterWallet() nel componente se vuoi unirti tramite ID
  joinWallet(walletId: number, userId: number): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/${walletId}/join?userId=${userId}`, {});
  }

  getWalletById(walletId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${walletId}`);
  }
}
