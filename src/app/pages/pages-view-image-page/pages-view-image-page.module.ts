import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PagesViewImagePagePageRoutingModule } from './pages-view-image-page-routing.module';

import { PagesViewImagePagePage } from './pages-view-image-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PagesViewImagePagePageRoutingModule
  ],
  declarations: [PagesViewImagePagePage]
})
export class PagesViewImagePagePageModule {}
