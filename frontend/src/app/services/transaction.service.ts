import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Transaction } from '../models/transaction.model'; // Assicurati che il percorso sia giusto

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  // URL del tuo Backend Spring Boot
  private apiUrl = 'http://localhost:8080/api/transactions';

  // Iniezione del client HTTP
  private http = inject(HttpClient);

  constructor() {}

  // 1. Aggiungi Transazione (chiama POST su Spring)
  add(userId: number, t: Transaction): Observable<Transaction> {
    // Ci assicuriamo che l'amount sia un numero e non una stringa
    const payload = { ...t, amount: Number(t.amount) };
    return this.http.post<Transaction>(`${this.apiUrl}/user/${userId}`, payload);
  }

  // 2. Prendi tutte le transazioni (chiama GET su Spring)
  getAllTransactions(userId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/user/${userId}`);
  }

  // 3. Logica complessa del tuo collega (adattata al backend)
  getDataByMonth(userId: number, meseIdx: number, anno: number): Observable<any> {

    // Scarichiamo i dati dal server...
    return this.getAllTransactions(userId).pipe(
      map(transactions => {

        // ...e poi li filtriamo qui nel frontend come faceva lui
        const filtered = transactions.filter(t => {
          const parts = t.date.split('-'); // La data è "2025-01-03"
          const tAnno = Number(parts[0]);
          const tMese = Number(parts[1]) - 1; // I mesi in JS vanno da 0 a 11
          return tAnno === anno && tMese === meseIdx;
        });

        // Calcolo totali (adattato ai nomi inglesi)
        const totaleEntrate = filtered
          .filter(t => t.type === 'ENTRATA')
          .reduce((acc, curr) => acc + curr.amount, 0);

        const totaleUscite = filtered
          .filter(t => t.type === 'USCITA')
          .reduce((acc, curr) => acc + curr.amount, 0);

        // Restituisce lo stesso oggetto che il frontend si aspetta
        return {
          transactions: filtered,
          totaleEntrate,
          totaleUscite,
          saldo: totaleEntrate - totaleUscite
        };
      })
    );
  }
  // ... altri metodi ...

  // 4. NUOVO METODO: Filtra per Anno (serve al componente YearlyHistory)
  getDataByYear(userId: number, anno: number): Observable<Transaction[]> {
    return this.getAllTransactions(userId).pipe(
      map(transactions => {
        return transactions.filter(t => {
          const tAnno = Number(t.date.split('-')[0]); // "2025-01-03" -> 2025
          return tAnno === anno;
        });
      })
    );
  }
}
