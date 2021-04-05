import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignaturePagePage } from './signature-page.page';

const routes: Routes = [
  {
    path: '',
    component: SignaturePagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignaturePagePageRoutingModule {}
