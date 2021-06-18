import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddVisitorCompanyPageRoutingModule } from './add-visitor-company-routing.module';

import { AddVisitorCompanyPage } from './add-visitor-company.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule.forChild(),
    AddVisitorCompanyPageRoutingModule
  ],
  declarations: [AddVisitorCompanyPage]
})
export class AddVisitorCompanyPageModule {}
