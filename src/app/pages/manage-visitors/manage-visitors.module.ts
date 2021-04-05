import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageVisitorsPageRoutingModule } from './manage-visitors-routing.module';

import { ManageVisitorsPage } from './manage-visitors.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageVisitorsPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [ManageVisitorsPage]
})
export class ManageVisitorsPageModule {}
