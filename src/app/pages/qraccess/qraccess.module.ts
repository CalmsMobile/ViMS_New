import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QRAccessPageRoutingModule } from './qraccess-routing.module';

import { QRAccessPage } from './qraccess.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QRAccessPageRoutingModule
  ],
  declarations: [QRAccessPage]
})
export class QRAccessPageModule {}
