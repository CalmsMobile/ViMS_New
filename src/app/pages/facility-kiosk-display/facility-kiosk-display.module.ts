import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacilityKioskDisplayPageRoutingModule } from './facility-kiosk-display-routing.module';

import { FacilityKioskDisplayPage } from './facility-kiosk-display.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacilityKioskDisplayPageRoutingModule
  ],
  declarations: [FacilityKioskDisplayPage]
})
export class FacilityKioskDisplayPageModule {}
