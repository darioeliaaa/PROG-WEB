import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { WalletService } from '../../services/wallet.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-movimenti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimenti.html',
  styleUrl: './movimenti.css'
})
export class Movimenti implements OnInit {

  // ID del wallet opzionale passato in input (se presente, indica un wallet specifico)
  @Input() walletId?: number;
  // Evento emesso per chiudere il componente/modale
  @Output() close = new EventEmitter<void>();
  // Evento emesso dopo un salvataggio riuscito per aggiornare i dati nel parent
  @Output() saved = new EventEmitter<void>();

  // Oggetto reattivo per il form del nuovo movimento finanziario
  nuovoMovimento = {
    tipo: 'entrata',
    importo: null,
    descrizione: '',
    categoria: '',
    walletId: null as number | null,
    data: new Date().toISOString().split('T')[0] // Data predefinita: oggi
  };

  personalWalletId: number | null = null; // ID del portafoglio personale dell'utente loggato
  isPersonalDashboard: boolean = false;   // Flag per distinguere se l'utente agisce sul proprio wallet o su uno condiviso

  // Stati per la gestione del feedback visivo nella UI
  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Variabili per la gestione della logica di business e dei limiti finanziari
  minLoadLimit: number = 0;   // Deposito minimo (se impostato dall'admin del wallet)
  maxSpendLimit: number = 0;  // Spesa massima (se impostata dall'admin del wallet)
  currentBalance: number = 0; // Saldo calcolato del wallet corrente

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private walletService: WalletService
  ) {}

  /**
   * Inizializzazione del componente:
   * 1. Recupera l'utente corrente e il suo wallet personale.
   * 2. Determina il contesto operativo (Wallet specifico vs Dashboard personale).
   * 3. Carica i limiti del wallet e calcola il saldo disponibile.
   */
  ngOnInit() {
    const userId = this.userService.getCurrentUserId();
    if (!userId) return;

    // Recupera tutti i wallet dell'utente per trovare quello personale
    this.walletService.getUserWallets(userId).subscribe(wallets => {
      const personal = wallets.find(w => w.personal === true);
      if (personal) this.personalWalletId = personal.id;

      if (this.walletId) {
        // Caso: Operazione su un wallet specifico (spesso condiviso)
        this.isPersonalDashboard = false;
        this.nuovoMovimento.walletId = this.walletId;

        // Recupera le impostazioni del wallet (budget e limiti) per le validazioni
        this.walletService.getWalletById(this.walletId).subscribe({
          next: (walletData: any) => {
            this.minLoadLimit = walletData.monthlyBudget || 0;
            this.maxSpendLimit = walletData.maxTransferLimit || 0;
          },
          error: (err) => console.error("Errore limiti wallet", err)
        });

      } else {
        // Caso: Operazione dalla Dashboard personale
        this.isPersonalDashboard = true;
        this.nuovoMovimento.walletId = this.personalWalletId;
      }

      // Inizializza il calcolo del saldo per il wallet selezionato
      if (this.nuovoMovimento.walletId) {
        this.calcolaSaldoDisponibile(this.nuovoMovimento.walletId);
      }
    });
  }

  /**
   * Calcola il saldo corrente sottraendo le uscite dalle entrate caricate dal DB.
   */
  calcolaSaldoDisponibile(wId: number) {
    this.transactionService.getTransactionsByWallet(wId).subscribe({
      next: (txs) => {
        let entrate = 0;
        let uscite = 0;
        txs.forEach((t: any) => {
          if (t.type === 'ENTRATA') entrate += Number(t.amount);
          if (t.type === 'USCITA') uscite += Number(t.amount);
        });
        this.currentBalance = entrate - uscite;
      }
    });
  }

  /**
   * Logica principale di validazione e salvataggio del movimento.
   */
  salva() {
    this.errorMessage = null;
    this.successMessage = null;

    // Validazione campi obbligatori
    if (!this.nuovoMovimento.importo || !this.nuovoMovimento.categoria) {
      this.errorMessage = "Compila importo e categoria.";
      return;
    }

    const userId = this.userService.getCurrentUserId();
    if (!userId || !this.nuovoMovimento.walletId) {
      this.errorMessage = "Errore critico: Wallet non identificato.";
      return;
    }

    const importo = Number(this.nuovoMovimento.importo);

    // CONTROLLO SALDO NEGATIVO: Impedisce uscite superiori al saldo disponibile
    if (this.nuovoMovimento.tipo === 'uscita') {
      if (importo > this.currentBalance) {
        this.errorMessage = `Saldo insufficiente! Hai disponibile solo ${this.currentBalance.toFixed(2)} €`;
        return;
      }
    }

    // CONTROLLI LIMITI AMMINISTRATIVI: Applicati solo se non siamo nel wallet personale
    if (!this.isPersonalDashboard) {
      // Controllo deposito minimo
      if (this.nuovoMovimento.tipo === 'entrata' && this.minLoadLimit > 0) {
        if (importo < this.minLoadLimit) {
          this.errorMessage = `Importo troppo basso! Minimo richiesto: ${this.minLoadLimit} €.`;
          return;
        }
      }

      // Controllo tetto massimo di spesa singola
      if (this.nuovoMovimento.tipo === 'uscita' && this.maxSpendLimit > 0) {
        if (importo > this.maxSpendLimit) {
          this.errorMessage = `Superi il limite di prelievo singolo (${this.maxSpendLimit} €).`;
          return;
        }
      }
    }

    this.isLoading = true; // Attiva lo stato di caricamento per disabilitare il pulsante

    /**
     * GESTIONE SALVATAGGIO DIFFERENZIATA:
     * 1. Dashboard Personale: Salva direttamente entrata o uscita.
     * 2. Wallet Condiviso (Entrata): Esegue un trasferimento dal wallet personale al condiviso.
     * 3. Wallet Condiviso (Uscita): Registra la spesa direttamente sul condiviso.
     */
    if (this.isPersonalDashboard) {
      const tipoReale = (this.nuovoMovimento.tipo === 'entrata') ? 'ENTRATA' : 'USCITA';
      this.salvaTransazioneDB(tipoReale);
    }
    else {
      if (this.nuovoMovimento.tipo === 'entrata') {
        // Deposito nel condiviso prelevando dal personale
        this.walletService.transferMoney(userId, this.personalWalletId!, this.nuovoMovimento.walletId, importo)
          .subscribe({
            next: () => this.handleSuccess(),
            error: () => {
              this.isLoading = false;
              this.errorMessage = "Non hai abbastanza soldi nel tuo Wallet Personale!";
            }
          });
      }
      else {
        // Spesa semplice dal wallet condiviso
        this.salvaTransazioneDB('USCITA');
      }
    }
  }

  /**
   * Metodo helper per persistere la transazione sul database tramite il servizio.
   */
  salvaTransazioneDB(tipo: 'ENTRATA' | 'USCITA') {
    const tx: Transaction = {
      description: this.nuovoMovimento.descrizione || (tipo === 'ENTRATA' ? 'Deposito' : 'Spesa'),
      category: this.nuovoMovimento.categoria,
      amount: Number(this.nuovoMovimento.importo),
      date: this.nuovoMovimento.data,
      type: tipo
    };

    this.transactionService.add(this.userService.getCurrentUserId()!, this.nuovoMovimento.walletId!, tx)
      .subscribe({
        next: () => this.handleSuccess(),
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.errorMessage = "Errore durante il salvataggio.";
        }
      });
  }

  /**
   * Gestisce il feedback di successo e avvia la chiusura automatica del pannello.
   */
  handleSuccess() {
    this.isLoading = false;
    this.successMessage = "Fatto!";

    // Delay di 500ms per permettere all'utente di leggere il messaggio di successo
    setTimeout(() => {
      this.concludi();
    }, 500);
  }

  /**
   * Emette gli eventi di salvataggio/chiusura e pulisce il modulo.
   */
  concludi() {
    this.saved.emit();
    this.close.emit();
    this.resetForm();
  }

  /**
   * Ripristina lo stato iniziale del modulo per l'inserimento successivo.
   */
  resetForm() {
    this.nuovoMovimento.importo = null;
    this.nuovoMovimento.descrizione = '';
    this.nuovoMovimento.categoria = '';
    this.nuovoMovimento.tipo = 'uscita';
    this.successMessage = null;
    this.errorMessage = null;
    this.currentBalance = 0;
  }

  /**
   * Annulla l'operazione in corso chiudendo il pannello.
   */
  annulla() {
    this.close.emit();
  }
}
