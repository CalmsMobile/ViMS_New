import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityAppointmentDetailPageRoutingModule } from './security-appointment-detail-routing.module';

import { SecurityAppointmentDetailPage } from './security-appointment-detail.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecurityAppointmentDetailPageRoutingModule,
    TranslateModule.forChild(),
    PipesModule
  ],
  declarations: [SecurityAppointmentDetailPage]
})
export class SecurityAppointmentDetailPageModule {}
