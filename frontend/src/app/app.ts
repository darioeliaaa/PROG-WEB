import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Import Componenti
import { SidebarComponent } from './sidebar/sidebar'; // Controlla percorso
import { SidebarMarketComponent } from './shared/sidebarmarket/sidebarMarket'; // Controlla percorso
import { HeaderComponent } from './shared/header/header'; // Controlla percorso

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, SidebarMarketComponent, HeaderComponent],
  templateUrl: './app.html', // NOTA: A volte è app.component.html
  styleUrls: ['./app.css']     // NOTA: A volte è app.component.css
})
export class AppComponent {
  isLoginPage = false;
  isMarketSection = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;

      // 1. GESTIONE PAGINE
      this.isLoginPage = url.includes('/login');

      // ✅ FIX: Consideriamo "Market" sia il market che il portfolio
      // Così carica la sidebar giusta e nasconde quella principale
      this.isMarketSection = url.includes('/market') || url.includes('/portfolio');

      // 2. RESET SCROLL
      setTimeout(() => {
        this.scrollToTop();
      }, 10);
    });
  }

  scrollToTop() {
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      this.scrollContainer.nativeElement.scrollTop = 0;
    }
  }
}
