import { Component } from '@angular/core';
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
export class HeaderComponent {

  isLoggedIn: boolean = false;
  showMenu: boolean = false;

  constructor(public router: Router, public userService: UserService) {

    // 1. Prendi il valore iniziale direttamente dal Service (che ora è corretto subito)
    this.isLoggedIn = this.userService.isLoggedIn();

    // 2. Iscriviti per i cambiamenti futuri (login/logout)
    this.userService.isLoggedIn$.subscribe(state => {
      this.isLoggedIn = state;
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
