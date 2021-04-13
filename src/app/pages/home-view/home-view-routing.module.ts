import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeViewPage } from './home-view.page';


const routes: Routes = [
  {
    path: 'home-view',
    component: HomeViewPage,
    children: [
      {
        path: 'upcoming-appointment-page',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/upcoming-appointment-page/upcoming-appointment-page.module').then( m => m.UpcomingAppointmentPagePageModule)
          }
        ]
      },
      {
        path: 'appointment-history',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/appointment-history/appointment-history.module').then( m => m.AppointmentHistoryPageModule)
          }
        ]
      },{
        path: 'manage-appointment',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/manage-appointment/manage-appointment.module').then( m => m.ManageAppointmentPageModule)
          }
        ]
      },{
        path: 'settings-view-page',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/settings-view-page/settings-view-page.module').then( m => m.SettingsViewPagePageModule)
          }
        ]
      },
      {
        path: 'quick-pass-dash-board-page',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/quick-pass-dash-board-page/quick-pass-dash-board-page.module').then( m => m.QuickPassDashBoardPagePageModule)
          }
        ]
      },
      {
        path: 'facility-upcoming',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/facility-upcoming/facility-upcoming.module').then( m => m.FacilityUpcomingPageModule)
          }
        ]
      },
      {
        path: 'facility-booking-history',
        children: [
          {
            path: '',
            loadChildren: () => import('../../pages/facility-booking-history/facility-booking-history.module').then( m => m.FacilityBookingHistoryPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/home-view/upcoming-appointment-page',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home-view/upcoming-appointment-page',
    pathMatch: 'full'
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeViewPageRoutingModule {}
