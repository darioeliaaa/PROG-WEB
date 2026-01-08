import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, Chart, registerables } from 'chart.js';

// IMPORT CORRETTI
import { TransactionService } from '../../../services/transaction.service';
import { UserService } from '../../../services/user.service'; // <--- AGGIUNTO QUESTO
import { Transaction } from '../../../models/transaction.model';

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
        data: [], // Entrate
        label: 'Entrate',
        backgroundColor: '#2ecc71',
        hoverBackgroundColor: '#27ae60',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      },
      {
        data: [], // Uscite
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
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#bdc3c7'} },
      x: { grid: { display: false }, ticks: { color: '#bdc3c7'} }
    }
  };

  constructor(
    private service: TransactionService,
    private userService: UserService // <--- INIETTIAMO IL SERVICE UTENTE
  ) {
    // Registra i componenti Chart.js per evitare errori
    Chart.register(...registerables);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentDate'] && this.currentDate) {
      this.caricaDatiAnnuali();
    }
  }

  caricaDatiAnnuali() {
    // 1. RECUPERA L'ID VERO (Non usare 1 fisso!)
    const userId = this.userService.getCurrentUserId();

    if (!userId) return; // Se non sei loggato, esce

    const anno = this.currentDate.getFullYear();

    console.log(`Carico storico annuale ${anno} per User ${userId}...`);

    // 2. CHIAMATA AL SERVICE
    this.service.getDataByYear(userId, anno).subscribe({
      next: (transazioni: Transaction[]) => {

        // Creiamo array vuoti (12 zeri)
        const entrateMensili = new Array(12).fill(0);
        const usciteMensili = new Array(12).fill(0);

        // 3. CICLO SUI DATI
        transazioni.forEach(t => {
          // Metodo sicuro per la data: "2025-01-15" -> split -> "01" -> index 0
          const parts = t.date.split('-');
          const meseIndex = Number(parts[1]) - 1;

          // Se per qualche motivo la data è strana, la saltiamo
          if (meseIndex < 0 || meseIndex > 11) return;

          const importo = Number(t.amount);

          if (t.type === 'ENTRATA') {
            entrateMensili[meseIndex] += importo;
          } else {
            usciteMensili[meseIndex] += importo;
          }
        });

        // 4. AGGIORNAMENTO GRAFICO
        this.barChartData.datasets[0].data = entrateMensili;
        this.barChartData.datasets[1].data = usciteMensili;

        this.chart?.update();
        console.log("Grafico annuale aggiornato!");
      },
      error: (err) => console.error("Errore caricamento grafico annuale:", err)
    });
  }
}
