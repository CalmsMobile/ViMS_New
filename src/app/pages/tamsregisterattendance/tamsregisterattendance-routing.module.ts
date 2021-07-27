import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TamsregisterattendancePage } from './tamsregisterattendance.page';

const routes: Routes = [
  {
    path: '',
    component: TamsregisterattendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TamsregisterattendancePageRoutingModule {}
