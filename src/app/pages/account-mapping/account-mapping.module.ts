import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountMappingPageRoutingModule } from './account-mapping-routing.module';

import { AccountMappingPage } from './account-mapping.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    AccountMappingPageRoutingModule
  ],
  declarations: [AccountMappingPage],
})
export class AccountMappingPageModule {}
