import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacilityBookingPageRoutingModule } from './facility-booking-routing.module';

import { FacilityBookingPage } from './facility-booking.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacilityBookingPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [FacilityBookingPage]
})
export class FacilityBookingPageModule {}
