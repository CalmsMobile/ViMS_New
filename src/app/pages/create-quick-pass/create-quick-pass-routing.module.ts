import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateQuickPassPage } from './create-quick-pass.page';

const routes: Routes = [
  {
    path: '',
    component: CreateQuickPassPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateQuickPassPageRoutingModule {}
