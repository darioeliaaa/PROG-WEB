import { Component, OnInit, AfterViewInit, Input, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

declare const TradingView: any; // Diciamo a TypeScript che TradingView esiste

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-chart.html',
  styleUrl: './stock-chart.css'
})
export class StockChart implements OnInit, AfterViewInit {

  // Riceviamo il simbolo dall'URL (es. /chart/AAPL)
  symbol: string = 'NASDAQ:AAPL';

  @ViewChild('containerDiv', { static: false }) containerDiv!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Recupera il simbolo dalla rotta se presente
    this.route.paramMap.subscribe(params => {
      const sym = params.get('symbol');
      if (sym) {
        // TradingView spesso vuole il mercato (es. NASDAQ:AAPL).
        // Se non lo sai, passa solo il simbolo, spesso funziona lo stesso.
        this.symbol = sym;
      }
    });
  }

  ngAfterViewInit() {
    // Eseguiamo solo se siamo nel browser (non in server-side rendering)
    if (isPlatformBrowser(this.platformId)) {
      this.loadTradingViewScript();
    }
  }

  loadTradingViewScript() {
    // Controlliamo se lo script è già stato caricato per non duplicarlo
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
        "height": "100%", // Si adatta al contenitore
        "symbol": this.symbol,
        "interval": "D", // Giornaliero
        "timezone": "Europe/Rome",
        "theme": "dark", // TEMA SCURO per abbinarsi alla tua app
        "style": "1", // 1 = Candele
        "locale": "it",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true, // Permetti di cambiare azione
        "container_id": "tradingview_chart", // Deve coincidere con l'ID nell'HTML
        "hide_side_toolbar": false, // Mostra gli strumenti di disegno (IMPORTANTE PER LO STUDIO)
        "details": true,
        "hotlist": true,
        "calendar": true,
        // Personalizzazione colori per matchare il tuo CSS (opzionale)
        /*
        "overrides": {
           "paneProperties.background": "#1e1e2d",
           "scalesProperties.textColor": "#AAA"
        }
        */
      });
    }
  }
}
