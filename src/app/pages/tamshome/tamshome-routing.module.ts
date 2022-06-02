import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TAMSHomePage } from './tamshome.page';


const routes: Routes = [
  {
    path: '',
    component: TAMSHomePage,
    children: [
      {
        path: 'tamsmyschedule',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/tamsmyschedule/tamsmyschedule.module').then( m => m.TamsmyschedulePageModule)
          }
        ]
      },
      {
        path: 'tamsmyattendance',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/tamsmyattendance/tamsmyattendance.module').then( m => m.TamsmyattendancePageModule)
          }
        ]
      },{
        path: 'tamsmyattendancelocation',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/tamsmyattendancelocation/tamsmyattendancelocation.module').then( m => m.TamsmyattendancelocationPageModule)
          }
        ]
      },
      {
        path: 'tamsmyattendancelogs',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/tamsmyattendancelogs/tamsmyattendancelogs.module').then( m => m.TamsmyattendancelogsPageModule)
          }
        ]
      },
      {
        path: 'settings-view-page',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/settings-view-page/settings-view-page.module').then( m => m.SettingsViewPagePageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tamshome/tamsmyschedule',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tamshome/tamsmyschedule',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TAMSHomePageRoutingModule {}
