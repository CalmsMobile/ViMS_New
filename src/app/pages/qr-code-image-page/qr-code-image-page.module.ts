import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QrCodeImagePagePageRoutingModule } from './qr-code-image-page-routing.module';

import { QrCodeImagePagePage } from './qr-code-image-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrCodeImagePagePageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [QrCodeImagePagePage]
})
export class QrCodeImagePagePageModule {}
