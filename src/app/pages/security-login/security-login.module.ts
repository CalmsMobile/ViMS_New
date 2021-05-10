import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityLoginPageRoutingModule } from './security-login-routing.module';

import { SecurityLoginPage } from './security-login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecurityLoginPageRoutingModule
  ],
  declarations: [SecurityLoginPage]
})
export class SecurityLoginPageModule {}
