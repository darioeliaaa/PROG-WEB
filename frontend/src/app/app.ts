import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Importa TUTTI i componenti
import { SidebarComponent } from './sidebar/sidebar';
import { SidebarMarketComponent } from './shared/sidebarmarket/sidebarMarket';
import { HeaderComponent } from './shared/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, SidebarMarketComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  isLoginPage = false;
  isMarketSection = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;

      // 1. Sei nel login?
      this.isLoginPage = url.includes('/login');

      // 2. Sei nella sezione investimenti? (controllo se l'url contiene 'market')
      this.isMarketSection = url.includes('/market');
    });
  }
}
