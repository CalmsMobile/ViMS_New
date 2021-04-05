import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotiificationViewPageRoutingModule } from './notiification-view-routing.module';

import { NotiificationViewPage } from './notiification-view.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotiificationViewPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [NotiificationViewPage]
})
export class NotiificationViewPageModule {}
