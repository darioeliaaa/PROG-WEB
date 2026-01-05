import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  isLoggedIn = false;

  constructor(public router: Router, public userService: UserService) {
    this.userService.isLoggedIn$.subscribe(isLoggedIn => this.isLoggedIn = isLoggedIn);
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
