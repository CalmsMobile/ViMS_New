import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminAppointmentDetailsPageRoutingModule } from './admin-appointment-details-routing.module';

import { AdminAppointmentDetailsPage } from './admin-appointment-details.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    AdminAppointmentDetailsPageRoutingModule
  ],
  declarations: [AdminAppointmentDetailsPage]
})
export class AdminAppointmentDetailsPageModule {}
