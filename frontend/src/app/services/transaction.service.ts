import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = `${environment.apiUrl}/api/transactions`;

  private http = inject(HttpClient);


  add(userId: number, walletId: number, t: Transaction): Observable<Transaction> {
    const payload = { ...t, amount: Number(t.amount) };
    return this.http.post<Transaction>(`${this.apiUrl}/user/${userId}/wallet/${walletId}`, payload);
  }


  getTransactionsByWallet(walletId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/wallet/${walletId}`);
  }


  getRecentTransactions(userId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/recent/${userId}`);
  }
}
