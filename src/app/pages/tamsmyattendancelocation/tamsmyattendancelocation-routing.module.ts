import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TamsmyattendancelocationPage } from './tamsmyattendancelocation.page';

const routes: Routes = [
  {
    path: '',
    component: TamsmyattendancelocationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TamsmyattendancelocationPageRoutingModule {}
