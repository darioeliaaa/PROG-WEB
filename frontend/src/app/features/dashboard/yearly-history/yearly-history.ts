import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-yearly-history',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './yearly-history.html',
  styleUrl: './yearly-history.css'
})
export class YearlyHistory implements OnChanges {

  @Input() currentDate!: Date;
  @Input() allTransactions: any[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
    datasets: [
      { data: [], label: 'Entrate', backgroundColor: '#2ecc71', borderRadius: 4 },
      { data: [], label: 'Uscite', backgroundColor: '#ef4444', borderRadius: 4 }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true }, tooltip: { enabled: true } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { grid: { display: false } }
    }
  };

  // Inizializza i componenti necessari di Chart.js per il rendering dei grafici a barre
  constructor() {
    Chart.register(...registerables);
  }

  // Intercetta l'aggiornamento dell'elenco transazioni per ricalcolare i dati annuali
  ngOnChanges(changes: SimpleChanges) {
    if (changes['allTransactions']) {
      this.calcolaDatiLocali();
    }
  }

  // Filtra le transazioni per l'anno visualizzato e aggrega i totali di entrate e uscite per ogni mese
  calcolaDatiLocali() {
    if (!this.allTransactions || this.allTransactions.length === 0) {
      return;
    }

    const annoTarget = this.currentDate.getFullYear();
    const entrateMensili = new Array(12).fill(0);
    const usciteMensili = new Array(12).fill(0);

    this.allTransactions.forEach(t => {
      const dataT = new Date(t.date);

      if (dataT.getFullYear() === annoTarget) {
        const meseIndex = dataT.getMonth();
        const importo = Number(t.amount);

        if (t.type === 'ENTRATA') {
          entrateMensili[meseIndex] += importo;
        } else if (t.type === 'USCITA') {
          usciteMensili[meseIndex] += importo;
        }
      }
    });

    this.barChartData.datasets[0].data = entrateMensili;
    this.barChartData.datasets[1].data = usciteMensili;

    if (this.chart) {
      this.chart.update();
    }
  }
}
