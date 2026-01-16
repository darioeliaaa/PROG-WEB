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

  // Stato della sessione e dati dei wallet
  isLoggedIn: boolean = false;
  wallets: Wallet[] = [];
  loading = true; // Gestisce la visualizzazione dello spinner di caricamento
  userId: number | null = null;

  // Variabili per il controllo della UI (modali/sezioni a comparsa)
  showCreate = false;
  showJoin = false;
  inviteCodeInput: string = ''; // Input per il codice di invito al wallet

  constructor(
    private walletService: WalletService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef // Iniezione del rilevatore di modifiche per aggiornamenti manuali
  ) {}

  /**
   * Inizializzazione: verifica se l'utente è loggato e avvia il recupero dati.
   */
  ngOnInit() {
    this.isLoggedIn = this.userService.isLoggedIn();
    if (this.isLoggedIn) {
      this.initUser();
    } else {
      this.loading = false;
    }
  }

  // Navigazione verso la pagina di login se l'utente è ospite
  goToLogin() {
    this.router.navigate(['/login']);
  }

  /**
   * Identifica l'utente corrente cercando l'ID nel service o nel localStorage.
   * Include un meccanismo di retry per gestire il ritardo nel caricamento dei dati di sessione.
   */
  initUser() {
    const serviceId = this.userService.getCurrentUserId();
    const storedId = serviceId ? serviceId : Number(localStorage.getItem('userId'));

    if (storedId) {
      this.userId = storedId;
      this.loadWallets();
    } else {
      // Se l'ID non è subito disponibile, riprova dopo 500ms
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

  /**
   * Recupera i wallet dell'utente dal server.
   * Filtra i wallet personali e applica un ordinamento deterministico per la UI.
   */
  loadWallets() {
    if (!this.userId) return;

    this.loading = true;
    this.walletService.getUserWallets(this.userId).subscribe({
      next: (res) => {
        // 1. Filtra solo i wallet condivisi (esclude quelli personali/privati)
        const sharedWallets = res.filter(w => !w.personal);

        // 2. FIX: ORDINAMENTO FORZATO per ID (dal più vecchio al più nuovo)
        // Garantisce che le card rimangano sempre nella stessa posizione visiva.
        this.wallets = sharedWallets.sort((a, b) => a.id - b.id);

        this.loading = false;
        this.cdr.detectChanges(); // Forza il refresh grafico per mostrare i wallet caricati
      },
      error: (err) => {
        console.error("Errore load:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Determina se l'utente loggato è il proprietario/amministratore del wallet.
   * Utilizza diversi controlli (ID diretto o oggetto admin) per massima compatibilità con il backend.
   */
  isAdmin(wallet: any): boolean {
    if (!this.userId || !wallet) return false;

    // Controllo tramite campo adminId diretto
    if (wallet.adminId) {
      return Number(wallet.adminId) === Number(this.userId);
    }

    // Controllo tramite oggetto admin mappato
    if (wallet.admin && wallet.admin.id) {
      return Number(wallet.admin.id) === Number(this.userId);
    }

    return false;
  }

  /**
   * Crea un nuovo wallet nel database per l'utente corrente.
   */
  createWallet(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName || !this.userId) return;

    this.walletService.createWallet(this.userId, trimmedName).subscribe({
      next: () => {
        this.showCreate = false;
        // Piccolo delay prima del ricarico per permettere la propagazione dei dati sul server
        setTimeout(() => {
          this.loadWallets();
        }, 300);
      },
      error: (err) => console.error('Errore creazione:', err)
    });
  }

  // Gestore per l'invio del form di creazione tramite input testuale
  handleCreateWallet(nameInput: HTMLInputElement) {
    const name = nameInput.value.trim();
    if (!name) return;
    this.createWallet(name);
    nameInput.value = ''; // Resetta il campo dopo l'invio
  }

  /**
   * Permette all'utente di unirsi a un wallet esistente tramite codice alfanumerico.
   */
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

  /**
   * Rimuove l'utente corrente dal wallet specificato (Abbandona gruppo).
   */
  leaveWallet(walletId: number): void {
    if (!this.userId) {
      console.error("Errore: Utente non loggato");
      return;
    }

    if(!confirm("Sei sicuro di voler abbandonare questo gruppo?")) {
      return;
    }

    // Il metodo removeMember viene usato con l'ID dell'utente sia come target che come richiedente
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

  /**
   * ELIMINAZIONE WALLET (Riservata agli admin):
   * Cancella permanentemente l'intero wallet e tutte le transazioni associate.
   */
  deleteWallet(walletId: number): void {
    if (!this.userId) return;

    const confirmMsg = "ATTENZIONE: Sei sicuro di voler eliminare DEFINITIVAMENTE questo wallet?\n\nTutte le transazioni e i dati verranno persi per sempre. Questa azione non può essere annullata.";

    if (!confirm(confirmMsg)) {
      return;
    }

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

  /**
   * Naviga verso la dashboard specifica del wallet selezionato.
   */
  openWallet(walletId: number): void {
    this.router.navigate([`/dashboardWallet`, walletId]);
  }
}
