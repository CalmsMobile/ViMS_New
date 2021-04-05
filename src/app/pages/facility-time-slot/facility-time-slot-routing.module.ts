import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilityTimeSlotPage } from './facility-time-slot.page';

const routes: Routes = [
  {
    path: '',
    component: FacilityTimeSlotPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilityTimeSlotPageRoutingModule {}
