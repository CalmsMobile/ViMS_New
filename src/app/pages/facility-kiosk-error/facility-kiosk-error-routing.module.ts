import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilityKioskErrorPage } from './facility-kiosk-error.page';

const routes: Routes = [
  {
    path: '',
    component: FacilityKioskErrorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilityKioskErrorPageRoutingModule {}
