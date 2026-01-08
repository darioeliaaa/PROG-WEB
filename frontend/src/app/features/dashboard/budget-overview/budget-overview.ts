import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-budget-overview',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './budget-overview.html', // Assicurati che il nome file sia giusto (budget-overview.component.html?)
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
    // Le chiavi devono corrispondere a come le salvi nel DB (minuscolo va bene se nel DB sono minuscole)
    'stipendio': '#2ecc71',
    'investimenti': '#3498db',
    'altro': '#95a5a6',
    'casa': '#e74c3c',
    'spesa': '#f1c40f',
    'svago': '#9b59b6',
    'salute': '#e67e22',
    'trasporti': '#1abc9c',
    'default': '#bdc3c7'
  };

  constructor() {
    // 🔴 RISOLVE L'ERRORE "doughnut is not registered"
    Chart.register(...registerables);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['datiReali'] && this.datiReali) {
      // Aggiorna i totali
      this.totaleEntrate = this.datiReali.totaleEntrate;
      this.totaleUscite = this.datiReali.totaleUscite;

      // Passa le transazioni al metodo di elaborazione
      this.elaboraDati(this.datiReali.transactions);
    }
  }

  private elaboraDati(transazioni: any[]) {
    if (!transazioni) return;

    const entrateMap = new Map<string, number>();
    const usciteMap = new Map<string, number>();

    transazioni.forEach(t => {
      // 🔴 CORREZIONE FONDAMENTALE: Usiamo i nomi campi INGLESI del Backend
      const valore = Number(t.amount); // Era t.importo
      const categoria = t.category;    // Era t.categoria
      const tipo = t.type;             // Era t.tipo

      // Il backend invia 'ENTRATA' (tutto maiuscolo)
      if (tipo === 'ENTRATA') {
        const attuale = entrateMap.get(categoria) || 0;
        entrateMap.set(categoria, attuale + valore);
      }
      // Il backend invia 'USCITA'
      else if (tipo === 'USCITA') {
        const attuale = usciteMap.get(categoria) || 0;
        usciteMap.set(categoria, attuale + valore);
      }
    });

    // Aggiorna i dati del grafico ENTRATE
    this.incomeData = {
      labels: Array.from(entrateMap.keys()).map(k => k.toUpperCase()),
      datasets: [{
        data: Array.from(entrateMap.values()),
        backgroundColor: Array.from(entrateMap.keys()).map(k => this.coloriCategorie[k.toLowerCase()] || this.coloriCategorie['default']),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };

    // Aggiorna i dati del grafico USCITE
    this.expenseData = {
      labels: Array.from(usciteMap.keys()).map(k => k.toUpperCase()),
      datasets: [{
        data: Array.from(usciteMap.values()),
        backgroundColor: Array.from(usciteMap.keys()).map(k => this.coloriCategorie[k.toLowerCase()] || this.coloriCategorie['default']),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };

    // Forza l'aggiornamento visivo del grafico
    this.chart?.update();
  }
}
