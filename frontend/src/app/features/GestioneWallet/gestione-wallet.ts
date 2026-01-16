import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ✅ 1. ChangeDetectorRef gestisce aggiornamenti UI manuali
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
  // Array dei wallet in cui l'utente ha permessi amministrativi
  adminWallets: any[] = [];
  // Il wallet correntemente selezionato nel dropdown per la modifica
  selectedWallet: any | null = null;
  // Variabili per il feedback utente (messaggi di successo o errore)
  message: string = '';
  isError: boolean = false;
  // Dati dell'utente amministratore
  currentUserId!: number;
  currentUserName: string = '';
  // Stato di caricamento per mostrare eventuali spinner
  loading: boolean = false;

  constructor(
    private walletService: WalletService,
    private router: Router,
    private UserService: UserService,
    private cdr: ChangeDetectorRef // ✅ 2. Fondamentale per aggiornare la vista in operazioni asincrone complesse
  ) {}

  /**
   * Ciclo di vita: Avvia la procedura di recupero dell'identità utente.
   */
  ngOnInit(): void {
    this.initUser();
  }

  /**
   * ✅ 3. Logica di inizializzazione "Smart":
   * Risolve il problema del refresh della pagina dove il servizio potrebbe non aver ancora
   * caricato l'ID dal localStorage/sessione. Se fallisce, riprova dopo mezzo secondo.
   */
  initUser() {
    const userId = this.UserService.getCurrentUserId();

    if (userId) {
      this.startPage(userId);
    } else {
      // Meccanismo di retry per garantire la robustezza al ricaricamento del browser
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

  /**
   * Configura la pagina recuperando il profilo utente e la lista dei wallet.
   */
  startPage(userId: number) {
    this.currentUserId = userId;

    // Recupera il profilo per visualizzare il nome dell'admin nell'intestazione
    this.UserService.getUserProfile(this.currentUserId).subscribe(user => {
      this.currentUserName = user.nome || user.cognome || 'Admin';
    });

    this.loadAdminWallets();
  }

  /**
   * Carica i wallet dal server e applica filtri stringenti:
   * - L'utente deve essere l'admin.
   * - Non deve essere un wallet personale (la gestione è per i condivisi).
   */
  loadAdminWallets() {
    this.loading = true;
    this.walletService.getUserWallets(this.currentUserId).subscribe({
      next: (wallets) => {
        // Filtro logico lato client per isolare i wallet amministrabili
        this.adminWallets = wallets.filter(w =>
          w.admin &&
          w.admin.id === this.currentUserId &&
          !w.personal
        );

        if (this.adminWallets.length === 0) {
          this.selectedWallet = null;
        }

        this.loading = false;
        this.cdr.detectChanges(); // ✅ 4. Notifica Angular che i dati filtrati sono pronti per il rendering
      },
      error: () => {
        this.isError = true;
        this.message = "Errore caricamento wallet";
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Gestisce il cambio di selezione nel menu a tendina.
   */
  selectWallet(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    const index = Number(selectEl.value);
    if (!isNaN(index) && this.adminWallets[index]) {
      this.selectedWallet = this.adminWallets[index];
    } else {
      this.selectedWallet = null;
    }
  }

  /**
   * Salva le modifiche ai limiti finanziari (budget e tetto trasferimenti).
   */
  saveSettings(): void {
    if (!this.selectedWallet) return;

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
        this.cdr.detectChanges(); // Mostra il feedback positivo nella UI
      },
      error: (err) => {
        console.error(err);
        this.message = 'Errore salvataggio impostazioni.';
        this.isError = true;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Espelle un partecipante dal wallet.
   * Aggiorna la lista locale istantaneamente per una UX reattiva.
   */
  removeMember(memberId: number): void {
    if (!this.selectedWallet) return;
    if (!confirm("Vuoi davvero rimuovere questo membro?")) return;

    this.walletService.removeMember(
      this.selectedWallet.id,
      this.currentUserId,
      memberId
    ).subscribe({
      next: () => {
        // Ottimizzazione locale: rimuove il membro dall'array senza rifare la chiamata GET
        this.selectedWallet.members = this.selectedWallet.members.filter((m: { id: number; }) => m.id !== memberId);
        this.message = 'Membro rimosso!';
        this.isError = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Errore durante la rimozione del membro.';
        this.isError = true;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Elimina l'intero wallet dal database. Operazione irreversibile.
   */
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
        this.loadAdminWallets(); // Ricarica la lista per riflettere l'eliminazione
      },
      error: () => {
        this.message = 'Errore durante l\'eliminazione del wallet.';
        this.isError = true;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Navigazione programmatica per tornare alla vista principale.
   */
  backToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
