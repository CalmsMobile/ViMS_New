import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectStaffPageRoutingModule } from './select-staff-routing.module';

import { SelectStaffPage } from './select-staff.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectStaffPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [SelectStaffPage]
})
export class SelectStaffPageModule {}
