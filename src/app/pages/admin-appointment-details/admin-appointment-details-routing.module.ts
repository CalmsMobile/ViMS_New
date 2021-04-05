import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminAppointmentDetailsPage } from './admin-appointment-details.page';

const routes: Routes = [
  {
    path: '',
    component: AdminAppointmentDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminAppointmentDetailsPageRoutingModule {}
