import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface MarketAsset {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  type: string;
  logoUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private apiUrl = 'http://localhost:8080/api/market/overview';
  private http = inject(HttpClient);

  getAssetsByType(typeFilter: string): Observable<MarketAsset[]> {
    return this.http.get<MarketAsset[]>(this.apiUrl).pipe(
      map(allAssets => {
        // 1. Filtra i dati veri che arrivano dal backend
        const filtered = allAssets.filter(asset => asset.type === typeFilter);

        // 2. TRUCCO FRONTEND: Se la lista è vuota (es. ETF), usiamo dati finti
        if (filtered.length === 0) {
          console.warn(`Backend vuoto per ${typeFilter}, uso dati finti per test.`);
          return this.getMockData(typeFilter);
        }

        return filtered;
      }),
      // Se il backend è proprio spento o dà errore, mostra comunque i dati finti
      catchError(err => {
        console.error("Backend non raggiungibile, uso dati mock", err);
        return of(this.getMockData(typeFilter));
      })
    );
  }

  // Generatore di dati finti per testare la UI
  private getMockData(type: string): MarketAsset[] {
    if (type === 'ETF') {
      return [
        { symbol: 'VTI', name: 'Vanguard Total Stock', currentPrice: 220.50, changePercent: 1.2, type: 'ETF', logoUrl: '' },
        { symbol: 'VOO', name: 'Vanguard S&P 500', currentPrice: 410.10, changePercent: -0.5, type: 'ETF', logoUrl: '' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', currentPrice: 350.75, changePercent: 2.1, type: 'ETF', logoUrl: '' }
      ];
    }
    if (type === 'STOCK') {
      return [
        { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 175.30, changePercent: 0.5, type: 'STOCK', logoUrl: '' },
        { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 240.00, changePercent: -1.2, type: 'STOCK', logoUrl: '' }
      ];
    }
    if (type === 'CRYPTO') {
      return [
        { symbol: 'BTC', name: 'Bitcoin', currentPrice: 42000, changePercent: 3.5, type: 'CRYPTO', logoUrl: '' },
        { symbol: 'ETH', name: 'Ethereum', currentPrice: 2200, changePercent: 1.1, type: 'CRYPTO', logoUrl: '' }
      ];
    }
    return [];
  }
}
