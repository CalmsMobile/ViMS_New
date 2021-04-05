import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpcomingAppointmentPagePage } from './upcoming-appointment-page.page';

const routes: Routes = [
  {
    path: '',
    component: UpcomingAppointmentPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpcomingAppointmentPagePageRoutingModule {}
