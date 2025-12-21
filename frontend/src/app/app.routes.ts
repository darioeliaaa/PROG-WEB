import { Routes } from '@angular/router';
// Importa i componenti che hai generato (se non li hai ancora, Angular ti darà errore: dimmelo!)
import { Dashboard } from './features/dashboard/dashboard';
import { Market } from './features/market/market';
import { Movimenti } from './features/movimenti/movimenti'; // Importalo

export const routes: Routes = [
  // 1. Se l'utente apre il sito senza nulla, mandalo alla Dashboard
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // 2. La rotta per "Gestione Finanze"
  { path: 'dashboard', component: Dashboard },

  // 3. La rotta per "Investimenti"
  { path: 'market', component: Market },

  { path: 'movimenti', component: Movimenti }
];
