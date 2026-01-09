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

  constructor() {
    Chart.register(...registerables);
  }

  ngOnChanges(changes: SimpleChanges) {
    // LOG 1: Vediamo se Angular rileva i cambiamenti
    if (changes['allTransactions']) {
      console.log("📊 [YearlyHistory] Nuovi dati ricevuti:", this.allTransactions);
      this.calcolaDatiLocali();
    }
  }

  calcolaDatiLocali() {
    if (!this.allTransactions || this.allTransactions.length === 0) {
      console.warn("⚠️ [YearlyHistory] Array transazioni vuoto!");
      return;
    }

    const annoTarget = this.currentDate.getFullYear();
    console.log(`📅 [YearlyHistory] Filtro per anno: ${annoTarget}`);

    const entrateMensili = new Array(12).fill(0);
    const usciteMensili = new Array(12).fill(0);
    let transazioniTrovate = 0;

    this.allTransactions.forEach(t => {
      // LOG 2: Vediamo come sono fatte le date
      // Usa new Date() che è più sicuro dello split
      const dataT = new Date(t.date);

      // Controllo se l'anno coincide
      if (dataT.getFullYear() === annoTarget) {
        transazioniTrovate++;
        const meseIndex = dataT.getMonth();
        const importo = Number(t.amount);

        // LOG 3: Controlliamo se riconosce ENTRATA/USCITA
        // Nota: Assicurati che nel DB sia 'ENTRATA' tutto maiuscolo
        if (t.type === 'ENTRATA') {
          entrateMensili[meseIndex] += importo;
        } else if (t.type === 'USCITA') {
          usciteMensili[meseIndex] += importo;
        }
      }
    });

    console.log(`✅ [YearlyHistory] Trovate ${transazioniTrovate} transazioni per il ${annoTarget}`);
    console.log("📈 Entrate per mese:", entrateMensili);
    console.log("📉 Uscite per mese:", usciteMensili);

    // AGGIORNAMENTO DATI
    this.barChartData.datasets[0].data = entrateMensili;
    this.barChartData.datasets[1].data = usciteMensili;

    // FORZA L'AGGIORNAMENTO DEL GRAFICO
    if (this.chart) {
      this.chart.update();
      console.log("🔄 [YearlyHistory] Grafico aggiornato!");
    } else {
      console.error("❌ [YearlyHistory] Impossibile aggiornare: Componente grafico non pronto.");
    }
  }
}
