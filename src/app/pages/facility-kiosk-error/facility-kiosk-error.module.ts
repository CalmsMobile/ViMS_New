import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacilityKioskErrorPageRoutingModule } from './facility-kiosk-error-routing.module';

import { FacilityKioskErrorPage } from './facility-kiosk-error.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacilityKioskErrorPageRoutingModule
  ],
  declarations: [FacilityKioskErrorPage]
})
export class FacilityKioskErrorPageModule {}
