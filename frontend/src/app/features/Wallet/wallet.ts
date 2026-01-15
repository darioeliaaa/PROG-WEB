import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { WalletService } from '../../services/wallet.service';
import { UserService } from '../../services/user.service';
import { Wallet } from '../../models/wallet.model';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.html',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, CommonModule],
  styleUrls: ['./wallet.css']
})
export class WalletComponent implements OnInit {

  isLoggedIn: boolean = false;
  wallets: Wallet[] = [];
  loading = true;
  userId: number | null = null;

  showCreate = false;
  showJoin = false;
  inviteCodeInput: string = '';

  constructor(
    private walletService: WalletService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.userService.isLoggedIn();
    if (this.isLoggedIn) {
      this.initUser();
    } else {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  initUser() {
    const serviceId = this.userService.getCurrentUserId();
    const storedId = serviceId ? serviceId : Number(localStorage.getItem('userId'));

    if (storedId) {
      this.userId = storedId;
      this.loadWallets();
    } else {
      setTimeout(() => {
        const retryId = localStorage.getItem('userId');
        if (retryId) {
          this.userId = Number(retryId);
          this.loadWallets();
        } else {
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
        // Filtra solo quelli non personali (condivisi)
        this.wallets = res.filter(w => !w.personal);
        this.loading = false;
        // Forza l'aggiornamento della grafica
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore load:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  isAdmin(wallet: any): boolean {
    if (!this.userId) return false;
    if (wallet.adminId) return wallet.adminId === this.userId;
    if (wallet.members && wallet.members.length > 0) return wallet.members[0].id === this.userId;
    return false;
  }

  // --- MODIFICA FONDAMENTALE QUI SOTTO ---
  createWallet(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName || !this.userId) return;

    this.walletService.createWallet(this.userId, trimmedName).subscribe({
      next: () => {
        // 1. Chiudi subito il pannello
        this.showCreate = false;

        // 2. Aspetta 300ms che il DB finisca di scrivere, poi ricarica
        setTimeout(() => {
          this.loadWallets();
        }, 300);
      },
      error: (err) => console.error('Errore creazione:', err)
    });
  }
  // ---------------------------------------

  handleCreateWallet(nameInput: HTMLInputElement) {
    const name = nameInput.value.trim();
    if (!name) return;
    this.createWallet(name);
    nameInput.value = '';
  }

  handleJoinWallet() {
    if (!this.inviteCodeInput || this.inviteCodeInput.length < 6) {
      alert("Codice troppo corto");
      return;
    }
    if (!this.userId) return;

    this.walletService.joinWalletByCode(this.inviteCodeInput.toUpperCase().trim(), this.userId).subscribe({
      next: (wallet) => {
        this.showJoin = false;
        this.inviteCodeInput = '';

        // Anche qui mettiamo un piccolo timeout per sicurezza
        setTimeout(() => {
          this.loadWallets();
          alert(`Benvenuto in ${wallet.name}!`);
        }, 300);
      },
      error: () => alert("Codice non valido o sei già dentro.")
    });
  }

  leaveWallet(walletId: number): void {
    if (!this.userId) return;
    if(confirm("Uscire dal gruppo?")) {
      this.walletService.removeMember(walletId, this.userId, this.userId).subscribe({
        next: () => {
          // Piccolo timeout anche qui per sicurezza
          setTimeout(() => {
            this.loadWallets();
          }, 300);
        },
        error: err => console.error(err)
      });
    }
  }

  openWallet(walletId: number): void {
    this.router.navigate([`/dashboardWallet`, walletId]);
  }
}
