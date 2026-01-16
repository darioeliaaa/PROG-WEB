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

  // Array degli asset scaricati dal mercato
  assets: MarketAsset[] = [];
  // Tipologia corrente (es. 'STOCK', 'CRYPTO') passata dalle rotte
  currentType: string = '';
  // Stati UI per il caricamento e il controllo accessi
  loading = false;
  isLoggedIn: boolean = false;
  showLoginModal = false;

  /** * Mappa per l'accesso rapido alle quantità possedute.
   * Permette di mostrare all'utente quanti titoli ha già mentre ne visualizza altri.
   */
  myPortfolioAssets: Map<string, number> = new Map();

  // Gestione dello stato del modale di trading
  isTradeModalOpen = false; // Apre/chiude il popup di compravendita
  isProcessing = false;     // Stato di caricamento durante l'invio dell'ordine (spinner sul bottone)
  selectedAsset: any = null; // L'asset su cui l'utente ha cliccato per negoziare
  tradeAction: 'BUY' | 'SELL' = 'BUY'; // Azione selezionata (Acquisto o Vendita)

  // Variabili per il calcolo reattivo del form di trading
  tradeQuantity: number | null = null; // Input dell'utente: numero di azioni/crypto
  tradeAmount: number | null = null;   // Input dell'utente: valore totale in euro

  constructor(
    private route: ActivatedRoute,
    private marketService: MarketService,
    private userService: UserService,
    private portfolioService: PortfolioService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  /**
   * Inizializzazione:
   * 1. Verifica la sessione utente.
   * 2. Ascolta i cambiamenti della rotta per caricare la categoria corretta.
   * 3. Carica il portafoglio se l'utente è autenticato.
   */
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

  // Chiude il popup che invita al login
  closeLoginModal() {
    this.showLoginModal = false;
  }

  /**
   * Recupera le posizioni aperte dell'utente per validare le vendite
   * e mostrare le quantità possedute nella lista.
   */
  loadMyPortfolio() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    this.portfolioService.getPortfolio(userId).subscribe({
      next: (data) => {
        if (data && data.assets) {
          // Popola la mappa Simbolo -> Quantità
          data.assets.forEach(asset => {
            this.myPortfolioAssets.set(asset.symbol, asset.quantity);
          });
        }
      }
    });
  }

  /**
   * Scarica gli asset dal MarketService in base alla categoria (STOCK, CRYPTO, ETF).
   */
  loadAssets() {
    this.loading = true;
    this.assets = [];
    this.marketService.getAssetsByType(this.currentType).subscribe({
      next: (res) => {
        this.assets = res;
        this.loading = false;
        this.cd.detectChanges(); // Notifica Angular dell'aggiornamento dati asincrono
      },
      error: (err) => {
        console.error("Errore download market:", err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  // --- GESTIONE MODALE E CALCOLI ---

  /**
   * Apre il pannello di negoziazione.
   * Se l'utente non è loggato, blocca l'azione e mostra il modale di login.
   */
  openTradePanel(asset: any) {
    if (!this.userService.getCurrentUserId()) {
      this.showLoginModal = true;
      return;
    }

    // Reset dei campi prima dell'apertura per una UX pulita
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

  /**
   * Calcolo Reattivo 1:
   * Quando l'utente scrive la QUANTITÀ, il sistema calcola automaticamente gli EURO necessari.
   */
  onQuantityChange() {
    if (this.tradeQuantity && this.selectedAsset) {
      this.tradeAmount = Number((this.tradeQuantity * this.selectedAsset.currentPrice).toFixed(2));
    } else {
      this.tradeAmount = null;
    }
  }

  /**
   * Calcolo Reattivo 2:
   * Quando l'utente scrive l'IMPORTO in Euro, il sistema calcola quante UNITÀ può acquistare.
   */
  onAmountChange() {
    if (this.tradeAmount && this.selectedAsset) {
      // Precisione a 4 decimali per supportare frazionamento crypto
      this.tradeQuantity = Number((this.tradeAmount / this.selectedAsset.currentPrice).toFixed(4));
    } else {
      this.tradeQuantity = null;
    }
  }

  /**
   * Helper per il template: ritorna quante unità di un titolo l'utente ha in portafoglio.
   */
  getMyQuantity(symbol: string): number {
    return this.myPortfolioAssets.get(symbol) || 0;
  }

  /**
   * Esegue l'invio dell'ordine al backend.
   * Include la validazione dei dati e la gestione dei feedback di successo/errore.
   */
  confirmTrade() {
    if (!this.selectedAsset || !this.tradeQuantity || this.tradeQuantity <= 0) return;

    const currentUserId = this.userService.getCurrentUserId();
    if (!currentUserId) {
      alert("Devi effettuare il login per fare trading!");
      this.router.navigate(['/login']);
      return;
    }

    this.isProcessing = true; // Mostra lo stato di attesa

    // Preparazione del payload per la richiesta API
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

        // Aggiorna i dati per riflettere il nuovo saldo e le nuove quantità
        this.loadMyPortfolio();
        this.loadAssets();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Errore Backend:', err);
        this.isProcessing = false;

        // Estrae il messaggio d'errore specifico (es. "Saldo insufficiente") dal backend
        const errorMsg = err.error && err.error.error ? err.error.error : "Errore durante la transazione";
        alert("❌ Transazione fallita: " + errorMsg);
      }
    });
  }

  /**
   * Gestisce il caricamento fallito dei loghi degli asset.
   * Implementa una logica di fallback "Smart":
   * 1. Tenta di usare Clearbit per le azioni o Cryptologos per le crypto.
   * 2. In caso di fallimento totale, usa un'icona generica.
   */
  handleImgError(event: any, symbol: string) {
    const isCrypto = symbol.includes('BINANCE') || this.currentType === 'CRYPTO';

    // Icone di riserva se tutto fallisce
    const fallbackIcon = isCrypto
      ? 'https://cdn-icons-png.flaticon.com/512/12192/12192349.png'
      : 'https://cdn-icons-png.flaticon.com/512/10103/10103216.png';

    const currentSrc = event.target.src;

    if (isCrypto && !currentSrc.includes('cryptologos.cc')) {
      const cleanName = this.pulisciSimbolo(symbol).toLowerCase();
      event.target.src = `https://cryptologos.cc/logos/${cleanName}-${cleanName}-logo.png?v=029`;
    }
    else if (!isCrypto && !currentSrc.includes('clearbit')) {
      event.target.src = `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
    }
    else {
      event.target.src = fallbackIcon;
    }

    event.target.onerror = null; // Impedisce loop infiniti se anche il fallback fallisce
  }

  /**
   * Rimuove prefissi del provider (es. BINANCE:) e suffissi valutari (USDT, USD, EUR)
   * per ottenere il solo codice identificativo (Ticker) dell'asset.
   */
  pulisciSimbolo(simbolo: string): string {
    if (!simbolo) return '';
    let nomePulito = simbolo.includes(':') ? simbolo.split(':')[1] : simbolo;
    return nomePulito.replace('USDT', '').replace('USD', '').replace('EUR', '');
  }
}
