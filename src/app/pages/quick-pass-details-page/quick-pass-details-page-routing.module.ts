import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuickPassDetailsPagePage } from './quick-pass-details-page.page';

const routes: Routes = [
  {
    path: '',
    component: QuickPassDetailsPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuickPassDetailsPagePageRoutingModule {}
