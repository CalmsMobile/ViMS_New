import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignPadVisitorDetailsPagePageRoutingModule } from './sign-pad-visitor-details-page-routing.module';

import { SignPadVisitorDetailsPagePage } from './sign-pad-visitor-details-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignPadVisitorDetailsPagePageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [SignPadVisitorDetailsPagePage]
})
export class SignPadVisitorDetailsPagePageModule {}
