import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TamsmyattendancePageRoutingModule } from './tamsmyattendance-routing.module';

import { TamsmyattendancePage } from './tamsmyattendance.page';
import { TranslateModule } from '@ngx-translate/core';
import { NgCalendarModule } from 'ionic2-calendar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    NgCalendarModule,
    TamsmyattendancePageRoutingModule
  ],
  declarations: [TamsmyattendancePage]
})
export class TamsmyattendancePageModule {}
