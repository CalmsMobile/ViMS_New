import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignPadIdlePagePage } from './sign-pad-idle-page.page';

const routes: Routes = [
  {
    path: '',
    component: SignPadIdlePagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignPadIdlePagePageRoutingModule {}
