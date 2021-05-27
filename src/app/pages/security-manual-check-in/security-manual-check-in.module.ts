import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityManualCheckInPageRoutingModule } from './security-manual-check-in-routing.module';

import { SecurityManualCheckInPage } from './security-manual-check-in.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecurityManualCheckInPageRoutingModule
  ],
  declarations: [SecurityManualCheckInPage]
})
export class SecurityManualCheckInPageModule {}
