import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // <--- AGGIUNTO

import { WalletService } from '../../services/wallet.service';
import { UserService } from '../../services/user.service'; // <--- AGGIUNTO
import { Wallet } from '../../models/wallet.model';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.html',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  styleUrls: ['./wallet.css']
})
export class WalletComponent implements OnInit {

  // Variabile di controllo Login
  isLoggedIn: boolean = false;

  wallets: Wallet[] = [];
  loading = true;
  userId: number | null = null;

  showCreate = false;
  showJoin = false;
  inviteCodeInput: string = '';

  constructor(
    private walletService: WalletService,
    private userService: UserService, // <--- AGGIUNTO
    private router: Router,           // <--- AGGIUNTO
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 1. CONTROLLO LOGIN IMMEDIATO
    this.isLoggedIn = this.userService.isLoggedIn();

    // 2. CARICA I DATI SOLO SE LOGGATO
    if (this.isLoggedIn) {
      this.initUser();
    } else {
      // Se non è loggato, smettiamo di caricare (così non gira la rotellina a vuoto)
      this.loading = false;
    }
  }

  // Tasto del blocco overlay
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Funzione di inizializzazione
  initUser() {
    // Proviamo a prendere l'ID dal service prima, poi dal local storage
    const serviceId = this.userService.getCurrentUserId();
    const storedId = serviceId ? serviceId : Number(localStorage.getItem('userId'));

    if (storedId) {
      this.userId = storedId;
      this.loadWallets();
    } else {
      console.warn("ID non trovato subito, riprovo tra 500ms...");
      setTimeout(() => {
        const retryId = localStorage.getItem('userId');
        if (retryId) {
          this.userId = Number(retryId);
          this.loadWallets();
        } else {
          console.error("Errore: Impossibile trovare l'utente.");
          this.loading = false;
        }
      }, 500);
    }
  }

  loadWallets() {
    if (!this.userId) return;

    this.loading = true;
    this.walletService.getUserWallets(this.userId).subscribe({
      next: (res) => {
        // Filtriamo i wallet condivisi
        this.wallets = res.filter(wallet => !wallet.personal);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error("Errore caricamento wallet:", err);
        this.cdr.detectChanges();
      }
    });
  }

  createWallet(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName || !this.userId) return;

    this.walletService.createWallet(this.userId, trimmedName).subscribe({
      next: () => {
        this.loadWallets();
        this.showCreate = false;
      },
      error: (err) => console.error('Errore creazione wallet:', err)
    });
  }

  handleCreateWallet(nameInput: HTMLInputElement) {
    const name = nameInput.value.trim();
    if (!name) return;
    this.createWallet(name);
    nameInput.value = '';
  }

  handleJoinWallet() {
    if (!this.inviteCodeInput || this.inviteCodeInput.trim().length < 6) {
      alert("Inserisci un codice valido di 6 caratteri");
      return;
    }
    if (!this.userId) {
      alert("Errore utente. Riprova a fare login.");
      return;
    }

    this.walletService.joinWalletByCode(this.inviteCodeInput.toUpperCase().trim(), this.userId).subscribe({
      next: (wallet) => {
        alert(`Unito con successo a: ${wallet.name}`);
        this.loadWallets();
        this.showJoin = false;
        this.inviteCodeInput = '';
      },
      error: (err) => {
        console.error("Errore join wallet:", err);
        alert("Codice non valido o sei già membro.");
      }
    });
  }

  leaveWallet(walletId: number): void {
    if (!this.userId) return;
    if(confirm("Vuoi davvero uscire da questo gruppo?")) {
      this.walletService.removeMember(walletId, this.userId, this.userId).subscribe({
        next: () => this.loadWallets(),
        error: err => console.error('Errore uscita wallet', err)
      });
    }
  }

  openWallet(walletId: number): void {
    this.router.navigate([`/dashboardWallet`, walletId]);
  }
}
