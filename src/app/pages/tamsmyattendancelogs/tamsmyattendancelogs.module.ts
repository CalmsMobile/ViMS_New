import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TamsmyattendancelogsPageRoutingModule } from './tamsmyattendancelogs-routing.module';

import { TamsmyattendancelogsPage } from './tamsmyattendancelogs.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    TamsmyattendancelogsPageRoutingModule
  ],
  declarations: [TamsmyattendancelogsPage]
})
export class TamsmyattendancelogsPageModule {}
