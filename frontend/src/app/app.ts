import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;

      this.isLoginPage = url.includes('/login');
      this.isMarketSection = url.includes('/market') || url.includes('/portfolio');

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
