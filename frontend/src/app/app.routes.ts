import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Movimenti } from './features/movimenti/movimenti';
import { Login } from './features/auth/login/login';
import { Profilo } from './features/Profilo/profilo';
import { MarketHomeComponent } from './features/market/market-home/market-home';
import { AssetListComponent } from './features/market/asset-list/asset-list';
import { GestioneWallet} from './features/GestioneWallet/gestione-wallet';
import { MyPortfolioComponent } from './features/portfolio/my-portfolio/my-portfolio';
import { StockChart } from './features/market/stock-chart/stock-chart';
import { SettingsComponent } from './features/settings/settings';
import { WalletComponent } from './features/Wallet/wallet';

import { DashboardWallet } from './features/DashboardWallet/dashboard-wallet';
import { ChiSiamoComponent } from './features/chi-siamo/chi-siamo';

export const routes: Routes = [

  // Redirect iniziale
  { path: '', redirectTo: 'market', pathMatch: 'full' },

  // Dashboard Generale
  { path: 'dashboard', component: Dashboard },

  // Dashboard specifica del Wallet (quella su cui stiamo lavorando)
  { path: 'dashboardWallet/:id', component: DashboardWallet },

  // Market Routes
  {
    path: 'market',
    component: MarketHomeComponent
  },
  {
    path: 'market/azioni',
    component: AssetListComponent,
    data: { type: 'STOCK' }
  },
  {
    path: 'market/etf',
    component: AssetListComponent,
    data: { type: 'ETF' }
  },
  {
    path: 'market/crypto',
    component: AssetListComponent,
    data: { type: 'CRYPTO' }
  },
  { path: 'market/chart/:symbol', component: StockChart },

  // Altre feature
  { path: 'movimenti', component: Movimenti },
  { path: 'login' , component: Login },
  { path: 'profilo' , component: Profilo },
  { path: 'settings', component: SettingsComponent },
  { path: 'wallet', component: WalletComponent },
  { path: 'gestioneWallet', component: GestioneWallet },
  { path: 'portfolio', component: MyPortfolioComponent },

  // Chi siamo
  { path: 'chi-siamo', component: ChiSiamoComponent },

];
