import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacilityUpcomingPageRoutingModule } from './facility-upcoming-routing.module';

import { FacilityUpcomingPage } from './facility-upcoming.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacilityUpcomingPageRoutingModule,
    TranslateModule.forChild(),
    PipesModule
  ],
  declarations: [FacilityUpcomingPage]
})
export class FacilityUpcomingPageModule {}
