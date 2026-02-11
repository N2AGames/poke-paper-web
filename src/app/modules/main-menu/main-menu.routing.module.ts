import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainMenu } from './components/main-menu/main-menu.component';

const routes: Routes = [
  {
    path: '',
    component: MainMenu
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainMenuRoutingModule { }
