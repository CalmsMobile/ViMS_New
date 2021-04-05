import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeViewPage } from './home-view.page';

const routes: Routes = [
  {
    path: '',
    component: HomeViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeViewPageRoutingModule {}
