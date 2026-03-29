import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PokeTable } from './components/poke-table/poke-table.component';

const routes: Routes = [
  {
    path: '',
    component: PokeTable
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PokeTableRoutingModule { }
