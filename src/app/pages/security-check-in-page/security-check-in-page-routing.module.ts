import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecurityCheckInPagePage } from './security-check-in-page.page';

const routes: Routes = [
  {
    path: '',
    component: SecurityCheckInPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityCheckInPagePageRoutingModule {}
