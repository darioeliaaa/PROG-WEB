import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-yearly-history-wallet',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './yearly-history-wallet.html',
  styleUrl: './yearly-history-wallet.css'
})
export class YearlyHistoryWallet implements OnChanges {

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

  // Registra i moduli core di Chart.js necessari per il rendering dei grafici a barre
  constructor() {
    Chart.register(...registerables);
  }

  // Intercetta i cambiamenti alle transazioni per attivare il ricalcolo dei dati annuali
  ngOnChanges(changes: SimpleChanges) {
    if (changes['allTransactions']|| changes['currentDate']) {
      this.calcolaDatiLocali();
    }
  }

  // Filtra l'intero storico in base all'anno selezionato e aggrega i totali mensili per il grafico
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
