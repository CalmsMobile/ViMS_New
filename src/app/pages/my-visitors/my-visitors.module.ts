import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyVisitorsPageRoutingModule } from './my-visitors-routing.module';

import { MyVisitorsPage } from './my-visitors.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyVisitorsPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [MyVisitorsPage]
})
export class MyVisitorsPageModule {}
