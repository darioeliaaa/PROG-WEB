import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
  @Input() datiReali: any;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public totaleEntrate: number = 0;
  public totaleUscite: number = 0;

  public chartType: ChartType = 'doughnut';

  public incomeData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }]
  };

  public expenseData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 11 } } }
    }
  };

  private coloriCategorie: { [key: string]: string } = {
    // ENTRATE
    'stipendio': '#2ecc71',
    'investimenti': '#3498db',
    'altro': '#95a5a6',

    // USCITE
    'casa': '#e74c3c',
    'spesa': '#f1c40f',
    'svago': '#9b59b6',
    'salute': '#e67e22',
    'trasporti': '#1abc9c',
    'default': '#bdc3c7'
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['datiReali'] && this.datiReali) {

      this.totaleEntrate = this.datiReali.totaleEntrate;
      this.totaleUscite = this.datiReali.totaleUscite;

      this.elaboraDati(this.datiReali.transactions);
    }
  }

  private elaboraDati(transazioni: any[]) {
    if (!transazioni) return;

    const entrateMap = new Map<string, number>();
    const usciteMap = new Map<string, number>();

    transazioni.forEach(t => {
      const valore = Number(t.importo);
      const categoria = t.categoria;

      if (t.tipo === 'entrata') {
        const attuale = entrateMap.get(categoria) || 0;
        entrateMap.set(categoria, attuale + valore);
      } else {
        const attuale = usciteMap.get(categoria) || 0;
        usciteMap.set(categoria, attuale + valore);
      }
    });

    this.incomeData = {
      labels: Array.from(entrateMap.keys()).map(k => k.toUpperCase()),
      datasets: [{
        data: Array.from(entrateMap.values()),
        backgroundColor: Array.from(entrateMap.keys()).map(k => this.coloriCategorie[k] || this.coloriCategorie['default']),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };

    this.expenseData = {
      labels: Array.from(usciteMap.keys()).map(k => k.toUpperCase()),
      datasets: [{
        data: Array.from(usciteMap.values()),
        backgroundColor: Array.from(usciteMap.keys()).map(k => this.coloriCategorie[k] || this.coloriCategorie['default']),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
    this.chart?.update();
  }
}
