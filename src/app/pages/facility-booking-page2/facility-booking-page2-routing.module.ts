import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilityBookingPage2Page } from './facility-booking-page2.page';

const routes: Routes = [
  {
    path: '',
    component: FacilityBookingPage2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilityBookingPage2PageRoutingModule {}
