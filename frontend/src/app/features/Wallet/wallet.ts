import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- AGGIUNTO ChangeDetectorRef
import { WalletService } from '../../services/wallet.service';
import { Wallet } from '../../models/wallet.model';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule
  ],
  styleUrls: ['./wallet.css']
})
export class WalletComponent implements OnInit {

  wallets: Wallet[] = [];
  loading = true;
  userId: number | null = null;

  showCreate = false;
  showJoin = false;
  inviteCodeInput: string = '';

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef // <--- INIEZIONE FONDAMENTALE PER AGGIORNARE LA VISTA
  ) {}

  ngOnInit() {
    this.initUser();
  }

  // Funzione di inizializzazione robusta
  initUser() {
    const storedId = localStorage.getItem('userId');

    if (storedId) {
      this.userId = Number(storedId);
      this.loadWallets();
    } else {
      // FIX PER "DEVO RICARICARE":
      // Se l'ID non c'è (magari il login sta ancora finendo di scrivere),
      // aspettiamo 500ms e riproviamo.
      console.warn("ID non trovato subito, riprovo tra 500ms...");
      setTimeout(() => {
        const retryId = localStorage.getItem('userId');
        if (retryId) {
          this.userId = Number(retryId);
          this.loadWallets();
        } else {
          console.error("Errore: Impossibile trovare l'utente. Effettua il login.");
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

        // AGGIORNAMENTO FORZATO DELLA GRAFICA
        // Risolve il problema "va lento" o "non vedo le cose"
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error("Errore caricamento wallet:", err);
        this.cdr.detectChanges(); // Aggiorna anche in caso di errore
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
}
