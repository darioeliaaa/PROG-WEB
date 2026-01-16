import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Aggiunto Router
import { FormsModule } from '@angular/forms'; // FONDAMENTALE per ngModel

// --- SERVIZI NECESSARI PER IL TRADE ---
import { MarketService, MarketAsset } from '../market.service';
import { UserService } from '../../../services/user.service';
import { PortfolioService } from '../../../services/portfolio.service';

declare const TradingView: any;

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Aggiunto FormsModule e RouterModule
  templateUrl: './stock-chart.html',
  styleUrl: './stock-chart.css'
})
export class StockChart implements OnInit, AfterViewInit {

  symbol: string = 'NASDAQ:AAPL';
  @ViewChild('containerDiv', { static: false }) containerDiv!: ElementRef;

  // --- VARIABILI PER IL TRADE (COPIATE DA ASSET-LIST) ---
  isTradeModalOpen = false;
  isProcessing = false;
  selectedAsset: any = null; // Conterrà i dati dell'asset corrente (Prezzo, nome, ecc)
  tradeAction: 'BUY' | 'SELL' = 'BUY';
  tradeQuantity: number | null = null;
  tradeAmount: number | null = null;
  myPortfolioAssets: Map<string, number> = new Map();
  showLoginModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Necessario per redirect
    private marketService: MarketService,
    private userService: UserService,
    private portfolioService: PortfolioService,
    private cd: ChangeDetectorRef, // Per aggiornare la UI
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const sym = params.get('symbol');
      if (sym) {
        this.symbol = sym;
        // Appena ho il simbolo, cerco i dati aggiornati (prezzo, ecc) per il box trade
        this.loadAssetDetails(sym);
      }
    });

    // Carico portafoglio se utente loggato
    if (this.userService.getCurrentUserId()) {
      this.loadMyPortfolio();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTradingViewScript();
    }
  }

  goBack() {
    history.back();
  }

  // ===========================================================
  //  LOGICA TRADE (PORTATA DA ASSET-LIST)
  // ===========================================================

  // 1. Recupero Dati Asset (Necessario perché qui non siamo in una lista)
  loadAssetDetails(fullSymbol: string) {
    // Cerco di capire il tipo per scaricare la lista giusta (Stocks o Crypto)
    // Se non lo so per certo, potrei provare entrambi o fare una chiamata specifica getAsset(symbol)
    // Qui assumo una logica semplice o uso 'STOCK' come default se non capisco
    const type = fullSymbol.includes('BINANCE') ? 'CRYPTO' : 'STOCK';

    this.marketService.getAssetsByType(type).subscribe(assets => {
      // Trovo l'asset corrispondente nella lista
      const found = assets.find(a => a.symbol === fullSymbol);
      if (found) {
        this.selectedAsset = found;
      } else {
        // Fallback se non trovato in lista (creo oggetto finto o gestisco errore)
        console.warn("Asset non trovato nel market list, impossibile tradare con prezzo esatto.");
      }
    });
  }

  // 2. Recupero Portafoglio Utente
  loadMyPortfolio() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    this.portfolioService.getPortfolio(userId).subscribe({
      next: (data) => {
        if (data && data.assets) {
          data.assets.forEach(asset => {
            this.myPortfolioAssets.set(asset.symbol, asset.quantity);
          });
        }
      }
    });
  }

  // 3. Apertura Modale
  openTradePanel() {
    if (!this.userService.getCurrentUserId()) {
      this.showLoginModal = true;
      return;
    }

    // Se non abbiamo ancora i dati dell'asset (prezzo), proviamo a ricaricarli
    if (!this.selectedAsset) {
      this.loadAssetDetails(this.symbol);
    }

    this.tradeAction = 'BUY';
    this.tradeQuantity = null;
    this.tradeAmount = null;
    this.isTradeModalOpen = true;
  }

  closeTradePanel() {
    this.isTradeModalOpen = false;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  setAction(action: 'BUY' | 'SELL') {
    this.tradeAction = action;
    // Ricalcolo se cambio azione (opzionale, ma utile per UX colori)
  }

  // 4. Calcolatori
  onQuantityChange() {
    if (this.tradeQuantity && this.selectedAsset) {
      this.tradeAmount = Number((this.tradeQuantity * this.selectedAsset.currentPrice).toFixed(2));
    } else {
      this.tradeAmount = null;
    }
  }

  onAmountChange() {
    if (this.tradeAmount && this.selectedAsset) {
      this.tradeQuantity = Number((this.tradeAmount / this.selectedAsset.currentPrice).toFixed(4));
    } else {
      this.tradeQuantity = null;
    }
  }

  getMyQuantity(symbol: string): number {
    return this.myPortfolioAssets.get(symbol) || 0;
  }

  // 5. Conferma Ordine
  confirmTrade() {
    if (!this.selectedAsset || !this.tradeQuantity || this.tradeQuantity <= 0) return;

    const currentUserId = this.userService.getCurrentUserId();
    if (!currentUserId) {
      this.showLoginModal = true;
      return;
    }

    this.isProcessing = true;

    const request = {
      userId: currentUserId,
      symbol: this.selectedAsset.symbol,
      assetName: this.selectedAsset.name,
      quantity: this.tradeQuantity,
      priceAtTransaction: this.selectedAsset.currentPrice,
      action: this.tradeAction
    };

    this.marketService.tradeAsset(request).subscribe({
      next: (response) => {
        this.isProcessing = false;
        const tipoOperazione = this.tradeAction === 'BUY' ? 'Acquisto' : 'Vendita';
        alert(`✅ ${tipoOperazione} di ${this.pulisciSimbolo(this.selectedAsset.symbol)} completato!`);

        this.closeTradePanel();
        this.loadMyPortfolio(); // Ricarico portafoglio aggiornato
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Errore Backend:', err);
        this.isProcessing = false;
        const errorMsg = err.error && err.error.error ? err.error.error : "Errore transazione";
        alert("❌ Transazione fallita: " + errorMsg);
      }
    });
  }

  // Utility Immagini
  handleImgError(event: any, symbol: string) {
    if (!symbol) return;
    const isCrypto = symbol.includes('BINANCE');
    const fallbackIcon = isCrypto
      ? 'https://cdn-icons-png.flaticon.com/512/12192/12192349.png'
      : 'https://cdn-icons-png.flaticon.com/512/10103/10103216.png';

    const currentSrc = event.target.src;
    if (isCrypto && !currentSrc.includes('cryptologos.cc')) {
      const cleanName = this.pulisciSimbolo(symbol).toLowerCase();
      event.target.src = `https://cryptologos.cc/logos/${cleanName}-${cleanName}-logo.png?v=029`;
    } else if (!isCrypto && !currentSrc.includes('clearbit')) {
      event.target.src = `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
    } else {
      event.target.src = fallbackIcon;
    }
    event.target.onerror = null;
  }

  pulisciSimbolo(simbolo: string): string {
    if (!simbolo) return '';
    let nomePulito = simbolo.includes(':') ? simbolo.split(':')[1] : simbolo;
    return nomePulito.replace('USDT', '').replace('USD', '').replace('EUR', '');
  }

  // ===========================================================
  //  FINE LOGICA TRADE
  // ===========================================================

  loadTradingViewScript() {
    if (document.getElementById('tv-widget-script')) {
      this.initWidget();
      return;
    }
    const script = document.createElement('script');
    script.id = 'tv-widget-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => this.initWidget();
    document.head.appendChild(script);
  }

  initWidget() {
    if (typeof TradingView !== 'undefined' && this.containerDiv) {
      new TradingView.widget({
        "width": "100%",
        "height": "100%",
        "symbol": this.symbol,
        "interval": "D",
        "timezone": "Europe/Rome",
        "theme": "light",
        "style": "1",
        "locale": "it",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_chart",
        "hide_side_toolbar": false,
        "details": true,
        "hotlist": true,
        "calendar": true,
        "overrides": {
          "paneProperties.background": "#ffffff",
          "paneProperties.vertGridProperties.color": "rgba(101, 101, 248, 0.05)",
          "paneProperties.horzGridProperties.color": "rgba(101, 101, 248, 0.05)",
          "mainSeriesProperties.candleStyle.upColor": "#2ecc71",
          "mainSeriesProperties.candleStyle.downColor": "#e74c3c",
          "mainSeriesProperties.candleStyle.wickUpColor": "#2ecc71",
          "mainSeriesProperties.candleStyle.wickDownColor": "#e74c3c",
          "mainSeriesProperties.candleStyle.borderUpColor": "#2ecc71",
          "mainSeriesProperties.candleStyle.borderDownColor": "#e74c3c"
        }
      });
    }
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
