import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountMappingPage } from './account-mapping.page';

const routes: Routes = [
  {
    path: '',
    component: AccountMappingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountMappingPageRoutingModule {}
