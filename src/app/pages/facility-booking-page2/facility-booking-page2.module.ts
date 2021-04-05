import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacilityBookingPage2PageRoutingModule } from './facility-booking-page2-routing.module';

import { FacilityBookingPage2Page } from './facility-booking-page2.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FacilityBookingPage2PageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [FacilityBookingPage2Page]
})
export class FacilityBookingPage2PageModule {}
