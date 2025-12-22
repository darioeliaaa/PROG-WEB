import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-budget-overview',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './budget-overview.html',
  styleUrl: './budget-overview.css'
})
export class BudgetOverview {

  public chartType: ChartType = 'doughnut';

  public incomeData: ChartData<'doughnut'> = {
    labels: ['Stipendio', 'Freelance', 'Dividendi', 'Altro'],
    datasets: [
      {
        data: [2500, 600, 150, 100], // Esempio numeri
        backgroundColor: ['#2ecc71', '#3498db', '#1abc9c', '#27ae60'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  public expenseData: ChartData<'doughnut'> = {
    labels: ['Casa & Bollette', 'Spesa', 'Auto/Trasporti', 'Svago', 'Salute'],
    datasets: [
      {
        data: [1200, 400, 200, 300, 100], // Esempio numeri
        backgroundColor: ['#e74c3c', '#f1c40f', '#e67e22', '#9b59b6', '#95a5a6'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom', // Legenda sotto per risparmiare spazio laterale
        labels: {
          usePointStyle: true,
          font: { size: 11 }
        }
      }
    }
  };
}
