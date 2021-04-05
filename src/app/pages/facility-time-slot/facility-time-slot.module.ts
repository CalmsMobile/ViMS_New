import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacilityTimeSlotPageRoutingModule } from './facility-time-slot-routing.module';

import { FacilityTimeSlotPage } from './facility-time-slot.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    PipesModule,
    FacilityTimeSlotPageRoutingModule
  ],
  declarations: [FacilityTimeSlotPage]
})
export class FacilityTimeSlotPageModule {}
