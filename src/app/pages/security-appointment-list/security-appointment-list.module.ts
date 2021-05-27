import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityAppointmentListPageRoutingModule } from './security-appointment-list-routing.module';

import { SecurityAppointmentListPage } from './security-appointment-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecurityAppointmentListPageRoutingModule
  ],
  declarations: [SecurityAppointmentListPage]
})
export class SecurityAppointmentListPageModule {}
