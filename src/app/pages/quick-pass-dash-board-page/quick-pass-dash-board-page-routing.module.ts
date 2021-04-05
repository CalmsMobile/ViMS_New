import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuickPassDashBoardPagePage } from './quick-pass-dash-board-page.page';

const routes: Routes = [
  {
    path: '',
    component: QuickPassDashBoardPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuickPassDashBoardPagePageRoutingModule {}
