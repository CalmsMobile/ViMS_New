import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageHostsPageRoutingModule } from './manage-hosts-routing.module';

import { ManageHostsPage } from './manage-hosts.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageHostsPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [ManageHostsPage]
})
export class ManageHostsPageModule {}
