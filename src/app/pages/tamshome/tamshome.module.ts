import { NgModule } from '@angular/core';
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
  declarations: [TAMSHomePage]
})
export class TAMSHomePageModule {}
