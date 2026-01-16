import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketService, MarketAsset } from '../market.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-market-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './market-home.html',
  styleUrls: ['./market-home.css']
})
export class MarketHomeComponent implements OnInit {

  // Liste per memorizzare gli asset finanziari divisi per categoria
  topStocks: MarketAsset[] = [];
  topCrypto: MarketAsset[] = [];
  topEtf: MarketAsset[] = [];
  newsList: any[] = [];

  // Variabili di stato per gestire la visualizzazione di loader o errori nel template
  loading = true;
  hasError = false;

  constructor(
    private marketService: MarketService,
    private cd: ChangeDetectorRef // Utilizzato per notificare Angular di aggiornare la UI dopo chiamate asincrone
  ) {}

  /**
   * Ciclo di vita: All'inizializzazione del componente avvia il caricamento dei dati.
   */
  ngOnInit() {
    this.caricaDatiParalleli();
  }

  /**
   * Metodo principale per popolare la home del market.
   * Effettua chiamate parallele (non bloccanti tra loro) per Stocks, Crypto, ETF e News.
   */
  caricaDatiParalleli() {
    this.loading = false; // Lo stato di loading viene gestito individualmente o inizialmente settato a false
    this.hasError = false;

    // 1. CARICAMENTO AZIONI (STOCKS)
    this.marketService.getAssetsByType('STOCK').subscribe({
      next: (res) => {
        // Unisce i dati reali del server con i dati di fallback e prende i primi 8
        this.topStocks = this.mergeDati(res, this.getFallbackStocks()).slice(0, 8);
        this.cd.detectChanges(); // Forza il refresh della UI
      },
      error: (err) => {
        console.warn('Errore Stocks:', err);
        this.topStocks = this.getFallbackStocks(); // In caso di errore API, usa dati statici
        this.cd.detectChanges();
      }
    });

    // 2. CARICAMENTO CRIPTOVALUTE
    this.marketService.getAssetsByType('CRYPTO').subscribe({
      next: (res) => {
        this.topCrypto = this.mergeDati(res, this.getFallbackCrypto()).slice(0, 8);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.warn('Errore Crypto:', err);
        this.topCrypto = this.getFallbackCrypto();
        this.cd.detectChanges();
      }
    });

    // 3. CARICAMENTO ETF
    this.marketService.getAssetsByType('ETF').subscribe({
      next: (res) => {
        this.topEtf = this.mergeDati(res, this.getFallbackEtf()).slice(0, 8);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.warn('Errore ETF:', err);
        this.topEtf = this.getFallbackEtf();
        this.cd.detectChanges();
      }
    });

    // 4. CARICAMENTO NOTIZIE FINANZIARIE
    this.marketService.getNews().subscribe({
      next: (res) => {
        // Se l'API restituisce dati validi li usa, altrimenti carica news dimostrative
        if (res && res.length > 0) this.newsList = res;
        else this.usaNewsFinte();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.warn('Errore News:', err);
        this.usaNewsFinte();
        this.cd.detectChanges();
      }
    });
  }

  /**
   * Helper per unire i dati reali del backend con quelli di fallback.
   * Filtra i duplicati basandosi sul simbolo dell'asset per evitare ripetizioni nella UI.
   */
  mergeDati(real: any[], fake: any[]): any[] {
    const safeReal = real || [];
    const combined = [...safeReal, ...fake];
    return combined.filter((item, index, self) =>
      index === self.findIndex((t) => this.pulisciSimbolo(t.symbol) === this.pulisciSimbolo(item.symbol))
    );
  }

  /**
   * Rimuove prefissi o suffissi valutari dai simboli (es. "NASDAQ:AAPL" -> "AAPL").
   * Utile per uniformare i dati provenienti da fonti diverse.
   */
  pulisciSimbolo(simbolo: string): string {
    if (!simbolo) return '';
    let nomePulito = simbolo.includes(':') ? simbolo.split(':')[1] : simbolo;
    return nomePulito.replace('USDT', '').replace('USD', '').replace('EUR', '');
  }

  /**
   * Gestisce l'errore di caricamento delle immagini dei loghi.
   * Se l'URL dell'immagine non è valido, assegna un'icona generica in base al tipo di asset.
   */
  handleImgError(event: any, symbol: string) {
    const cleanSymbol = this.pulisciSimbolo(symbol).toLowerCase();
    const fallbackUrl = symbol.includes('BINANCE') || symbol.includes('CRYPTO')
      ? 'https://cdn-icons-png.flaticon.com/512/12192/12192349.png'
      : 'https://cdn-icons-png.flaticon.com/512/10103/10103216.png';

    if (!event.target.src.includes('flaticon')) {
      event.target.src = fallbackUrl;
    }
  }

  // === METODI DI FALLBACK (DATI STATICI) ===
  // Questi metodi restituiscono dati "hardcoded" per garantire che l'app
  // mostri contenuti anche se il server backend è offline.

  getFallbackStocks(): any[] {
    return [
      { symbol: 'AAPL', name: 'Apple', currentPrice: 185.92, changePercent: 1.25, logoUrl: 'https://logo.clearbit.com/apple.com' },
      { symbol: 'TSLA', name: 'Tesla', currentPrice: 240.50, changePercent: -2.10, logoUrl: 'https://logo.clearbit.com/tesla.com' },
      { symbol: 'NVDA', name: 'Nvidia', currentPrice: 485.00, changePercent: 3.45, logoUrl: 'https://logo.clearbit.com/nvidia.com' },
      { symbol: 'AMZN', name: 'Amazon', currentPrice: 145.20, changePercent: 0.80, logoUrl: 'https://logo.clearbit.com/amazon.com' },
      { symbol: 'MSFT', name: 'Microsoft', currentPrice: 370.10, changePercent: 0.45, logoUrl: 'https://logo.clearbit.com/microsoft.com' },
      { symbol: 'GOOGL', name: 'Google', currentPrice: 138.20, changePercent: -0.30, logoUrl: 'https://logo.clearbit.com/abc.xyz' },
      { symbol: 'META', name: 'Meta', currentPrice: 335.50, changePercent: 1.10, logoUrl: 'https://logo.clearbit.com/meta.com' },
      { symbol: 'NFLX', name: 'Netflix', currentPrice: 450.00, changePercent: -1.05, logoUrl: 'https://logo.clearbit.com/netflix.com' }
    ] as any[];
  }

  getFallbackCrypto(): any[] {
    return [
      { symbol: 'BTC', name: 'Bitcoin', currentPrice: 43500, changePercent: 2.5, logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=029' },
      { symbol: 'ETH', name: 'Ethereum', currentPrice: 2250, changePercent: 1.1, logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=029' },
      { symbol: 'SOL', name: 'Solana', currentPrice: 95.40, changePercent: 5.8, logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=029' },
      { symbol: 'XRP', name: 'Ripple', currentPrice: 0.62, changePercent: -0.5, logoUrl: 'https://cryptologos.cc/logos/xrp-xrp-logo.png?v=029' },
      { symbol: 'BNB', name: 'Binance', currentPrice: 310.20, changePercent: 0.8, logoUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=029' },
      { symbol: 'ADA', name: 'Cardano', currentPrice: 0.55, changePercent: -1.2, logoUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.png?v=029' },
      { symbol: 'AVAX', name: 'Avalanche', currentPrice: 36.50, changePercent: 3.4, logoUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.png?v=029' },
      { symbol: 'DOGE', name: 'Dogecoin', currentPrice: 0.08, changePercent: 4.2, logoUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png?v=029' }
    ] as any[];
  }

  getFallbackEtf(): any[] {
    return [
      { symbol: 'SPY', name: 'SPDR S&P 500', currentPrice: 470.10, changePercent: 0.5, logoUrl: 'https://logo.clearbit.com/ssga.com' },
      { symbol: 'QQQ', name: 'Invesco QQQ', currentPrice: 405.20, changePercent: 0.9, logoUrl: 'https://logo.clearbit.com/invesco.com' },
      { symbol: 'VTI', name: 'Vanguard Total', currentPrice: 235.50, changePercent: 0.4, logoUrl: 'https://logo.clearbit.com/vanguard.com' },
      { symbol: 'VOO', name: 'Vanguard 500', currentPrice: 430.00, changePercent: 0.45, logoUrl: 'https://logo.clearbit.com/vanguard.com' },
      { symbol: 'GLD', name: 'SPDR Gold', currentPrice: 185.00, changePercent: -0.2, logoUrl: 'https://logo.clearbit.com/spdrgoldshares.com' },
      { symbol: 'IVV', name: 'iShares Core', currentPrice: 475.00, changePercent: 0.5, logoUrl: 'https://logo.clearbit.com/blackrock.com' },
      { symbol: 'ARKK', name: 'ARK Innovation', currentPrice: 45.20, changePercent: -2.5, logoUrl: 'https://logo.clearbit.com/ark-funds.com' },
      { symbol: 'DIA', name: 'SPDR Dow Jones', currentPrice: 370.50, changePercent: 0.1, logoUrl: 'https://logo.clearbit.com/ssga.com' }
    ] as any[];
  }

  /**
   * Popola la lista delle news con dati dimostrativi.
   */
  usaNewsFinte() {
    this.newsList = [
      {
        title: 'Fed annuncia tassi invariati: mercati in lieve rialzo',
        url: '#',
        source: { name: 'Il Sole 24 Ore' },
        urlToImage: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=1000'
      },
      {
        title: 'Bitcoin supera una nuova resistenza tecnica',
        url: '#',
        source: { name: 'CoinDesk' },
        urlToImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=1000'
      },
      {
        title: 'Trimestrali Tech: sorprese positive da Wall Street',
        url: '#',
        source: { name: 'Bloomberg' },
        urlToImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1000'
      }
    ];
  }
}
