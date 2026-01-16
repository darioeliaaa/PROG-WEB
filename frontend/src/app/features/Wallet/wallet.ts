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
        // 1. Prima filtriamo quelli condivisi (togliamo i personali)
        const sharedWallets = res.filter(w => !w.personal);

        // 2. FIX: ORDINAMENTO FORZATO
        // Li ordiniamo per ID: dal più vecchio al più nuovo.
        // In questo modo la posizione sarà SEMPRE la stessa, non importa come risponde il server.
        this.wallets = sharedWallets.sort((a, b) => a.id - b.id);

        /* NOTA: Se invece li vuoi in ordine alfabetico, usa questa riga al posto di quella sopra:
           this.wallets = sharedWallets.sort((a, b) => a.name.localeCompare(b.name));
        */

        this.loading = false;
        this.cdr.detectChanges(); // Aggiorna la grafica
      },
      error: (err) => {
        console.error("Errore load:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  isAdmin(wallet: any): boolean {
    if (!this.userId || !wallet) return false;

    // 1. Controllo prioritario e sicuro: usa il campo adminId se presente
    if (wallet.adminId) {
      return Number(wallet.adminId) === Number(this.userId);
    }

    // 2. Se il backend manda l'oggetto admin
    if (wallet.admin && wallet.admin.id) {
      return Number(wallet.admin.id) === Number(this.userId);
    }

    // 3. NON USARE wallet.members[0]! È instabile.
    // Se non hai i campi sopra, il backend DEVE mandare chi è l'admin.
    return false;
  }

  createWallet(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName || !this.userId) return;

    this.walletService.createWallet(this.userId, trimmedName).subscribe({
      next: () => {
        this.showCreate = false;
        setTimeout(() => {
          this.loadWallets();
        }, 300);
      },
      error: (err) => console.error('Errore creazione:', err)
    });
  }

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
        setTimeout(() => {
          this.loadWallets();
          alert(`Benvenuto in ${wallet.name}!`);
        }, 300);
      },
      error: () => alert("Codice non valido o sei già dentro.")
    });
  }

  leaveWallet(walletId: number): void {
    if (!this.userId) {
      console.error("Errore: Utente non loggato");
      return;
    }

    if(!confirm("Sei sicuro di voler abbandonare questo gruppo?")) {
      return;
    }

    this.walletService.removeMember(walletId, this.userId, this.userId).subscribe({
      next: () => {
        setTimeout(() => {
          this.loadWallets();
          alert("Sei uscito dal wallet correttamente.");
        }, 300);
      },
      error: (err) => {
        console.error("ERRORE BACKEND:", err);
        alert("Impossibile uscire: " + (err.error?.message || "Errore sconosciuto"));
      }
    });
  }

  // --- NUOVA FUNZIONE DELETE (PER ADMIN) ---
  deleteWallet(walletId: number): void {
    if (!this.userId) return;

    // Messaggio di conferma molto chiaro perché l'azione è distruttiva
    const confirmMsg = "ATTENZIONE: Sei sicuro di voler eliminare DEFINITIVAMENTE questo wallet?\n\nTutte le transazioni e i dati verranno persi per sempre. Questa azione non può essere annullata.";

    if (!confirm(confirmMsg)) {
      return;
    }

    // Assumiamo che nel service tu abbia un metodo deleteWallet(walletId, adminId)
    // Se nel backend hai deleteWallet(adminId, walletId), inverti i parametri qui sotto!
    this.walletService.deleteWallet(walletId, this.userId).subscribe({
      next: () => {
        setTimeout(() => {
          this.loadWallets();
          alert("Wallet eliminato con successo.");
        }, 300);
      },
      error: (err) => {
        console.error("Errore eliminazione:", err);
        alert("Errore: " + (err.error?.message || "Impossibile eliminare il wallet."));
      }
    });
  }
  // ----------------------------------------

  openWallet(walletId: number): void {
    this.router.navigate([`/dashboardWallet`, walletId]);
  }
}
