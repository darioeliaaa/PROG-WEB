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
import { NotifichePage } from './shared/notifiche/notifiche';
import { DashboardWallet } from './features/DashboardWallet/dashboard-wallet';
import { ChiSiamoComponent } from './features/chi-siamo/chi-siamo';

/**
 * Configurazione principale delle rotte dell'applicazione.
 * Associa ogni URL al componente corrispondente.
 */
export const routes: Routes = [
  // Rotta di default: reindirizza alla pagina Market quando l'URL è vuoto
  { path: '', redirectTo: 'market', pathMatch: 'full' },

  // Dashboard generale dell'utente
  { path: 'dashboard', component: Dashboard },

  // Dashboard specifica per un singolo Wallet, identificato tramite ID dinamico
  { path: 'dashboardWallet/:id', component: DashboardWallet },

  // Home page della sezione mercato/investimenti
  {
    path: 'market',
    component: MarketHomeComponent
  },

  // Pagina dedicata alla visualizzazione delle notifiche utente
  { path: 'notifiche', component: NotifichePage },

  // Rotte per il mercato, differenziate tramite il campo 'data' per filtrare gli asset
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

  // Visualizzazione dei grafici per un titolo specifico (es. AAPL, BTC) tramite simbolo
  { path: 'market/chart/:symbol', component: StockChart },

  // Altre rotte dell'applicazione
  { path: 'movimenti', component: Movimenti },
  { path: 'login' , component: Login },
  { path: 'profilo' , component: Profilo },
  { path: 'settings', component: SettingsComponent },
  { path: 'wallet', component: WalletComponent },
  { path: 'gestioneWallet', component: GestioneWallet },
  { path: 'portfolio', component: MyPortfolioComponent },
  { path: 'chi-siamo', component: ChiSiamoComponent },
];
