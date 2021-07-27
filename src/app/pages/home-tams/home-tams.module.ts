import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeTAMSPageRoutingModule } from './home-tams-routing.module';

import { HomeTAMSPage } from './home-tams.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    HomeTAMSPageRoutingModule
  ],
  declarations: [HomeTAMSPage]
})
export class HomeTAMSPageModule {}
