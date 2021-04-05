import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QrCodeImagePagePage } from './qr-code-image-page.page';

const routes: Routes = [
  {
    path: '',
    component: QrCodeImagePagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QrCodeImagePagePageRoutingModule {}
