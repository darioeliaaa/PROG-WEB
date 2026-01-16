import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// --- SERVIZI NECESSARI PER IL TRADE ---
import { MarketService, MarketAsset } from '../market.service';
import { UserService } from '../../../services/user.service';
import { PortfolioService } from '../../../services/portfolio.service';

// Dichiarazione globale per la libreria esterna di TradingView caricata via script
declare const TradingView: any;

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './stock-chart.html',
  styleUrl: './stock-chart.css'
})
export class StockChart implements OnInit, AfterViewInit {

  // Simbolo di default (es. Apple su NASDAQ)
  symbol: string = 'NASDAQ:AAPL';

  // Riferimento all'elemento del DOM dove verrà iniettato il widget del grafico
  @ViewChild('containerDiv', { static: false }) containerDiv!: ElementRef;

  // --- VARIABILI PER LA LOGICA DI TRADING ---
  isTradeModalOpen = false;       // Controllo visibilità modale di compravendita
  isProcessing = false;           // Stato di caricamento durante l'invio dell'ordine
  selectedAsset: any = null;      // Dati dell'asset corrente recuperati dal MarketService
  tradeAction: 'BUY' | 'SELL' = 'BUY'; // Tipo di operazione selezionata
  tradeQuantity: number | null = null; // Quantità di titoli da scambiare
  tradeAmount: number | null = null;   // Controvalore monetario dello scambio
  myPortfolioAssets: Map<string, number> = new Map(); // Mappa locale per conoscere le quantità già possedute
  showLoginModal = false;         // Controllo per invitare l'utente al login se prova a tradare da ospite

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketService: MarketService,
    private userService: UserService,
    private portfolioService: PortfolioService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Inizializzazione:
   * 1. Ascolta i cambiamenti del parametro 'symbol' nell'URL.
   * 2. Carica i dettagli dell'asset per popolare il box di trading.
   * 3. Se l'utente è loggato, carica il suo portafoglio.
   */
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const sym = params.get('symbol');
      if (sym) {
        this.symbol = sym;
        this.loadAssetDetails(sym);
      }
    });

    if (this.userService.getCurrentUserId()) {
      this.loadMyPortfolio();
    }
  }

  /**
   * Dopo l'inizializzazione della vista, carica il widget se siamo nel browser.
   */
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTradingViewScript();
    }
  }

  // Torna alla pagina precedente della cronologia
  goBack() {
    history.back();
  }

  // ===========================================================
  //  LOGICA TRADE
  // ===========================================================

  /**
   * Recupera i dati dell'asset (prezzo attuale, nome, etc) dalla lista globale.
   * Questo è necessario per calcolare i controvalori nel modale di trading.
   */
  loadAssetDetails(fullSymbol: string) {
    // Determina se è un asset Crypto o Stock basandosi sul fornitore (es. Binance)
    const type = fullSymbol.includes('BINANCE') ? 'CRYPTO' : 'STOCK';

    this.marketService.getAssetsByType(type).subscribe(assets => {
      const found = assets.find(a => a.symbol === fullSymbol);
      if (found) {
        this.selectedAsset = found;
      } else {
        console.warn("Asset non trovato nel market list.");
      }
    });
  }

  /**
   * Carica la composizione attuale del portafoglio utente.
   * Serve per validare le vendite (non puoi vendere ciò che non hai).
   */
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

  /**
   * Apre il pannello di compravendita. Se non loggato, mostra il prompt di accesso.
   */
  openTradePanel() {
    if (!this.userService.getCurrentUserId()) {
      this.showLoginModal = true;
      return;
    }

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

  // Cambia la modalità tra Acquisto e Vendita
  setAction(action: 'BUY' | 'SELL') {
    this.tradeAction = action;
  }

  /**
   * Calcola il costo totale (Amount) basandosi sulla quantità inserita.
   */
  onQuantityChange() {
    if (this.tradeQuantity && this.selectedAsset) {
      this.tradeAmount = Number((this.tradeQuantity * this.selectedAsset.currentPrice).toFixed(2));
    } else {
      this.tradeAmount = null;
    }
  }

  /**
   * Calcola la quantità di titoli basandosi sull'importo monetario inserito.
   */
  onAmountChange() {
    if (this.tradeAmount && this.selectedAsset) {
      this.tradeQuantity = Number((this.tradeAmount / this.selectedAsset.currentPrice).toFixed(4));
    } else {
      this.tradeQuantity = null;
    }
  }

  // Ritorna la quantità posseduta di un determinato asset
  getMyQuantity(symbol: string): number {
    return this.myPortfolioAssets.get(symbol) || 0;
  }

  /**
   * Invia l'ordine di acquisto o vendita al backend.
   */
  confirmTrade() {
    if (!this.selectedAsset || !this.tradeQuantity || this.tradeQuantity <= 0) return;

    const currentUserId = this.userService.getCurrentUserId();
    if (!currentUserId) {
      this.showLoginModal = true;
      return;
    }

    this.isProcessing = true;

    // Preparazione dell'oggetto richiesta per il MarketService
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
        this.loadMyPortfolio(); // Ricarica i dati per riflettere la modifica al portafoglio
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

  /**
   * Gestisce il caricamento fallito delle immagini degli asset (loghi aziendali).
   * Prova diverse fonti (Clearbit per stock, CryptoLogos per crypto) prima di usare un fallback.
   */
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

  /**
   * Rimuove prefissi (es. NASDAQ:) e suffissi valutari per ottenere il solo Ticker.
   */
  pulisciSimbolo(simbolo: string): string {
    if (!simbolo) return '';
    let nomePulito = simbolo.includes(':') ? simbolo.split(':')[1] : simbolo;
    return nomePulito.replace('USDT', '').replace('USD', '').replace('EUR', '');
  }

  // ===========================================================
  //  LOGICA TRADINGVIEW (WIDGET ESTERNO)
  // ===========================================================

  /**
   * Carica dinamicamente lo script di TradingView se non è già presente nell'head.
   */
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

  /**
   * Inizializza il widget avanzato con impostazioni personalizzate (candele, griglia, fuso orario).
   */
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
}
