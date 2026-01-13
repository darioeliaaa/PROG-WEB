import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- 1. Importalo
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketService, MarketAsset } from '../market.service';
import { RouterModule } from '@angular/router';

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
  selectedAsset: MarketAsset | null = null;
  tradeAction: 'BUY' | 'SELL' = 'BUY'; // Azione di default
  tradeQuantity: number = 1;
  isProcessing = false; // Per lo spinner sul bottone conferma

  constructor(
    private route: ActivatedRoute,
    private marketService: MarketService,
    private cd: ChangeDetectorRef // <--- 2. Iniettalo qui
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

        // <--- 3. FORZA L'AGGIORNAMENTO GRAFICO
        this.cd.detectChanges();

        console.log(`Dati caricati per ${this.currentType}:`, this.assets);
      },
      error: (err) => {
        console.error("Errore download market:", err);
        this.loading = false;
        this.cd.detectChanges(); // Anche in caso di errore
      }
    });
  }
  openTradePanel(asset: MarketAsset) {
    this.selectedAsset = asset;
    this.tradeQuantity = 1; // Reset quantità
    this.tradeAction = 'BUY'; // Reset azione
    this.isTradeModalOpen = true;
  }

  // CHIUDI IL PANNELLO
  closeTradePanel() {
    this.isTradeModalOpen = false;
    this.selectedAsset = null;
  }

  // IMPOSTA AZIONE (Compra/Vendi)
  setAction(action: 'BUY' | 'SELL') {
    this.tradeAction = action;
  }

  // CALCOLA TOTALE LIVE
  get estimatedTotal(): number {
    if (!this.selectedAsset) return 0;
    return this.selectedAsset.currentPrice * this.tradeQuantity;
  }

  // ESEGUI TRANSAZIONE
  confirmTrade() {
    if (!this.selectedAsset || this.tradeQuantity <= 0) return;

    this.isProcessing = true;

    const request = {
      assetSymbol: this.selectedAsset.symbol,
      amount: this.estimatedTotal, // O la quantità, dipende dal tuo backend
      quantity: this.tradeQuantity,
      type: this.tradeAction == 'BUY' ? 'ENTRATA' : 'USCITA', // Adatta ai tuoi enum Java
      priceAtTransaction: this.selectedAsset.currentPrice
    };
    console.log('Invio Ordine:', request);

    // Simuliamo una chiamata (Sostituisci con this.marketService.executeTrade(request).subscribe...)
    setTimeout(() => {
      alert(`Ordine ${this.tradeAction} eseguito con successo per ${this.selectedAsset?.symbol}!`);
      this.isProcessing = false;
      this.closeTradePanel();
    }, 1500);
  }


}
