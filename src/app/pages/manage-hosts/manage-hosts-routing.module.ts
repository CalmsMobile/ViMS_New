import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageHostsPage } from './manage-hosts.page';

const routes: Routes = [
  {
    path: '',
    component: ManageHostsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageHostsPageRoutingModule {}
