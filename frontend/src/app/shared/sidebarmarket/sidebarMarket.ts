import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-market',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebarMarket.html',
  styleUrl: './sidebarMarket.css' // Assicurati di usare lo stesso CSS o copiarlo
})
export class SidebarMarketComponent {
  isMarketOpen: boolean = true; // Imposta su 'false' se lo vuoi chiuso all'avvio

  toggleMarket() {
    this.isMarketOpen = !this.isMarketOpen;
  }
}
