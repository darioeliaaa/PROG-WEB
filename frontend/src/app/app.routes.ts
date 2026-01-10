import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';

import { Movimenti } from './features/movimenti/movimenti';
import { Login } from './features/auth/login/login';
import { Profilo } from './features/Profilo/profilo';
import { MarketHomeComponent } from './features/market/market-home/market-home';

// 1. IMPORTA IL COMPONENTE CHE GESTISCE LA LISTA
import { AssetListComponent } from './features/market/asset-list/asset-list';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },

  {
    path: 'market',
    component: MarketHomeComponent // 1. Pagina Principale (Vetrina)
  },
  {
    path: 'market/azioni',
    component: AssetListComponent, // 2. Lista Completa Azioni
    data: { type: 'STOCK' }
  },
  {
    path: 'market/etf',
    component: AssetListComponent, // 3. Lista Completa ETF
    data: { type: 'ETF' }
  },
  {
    path: 'market/crypto',
    component: AssetListComponent, // 4. Lista Completa Crypto
    data: { type: 'CRYPTO' }
  },

  // Se l'utente scrive solo "localhost:4200/market", lo mandiamo alle azioni di default
  { path: 'market', redirectTo: 'market/dashboard', pathMatch: 'full' },

  // --- FINE NUOVE ROTTE MARKET ---

  { path: 'movimenti', component: Movimenti },
  { path: 'login' , component: Login },
  { path: 'profilo' , component: Profilo }
];
