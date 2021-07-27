import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeTAMSPage } from './home-tams.page';

const routes: Routes = [
  {
    path: '',
    component: HomeTAMSPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeTAMSPageRoutingModule {}
