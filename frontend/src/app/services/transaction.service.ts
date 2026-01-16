import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';

/**
 * Servizio per la gestione dei movimenti finanziari (Entrate/Uscite).
 * Permette la registrazione e il recupero della cronologia transazioni.
 */
@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  // URL base del controller delle transazioni nel backend Spring Boot
  private apiUrl = 'http://localhost:8080/api/transactions';

  // Iniezione di HttpClient tramite la funzione inject()
  private http = inject(HttpClient);

  /**
   * 1. SALVARE: Registra una nuova transazione nel database.
   * Il payload viene preparato forzando l'importo a tipo Number per evitare errori di calcolo.
   * @param userId ID dell'utente che effettua l'operazione
   * @param walletId ID del wallet su cui registrare il movimento
   * @param t Oggetto transazione contenente i dettagli
   */
  add(userId: number, walletId: number, t: Transaction): Observable<Transaction> {
    const payload = { ...t, amount: Number(t.amount) };
    return this.http.post<Transaction>(`${this.apiUrl}/user/${userId}/wallet/${walletId}`, payload);
  }

  /**
   * 2. RECUPERO PER WALLET: Scarica la lista completa dei movimenti di un wallet.
   * Fondamentale per calcolare il saldo residuo e popolare i grafici delle statistiche.
   * Risolve l'errore TS2339 quando richiamato dai componenti.
   */
  getTransactionsByWallet(walletId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/wallet/${walletId}`);
  }

  /**
   * 3. ULTIMI MOVIMENTI: Recupera le transazioni più recenti dell'utente a livello globale.
   * Utilizzato solitamente nella Dashboard principale per mostrare il feed attività.
   */
  getRecentTransactions(userId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/recent/${userId}`);
  }
}
