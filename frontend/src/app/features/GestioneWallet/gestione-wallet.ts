import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ✅ 1. Importa ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WalletService } from '../../services/wallet.service';
import { UserService } from '../../services/user.service';
import { Wallet } from '../../models/wallet.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-gestione-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './GestioneWallet.html',
  styleUrls: ['./GestioneWallet.css']
})
export class GestioneWallet implements OnInit {
  adminWallets: any[] = [];
  selectedWallet: any | null = null;
  message: string = '';
  isError: boolean = false;
  currentUserId!: number;
  currentUserName: string = '';
  loading: boolean = false;

  constructor(
    private walletService: WalletService,
    private router: Router,
    private UserService: UserService,
    private cdr: ChangeDetectorRef // ✅ 2. Inietta il rilevatore di modifiche
  ) {}

  ngOnInit(): void {
    this.initUser();
  }

  // ✅ 3. Logica di inizializzazione "Smart" (con retry)
  initUser() {
    const userId = this.UserService.getCurrentUserId();

    if (userId) {
      this.startPage(userId);
    } else {
      // Se l'ID non c'è subito, aspettiamo 500ms e riproviamo (risolve il problema del refresh)
      setTimeout(() => {
        const retryId = this.UserService.getCurrentUserId();
        if (retryId) {
          this.startPage(retryId);
        } else {
          this.isError = true;
          this.message = 'Utente non autenticato. Effettua il login.';
          this.loading = false;
        }
      }, 500);
    }
  }

  startPage(userId: number) {
    this.currentUserId = userId;

    // Carica nome utente
    this.UserService.getUserProfile(this.currentUserId).subscribe(user => {
      this.currentUserName = user.nome || user.cognome || 'Admin';
    });

    // Carica i wallet
    this.loadAdminWallets();
  }

  loadAdminWallets() {
    this.loading = true;
    this.walletService.getUserWallets(this.currentUserId).subscribe({
      next: (wallets) => {
        // Filtra: Solo Admin, Solo ID Corrente, NO Wallet Personali
        this.adminWallets = wallets.filter(w =>
          w.admin &&
          w.admin.id === this.currentUserId &&
          !w.personal
        );

        // Se la lista è vuota dopo il filtro, pulisci la selezione
        if (this.adminWallets.length === 0) {
          this.selectedWallet = null;
        }

        this.loading = false;
        this.cdr.detectChanges(); // ✅ 4. Forza l'aggiornamento grafico immediato
      },
      error: () => {
        this.isError = true;
        this.message = "Errore caricamento wallet";
        this.loading = false;
        this.cdr.detectChanges(); // ✅ Aggiorna anche in caso di errore
      }
    });
  }

  selectWallet(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    const index = Number(selectEl.value);
    if (!isNaN(index) && this.adminWallets[index]) {
      this.selectedWallet = this.adminWallets[index];
    } else {
      this.selectedWallet = null;
    }
  }

  saveSettings(): void {
    if (!this.selectedWallet) return;

    // Prendiamo i valori (se vuoti manda 0)
    const budget = this.selectedWallet.monthlyBudget || 0;
    const limit = this.selectedWallet.maxTransferLimit || 0;

    this.walletService.updateSettings(
      this.selectedWallet.id,
      this.currentUserId,
      budget,
      limit
    ).subscribe({
      next: () => {
        this.message = 'Impostazioni aggiornate con successo!';
        this.isError = false;
        this.cdr.detectChanges(); // Aggiorna feedback
      },
      error: (err) => {
        console.error(err);
        this.message = 'Errore salvataggio impostazioni.';
        this.isError = true;
        this.cdr.detectChanges();
      }
    });
  }

  removeMember(memberId: number): void {
    if (!this.selectedWallet) return;
    if (!confirm("Vuoi davvero rimuovere questo membro?")) return;

    this.walletService.removeMember(
      this.selectedWallet.id,
      this.currentUserId,
      memberId
    ).subscribe({
      next: () => {
        // Rimuovi localmente dalla lista
        this.selectedWallet.members = this.selectedWallet.members.filter((m: { id: number; }) => m.id !== memberId);
        this.message = 'Membro rimosso!';
        this.isError = false;
        this.cdr.detectChanges(); // Forza aggiornamento lista
      },
      error: () => {
        this.message = 'Errore durante la rimozione del membro.';
        this.isError = true;
        this.cdr.detectChanges();
      }
    });
  }

  deleteWallet(): void {
    if (!this.selectedWallet) return;
    if (!confirm("ATTENZIONE: il wallet sarà eliminato definitivamente. Continuare?")) return;

    this.walletService.deleteWallet(
      this.selectedWallet.id,
      this.currentUserId
    ).subscribe({
      next: () => {
        this.message = 'Wallet eliminato!';
        this.isError = false;
        this.selectedWallet = null;
        this.loadAdminWallets(); // Ricarica la lista per mostrare la schermata vuota
      },
      error: () => {
        this.message = 'Errore durante l\'eliminazione del wallet.';
        this.isError = true;
        this.cdr.detectChanges();
      }
    });
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
