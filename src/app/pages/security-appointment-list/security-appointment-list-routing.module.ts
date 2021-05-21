import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SecurityAppointmentListPage } from './security-appointment-list.page';

const routes: Routes = [
  {
    path: '',
    component: SecurityAppointmentListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecurityAppointmentListPageRoutingModule {}
