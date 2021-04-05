import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateQuickPassPageRoutingModule } from './create-quick-pass-routing.module';

import { CreateQuickPassPage } from './create-quick-pass.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule.forChild(),
    CreateQuickPassPageRoutingModule
  ],
  declarations: [CreateQuickPassPage]
})
export class CreateQuickPassPageModule {}
