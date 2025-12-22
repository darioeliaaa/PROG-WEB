import { Component } from '@angular/core';
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
export class YearlyHistory {

  public barChartType: ChartType = 'bar';

  public barChartData: ChartData<'bar'> = {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', "Lug", "Aug", "Set", "Ott", "Nov", "Dic"],
    datasets: [
      {
        data: [2500, 3000, 2800, 3200, 4000, 3500,2500, 3000, 2800, 3200, 4000, 3500],
        label: 'Entrate',
        backgroundColor: '#2ecc71',
        hoverBackgroundColor: '#27ae60',
        borderRadius: 5,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      },
      {
        data: [1800, 2200, 2900, 1500, 2000, 2100,1800, 2200, 2900, 1500, 2000, 2100],
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
    maintainAspectRatio: false, // Fondamentale per il CSS
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
        mode: 'index', // Mostra entrate e uscite insieme quando passi sopra il mese
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)' // Griglia leggera
        }
      },
      x: {
        grid: {
          display: false // Niente griglia verticale per pulizia
        }
      }
    }
  };
}
