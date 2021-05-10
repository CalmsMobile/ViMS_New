import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecurityLoginPage } from './security-login.page';

const routes: Routes = [
  {
    path: '',
    component: SecurityLoginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityLoginPageRoutingModule {}
