import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QrProfilePage } from './qr-profile.page';

const routes: Routes = [
  {
    path: '',
    component: QrProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QrProfilePageRoutingModule {}
