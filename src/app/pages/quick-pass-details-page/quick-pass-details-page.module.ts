import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuickPassDetailsPagePageRoutingModule } from './quick-pass-details-page-routing.module';

import { QuickPassDetailsPagePage } from './quick-pass-details-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuickPassDetailsPagePageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [QuickPassDetailsPagePage]
})
export class QuickPassDetailsPagePageModule {}
