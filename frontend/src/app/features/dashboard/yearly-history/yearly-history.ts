import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts'; // Assicurati di avere ng2-charts installato
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

// IMPORT CORRETTI
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction.model'; // <--- Controlla che questo percorso sia giusto!

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
    const userId = 1; // ID utente fisso per ora

    // 1. CHIAMATA ASINCRONA AL BACKEND
    this.service.getDataByYear(userId, anno).subscribe({
      next: (transazioni: Transaction[]) => {

        const entrateMensili = new Array(12).fill(0);
        const usciteMensili = new Array(12).fill(0);

        // 2. CICLO SUI DATI (IN INGLESE)
        transazioni.forEach(t => {
          // 'date' (inglese) invece di 'data'
          const mese = new Date(t.date).getMonth();

          // 'type' e 'INCOME' invece di 'tipo' ed 'entrata'
          if (t.type === 'ENTRATA') {
            entrateMensili[mese] += t.amount; // 'amount' invece di 'importo'
          } else {
            usciteMensili[mese] += t.amount;
          }
        });

        // 3. AGGIORNAMENTO GRAFICO
        this.barChartData.datasets[0].data = entrateMensili;
        this.barChartData.datasets[1].data = usciteMensili;

        this.chart?.update();
      },
      error: (err) => console.error("Errore caricamento grafico annuale:", err)
    });
  }
}
