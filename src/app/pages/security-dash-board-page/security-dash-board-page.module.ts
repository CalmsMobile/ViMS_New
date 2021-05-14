import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityDashBoardPagePageRoutingModule } from './security-dash-board-page-routing.module';

import { SecurityDashBoardPagePage } from './security-dash-board-page.page';
import { TranslateModule } from '@ngx-translate/core';
import { LongPressModule } from 'ionic-long-press';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecurityDashBoardPagePageRoutingModule,
    TranslateModule.forChild(),
    LongPressModule,
    Ng2GoogleChartsModule
  ],
  declarations: [SecurityDashBoardPagePage]
})
export class SecurityDashBoardPagePageModule {}