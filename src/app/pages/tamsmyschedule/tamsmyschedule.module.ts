import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TamsmyschedulePageRoutingModule } from './tamsmyschedule-routing.module';

import { TamsmyschedulePage } from './tamsmyschedule.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    TamsmyschedulePageRoutingModule
  ],
  declarations: [TamsmyschedulePage]
})
export class TamsmyschedulePageModule {}
