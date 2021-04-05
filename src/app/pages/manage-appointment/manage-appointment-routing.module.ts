import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageAppointmentPage } from './manage-appointment.page';

const routes: Routes = [
  {
    path: '',
    component: ManageAppointmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageAppointmentPageRoutingModule {}
