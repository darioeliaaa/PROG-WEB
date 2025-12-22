import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Market } from './features/market/market';
import { Movimenti } from './features/movimenti/movimenti';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: Dashboard },

  { path: 'market', component: Market },

  { path: 'movimenti', component: Movimenti }
];
