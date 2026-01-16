import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


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


export interface PortfolioOverview {
  currentTotalValue: number;   // Valore totale di mercato di tutti gli asset + liquidità
  totalInvested: number;       // Somma totale del capitale investito inizialmente
  totalProfit: number;         // Profitto totale lordo del portafoglio
  totalProfitPercent: number;  // Percentuale di rendimento complessiva
  availableCash: number;       // Liquidità non investita disponibile per nuovi acquisti
  assets: AssetPerformance[];  // Lista dettagliata dei singoli titoli posseduti
}


@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  private apiUrl = 'http://localhost:8080/api/portfolio';

  private http = inject(HttpClient);

  getPortfolio(userId: number): Observable<PortfolioOverview> {
    return this.http.get<PortfolioOverview>(`${this.apiUrl}/${userId}`);
  }
}
