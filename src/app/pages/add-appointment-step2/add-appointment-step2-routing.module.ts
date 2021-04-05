import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddAppointmentStep2Page } from './add-appointment-step2.page';

const routes: Routes = [
  {
    path: '',
    component: AddAppointmentStep2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddAppointmentStep2PageRoutingModule {}
