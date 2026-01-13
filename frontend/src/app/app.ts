import { Component, ViewChild, ElementRef } from '@angular/core'; // 1. Aggiunti questi import
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

  // 2. Colleghiamo il div dell'HTML (#scrollContainer) a questa variabile
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;

      // Gestione visualizzazione Sidebar/Header
      this.isLoginPage = url.includes('/login');
      this.isMarketSection = url.includes('/market');

      // 3. Resetta lo scroll in alto ad ogni cambio pagina
      // Usiamo un piccolo timeout per essere sicuri che la pagina sia stata renderizzata
      setTimeout(() => {
        this.scrollToTop();
      }, 10);
    });
  }

  // 4. Funzione che esegue fisicamente lo scroll a 0
  scrollToTop() {
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      this.scrollContainer.nativeElement.scrollTop = 0;
    }
  }
}
