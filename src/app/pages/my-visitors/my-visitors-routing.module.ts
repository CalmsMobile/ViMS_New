import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyVisitorsPage } from './my-visitors.page';

const routes: Routes = [
  {
    path: '',
    component: MyVisitorsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyVisitorsPageRoutingModule {}
