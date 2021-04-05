import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AckVisitorLisPage } from './ack-visitor-lis.page';

const routes: Routes = [
  {
    path: '',
    component: AckVisitorLisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AckVisitorLisPageRoutingModule {}
