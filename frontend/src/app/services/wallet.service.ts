import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {WalletComponent} from '../features/Wallet/wallet';
import {Wallet} from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private apiUrl = 'http://localhost:8080/api/wallets';
  private http = inject(HttpClient);

  // 1. Rinominiamo o aggiungiamo l'alias per far sparire il rosso nel componente
  getUserWallets(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // 2. Per rinominare il wallet (funzione Admin)
  renameWallet(walletId: number, adminId: number, newName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${walletId}/rename?adminId=${adminId}&newName=${newName}`, {});
  }

  // 3. Per impostare il budget (funzione Admin)
  updateBudget(walletId: number, adminId: number, budget: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${walletId}/budget?adminId=${adminId}&budget=${budget}`, {});
  }

  // 4. Per vedere chi fa parte del wallet
  getWalletMembers(walletId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${walletId}/members`);
  }

  // 5. Per rimuovere un utente o abbandonare
  removeMember(walletId: number, adminId: number, memberId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${walletId}/remove-member/${memberId}?adminId=${adminId}`);
  }

  createWallet(userId: number, walletName: string): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/user/${userId}/create?walletName=${encodeURIComponent(walletName)}`, {});
  }

  joinWallet(walletId: number, userId: number): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.apiUrl}/${walletId}/join?userId=${userId}`, {});
  }


  getWalletById(walletId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${walletId}`);
  }
}
