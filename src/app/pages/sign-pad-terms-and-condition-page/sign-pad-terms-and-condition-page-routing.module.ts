import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignPadTermsAndConditionPagePage } from './sign-pad-terms-and-condition-page.page';

const routes: Routes = [
  {
    path: '',
    component: SignPadTermsAndConditionPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignPadTermsAndConditionPagePageRoutingModule {}
