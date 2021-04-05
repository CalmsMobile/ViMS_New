import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignPadVisitorDetailsPagePage } from './sign-pad-visitor-details-page.page';

const routes: Routes = [
  {
    path: '',
    component: SignPadVisitorDetailsPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignPadVisitorDetailsPagePageRoutingModule {}
