import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- 1. Importalo
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketService, MarketAsset } from '../market.service';
import { UserService } from '../../../services/user.service';
import { RouterModule } from '@angular/router';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './asset-list.html',
  styleUrls: ['./asset-list.css']
})
export class AssetListComponent implements OnInit {

  assets: MarketAsset[] = [];
  currentType: string = '';
  loading = false;

  isTradeModalOpen = false;
  isProcessing = false;
  selectedAsset: any = null;
  tradeAction: 'BUY' | 'SELL' = 'BUY';
  tradeQuantity: number = 0; // Quantità inserita
  currentHolding: number = 0;

  constructor(
    private route: ActivatedRoute,
    private marketService: MarketService,
    private cd: ChangeDetectorRef,
    private userService: UserService, // <--- NUOVO
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.currentType = data['type'];
      this.loadAssets();
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

        console.log(`Dati caricati per ${this.currentType}:`, this.assets);
      },
      error: (err) => {
        console.error("Errore download market:", err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }
  openTradePanel(asset: any) {
    this.selectedAsset = asset;
    this.tradeAction = 'BUY';
    this.tradeQuantity = 0; // Reset input
    this.isTradeModalOpen = true;
  }

  closeTradePanel() {
    this.isTradeModalOpen = false;
    this.selectedAsset = null;
  }

  setAction(action: 'BUY' | 'SELL') {
    this.tradeAction = action;
  }

  get estimatedTotal(): number {
    if (!this.selectedAsset || !this.tradeQuantity) return 0;
    return this.selectedAsset.currentPrice * this.tradeQuantity;
  }

  confirmTrade() {
    // 1. Validazione input
    if (!this.selectedAsset || this.tradeQuantity <= 0) return;

    // 2. Recupero ID Utente dal Service
    const currentUserId = this.userService.getCurrentUserId();

    // Se l'utente non è loggato, lo mandiamo al login
    if (!currentUserId) {
      alert("Devi effettuare il login per fare trading!");
      this.router.navigate(['/login']);
      return;
    }

    this.isProcessing = true;

    // 3. Creazione Oggetto per il Backend (TradeRequestDTO)
    const request = {
      userId: currentUserId,                 // ID Utente reale
      symbol: this.selectedAsset.symbol,     // Simbolo (es. AAPL)
      assetName: this.selectedAsset.name,    // Nome (es. Apple Inc.)
      quantity: this.tradeQuantity,          // Quante ne compri
      priceAtTransaction: this.selectedAsset.currentPrice, // Prezzo attuale
      action: this.tradeAction               // "BUY" o "SELL"
    };

    console.log('Invio Ordine al Backend:', request);

// CAMBIA QUESTO: da this.marketService.buyAsset(request) a:
    this.marketService.tradeAsset(request).subscribe({
      next: (response) => {
        console.log('Risposta Backend:', response);
        this.isProcessing = false;
        this.closeTradePanel();

        // Messaggio di successo
        const tipoOperazione = this.tradeAction === 'BUY' ? 'Acquisto' : 'Vendita';
        alert(`✅ ${tipoOperazione} di ${this.selectedAsset.symbol} completato con successo!`);

        // Qui potresti chiamare this.loadAssets() se volessi aggiornare qualcosa,
        // ma per ora va bene così.
      },
      error: (err) => {
        console.error('Errore Backend:', err);
        this.isProcessing = false;

        // Mostra il messaggio di errore specifico che arriva da Java (es. "Fondi insufficienti")
        const errorMsg = err.error && err.error.error ? err.error.error : "Errore durante la transazione";
        alert("❌ Transazione fallita: " + errorMsg);
      }
    });
  }


}
