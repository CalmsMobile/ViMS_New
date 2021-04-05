import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SecurityVisitorListPagePageRoutingModule } from './security-visitor-list-page-routing.module';

import { SecurityVisitorListPagePage } from './security-visitor-list-page.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SecurityVisitorListPagePageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [SecurityVisitorListPagePage]
})
export class SecurityVisitorListPagePageModule {}
