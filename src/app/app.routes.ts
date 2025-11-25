import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Movimenti } from './pages/movimenti/movimenti';
import { Investimenti } from './pages/investimenti/investimenti';
import { Crypto } from './pages/crypto/crypto';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: Dashboard },
  { path: 'movimenti', component: Movimenti },
  { path: 'investimenti', component: Investimenti },
  { path: 'crypto', component: Crypto },
  { path: 'login', component: Login },

  { path: '**', redirectTo: 'dashboard' }
];
