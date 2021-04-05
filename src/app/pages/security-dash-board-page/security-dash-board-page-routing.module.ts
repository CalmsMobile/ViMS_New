import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecurityDashBoardPagePage } from './security-dash-board-page.page';

const routes: Routes = [
  {
    path: '',
    component: SecurityDashBoardPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityDashBoardPagePageRoutingModule {}
