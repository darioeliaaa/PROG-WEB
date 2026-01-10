import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Movimenti } from './features/movimenti/movimenti';
import { Login } from './features/auth/login/login';
import { Profilo } from './features/Profilo/profilo';
import { MarketHomeComponent } from './features/market/market-home/market-home';
import { AssetListComponent } from './features/market/asset-list/asset-list';

// 1. IMPORTA IL NUOVO COMPONENTE GRAFICO (Verifica che il percorso sia giusto)
import { StockChart } from './features/market/stock-chart/stock-chart';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },

  // --- SEZIONE MARKET ---
  {
    path: 'market',
    component: MarketHomeComponent // Pagina Principale (Vetrina)
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

  // --- NUOVA ROTTA PER IL GRAFICO TRADINGVIEW ---
  // Quando clicchi su un'azione, l'URL diventa es: /chart/AAPL
  // ":symbol" è un parametro dinamico che StockChart leggerà.
  { path: 'chart/:symbol', component: StockChart },

  // --- ALTRE PAGINE ---
  { path: 'movimenti', component: Movimenti },
  { path: 'login' , component: Login },
  { path: 'profilo' , component: Profilo }
];
