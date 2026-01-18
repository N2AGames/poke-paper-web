import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WhoIsThatPoke } from './components/who-is-that-poke/who-is-that-poke.component';

export const WHO_IS_THAT_POKE_ROUTES: Routes = [
  {
    path: '',
    component: WhoIsThatPoke
  }
];

@NgModule({
  imports: [RouterModule.forChild(WHO_IS_THAT_POKE_ROUTES)],
  exports: [RouterModule]
})
export class WhoIsThatPokeRoutingModule { }
