import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
// Market non serve più importarlo qui se usiamo AssetListComponent per le liste
// import { Market } from './features/market/market';
import { Movimenti } from './features/movimenti/movimenti';
import { Login } from './features/auth/login/login';
import { Profilo } from './features/Profilo/profilo';

// 1. IMPORTA IL COMPONENTE CHE GESTISCE LA LISTA
import { AssetListComponent } from './features/market/asset-list/asset-list';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },

  // --- INIZIO NUOVE ROTTE MARKET ---
  // Queste rotte corrispondono esattamente ai routerLink che hai messo nella sidebarMarket.html

  {
    path: 'market/dashboard',
    component: AssetListComponent,
    data: { type: 'STOCK' } // <-- Questo dice alla lista: "Mostra solo le AZIONI"
  },
  {
    path: 'market/wallet',
    component: AssetListComponent,
    data: { type: 'ETF' }   // <-- "Mostra solo ETF"
  },
  {
    path: 'market/crypto',
    component: AssetListComponent,
    data: { type: 'CRYPTO' } // <-- "Mostra solo CRYPTO"
  },

  // Se l'utente scrive solo "localhost:4200/market", lo mandiamo alle azioni di default
  { path: 'market', redirectTo: 'market/dashboard', pathMatch: 'full' },

  // --- FINE NUOVE ROTTE MARKET ---

  { path: 'movimenti', component: Movimenti },
  { path: 'login' , component: Login },
  { path: 'profilo' , component: Profilo }
];
