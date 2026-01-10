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

  // 1. SALVARE (Richiede User e Wallet)
  add(userId: number, walletId: number, t: Transaction): Observable<Transaction> {
    // Il backend si aspetta i campi in inglese (amount, description, etc.)
    // Assicuriamoci che l'amount sia un numero puro
    const payload = {
      ...t,
      amount: Number(t.amount)
    };

    return this.http.post<Transaction>(
      `${this.apiUrl}/user/${userId}/wallet/${walletId}`,
      payload
    );
  }

  // 2. LEGGERE (Richiede solo il Wallet)
  // Questo è il metodo fondamentale per i grafici!
  getTransactionsByWallet(walletId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/wallet/${walletId}`);
  }
}
