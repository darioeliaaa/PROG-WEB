import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Movimenti } from './features/movimenti/movimenti';
import { Login } from './features/auth/login/login';
import { Profilo } from './features/Profilo/profilo';
import { MarketHomeComponent } from './features/market/market-home/market-home';
import { AssetListComponent } from './features/market/asset-list/asset-list';

import { StockChart } from './features/market/stock-chart/stock-chart';
import {WalletComponent} from './features/Wallet/wallet';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },

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

  { path: 'movimenti', component: Movimenti },
  { path: 'login' , component: Login },
  { path: 'profilo' , component: Profilo },
  { path: 'wallet', component: WalletComponent }
];
