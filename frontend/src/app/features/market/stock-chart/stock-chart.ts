import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

declare const TradingView: any;

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [
    CommonModule],
  templateUrl: './stock-chart.html',
  styleUrl: './stock-chart.css'
})
export class StockChart implements OnInit, AfterViewInit {

  symbol: string = 'NASDAQ:AAPL';
  @ViewChild('containerDiv', { static: false }) containerDiv!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const sym = params.get('symbol');
      if (sym) this.symbol = sym;
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTradingViewScript();
    }
  }

  // --- ECCO LA FUNZIONE CHE MANCAVA ---
  goBack() {
    history.back();
  }
  // ------------------------------------

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
}
