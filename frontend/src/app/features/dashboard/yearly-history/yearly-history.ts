import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
// Importiamo il service
import { TransactionService, Transaction } from '../../../services/transaction.service';

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
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
    datasets: [
      {
        data: [],
        label: 'Entrate',
        backgroundColor: '#2ecc71',
        hoverBackgroundColor: '#27ae60',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      },
      {
        data: [],
        label: 'Uscite',
        backgroundColor: '#ef4444',
        hoverBackgroundColor: '#c0392b',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true, mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  constructor(private service: TransactionService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentDate'] && this.currentDate) {
      this.caricaDatiAnnuali();
    }
  }

  caricaDatiAnnuali() {
    const anno = this.currentDate.getFullYear();

    const transazioni = this.service.getDataByYear(anno);

    const entrateMensili = new Array(12).fill(0);
    const usciteMensili = new Array(12).fill(0);

    // 3. Riempiamo gli slot
    transazioni.forEach(t => {
      const mese = new Date(t.data).getMonth();

      if (t.tipo === 'entrata') {
        entrateMensili[mese] += t.importo;
      } else {
        usciteMensili[mese] += t.importo;
      }
    });

    this.barChartData.datasets[0].data = entrateMensili;
    this.barChartData.datasets[1].data = usciteMensili;

    this.chart?.update();
  }
}
