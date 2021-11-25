import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectStaffPage } from './select-staff.page';

const routes: Routes = [
  {
    path: '',
    component: SelectStaffPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectStaffPageRoutingModule {}
