import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignPadTermsAndConditionPagePageRoutingModule } from './sign-pad-terms-and-condition-page-routing.module';

import { SignPadTermsAndConditionPagePage } from './sign-pad-terms-and-condition-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignPadTermsAndConditionPagePageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [SignPadTermsAndConditionPagePage]
})
export class SignPadTermsAndConditionPagePageModule {}
