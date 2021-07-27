import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TamsmyattendancelocationPageRoutingModule } from './tamsmyattendancelocation-routing.module';

import { TamsmyattendancelocationPage } from './tamsmyattendancelocation.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    TamsmyattendancelocationPageRoutingModule
  ],
  declarations: [TamsmyattendancelocationPage]
})
export class TamsmyattendancelocationPageModule {}
