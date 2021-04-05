import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserProfilePagePage } from './user-profile-page.page';

const routes: Routes = [
  {
    path: '',
    component: UserProfilePagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserProfilePagePageRoutingModule {}
