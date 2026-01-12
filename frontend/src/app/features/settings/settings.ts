import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Per usare ngModel
import { WalletService } from '../../../app/services/wallet.service';
import {Profilo} from '../Profilo/profilo';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, Profilo],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  activeTab: string = 'profilo';
  userWallets: any[] = [];
  userId: number = 1; // Temporaneo: qui andrà l'ID dell'utente loggato
  selectedWallet: any = null;
  members: any[] = [];
  showCreateForm: boolean = false;
  newWallet: any = { name: '', monthlyBudget: 0 };
  newUserEmail: string = '';

  constructor(private walletService: WalletService) {}

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.walletService.getUserWallets(this.userId).subscribe({
      next: (data) => this.userWallets = data,
      error: (err) => console.error('Errore nel caricamento wallet', err)
    });
  }

  setTab(tabName: string) {
    this.activeTab = tabName;
    this.selectedWallet = null; // Chiude il pannello gestione se cambi tab
    this.showCreateForm = false;
  }

  openManage(wallet: any) {
    this.selectedWallet = { ...wallet }; // Creiamo una copia per non modificare l'originale subito
    this.walletService.getWalletMembers(wallet.id).subscribe({
      next: (data) => {
        this.members = data; // Popoliamo la variabile che hai appena creato
      },
      error: (err) => console.error('Errore nel caricamento membri', err)
    });
  }

  saveWalletSettings() {
    if (!this.selectedWallet) return;

    const walletId = this.selectedWallet.id;
    const adminId = this.userId;
    const newName = this.selectedWallet.name;
    const newBudget = this.selectedWallet.monthlyBudget;

    // 1. Chiamata per rinominare il portafoglio
    this.walletService.renameWallet(walletId, adminId, newName).subscribe({
      next: () => {
        // 2. Se il nome è ok, aggiorniamo il budget
        this.walletService.updateBudget(walletId, adminId, newBudget).subscribe({
          next: () => {
            alert('Impostazioni salvate con successo!');
            this.loadWallets(); // Ricarica la lista per vedere i nomi aggiornati
            this.selectedWallet = null; // Torna alla lista
          },
          error: (err) => {
            console.error(err);
            alert('Errore durante l\'aggiornamento del budget.');
          }
        });
      },
      error: (err) => {
        console.error(err);
        alert('Errore durante il salvataggio del nome: ' + (err.error || 'Riprova più tardi'));
      }
    });
  }
  removeUser(memberId: number) {
    if (!this.selectedWallet) return;

    const confermato = confirm("Sei sicuro di voler rimuovere questo utente dal portafoglio?");

    if (confermato) {
      this.walletService.removeMember(this.selectedWallet.id, this.userId, memberId).subscribe({
        next: () => {
          // Aggiorniamo la lista locale dei membri senza ricaricare tutto
          this.members = this.members.filter(m => m.id !== memberId);
          alert('Utente rimosso correttamente.');
        },
        error: (err) => alert('Errore nella rimozione dell\'utente.')
      });
    }
  }
  createNewWallet() {
    if (!this.newWallet.name || this.newWallet.monthlyBudget <= 0) {
      alert("Per favore, inserisci un nome e un budget validi.");
      return;
    }

    // Chiamata al service
    this.walletService.createWallet(this.userId, this.newWallet).subscribe({
      next: (res: any) => {
        alert("Portafoglio creato con successo!");
        this.showCreateForm = false; // Chiude il form
        this.newWallet = { name: '', monthlyBudget: 0 }; // Resetta i campi
        this.loadWallets(); // Ricarica la lista per vedere il nuovo wallet
      },
      error: (err: any) => {
        console.error(err);
        alert("Errore durante la creazione del portafoglio.");
      }
    });
  }
}
