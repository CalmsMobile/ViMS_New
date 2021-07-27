import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TamsmyattendancelogsPage } from './tamsmyattendancelogs.page';

const routes: Routes = [
  {
    path: '',
    component: TamsmyattendancelogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TamsmyattendancelogsPageRoutingModule {}
