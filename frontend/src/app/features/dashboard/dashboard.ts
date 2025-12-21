import { Component } from '@angular/core';
// Importa i tre pezzi della dashboard
import { InvestmentSummary } from './investment-summary/investment-summary';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Aggiungili qui sotto:
  imports: [InvestmentSummary],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {}
