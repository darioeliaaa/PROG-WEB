import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

// 1. INTERFACCIA AGGIORNATA (Match perfetto con il Backend Java)
export interface MarketAsset {
  symbol: string;
  name: string;
  type: string;
  logoUrl?: string; // Opzionale perché potrebbe non esserci

  // Dati Prezzo Live
  currentPrice: number;
  changeValue: number;    // Variazione in valuta (es. -$1.50)
  changePercent: number;  // Variazione in % (es. -0.99%)

  // Dettagli Giornalieri
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  prevClosePrice: number;

  // Fondamentali (Opzionali perché le crypto potrebbero non averli tutti)
  marketCap?: number;
  industry?: string;
  currency?: string;
}

@Injectable({
  providedIn: 'root'
})
@Injectable({ providedIn: 'root' })
export class MarketService {

  // Assicurati che questo URL corrisponda al tuo Controller Java
  private apiUrl = 'http://localhost:8080/api/market/overview';

  private http = inject(HttpClient);

  getAssetsByType(typeFilter: string): Observable<MarketAsset[]> {
    // Passiamo un parametro dummy per evitare la cache se serve: ?forceRefresh=true
    return this.http.get<MarketAsset[]>(this.apiUrl).pipe(
      map(allAssets => {
        // 1. Il backend ti manda TUTTO, qui filtriamo per tipo (STOCK, ETF, CRYPTO)
        // Nota: Assicurati che il backend mandi 'stock', 'etf' (spesso sono lowercase o uppercase, qui normalizziamo)
        const filtered = allAssets.filter(asset =>
          asset.type.toUpperCase() === typeFilter.toUpperCase()
        );

        // 2. Fallback: Se la lista è vuota, usiamo i dati finti per non rompere la UI
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

  // --- DATI FINTI AGGIORNATI (Con la nuova struttura) ---
  private getMockData(type: string): MarketAsset[] {
    const t = type.toUpperCase();

    if (t === 'ETF') {
      return [
        {
          symbol: 'VTI', name: 'Vanguard Total Stock', type: 'ETF', logoUrl: '',
          currentPrice: 220.50, changeValue: 2.5, changePercent: 1.2,
          highPrice: 222.00, lowPrice: 218.00, openPrice: 219.00, prevClosePrice: 218.00,
          marketCap: 1000000, industry: 'Fund', currency: 'USD'
        },
        {
          symbol: 'QQQ', name: 'Invesco QQQ', type: 'ETF', logoUrl: '',
          currentPrice: 350.75, changeValue: 7.2, changePercent: 2.1,
          highPrice: 352.00, lowPrice: 345.00, openPrice: 346.00, prevClosePrice: 343.55,
          marketCap: 2000000, industry: 'Technology Fund', currency: 'USD'
        }
      ];
    }
    if (t === 'STOCK' || t === 'AZIONI') {
      return [
        {
          symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', logoUrl: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-0544d0f8d219.png',
          currentPrice: 175.30, changeValue: 0.85, changePercent: 0.5,
          highPrice: 176.00, lowPrice: 174.00, openPrice: 174.50, prevClosePrice: 174.45,
          marketCap: 2800000, industry: 'Technology', currency: 'USD'
        },
        {
          symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', logoUrl: '',
          currentPrice: 240.00, changeValue: -3.50, changePercent: -1.2,
          highPrice: 245.00, lowPrice: 238.00, openPrice: 244.00, prevClosePrice: 243.50,
          marketCap: 800000, industry: 'Automotive', currency: 'USD'
        }
      ];
    }
    if (t === 'CRYPTO') {
      return [
        {
          symbol: 'BTC', name: 'Bitcoin', type: 'crypto', logoUrl: '',
          currentPrice: 42000, changeValue: 1200, changePercent: 3.5,
          highPrice: 42500, lowPrice: 41000, openPrice: 40800, prevClosePrice: 40800,
          marketCap: 800000, industry: 'Blockchain', currency: 'USD'
        }
      ];
    }
    return [];
  }
  getNews(): Observable<any[]> {
    // Chiama il tuo controller Spring Boot
    return this.http.get<any[]>('http://localhost:8080/api/news').pipe(
      catchError(err => {
        console.error('Errore news backend', err);
        return of([]); // Ritorna array vuoto se il backend fallisce
      })
    );
  }
  executeTrade(transactionRequest: any): Observable<any> {
    // Assumi che il backend abbia un endpoint per le transazioni
    // Se non ce l'ha ancora, useremo un mock per ora
    return this.http.post(`${this.apiUrl}/transactions`, transactionRequest).pipe(
      catchError(err => {
        console.error('Errore Trade:', err);
        throw err;
      })
    );
  }
}
