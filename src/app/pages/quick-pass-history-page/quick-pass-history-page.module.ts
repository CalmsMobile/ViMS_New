import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuickPassHistoryPagePageRoutingModule } from './quick-pass-history-page-routing.module';

import { QuickPassHistoryPagePage } from './quick-pass-history-page.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuickPassHistoryPagePageRoutingModule,
    TranslateModule.forChild(),
    PipesModule
  ],
  declarations: [QuickPassHistoryPagePage]
})
export class QuickPassHistoryPagePageModule {}
