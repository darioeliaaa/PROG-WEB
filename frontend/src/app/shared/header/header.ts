import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router'; // 1. Aggiungi 'Router' qui

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  // 2. Iniettiamo il Router per poter leggere l'URL corrente
  constructor(public router: Router) {}
}
