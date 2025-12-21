import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar'; // (Assumendo che il file sia sidebar.ts)
// 1. IMPORTA L'HEADER QUI SOTTO
import { HeaderComponent } from './shared/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. AGGIUNGI HeaderComponent ALLA LISTA IMPORTS
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'frontend';
}
