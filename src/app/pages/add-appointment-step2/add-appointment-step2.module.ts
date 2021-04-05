import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddAppointmentStep2PageRoutingModule } from './add-appointment-step2-routing.module';

import { AddAppointmentStep2Page } from './add-appointment-step2.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule.forChild(),
    AddAppointmentStep2PageRoutingModule
  ],
  declarations: [AddAppointmentStep2Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AddAppointmentStep2PageModule {}
