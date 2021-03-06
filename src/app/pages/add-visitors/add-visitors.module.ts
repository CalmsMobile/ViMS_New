import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddVisitorsPageRoutingModule } from './add-visitors-routing.module';

import { AddVisitorsPage } from './add-visitors.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule.forChild(),
    AddVisitorsPageRoutingModule
  ],
  declarations: [AddVisitorsPage]
})
export class AddVisitorsPageModule {}
