import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  // { path: '', redirectTo: 'home-view', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('./pages/home-view/home-view.module').then( m => m.HomeViewPageModule)
  },
  {
    path: 'account-mapping',
    loadChildren: () => import('./pages/account-mapping/account-mapping.module').then( m => m.AccountMappingPageModule)
  },
  {
    path: 'ack-visitor-lis',
    loadChildren: () => import('./pages/ack-visitor-lis/ack-visitor-lis.module').then( m => m.AckVisitorLisPageModule)
  },
  {
    path: 'add-appointment',
    loadChildren: () => import('./pages/add-appointment/add-appointment.module').then( m => m.AddAppointmentPageModule)
  },
  {
    path: 'add-appointment-step2',
    loadChildren: () => import('./pages/add-appointment-step2/add-appointment-step2.module').then( m => m.AddAppointmentStep2PageModule)
  },
  {
    path: 'add-visitors',
    loadChildren: () => import('./pages/add-visitors/add-visitors.module').then( m => m.AddVisitorsPageModule)
  },
  {
    path: 'admin-appointment-details',
    loadChildren: () => import('./pages/admin-appointment-details/admin-appointment-details.module').then( m => m.AdminAppointmentDetailsPageModule)
  },
  {
    path: 'admin-home',
    loadChildren: () => import('./pages/admin-home/admin-home.module').then( m => m.AdminHomePageModule)
  },
  {
    path: 'appointment-details',
    loadChildren: () => import('./pages/appointment-details/appointment-details.module').then( m => m.AppointmentDetailsPageModule)
  },
  {
    path: 'create-quick-pass',
    loadChildren: () => import('./pages/create-quick-pass/create-quick-pass.module').then( m => m.CreateQuickPassPageModule)
  },
  {
    path: 'facility-booking',
    loadChildren: () => import('./pages/facility-booking/facility-booking.module').then( m => m.FacilityBookingPageModule)
  },
  {
    path: 'facility-booking-page2',
    loadChildren: () => import('./pages/facility-booking-page2/facility-booking-page2.module').then( m => m.FacilityBookingPage2PageModule)
  },
  {
    path: 'facility-booking-history',
    loadChildren: () => import('./pages/facility-booking-history/facility-booking-history.module').then( m => m.FacilityBookingHistoryPageModule)
  },
  {
    path: 'facility-kiosk-display',
    loadChildren: () => import('./pages/facility-kiosk-display/facility-kiosk-display.module').then( m => m.FacilityKioskDisplayPageModule)
  },
  {
    path: 'facility-kiosk-error',
    loadChildren: () => import('./pages/facility-kiosk-error/facility-kiosk-error.module').then( m => m.FacilityKioskErrorPageModule)
  },
  {
    path: 'facility-kiosk-settings',
    loadChildren: () => import('./pages/facility-kiosk-settings/facility-kiosk-settings.module').then( m => m.FacilityKioskSettingsPageModule)
  },
  {
    path: 'facility-time-slot',
    loadChildren: () => import('./pages/facility-time-slot/facility-time-slot.module').then( m => m.FacilityTimeSlotPageModule)
  },
  {
    path: 'facility-upcoming',
    loadChildren: () => import('./pages/facility-upcoming/facility-upcoming.module').then( m => m.FacilityUpcomingPageModule)
  },
  {
    path: 'manage-appointment',
    loadChildren: () => import('./pages/manage-appointment/manage-appointment.module').then( m => m.ManageAppointmentPageModule)
  },
  {
    path: 'manage-hosts',
    loadChildren: () => import('./pages/manage-hosts/manage-hosts.module').then( m => m.ManageHostsPageModule)
  },
  {
    path: 'manage-visitors',
    loadChildren: () => import('./pages/manage-visitors/manage-visitors.module').then( m => m.ManageVisitorsPageModule)
  },
  {
    path: 'my-visitors',
    loadChildren: () => import('./pages/my-visitors/my-visitors.module').then( m => m.MyVisitorsPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'notiification-view',
    loadChildren: () => import('./pages/notiification-view/notiification-view.module').then( m => m.NotiificationViewPageModule)
  },
  {
    path: 'pages-questions',
    loadChildren: () => import('./pages/pages-questions/pages-questions.module').then( m => m.PagesQuestionsPageModule)
  },
  {
    path: 'pages-view-image-page',
    loadChildren: () => import('./pages/pages-view-image-page/pages-view-image-page.module').then( m => m.PagesViewImagePagePageModule)
  },
  {
    path: 'qr-code-image-page',
    loadChildren: () => import('./pages/qr-code-image-page/qr-code-image-page.module').then( m => m.QrCodeImagePagePageModule)
  },
  {
    path: 'quick-pass-dash-board-page',
    loadChildren: () => import('./pages/quick-pass-dash-board-page/quick-pass-dash-board-page.module').then( m => m.QuickPassDashBoardPagePageModule)
  },
  {
    path: 'quick-pass-details-page',
    loadChildren: () => import('./pages/quick-pass-details-page/quick-pass-details-page.module').then( m => m.QuickPassDetailsPagePageModule)
  },
  {
    path: 'quick-pass-history-page',
    loadChildren: () => import('./pages/quick-pass-history-page/quick-pass-history-page.module').then( m => m.QuickPassHistoryPagePageModule)
  },
  {
    path: 'security-check-in-page',
    loadChildren: () => import('./pages/security-check-in-page/security-check-in-page.module').then( m => m.SecurityCheckInPagePageModule)
  },
  {
    path: 'security-check-out-page',
    loadChildren: () => import('./pages/security-check-out-page/security-check-out-page.module').then( m => m.SecurityCheckOutPagePageModule)
  },
  {
    path: 'security-dash-board-page',
    loadChildren: () => import('./pages/security-dash-board-page/security-dash-board-page.module').then( m => m.SecurityDashBoardPagePageModule)
  },
  {
    path: 'security-visitor-list-page',
    loadChildren: () => import('./pages/security-visitor-list-page/security-visitor-list-page.module').then( m => m.SecurityVisitorListPagePageModule)
  },
  {
    path: 'settings-view-page',
    loadChildren: () => import('./pages/settings-view-page/settings-view-page.module').then( m => m.SettingsViewPagePageModule)
  },
  {
    path: 'sign-pad-idle-page',
    loadChildren: () => import('./pages/sign-pad-idle-page/sign-pad-idle-page.module').then( m => m.SignPadIdlePagePageModule)
  },
  {
    path: 'sign-pad-terms-and-condition-page',
    loadChildren: () => import('./pages/sign-pad-terms-and-condition-page/sign-pad-terms-and-condition-page.module').then( m => m.SignPadTermsAndConditionPagePageModule)
  },
  {
    path: 'sign-pad-visitor-details-page',
    loadChildren: () => import('./pages/sign-pad-visitor-details-page/sign-pad-visitor-details-page.module').then( m => m.SignPadVisitorDetailsPagePageModule)
  },
  {
    path: 'signature-page',
    loadChildren: () => import('./pages/signature-page/signature-page.module').then( m => m.SignaturePagePageModule)
  },
  {
    path: 'user-profile-page',
    loadChildren: () => import('./pages/user-profile-page/user-profile-page.module').then( m => m.UserProfilePagePageModule)
  },
  {
    path: 'visitor-company-page',
    loadChildren: () => import('./pages/visitor-company-page/visitor-company-page.module').then( m => m.VisitorCompanyPagePageModule)
  },
  {
    path: 'admin-login',
    loadChildren: () => import('./pages/admin-login/admin-login.module').then( m => m.AdminLoginPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'visitor-information',
    loadChildren: () => import('./pages/visitor-information/visitor-information.module').then( m => m.VisitorInformationPageModule)
  },
  {
    path: 'security-appointment-list',
    loadChildren: () => import('./pages/security-appointment-list/security-appointment-list.module').then( m => m.SecurityAppointmentListPageModule)
  },
  {
    path: 'security-manual-check-in',
    loadChildren: () => import('./pages/security-manual-check-in/security-manual-check-in.module').then( m => m.SecurityManualCheckInPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
