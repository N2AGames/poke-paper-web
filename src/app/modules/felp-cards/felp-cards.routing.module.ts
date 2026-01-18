import { RouterModule, Routes } from '@angular/router';
import { FelpCardsHub } from './components/felp-cards-hub/felp-cards-hub.component';
import { NgModule } from '@angular/core';

export const FELP_CARDS_ROUTES: Routes = [
  {
    path: '',
    component: FelpCardsHub
  }
];

@NgModule({
  imports: [RouterModule.forChild(FELP_CARDS_ROUTES)],
  exports: [RouterModule]
})
export class FelpCardsRoutingModule { }