import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityCheckInPagePageRoutingModule } from './security-check-in-page-routing.module';

import { SecurityCheckInPagePage } from './security-check-in-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SecurityCheckInPagePageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [SecurityCheckInPagePage]
})
export class SecurityCheckInPagePageModule {}
