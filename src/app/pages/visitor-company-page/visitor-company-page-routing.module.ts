import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitorCompanyPagePage } from './visitor-company-page.page';

const routes: Routes = [
  {
    path: '',
    component: VisitorCompanyPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitorCompanyPagePageRoutingModule {}
