import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuickPassHistoryPagePage } from './quick-pass-history-page.page';

const routes: Routes = [
  {
    path: '',
    component: QuickPassHistoryPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuickPassHistoryPagePageRoutingModule {}
