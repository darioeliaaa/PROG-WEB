import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { MarketService, MarketAsset } from '../market.service';

import { UserService } from '../../../services/user.service';

import { PortfolioService } from '../../../services/portfolio.service';

@Component({

  selector: 'app-asset-list',

  standalone: true,

  imports: [CommonModule, RouterModule, FormsModule],

  templateUrl: './asset-list.html',

  styleUrls: ['./asset-list.css']

})

export class AssetListComponent implements OnInit {


  assets: MarketAsset[] = [];

  currentType: string = '';

  loading = false;

  isLoggedIn: boolean = false;

  showLoginModal = false;

  myPortfolioAssets: Map<string, number> = new Map();

  isTradeModalOpen = false;

  isProcessing = false;

  selectedAsset: any = null;

  tradeAction: 'BUY' | 'SELL' = 'BUY';

  tradeQuantity: number | null = null;

  tradeAmount: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private marketService: MarketService,
    private userService: UserService,
    private portfolioService: PortfolioService,

    private router: Router,
    private cd: ChangeDetectorRef
  ) {
  }


  ngOnInit() {

    const userId = this.userService.getCurrentUserId();

    this.isLoggedIn = !!userId;


    this.route.data.subscribe(data => {

      this.currentType = data['type'];

      this.loadAssets();

      if (this.isLoggedIn) {

        this.loadMyPortfolio();

      }

    });

  }


  closeLoginModal() {

    this.showLoginModal = false;

  }

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


  loadAssets() {

    this.loading = true;

    this.assets = [];

    this.marketService.getAssetsByType(this.currentType).subscribe({

      next: (res) => {

        this.assets = res;

        this.loading = false;

        this.cd.detectChanges();

      },

      error: (err) => {
        console.error("Errore download market:", err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  openTradePanel(asset: any) {

    if (!this.userService.getCurrentUserId()) {

      this.showLoginModal = true;

      return;

    }

    this.selectedAsset = asset;

    this.tradeAction = 'BUY';

    this.tradeQuantity = null;

    this.tradeAmount = null;

    this.isTradeModalOpen = true;

  }


  closeTradePanel() {

    this.isTradeModalOpen = false;

    this.selectedAsset = null;

  }


  setAction(action: 'BUY' | 'SELL') {

    this.tradeAction = action;

  }

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


  confirmTrade() {

    if (!this.selectedAsset || !this.tradeQuantity || this.tradeQuantity <= 0) return;

    const currentUserId = this.userService.getCurrentUserId();

    if (!currentUserId) {

      alert("Devi effettuare il login per fare trading!");

      this.router.navigate(['/login']);

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


    console.log('Invio Ordine al Backend:', request);


    this.marketService.tradeAsset(request).subscribe({

      next: (response) => {

        this.isProcessing = false;


        const tipoOperazione = this.tradeAction === 'BUY' ? 'Acquisto' : 'Vendita';

        alert(`✅ ${tipoOperazione} di ${this.selectedAsset.symbol} completato con successo!`);


        this.closeTradePanel();


        this.loadMyPortfolio();

        this.loadAssets();

        this.cd.detectChanges();

      },

      error: (err) => {

        console.error('Errore Backend:', err);

        this.isProcessing = false;


        const errorMsg = err.error && err.error.error ? err.error.error : "Errore durante la transazione";

        alert("❌ Transazione fallita: " + errorMsg);

      }

    });

  }


  handleImgError(event: any, symbol: string) {

    const isCrypto = symbol.includes('BINANCE') || this.currentType === 'CRYPTO';


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
  goToLogin() {
    this.router.navigate(['/login']);
  }
}

export class AssetList {
}
