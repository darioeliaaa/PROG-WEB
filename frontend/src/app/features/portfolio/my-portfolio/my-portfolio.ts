import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioService, PortfolioOverview } from '../../../services/portfolio.service';
import { UserService } from '../../../services/user.service';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-my-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective], // <--- BaseChartDirective è fondamentale
  templateUrl: './my-portfolio.html',
  styleUrls: ['./my-portfolio.css']
})
export class MyPortfolioComponent implements OnInit {

  portfolio: PortfolioOverview | null = null;
  loading = true;

  // --- CONFIGURAZIONE GRAFICO A CIAMBELLA (ALLOCATION) ---
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#475569' } }
    }
  };
  public pieChartType: ChartType = 'doughnut';
  public pieChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  // --- CONFIGURAZIONE GRAFICO A BARRE (PROFIT VS COST) ---
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
  private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userId = this.userService.getCurrentUserId();
    if (userId) {
      this.loadPortfolio(userId);
    } else {
      this.loading = false;
    }
  }

  loadPortfolio(userId: number) {
    this.loading = true;

    // Forza un aggiornamento subito per mostrare lo spinner
    this.cd.detectChanges();

    this.portfolioService.getPortfolio(userId).subscribe({
      next: (data) => {
        this.portfolio = data;
        this.setupCharts(data);
        this.loading = false;

        // 🔥 3. IL TRUCCO MAGICO: Forza l'aggiornamento della grafica
        this.cd.detectChanges();

        console.log("Dati aggiornati e grafica renderizzata!");
      },
      error: (err) => {
        console.error('Errore portfolio:', err);
        this.loading = false;
        this.cd.detectChanges(); // Forza anche in caso di errore
      }
    });
  }

  setupCharts(data: PortfolioOverview) {
    // Se non hai asset, non configurare i grafici
    if (!data.assets || data.assets.length === 0) return;

    // --- 1. DATI CIAMBELLA (Asset + Liquidità) ---
    const labels = data.assets.map(a => a.symbol);
    const values = data.assets.map(a => a.currentValue);

    // Aggiungiamo la liquidità per mostrare quanto cash hai fermo
    if (data.availableCash > 0) {
      labels.push('Cash (€)');
      values.push(data.availableCash);
    }

    this.pieChartData = {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
          '#8b5cf6', '#ec4899', '#6366f1', '#cbd5e1' // Grigio per il Cash
        ],
        hoverOffset: 4,
        borderWidth: 0
      }]
    };

    // --- 2. DATI BARRE (Investito vs Attuale) ---
    // Filtriamo il cash, mostriamo solo gli investimenti
    const assetLabels = data.assets.map(a => a.symbol);
    const investito = data.assets.map(a => a.quantity * a.avgBuyPrice);
    const attuale = data.assets.map(a => a.currentValue);

    this.barChartData = {
      labels: assetLabels,
      datasets: [
        {
          data: investito,
          label: 'Investito (€)',
          backgroundColor: '#94a3b8',
          borderRadius: 4,
          barPercentage: 0.6
        },
        {
          data: attuale,
          label: 'Valore Attuale (€)',
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          barPercentage: 0.6
        }
      ]
    };
  }
}
