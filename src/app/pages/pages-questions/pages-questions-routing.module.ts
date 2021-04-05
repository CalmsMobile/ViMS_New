import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagesQuestionsPage } from './pages-questions.page';

const routes: Routes = [
  {
    path: '',
    component: PagesQuestionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesQuestionsPageRoutingModule {}
