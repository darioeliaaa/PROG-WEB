import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interfacce per la tipizzazione dei dati finanziari provenienti dal Backend.
 * Assicurano che i dati degli investimenti siano gestiti in modo coerente nel frontend.
 */

/**
 * Rappresenta le performance di un singolo asset (azione, crypto, etc.) nel portafoglio.
 */
export interface AssetPerformance {
  symbol: string;        // Simbolo del titolo (es. AAPL, BTC)
  name: string;          // Nome esteso della società o dell'asset
  quantity: number;      // Quantità totale posseduta
  avgBuyPrice: number;   // Prezzo medio di carico (prezzo d'acquisto)
  currentPrice: number;  // Prezzo di mercato attuale recuperato in tempo reale
  currentValue: number;  // Valore totale della posizione (prezzo attuale * quantità)
  profit: number;        // Guadagno o perdita assoluta (Current Value - Invested)
  profitPercent: number; // Rendimento percentuale
}

/**
 * Rappresenta la visione d'insieme dell'intero portafoglio di un utente.
 */
export interface PortfolioOverview {
  currentTotalValue: number;   // Valore totale di mercato di tutti gli asset + liquidità
  totalInvested: number;       // Somma totale del capitale investito inizialmente
  totalProfit: number;         // Profitto totale lordo del portafoglio
  totalProfitPercent: number;  // Percentuale di rendimento complessiva
  availableCash: number;       // Liquidità non investita disponibile per nuovi acquisti
  assets: AssetPerformance[];  // Lista dettagliata dei singoli titoli posseduti
}

/**
 * Servizio per il monitoraggio degli investimenti e delle performance del portafoglio.
 */
@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  // Endpoint principale per il modulo Portfolio nel backend Spring Boot
  private apiUrl = 'http://localhost:8080/api/portfolio';

  // Iniezione di HttpClient tramite il pattern inject()
  private http = inject(HttpClient);

  /**
   * Recupera i dati aggregati del portafoglio per un determinato utente.
   * Restituisce un Observable di PortfolioOverview, utile per popolare grafici a torta (asset allocation)
   * e tabelle di performance nella sezione investimenti.
   */
  getPortfolio(userId: number): Observable<PortfolioOverview> {
    return this.http.get<PortfolioOverview>(`${this.apiUrl}/${userId}`);
  }
}
