import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

// INTERFACCIA ASSET
export interface MarketAsset {
  symbol: string;
  name: string;
  type: string;
  logoUrl?: string;
  currentPrice: number;
  changeValue: number;
  changePercent: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  prevClosePrice: number;
  marketCap?: number;
  industry?: string;
  currency?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarketService {

  // 1. CORREZIONE FONDAMENTALE: Punta alla radice dell'API
  private apiUrl = 'http://localhost:8080/api';

  private http = inject(HttpClient);

  // --- GET LISTA ASSET (Stock, Crypto, ETF) ---
  getAssetsByType(typeFilter: string): Observable<MarketAsset[]> {
    // Ora aggiungiamo qui il pezzo specifico dell'URL
    return this.http.get<MarketAsset[]>(`${this.apiUrl}/market/overview`).pipe(
      map(allAssets => {
        const filtered = allAssets.filter(asset =>
          asset.type.toUpperCase() === typeFilter.toUpperCase()
        );

        if (filtered.length === 0) {
          console.warn(`Backend vuoto per ${typeFilter}, uso dati finti.`);
          return this.getMockData(typeFilter);
        }

        return filtered;
      }),
      catchError(err => {
        console.error("Backend non raggiungibile o errore API", err);
        return of(this.getMockData(typeFilter));
      })
    );
  }

  // --- NEWS ---
  getNews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/news`).pipe(
      catchError(err => {
        console.error('Errore news backend', err);
        return of([]);
      })
    );
  }

  // --- TRADING REALE ---

  // 1. GET: Quante azioni possiedo già?
  getHolding(userId: number, symbol: string): Observable<number> {
    // URL Generato: http://localhost:8080/api/investments/holding/1/AAPL
    return this.http.get<number>(`${this.apiUrl}/investments/holding/${userId}/${symbol}`);
  }

  tradeAsset(request: any): Observable<any> {
    // Nota: l'endpoint ora è '/trade', non più '/buy'
    return this.http.post(`${this.apiUrl}/investments/trade`, request);
  }

  // (Opzionale) Vecchio metodo executeTrade se lo usi ancora da qualche parte
  executeTrade(transactionRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions`, transactionRequest);
  }

  // --- DATI FINTI DI BACKUP ---
  private getMockData(type: string): MarketAsset[] {
    const t = type.toUpperCase();
    if (t === 'ETF') {
      return [
        { symbol: 'VTI', name: 'Vanguard Total Stock', type: 'ETF', currentPrice: 220.50, changeValue: 2.5, changePercent: 1.2, highPrice: 222.00, lowPrice: 218.00, openPrice: 219.00, prevClosePrice: 218.00, marketCap: 1000000, industry: 'Fund', currency: 'USD' },
        { symbol: 'QQQ', name: 'Invesco QQQ', type: 'ETF', currentPrice: 350.75, changeValue: 7.2, changePercent: 2.1, highPrice: 352.00, lowPrice: 345.00, openPrice: 346.00, prevClosePrice: 343.55, marketCap: 2000000, industry: 'Technology Fund', currency: 'USD' }
      ];
    }
    if (t === 'STOCK' || t === 'AZIONI') {
      return [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', logoUrl: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-0544d0f8d219.png', currentPrice: 175.30, changeValue: 0.85, changePercent: 0.5, highPrice: 176.00, lowPrice: 174.00, openPrice: 174.50, prevClosePrice: 174.45, marketCap: 2800000, industry: 'Technology', currency: 'USD' },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', currentPrice: 240.00, changeValue: -3.50, changePercent: -1.2, highPrice: 245.00, lowPrice: 238.00, openPrice: 244.00, prevClosePrice: 243.50, marketCap: 800000, industry: 'Automotive', currency: 'USD' }
      ];
    }
    if (t === 'CRYPTO') {
      return [
        { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', currentPrice: 42000, changeValue: 1200, changePercent: 3.5, highPrice: 42500, lowPrice: 41000, openPrice: 40800, prevClosePrice: 40800, marketCap: 800000, industry: 'Blockchain', currency: 'USD' }
      ];
    }
    return [];
  }
}
