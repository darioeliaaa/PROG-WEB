import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class GestioneWallet implements OnInit{
  adminWallets: any[] = [];
  selectedWallet: any | null = null;
  monthlyBudget: number | null = null;
  message: string = '';
  isError: boolean = false;
  currentUserId!: number;
  currentUserName: string = '';
  loading: boolean = false;

  constructor(private walletService: WalletService, private router: Router, private UserService: UserService) {}

  ngOnInit(): void {
    const userId = this.UserService.getCurrentUserId();

    if (!userId) {
      this.isError = true;
      this.message = 'Utente non autenticato';
      return;
    }

    if(this.currentUserId){
      this.UserService.getUserProfile(this.currentUserId).subscribe(user => {this.currentUserName = user.nome|| user.cognome || 'U';})
    }

    this.currentUserId = userId;
    this.loadAdminWallets();
  }

  loadAdminWallets(){
    this.loading = true;

    this.walletService.getUserWallets(this.currentUserId).subscribe({
      next: (wallets) => {
        this.adminWallets = wallets.filter(w => w.admin && w.admin.id === this.currentUserId);
        this.loading = false;
      },
      error: () =>{
        this.isError = true;
        this.message = "Errore caricamento wallet";
        this.loading = false;
      }
      });
  }

  selectWallet(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    const index = Number(selectEl.value); // valore dell'opzione selezionata
    if (!isNaN(index) && this.adminWallets[index]) {
      this.selectedWallet = this.adminWallets[index];
    } else {
      this.selectedWallet = null;
    }
  }



  updateBudget(): void{
    if (!this.selectedWallet || this.monthlyBudget === null) return;

    this.walletService.updateBudget(
      this.selectedWallet.id,
      this.monthlyBudget,
      this.currentUserId
    ).subscribe({
      next: () => {
        this.message = 'Budget aggiornato!';
        this.isError = false;
        this.selectedWallet.monthlyBudget = this.monthlyBudget;
      },
      error: () => {
        this.message = 'Errore durante l\'aggiornamento del budget.';
        this.isError = true;

      }
    });
  }

  removeMember(memberId: number): void{
    if (!this.selectedWallet) return;

    if (!confirm("Vuoi davvero rimuovere questo membro?")) return;

    this.walletService.removeMember(
      this.selectedWallet.id,
      this.currentUserId,
      memberId
    ).subscribe({
      next: () => {
        this.selectedWallet.members = this.selectedWallet.members.filter((m: { id: number; }) => m.id !== memberId);
        this.message = 'Membro rimosso!';
        this.isError = false;
      },
      error: () => {
        this.message = 'Errore durante la rimozione del membro.';
        this.isError = true;
      }
    });
  }

  deleteWallet(): void{
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
        this.loadAdminWallets();
      },
      error: () => {
        this.message = 'Errore durante l\'eliminazione del wallet.';
        this.isError = true;
      }
    });
  }

  getMembersArray(wallet: Wallet | null): User[] {
    return wallet ? Array.from(wallet.members) : [];
  }

  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
