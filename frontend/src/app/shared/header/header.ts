import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UI } from '../ui';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ...UI],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {

  isLoggedIn: boolean = false;
  showMenu: boolean = false;
  userSettings: any;
  listaNotifiche: any[] = [];

  constructor(
    public router: Router,
    public userService: UserService,
    private cdr: ChangeDetectorRef
  ) {

    this.isLoggedIn = this.userService.isLoggedIn();

    // markForCheck e non detectChanges: qui la vista non esiste ancora
    this.userService.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
      this.cdr.markForCheck();
    });
  }

  get haNotificheNonLette(): boolean {
    return this.listaNotifiche.length > 0;
  }

  ngOnInit() {
    const currentSettings = this.userService.getSettingsSync();
    if (currentSettings) {
      this.userSettings = currentSettings;
    }
    this.userService.userSettings$.subscribe(settings => {
      if (settings) {
        console.log("Header: Ricevute nuove impostazioni", settings);
        this.userSettings = settings;
        this.cdr.markForCheck();
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
