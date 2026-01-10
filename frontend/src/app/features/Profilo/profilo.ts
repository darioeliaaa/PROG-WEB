import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ✅ 1. Importa ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profilo.html',
  styleUrls: ['./profilo.css']
})
export class Profilo implements OnInit {

  userId: number | null = null;
  message: string = '';
  isError: boolean = false;

  userData: any = {
    nome: '',
    cognome: '',
    sesso: '',
    dataDiNascita: '',
    telefono: '',
    indirizzo: ''
  };

  constructor(
    private userService: UserService,
    private router: Router,
    private cd: ChangeDetectorRef // ✅ 2. Iniettalo qui
  ) {}

  ngOnInit(): void {
    this.userId = this.userService.getCurrentUserId();

    if (this.userId) {
      this.loadUserData();
    }
  }

  loadUserData() {
    if (!this.userId) return;

    this.userService.getUserProfile(this.userId).subscribe({
      next: (data) => {
        console.log("Dati scaricati:", data);

        this.userData = data;

        // Fix data se necessario
        if (this.userData.dataDiNascita) {
          this.userData.dataDiNascita = this.userData.dataDiNascita.toString().split('T')[0];
        }

        // ✅ 3. FORZA L'AGGIORNAMENTO GRAFICO ORA!
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento:', err);
      }
    });
  }

  onSubmit() {
    if (!this.userId) return;

    this.userService.updateProfile(this.userId, this.userData).subscribe({
      next: () => {
        this.message = 'Profilo aggiornato!';
        this.isError = false;
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        this.message = 'Errore salvataggio.';
        this.isError = true;
      }
    });
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
