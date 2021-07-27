import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TamsregisterattendancePageRoutingModule } from './tamsregisterattendance-routing.module';

import { TamsregisterattendancePage } from './tamsregisterattendance.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    TamsregisterattendancePageRoutingModule
  ],
  declarations: [TamsregisterattendancePage]
})
export class TamsregisterattendancePageModule {}
