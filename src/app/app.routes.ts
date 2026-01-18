import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'felp-cards',
    loadChildren: () => import('./modules/felp-cards/felp-cards.routing.module').then(m => m.FELP_CARDS_ROUTES)
  },
  {
    path: 'who-is-that-poke',
    loadChildren: () => import('./modules/who-is-that-poke/who-is-that-poke.routing.module').then(m => m.WHO_IS_THAT_POKE_ROUTES)
  },
  {
    path: '',
    redirectTo: '/who-is-that-poke',
    pathMatch: 'full'
  }
];
