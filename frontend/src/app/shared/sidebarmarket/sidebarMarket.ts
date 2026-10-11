import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UI } from '../ui';

@Component({
  selector: 'app-sidebar-market',
  standalone: true,
  imports: [CommonModule, RouterModule, ...UI],
  templateUrl: './sidebarMarket.html',
  styleUrl: './sidebarMarket.css'
})
export class SidebarMarketComponent {
  isMarketOpen: boolean = true;

  toggleMarket() {
    this.isMarketOpen = !this.isMarketOpen;
  }
}
