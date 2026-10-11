import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UI, coloreCategoria } from '../../../shared/ui';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-budget-overview-wallet',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, ...UI],
  templateUrl: './budget-overview-wallet.html',
  styleUrl: './budget-overview-wallet.css'
})
export class BudgetOverviewWallet implements OnChanges {

  @Input() currentDate!: Date;
  @Input() datiReali: any;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public totaleEntrate: number = 0;
  public totaleUscite: number = 0;
  public chartType = 'doughnut' as const;

  public incomeData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }]
  };

  public expenseData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }]
  };

  public chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '72%',
    maintainAspectRatio: false,
    layout: { padding: 6 },
    // la legenda è disegnata nel template, con gli importi accanto a ogni categoria
    plugins: { legend: { display: false } }
  };


  // Registra i plugin di Chart.js necessari per renderizzare i grafici a ciambella
  constructor() {
    Chart.register(...registerables);
  }

  // Monitora l'input dei dati reali per aggiornare i totali e ricalcolare i dataset dei grafici
  ngOnChanges(changes: SimpleChanges) {
    if (changes['datiReali'] && this.datiReali) {
      this.totaleEntrate = this.datiReali.totaleEntrate;
      this.totaleUscite = this.datiReali.totaleUscite;
      this.elaboraDati(this.datiReali.transactions);
    }
  }

  // Mappa le transazioni grezze del wallet in gruppi per categoria e genera i dati per i grafici
  private elaboraDati(transazioni: any[]) {
    if (!transazioni) return;

    const entrateMap = new Map<string, number>();
    const usciteMap = new Map<string, number>();

    transazioni.forEach(t => {
      const valore = Number(t.amount);
      const categoria = t.category;
      const tipo = t.type;

      if (tipo === 'ENTRATA') {
        const attuale = entrateMap.get(categoria) || 0;
        entrateMap.set(categoria, attuale + valore);
      }
      else if (tipo === 'USCITA') {
        const attuale = usciteMap.get(categoria) || 0;
        usciteMap.set(categoria, attuale + valore);
      }
    });

    this.incomeData = {
      labels: Array.from(entrateMap.keys()).map(k => k.toUpperCase()),
      datasets: [{
        data: Array.from(entrateMap.values()),
        backgroundColor: Array.from(entrateMap.keys()).map(k => coloreCategoria(k)),
        borderColor: '#FBFCFA',
        borderWidth: 3,
        borderRadius: 6,
        hoverOffset: 6
      }]
    };

    this.expenseData = {
      labels: Array.from(usciteMap.keys()).map(k => k.toUpperCase()),
      datasets: [{
        data: Array.from(usciteMap.values()),
        backgroundColor: Array.from(usciteMap.keys()).map(k => coloreCategoria(k)),
        borderColor: '#FBFCFA',
        borderWidth: 3,
        borderRadius: 6,
        hoverOffset: 6
      }]
    };

    this.chart?.update();
  }
}
