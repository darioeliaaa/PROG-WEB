import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UI } from '../shared/ui';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ...UI],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
}
