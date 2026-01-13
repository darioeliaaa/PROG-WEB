import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Fondamentale per *ngFor e *ngIf
import { RouterModule } from '@angular/router';
import { MarketService, MarketAsset } from '../market.service';

@Component({
  selector: 'app-market-home',
  standalone: true,
  imports: [CommonModule, RouterModule], // CommonModule risolve gli errori dei direttivi
  templateUrl: './market-home.html',
  styleUrls: ['./market-home.css']
})
export class MarketHomeComponent implements OnInit {

  // Variabili per i dati di mercato
  topStocks: MarketAsset[] = [];
  topCrypto: MarketAsset[] = [];
  topEtf: MarketAsset[] = [];

  // === QUESTA È LA VARIABILE CHE MANCAVA ===
  newsList: any[] = [];

  loading = true;

  constructor(
    private marketService: MarketService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.caricaAnteprime();
    this.caricaNotizie();
  }

  caricaNotizie() {
    this.marketService.getNews().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          console.warn('Backend ha risposto con lista vuota. Uso dati di test.');
          this.usaDatiFinti();
        } else {
          this.newsList = data;
        }
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Errore chiamata news:', err);
        this.usaDatiFinti();
        this.cd.detectChanges();
      }
    });
  }

  usaDatiFinti() {
    this.newsList = [
      {
        title: 'Fed annuncia nuovi tassi di interesse: mercati in rialzo',
        url: '#',
        source: { name: 'Il Sole 24 Ore' }
      },
      {
        title: 'Bitcoin supera i 45.000$ in un rally inaspettato',
        url: '#',
        source: { name: 'CoinDesk' }
      },
      {
        title: 'Apple lancia il nuovo visore: ecco le reazioni di Wall Street',
        url: '#',
        source: { name: 'Bloomberg' }
      }
    ];
  }

  caricaAnteprime() {
    this.loading = true;

    this.marketService.getAssetsByType('STOCK').subscribe({
      next: (res) => {
        this.topStocks = res.slice(0, 8);
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });

    this.marketService.getAssetsByType('CRYPTO').subscribe({
      next: (res) => {
        this.topCrypto = res.slice(0, 8);
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });

    this.marketService.getAssetsByType('ETF').subscribe({
      next: (res) => {
        this.topEtf = res.slice(0, 8);
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }
}
