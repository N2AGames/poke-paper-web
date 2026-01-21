import { Routes } from '@angular/router';

export const routes: Routes = [
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
