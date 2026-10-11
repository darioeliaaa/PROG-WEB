import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PortfolioService, PortfolioOverview } from '../../../services/portfolio.service';
import { UserService } from '../../../services/user.service';
import { MarketService } from '../../market/market.service';
import { UI } from '../../../shared/ui';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-my-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, FormsModule, ...UI],
  templateUrl: './my-portfolio.html',
  styleUrls: ['./my-portfolio.css']
})
export class MyPortfolioComponent implements OnInit {

  portfolio: PortfolioOverview | null = null;
  loading = true;
  isLoggedIn = false;
  isTradeModalOpen = false;
  selectedAsset: any = null;
  tradeAction: 'BUY' | 'SELL' = 'BUY';
  tradeQuantity: number | null = null;
  tradeAmount: number | null = null;
  isProcessing = false;
  public pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    layout: { padding: 6 },
    // la legenda è nel template, con percentuali e importi
    plugins: { legend: { display: false } }
  };
  public pieChartType = 'doughnut' as const;
  public pieChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { border: { display: false }, grid: { display: false } },
      y: { beginAtZero: true, border: { display: false }, grid: { color: '#E3E8E2' }, ticks: { maxTicksLimit: 5 } }
    },
    plugins: { legend: { display: true, position: 'top', align: 'end' } }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  constructor(
    private portfolioService: PortfolioService,
    private userService: UserService,
    private marketService: MarketService,
    private cd: ChangeDetectorRef,
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    const userId = this.userService.getCurrentUserId();
    this.isLoggedIn = !!userId;
    console.log("👤 OnInit - User ID:", userId, "Logged In:", this.isLoggedIn);

    if (userId) {
      this.loadPortfolio(userId);
    } else {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  loadPortfolio(userId: number) {
    this.loading = true;
    this.cd.detectChanges();

    this.portfolioService.getPortfolio(userId).subscribe({
      next: (data) => {
        this.portfolio = data;
        this.loading = false;
        this.cd.detectChanges();

        setTimeout(() => {
          if (this.portfolio) {
            this.setupCharts(this.portfolio);
            this.cd.detectChanges();
          }
        }, 50);
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
    const labels = data.assets.map(a => a.symbol);
    const values = data.assets.map(a => a.currentValue);

    if (data.availableCash > 0) {
      labels.push('Cash (€)');
      values.push(data.availableCash);
    }

    this.pieChartData = {
      labels: [...labels],
      datasets: [{
        data: [...values],
        backgroundColor: [
          '#2F6DB5', '#1E9C8E', '#D9822F', '#C4524C',
          '#7B5BC2', '#B8911F', '#3B9563', '#A9B4AF'
        ],
        hoverOffset: 6,
        borderColor: '#FBFCFA',
        borderWidth: 3,
        borderRadius: 6
      }]
    };

    const assetLabels = data.assets.map(a => a.symbol);
    const investito = data.assets.map(a => a.quantity * a.avgBuyPrice);
    const attuale = data.assets.map(a => a.currentValue);

    this.barChartData = {
      labels: [...assetLabels],
      datasets: [
        {
          data: [...investito],
          label: 'Investito (€)',
          backgroundColor: '#C3CCC2',
          borderRadius: 6,
          barPercentage: 0.7,
          maxBarThickness: 26
        },
        {
          data: [...attuale],
          label: 'Valore Attuale (€)',
          backgroundColor: '#3F50C8',
          borderRadius: 6,
          barPercentage: 0.7,
          maxBarThickness: 26
        }
      ]
    };
  }

  pulisciSimbolo(simbolo: string): string {
    if (!simbolo) return '';
    let nomePulito = simbolo.includes(':') ? simbolo.split(':')[1] : simbolo;
    return nomePulito.replace('USDT', '').replace('USD', '').replace('EUR', '');
  }

  openTradePanel(asset: any) {
    this.selectedAsset = asset;
    this.tradeAction = 'BUY';
    this.tradeQuantity = null;
    this.tradeAmount = null;
    this.isTradeModalOpen = true;
    this.cd.detectChanges();
  }

  closeTradePanel() {
    this.isTradeModalOpen = false;
    this.selectedAsset = null;
    this.cd.detectChanges();
  }

  setAction(action: 'BUY' | 'SELL') {
    this.tradeAction = action;
    this.cd.detectChanges();
  }

  onQuantityChange() {
    if (this.tradeQuantity && this.selectedAsset) {
      this.tradeAmount = Number((this.tradeQuantity * this.selectedAsset.currentPrice).toFixed(2));
    } else {
      this.tradeAmount = null;
    }
    this.cd.detectChanges();
  }

  onAmountChange() {
    if (this.tradeAmount && this.selectedAsset) {
      this.tradeQuantity = Number((this.tradeAmount / this.selectedAsset.currentPrice).toFixed(4));
    } else {
      this.tradeQuantity = null;
    }
    this.cd.detectChanges();
  }

  confirmTrade() {
    if (!this.selectedAsset || !this.tradeQuantity || this.tradeQuantity <= 0) return;
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    this.isProcessing = true;
    this.cd.detectChanges();

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
