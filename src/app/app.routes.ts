import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'felp-cards',
    loadChildren: () => import('./modules/felp-cards/felp-cards.routes').then(m => m.FELP_CARDS_ROUTES)
  },
  {
    path: '',
    redirectTo: '/felp-cards',
    pathMatch: 'full'
  }
];
