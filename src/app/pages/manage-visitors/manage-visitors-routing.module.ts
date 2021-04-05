import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageVisitorsPage } from './manage-visitors.page';

const routes: Routes = [
  {
    path: '',
    component: ManageVisitorsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageVisitorsPageRoutingModule {}
