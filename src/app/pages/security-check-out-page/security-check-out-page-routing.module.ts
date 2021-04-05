import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecurityCheckOutPagePage } from './security-check-out-page.page';

const routes: Routes = [
  {
    path: '',
    component: SecurityCheckOutPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityCheckOutPagePageRoutingModule {}
