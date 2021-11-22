import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QrProfilePageRoutingModule } from './qr-profile-routing.module';

import { QrProfilePage } from './qr-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrProfilePageRoutingModule
  ],
  declarations: [QrProfilePage]
})
export class QrProfilePageModule {}
