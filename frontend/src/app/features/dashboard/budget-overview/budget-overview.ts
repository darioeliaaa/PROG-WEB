import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class BudgetOverview implements OnChanges {

  @Input() currentDate!: Date;

  public totaleEntrate: number = 0;
  public totaleUscite: number = 0;

  public chartType: ChartType = 'doughnut';

  public incomeData: ChartData<'doughnut'> = {
    labels: ['Stipendio', 'Freelance', 'Dividendi', 'Altro'],
    datasets: [{
      data: [2500, 600, 150, 100],
      backgroundColor: ['#2ecc71', '#3498db', '#1abc9c', '#27ae60'],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  };

  public expenseData: ChartData<'doughnut'> = {
    labels: ['Casa & Bollette', 'Spesa', 'Auto/Trasporti', 'Svago', 'Salute'],
    datasets: [{
      data: [1200, 400, 200, 300, 100],
      backgroundColor: ['#e74c3c', '#f1c40f', '#e67e22', '#9b59b6', '#95a5a6'],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, font: { size: 11 } }
      }
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentDate']) {
      this.simulaDatiDinamici();
    }
  }

  simulaDatiDinamici() {
    const random = () => Math.floor(Math.random() * 500) + 100;

    this.incomeData.datasets[0].data = [2500, random(), random(), 100];
    this.expenseData.datasets[0].data = [1200, random(), random(), 300, 100];

    this.incomeData = { ...this.incomeData };
    this.expenseData = { ...this.expenseData };

    this.calcolaTotali();
  }

  calcolaTotali() {
    this.totaleEntrate = this.incomeData.datasets[0].data.reduce((acc, curr) => Number(acc) + Number(curr), 0) as number;

    // Somma Uscite
    this.totaleUscite = this.expenseData.datasets[0].data.reduce((acc, curr) => Number(acc) + Number(curr), 0) as number;
  }
}
