import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddVisitorsPage } from './add-visitors.page';

const routes: Routes = [
  {
    path: '',
    component: AddVisitorsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddVisitorsPageRoutingModule {}
