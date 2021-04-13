import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignaturePagePageRoutingModule } from './signature-page-routing.module';

import { SignaturePagePage } from './signature-page.page';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignaturePagePageRoutingModule,
    TranslateModule.forChild()
  ],
  schemas : [NO_ERRORS_SCHEMA],
  declarations: [SignaturePagePage],
  exports:[]
})
export class SignaturePagePageModule {}
