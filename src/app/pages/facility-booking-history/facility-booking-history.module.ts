import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacilityBookingHistoryPageRoutingModule } from './facility-booking-history-routing.module';

import { FacilityBookingHistoryPage } from './facility-booking-history.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
    FacilityBookingHistoryPageRoutingModule
  ],
  declarations: [FacilityBookingHistoryPage]
})
export class FacilityBookingHistoryPageModule {}
