import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilityBookingHistoryPage } from './facility-booking-history.page';

const routes: Routes = [
  {
    path: '',
    component: FacilityBookingHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilityBookingHistoryPageRoutingModule {}
