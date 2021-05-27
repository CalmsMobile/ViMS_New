import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecurityManualCheckInPage } from './security-manual-check-in.page';

const routes: Routes = [
  {
    path: '',
    component: SecurityManualCheckInPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityManualCheckInPageRoutingModule {}
