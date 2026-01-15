import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ IMPORTANTE
import { RouterModule, Router } from '@angular/router';


@Component({
  selector: 'app-notifiche',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifiche.html',
  styleUrl: './notifiche.css'
})

export class NotifichePage {

  listaNotifiche: any[] = [];
  constructor(private router: Router) {}
  backToDashboard()
  {
    this.router.navigate(['/dashboard']);
  }
}


