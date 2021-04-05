import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PagesQuestionsPageRoutingModule } from './pages-questions-routing.module';

import { PagesQuestionsPage } from './pages-questions.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PagesQuestionsPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [PagesQuestionsPage]
})
export class PagesQuestionsPageModule {}
