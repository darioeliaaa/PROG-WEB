import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private apiUrl = 'http://localhost:8080/api/transactions';
  private http = inject(HttpClient);

  // 1. SALVARE
  add(userId: number, walletId: number, t: Transaction): Observable<Transaction> {
    const payload = { ...t, amount: Number(t.amount) };
    return this.http.post<Transaction>(`${this.apiUrl}/user/${userId}/wallet/${walletId}`, payload);
  }

  // ✅ 2. QUESTO È IL METODO CHE MANCAVA (Risolve TS2339)
  // Serve per scaricare tutti i movimenti di un wallet specifico (per i calcoli e grafici)
  getTransactionsByWallet(walletId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/wallet/${walletId}`);
  }

  // 3. ULTIMI MOVIMENTI
  getRecentTransactions(userId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/recent/${userId}`);
  }
}
