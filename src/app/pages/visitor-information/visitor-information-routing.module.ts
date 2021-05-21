import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitorInformationPage } from './visitor-information.page';

const routes: Routes = [
  {
    path: '',
    component: VisitorInformationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitorInformationPageRoutingModule {}
