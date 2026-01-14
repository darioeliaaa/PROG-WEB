import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketService, MarketAsset } from '../market.service';
import { UserService } from '../../../services/user.service';
import { PortfolioService } from '../../../services/portfolio.service'; // <--- IMPORTANTE

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

  // Dati Utente: Mappa Simbolo -> Quantità (Es. "AAPL" -> 10)
  myPortfolioAssets: Map<string, number> = new Map();

  // Variabili Modale Trade
  isTradeModalOpen = false;
  isProcessing = false;
  selectedAsset: any = null;
  tradeAction: 'BUY' | 'SELL' = 'BUY';

  // Variabili per il calcolo doppio
  tradeQuantity: number | null = null; // Quante azioni
  tradeAmount: number | null = null;   // Quanti euro

  constructor(
    private route: ActivatedRoute,
    private marketService: MarketService,
    private userService: UserService,
    private portfolioService: PortfolioService, // <--- INIETTATO
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.currentType = data['type'];
      this.loadAssets();
      this.loadMyPortfolio(); // <--- Carichiamo il portafoglio all'avvio
    });
  }

  // 1. SCARICA IL PORTAFOGLIO PER SAPERE COSA HAI
  loadMyPortfolio() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    this.portfolioService.getPortfolio(userId).subscribe({
      next: (data) => {
        // Creiamo una mappa veloce per cercare i simboli
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

  // --- GESTIONE MODALE E CALCOLI ---

  openTradePanel(asset: any) {
    this.selectedAsset = asset;
    this.tradeAction = 'BUY';
    this.tradeQuantity = null; // Reset
    this.tradeAmount = null;   // Reset
    this.isTradeModalOpen = true;
  }

  closeTradePanel() {
    this.isTradeModalOpen = false;
    this.selectedAsset = null;
  }

  setAction(action: 'BUY' | 'SELL') {
    this.tradeAction = action;
  }

  // 🔢 CALCOLO 1: Scrivo la Quantità -> Calcola gli Euro
  onQuantityChange() {
    if (this.tradeQuantity && this.selectedAsset) {
      // Euro = Quantità * Prezzo (Arrotondato a 2 decimali)
      this.tradeAmount = Number((this.tradeQuantity * this.selectedAsset.currentPrice).toFixed(2));
    } else {
      this.tradeAmount = null;
    }
  }

  // 💶 CALCOLO 2: Scrivo gli Euro -> Calcola la Quantità
  onAmountChange() {
    if (this.tradeAmount && this.selectedAsset) {
      // Quantità = Euro / Prezzo (Arrotondato a 4 decimali per crypto/frazionari)
      this.tradeQuantity = Number((this.tradeAmount / this.selectedAsset.currentPrice).toFixed(4));
    } else {
      this.tradeQuantity = null;
    }
  }

  // Helper per l'HTML: Restituisce quante azioni ho di questo asset
  getMyQuantity(symbol: string): number {
    return this.myPortfolioAssets.get(symbol) || 0;
  }

  confirmTrade() {
    // 1. Validazione input
    if (!this.selectedAsset || !this.tradeQuantity || this.tradeQuantity <= 0) return;

    // 2. Recupero ID Utente
    const currentUserId = this.userService.getCurrentUserId();
    if (!currentUserId) {
      alert("Devi effettuare il login per fare trading!");
      this.router.navigate(['/login']);
      return;
    }

    // Attivo lo spinner di caricamento sul bottone
    this.isProcessing = true;

    // 3. Creazione Oggetto richiesta
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
        // --- ERRORE ---
        console.error('Errore Backend:', err);
        this.isProcessing = false;

        const errorMsg = err.error && err.error.error ? err.error.error : "Errore durante la transazione";
        alert("❌ Transazione fallita: " + errorMsg);
      }
    });
  }
  pulisciSimbolo(simbolo: string): string {
    if (!simbolo) return '';

    // 1. Prende solo quello dopo i due punti (es. toglie "BINANCE:")
    let nomePulito = simbolo.includes(':') ? simbolo.split(':')[1] : simbolo;

    // 2. Toglie suffissi comuni come USDT, USD, EUR
    // Nota: l'ordine è importante (USDT prima di USD)
    return nomePulito.replace('USDT', '').replace('USD', '').replace('EUR', '');
  }
}
