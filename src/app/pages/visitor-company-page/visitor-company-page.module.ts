import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitorCompanyPagePageRoutingModule } from './visitor-company-page-routing.module';

import { VisitorCompanyPagePage } from './visitor-company-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitorCompanyPagePageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [VisitorCompanyPagePage]
})
export class VisitorCompanyPagePageModule {}
