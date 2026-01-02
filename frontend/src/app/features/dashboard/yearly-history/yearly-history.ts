import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-yearly-history',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './yearly-history.html',
  styleUrl: './yearly-history.css'
})
export class YearlyHistory implements OnChanges {

  @Input() currentDate!: Date;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public barChartType: ChartType = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', "Lug", "Aug", "Set", "Ott", "Nov", "Dic"],
    datasets: [
      {
        data: [2500, 3000, 2800, 3200, 4000, 3500, 2500, 3000, 2800, 3200, 4000, 3500],
        label: 'Entrate',
        backgroundColor: '#2ecc71',
        hoverBackgroundColor: '#27ae60',
        borderRadius: 5,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      },
      {
        data: [1800, 2200, 2900, 1500, 2000, 2100, 1800, 2200, 2900, 1500, 2000, 2100],
        label: 'Uscite',
        backgroundColor: '#e74c3c',
        hoverBackgroundColor: '#c0392b',
        borderRadius: 5,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentDate']) {
      console.log('YearlyHistory: Nuova data ricevuta ->', this.currentDate);

      // Qui simuliamo un cambio dati per farti vedere che funziona
      this.randomizeData();
    }
  }

  // Funzione per generare dati casuali (da sostituire con chiamata API in futuro)
  randomizeData() {
    // Genera 12 numeri casuali per le Entrate
    this.barChartData.datasets[0].data = Array.from({ length: 12 }, () => Math.floor(Math.random() * 5000) + 1000);

    // Genera 12 numeri casuali per le Uscite
    this.barChartData.datasets[1].data = Array.from({ length: 12 }, () => Math.floor(Math.random() * 3000) + 500);

    // Forza l'aggiornamento del grafico
    this.chart?.update();
  }
}
