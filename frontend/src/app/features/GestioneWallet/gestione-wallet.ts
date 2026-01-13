import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-gestione-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestione-wallet.html',
  styleUrls: ['./gestione-wallet.css']
})
export class GestioneWallet {
  walletId: number | null = null;
  walletName: string = '';
  walletBalance: number = 0;
  walletCurrency: string = '';
  walletPersonal: boolean = false;

  constructor(private walletService: WalletService, private router: Router) {}
}
