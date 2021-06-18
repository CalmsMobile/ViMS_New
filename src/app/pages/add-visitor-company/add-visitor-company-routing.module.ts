import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddVisitorCompanyPage } from './add-visitor-company.page';

const routes: Routes = [
  {
    path: '',
    component: AddVisitorCompanyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddVisitorCompanyPageRoutingModule {}
