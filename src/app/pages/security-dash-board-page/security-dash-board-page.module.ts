import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityDashBoardPagePageRoutingModule } from './security-dash-board-page-routing.module';

import { SecurityDashBoardPagePage } from './security-dash-board-page.page';
import { TranslateModule } from '@ngx-translate/core';
import { LongPressModule } from 'ionic-long-press';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecurityDashBoardPagePageRoutingModule,
    TranslateModule.forChild(),
    LongPressModule
  ],
  declarations: [SecurityDashBoardPagePage]
})
export class SecurityDashBoardPagePageModule {}
