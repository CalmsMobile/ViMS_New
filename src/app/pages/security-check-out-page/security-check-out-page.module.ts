import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityCheckOutPagePageRoutingModule } from './security-check-out-page-routing.module';

import { SecurityCheckOutPagePage } from './security-check-out-page.page';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecurityCheckOutPagePageRoutingModule,
    TranslateModule.forChild(),
    PipesModule
  ],
  declarations: [SecurityCheckOutPagePage]
})
export class SecurityCheckOutPagePageModule {}
