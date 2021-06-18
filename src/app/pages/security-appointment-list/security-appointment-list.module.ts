import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityAppointmentListPageRoutingModule } from './security-appointment-list-routing.module';

import { SecurityAppointmentListPage } from './security-appointment-list.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forChild(),
    IonicModule,
    SecurityAppointmentListPageRoutingModule
  ],
  declarations: [SecurityAppointmentListPage]
})
export class SecurityAppointmentListPageModule {}
