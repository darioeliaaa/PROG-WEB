import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- 1. Importa ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketService, MarketAsset } from '../market.service';

@Component({
  selector: 'app-market-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './market-home.html',
  styleUrls: ['./market-home.css']
})
export class MarketHomeComponent implements OnInit {

  topStocks: MarketAsset[] = [];
  topCrypto: MarketAsset[] = [];
  topEtf: MarketAsset[] = [];

  loading = true;

  constructor(
    private marketService: MarketService,
    private cd: ChangeDetectorRef // <--- 2. Iniettalo nel costruttore
  ) {}

  ngOnInit() {
    this.caricaAnteprime();
  }

  caricaAnteprime() {
    this.loading = true;

    // 1. Carica STOCKS
    this.marketService.getAssetsByType('STOCK').subscribe({
      next: (res) => {
        this.topStocks = res.slice(0, 8);
        this.cd.detectChanges(); // <--- 3. Forza l'aggiornamento grafico
      },
      error: (err) => console.error(err)
    });

    // 2. Carica CRYPTO
    this.marketService.getAssetsByType('CRYPTO').subscribe({
      next: (res) => {
        this.topCrypto = res.slice(0, 8);
        this.cd.detectChanges(); // <--- 3. Forza l'aggiornamento grafico
      },
      error: (err) => console.error(err)
    });

    // 3. Carica ETF
    this.marketService.getAssetsByType('ETF').subscribe({
      next: (res) => {
        this.topEtf = res.slice(0, 8);
        this.loading = false; // Nasconde lo spinner
        this.cd.detectChanges(); // <--- 3. Forza l'aggiornamento grafico
      },
      error: (err) => {
        console.error(err);
        this.loading = false; // Nasconde lo spinner anche se errore
        this.cd.detectChanges();
      }
    });
  }
}
