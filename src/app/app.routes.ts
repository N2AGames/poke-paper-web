import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'who-is-that-poke',
    loadChildren: () => import('./modules/who-is-that-poke/who-is-that-poke.routing.module').then(m => m.WHO_IS_THAT_POKE_ROUTES)
  },
  {
    path: 'picross',
    loadChildren: () => import('./modules/picross/picross-routing-module').then(m => m.PicrossRoutingModule)
  },
  {
    path: 'main',
    loadChildren: () => import('./modules/main-menu/main-menu-routing-module').then(m => m.MainMenuRoutingModule)
  },
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full'
  }
];
