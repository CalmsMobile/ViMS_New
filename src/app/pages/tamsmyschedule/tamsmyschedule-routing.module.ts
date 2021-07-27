import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TamsmyschedulePage } from './tamsmyschedule.page';

const routes: Routes = [
  {
    path: '',
    component: TamsmyschedulePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TamsmyschedulePageRoutingModule {}
