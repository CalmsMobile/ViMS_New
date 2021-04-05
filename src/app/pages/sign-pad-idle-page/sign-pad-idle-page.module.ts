import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { LongPressModule } from 'ionic-long-press';
import { SignPadIdlePagePageRoutingModule } from './sign-pad-idle-page-routing.module';

import { SignPadIdlePagePage } from './sign-pad-idle-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignPadIdlePagePageRoutingModule,
    TranslateModule.forChild(),
    LongPressModule
  ],
  declarations: [SignPadIdlePagePage]
})
export class SignPadIdlePagePageModule {}
