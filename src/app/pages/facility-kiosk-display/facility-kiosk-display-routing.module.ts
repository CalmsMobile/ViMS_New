import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilityKioskDisplayPage } from './facility-kiosk-display.page';

const routes: Routes = [
  {
    path: '',
    component: FacilityKioskDisplayPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilityKioskDisplayPageRoutingModule {}
