import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilityKioskSettingsPage } from './facility-kiosk-settings.page';

const routes: Routes = [
  {
    path: '',
    component: FacilityKioskSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilityKioskSettingsPageRoutingModule {}
