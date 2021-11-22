import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QRAccessPageRoutingModule } from './qraccess-routing.module';

import { QRAccessPage } from './qraccess.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QRAccessPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [QRAccessPage]
})
export class QRAccessPageModule {}
