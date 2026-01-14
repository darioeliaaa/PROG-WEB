import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PortfolioService, PortfolioOverview } from '../../../services/portfolio.service';
import { UserService } from '../../../services/user.service';
import { MarketService } from '../../market/market.service'; // Controlla il percorso se è giusto

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-my-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, FormsModule],
  templateUrl: './my-portfolio.html',
  styleUrls: ['./my-portfolio.css']
})
export class MyPortfolioComponent implements OnInit {

  portfolio: PortfolioOverview | null = null;
  loading = true;

  // Variabili Trading
  isTradeModalOpen = false;
  selectedAsset: any = null;
  tradeAction: 'BUY' | 'SELL' = 'BUY';
  tradeQuantity: number | null = null;
  tradeAmount: number | null = null;
  isProcessing = false;

  // --- CONFIGURAZIONE GRAFICI ---
  // Inizializziamo subito con dati vuoti per evitare errori
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#475569' } }
    }
  };
  public pieChartType: ChartType = 'doughnut';
  public pieChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { display: false } },
      y: { ticks: { color: '#64748b' }, beginAtZero: true }
    },
    plugins: { legend: { display: true } }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  constructor(
    private portfolioService: PortfolioService,
    private userService: UserService,
    private marketService: MarketService,
    private cd: ChangeDetectorRef, // <--- Il nostro migliore amico

  ) {Chart.register(...registerables);}

  ngOnInit() {
    const userId = this.userService.getCurrentUserId();
    console.log("👤 OnInit - User ID:", userId); // <--- CONTROLLA QUESTO IN CONSOLE

    if (userId) {
      this.loadPortfolio(userId);
    } else {
      console.warn("⚠️ Nessun utente trovato dopo il refresh!");
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  loadPortfolio(userId: number) {
    this.loading = true;
    this.cd.detectChanges(); // Mostra spinner

    this.portfolioService.getPortfolio(userId).subscribe({
      next: (data) => {
        // 1. Salviamo i dati grezzi
        this.portfolio = data;

        // 2. Nascondiamo il loading SUBITO.
        // Questo fa apparire i contenitori vuoti nel DOM (div dei grafici).
        this.loading = false;
        this.cd.detectChanges(); // Forza Angular a creare i <div> nella pagina

        // 3. ORA prepariamo i grafici, ma dentro un piccolo timeout.
        // Questo dà al browser quei 10ms necessari per calcolare la larghezza dei div.
        setTimeout(() => {
          if (this.portfolio) { // Controllo di sicurezza
            this.setupCharts(this.portfolio);
            this.cd.detectChanges(); // Aggiorna la vista finale con i grafici pieni
            console.log("✅ Grafici renderizzati dopo timeout");
          }
        }, 50); // 50 millisecondi di ritardo sono invisibili all'occhio ma salvano il rendering
      },
      error: (err) => {
        console.error('Errore portfolio:', err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  setupCharts(data: PortfolioOverview) {
    if (!data.assets || data.assets.length === 0) return;

    // --- 1. CIAMBELLA ---
    const labels = data.assets.map(a => a.symbol);
    const values = data.assets.map(a => a.currentValue);

    if (data.availableCash > 0) {
      labels.push('Cash (€)');
      values.push(data.availableCash);
    }

    // 🔥 TRUCCO: Creare un NUOVO oggetto invece di modificarlo
    // Questo dice a Chart.js: "Ehi, è cambiato tutto, ridisegna!"
    this.pieChartData = {
      labels: [...labels], // Copia array
      datasets: [{
        data: [...values], // Copia array
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
          '#8b5cf6', '#ec4899', '#6366f1', '#cbd5e1'
        ],
        hoverOffset: 4,
        borderWidth: 0
      }]
    };

    // --- 2. BARRE ---
    const assetLabels = data.assets.map(a => a.symbol);
    const investito = data.assets.map(a => a.quantity * a.avgBuyPrice);
    const attuale = data.assets.map(a => a.currentValue);

    this.barChartData = {
      labels: [...assetLabels],
      datasets: [
        {
          data: [...investito],
          label: 'Investito (€)',
          backgroundColor: '#94a3b8',
          borderRadius: 4,
          barPercentage: 0.6
        },
        {
          data: [...attuale],
          label: 'Valore Attuale (€)',
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          barPercentage: 0.6
        }
      ]
    };
  }

  // --- UTILS ---
  pulisciSimbolo(simbolo: string): string {
    if (!simbolo) return '';
    let nomePulito = simbolo.includes(':') ? simbolo.split(':')[1] : simbolo;
    return nomePulito.replace('USDT', '').replace('USD', '').replace('EUR', '');
  }

  // --- TRADING LOGIC ---

  openTradePanel(asset: any) {
    console.log("Apro pannello per:", asset.symbol);
    this.selectedAsset = asset;
    this.tradeAction = 'BUY';
    this.tradeQuantity = null;
    this.tradeAmount = null;

    this.isTradeModalOpen = true; // Imposto a true

    // 🔥 FIX FONDAMENTALE: Forza Angular a mostrare subito la modale
    this.cd.detectChanges();
  }

  closeTradePanel() {
    this.isTradeModalOpen = false;
    this.selectedAsset = null;
    this.cd.detectChanges(); // Pulisce subito la vista
  }

  setAction(action: 'BUY' | 'SELL') {
    this.tradeAction = action;
    // Ricalcolo i valori se cambio azione (opzionale, ma utile per UI)
    this.cd.detectChanges();
  }

  onQuantityChange() {
    if (this.tradeQuantity && this.selectedAsset) {
      this.tradeAmount = Number((this.tradeQuantity * this.selectedAsset.currentPrice).toFixed(2));
    } else {
      this.tradeAmount = null;
    }
    this.cd.detectChanges(); // Aggiorna input Euro in tempo reale
  }

  onAmountChange() {
    if (this.tradeAmount && this.selectedAsset) {
      this.tradeQuantity = Number((this.tradeAmount / this.selectedAsset.currentPrice).toFixed(4));
    } else {
      this.tradeQuantity = null;
    }
    this.cd.detectChanges(); // Aggiorna input Quantità in tempo reale
  }

  confirmTrade() {
    if (!this.selectedAsset || !this.tradeQuantity || this.tradeQuantity <= 0) return;

    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    this.isProcessing = true;
    this.cd.detectChanges(); // Mostra "Elaborazione..." sul bottone

    const request = {
      userId: userId,
      symbol: this.selectedAsset.symbol,
      assetName: this.selectedAsset.name,
      quantity: this.tradeQuantity,
      priceAtTransaction: this.selectedAsset.currentPrice,
      action: this.tradeAction
    };

    this.marketService.tradeAsset(request).subscribe({
      next: () => {
        this.isProcessing = false;
        alert('Transazione completata!');
        this.closeTradePanel();

        // Ricarica tutto per aggiornare grafici e tabella
        this.loadPortfolio(userId);
      },
      error: (err) => {
        this.isProcessing = false;
        alert('Errore transazione: ' + (err.error?.error || 'Sconosciuto'));
        this.cd.detectChanges();
      }
    });
  }
}
