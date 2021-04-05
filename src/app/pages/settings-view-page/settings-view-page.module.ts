import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsViewPagePageRoutingModule } from './settings-view-page-routing.module';

import { SettingsViewPagePage } from './settings-view-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsViewPagePageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [SettingsViewPagePage]
})
export class SettingsViewPagePageModule {}
