import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuickPassDashBoardPagePageRoutingModule } from './quick-pass-dash-board-page-routing.module';

import { QuickPassDashBoardPagePage } from './quick-pass-dash-board-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuickPassDashBoardPagePageRoutingModule
  ],
  declarations: [QuickPassDashBoardPagePage]
})
export class QuickPassDashBoardPagePageModule {}
