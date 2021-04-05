import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilityUpcomingPage } from './facility-upcoming.page';

const routes: Routes = [
  {
    path: '',
    component: FacilityUpcomingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilityUpcomingPageRoutingModule {}
