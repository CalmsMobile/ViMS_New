import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TAMSHomePageRoutingModule } from './tamshome-routing.module';

import { TAMSHomePage } from './tamshome.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TAMSHomePageRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [TAMSHomePage]
})
export class TAMSHomePageModule {}
