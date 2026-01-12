import { Component, OnInit } from '@angular/core';
import { WalletService} from '../../services/wallet.service';
import { Wallet } from '../../models/wallet.model';
import {NgIf, NgFor} from '@angular/common';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.html',
  imports: [
    NgIf,
    NgFor
  ],
  styleUrls: ['./wallet.css']
})

export class WalletComponent implements OnInit {
  wallets: Wallet[] = [];
  loading = true;
  userId: number =1;
  showCreate=false;

  constructor(private walletService: WalletService) {
  }

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.loading = true;
    this.walletService.getUserWallets(this.userId).subscribe({
      next: (res) => {
        this.wallets = res.filter(wallet => !wallet.personal);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createWallet(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    this.walletService.createWallet(this.userId, trimmedName).subscribe({
      next: () => this.loadWallets()
    });
  }

  handleCreateWallet(nameInput: HTMLInputElement) {
    const name = nameInput.value.trim();
    if (!name) return;
    this.createWallet(name);
    this.showCreate = false;
    nameInput.value = ''; // opzionale: pulire input
  }

  /** Rinomina un wallet (solo admin) */
  renameWallet(walletId: number, adminId: number, newName: string): void {
    this.walletService.renameWallet(walletId, adminId, newName).subscribe({
      next: () => this.loadWallets(),
      error: (err) => console.error('Errore rinomina wallet:', err)
    });
  }

  /** Aggiorna il budget (solo admin) */
  updateBudget(walletId: number, adminId: number, budget: number): void {
    this.walletService.updateBudget(walletId, adminId, budget).subscribe({
      next: () => this.loadWallets(),
      error: (err) => console.error('Errore aggiornamento budget:', err)
    });
  }

  /** Rimuove un membro dal wallet */
  removeMember(walletId: number, adminId: number, memberId: number): void {
    this.walletService.removeMember(walletId, adminId, memberId).subscribe({
      next: () => this.loadWallets(),
      error: (err) => console.error('Errore rimozione membro:', err)
    });
  }

  leaveWallet(walletId: number): void {
    // per ora usiamo userId come adminId (poi lo miglioreremo)
    this.walletService.removeMember(walletId, this.userId, this.userId).subscribe({
      next: () => this.loadWallets(),
      error: err => console.error('Errore abbandono wallet', err)
    });
  }

  enterWallet(walletId: number) {
    this.walletService.joinWallet(walletId, this.userId).subscribe({
      next: (wallet: Wallet) => {
        // Aggiorna solo il wallet appena entrato nella lista
        const index = this.wallets.findIndex(w => w.id === wallet.id);
        if (index >= 0) {
          this.wallets[index] = wallet; // aggiorna i membri
        } else {
          this.wallets.push(wallet); // aggiunge se non presente
        }
      },
      error: err => console.error('Errore entrata wallet', err)
    });
  }


}
