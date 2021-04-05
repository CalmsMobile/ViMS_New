import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecurityVisitorListPagePage } from './security-visitor-list-page.page';

const routes: Routes = [
  {
    path: '',
    component: SecurityVisitorListPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityVisitorListPagePageRoutingModule {}
