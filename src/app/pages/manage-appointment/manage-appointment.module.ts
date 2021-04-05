import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { NgCalendarModule  } from 'ionic2-calendar';
import { ManageAppointmentPageRoutingModule } from './manage-appointment-routing.module';

import { ManageAppointmentPage } from './manage-appointment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageAppointmentPageRoutingModule,
    NgCalendarModule
  ],
  declarations: [ManageAppointmentPage]
})
export class ManageAppointmentPageModule {}
