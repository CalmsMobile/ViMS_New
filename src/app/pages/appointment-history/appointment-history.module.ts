import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentHistoryPageRoutingModule } from './appointment-history-routing.module';

import { AppointmentHistoryPage } from './appointment-history.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentHistoryPageRoutingModule,
    TranslateModule.forChild(),
    PipesModule
  ],
  declarations: [AppointmentHistoryPage]
})
export class AppointmentHistoryPageModule {}
