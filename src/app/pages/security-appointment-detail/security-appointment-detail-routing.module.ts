import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecurityAppointmentDetailPage } from './security-appointment-detail.page';

const routes: Routes = [
  {
    path: '',
    component: SecurityAppointmentDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityAppointmentDetailPageRoutingModule {}
