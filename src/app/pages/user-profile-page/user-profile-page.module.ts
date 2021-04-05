import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserProfilePagePageRoutingModule } from './user-profile-page-routing.module';

import { UserProfilePagePage } from './user-profile-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule.forChild(),
    UserProfilePagePageRoutingModule
  ],
  declarations: [UserProfilePagePage]
})
export class UserProfilePagePageModule {}
