import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitorInformationPageRoutingModule } from './visitor-information-routing.module';

import { VisitorInformationPage } from './visitor-information.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    VisitorInformationPageRoutingModule
  ],
  declarations: [VisitorInformationPage]
})
export class VisitorInformationPageModule {}
