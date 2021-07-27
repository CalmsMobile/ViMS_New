import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TamsmyattendancePage } from './tamsmyattendance.page';

const routes: Routes = [
  {
    path: '',
    component: TamsmyattendancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TamsmyattendancePageRoutingModule {}
