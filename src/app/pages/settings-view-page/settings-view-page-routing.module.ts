import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsViewPagePage } from './settings-view-page.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsViewPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsViewPagePageRoutingModule {}
