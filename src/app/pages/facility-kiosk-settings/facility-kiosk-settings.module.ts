import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacilityKioskSettingsPageRoutingModule } from './facility-kiosk-settings-routing.module';

import { FacilityKioskSettingsPage } from './facility-kiosk-settings.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacilityKioskSettingsPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [FacilityKioskSettingsPage]
})
export class FacilityKioskSettingsPageModule {}
