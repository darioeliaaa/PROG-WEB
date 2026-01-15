import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {

  isLoggedIn: boolean = false;
  showMenu: boolean = false;
  userSettings: any;
  listaNotifiche: any[] = [];

  constructor(public router: Router, public userService: UserService, private cdr: ChangeDetectorRef) {

    // 1. Prendi il valore iniziale direttamente dal Service (che ora è corretto subito)
    this.isLoggedIn = this.userService.isLoggedIn();

    // 2. Iscriviti per i cambiamenti futuri (login/logout)
    this.userService.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
      this.cdr.detectChanges();
    });
  }
  get haNotificheNonLette(): boolean {
    return this.listaNotifiche.length > 0;
  }

  ngOnInit() {
    // 1. Carichiamo subito le impostazioni se già presenti nel Service
    // Questo risolve il problema del bottone che non appare al caricamento
    const currentSettings = this.userService.getSettingsSync();
    if (currentSettings) {
      this.userSettings = currentSettings;
    }

    // 2. Restiamo in ascolto per ogni cambiamento futuro
    this.userService.userSettings$.subscribe(settings => {
      if (settings) {
        console.log("Header: Ricevute nuove impostazioni", settings);
        this.userSettings = settings;
        // ✅ Forza Angular a ridisegnare l'header per far apparire la campana
        this.cdr.detectChanges();
      }
    });
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  closeMenu() {
    this.showMenu = false;
  }

  logout() {
    this.showMenu = false;
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
