import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Picross } from './components/picross/picross.component';

const routes: Routes = [
  {
    path: '',
    component: Picross,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PicrossRoutingModule { }
