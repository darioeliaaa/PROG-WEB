import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfacce per i dati che arrivano dal Backend
export interface AssetPerformance {
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  profit: number;
  profitPercent: number;
}

export interface PortfolioOverview {
  currentTotalValue: number;
  totalInvested: number;
  totalProfit: number;
  totalProfitPercent: number;
  availableCash: number; // Soldi liquidi disponibili
  assets: AssetPerformance[];
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  // URL del Backend (deve corrispondere al PortfolioController)
  private apiUrl = 'http://localhost:8080/api/portfolio';

  private http = inject(HttpClient);

  getPortfolio(userId: number): Observable<PortfolioOverview> {
    return this.http.get<PortfolioOverview>(`${this.apiUrl}/${userId}`);
  }
}
