import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagesViewImagePagePage } from './pages-view-image-page.page';

const routes: Routes = [
  {
    path: '',
    component: PagesViewImagePagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesViewImagePagePageRoutingModule {}
