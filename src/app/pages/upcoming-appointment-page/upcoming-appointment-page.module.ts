import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpcomingAppointmentPagePageRoutingModule } from './upcoming-appointment-page-routing.module';

import { UpcomingAppointmentPagePage } from './upcoming-appointment-page.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpcomingAppointmentPagePageRoutingModule,
    TranslateModule.forChild(),
    PipesModule
  ],
  declarations: [UpcomingAppointmentPagePage]
})
export class UpcomingAppointmentPagePageModule {}
