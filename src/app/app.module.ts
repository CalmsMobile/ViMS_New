import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LongPressModule } from 'ionic-long-press';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { File } from '@ionic-native/file/ngx';
import { Device } from '@ionic-native/device/ngx';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PipesModule } from './pipes/pipes.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Network } from '@ionic-native/network/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { EventsService } from './services/EventsService';
import { ToastService } from './services/util/Toast.service';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { RestProvider } from './providers/rest/rest';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { NetworkProvider } from './providers/network/network';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { WheelSelector } from '@ionic-native/wheel-selector/ngx';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { VimsFacilityDisplay } from './services/vims-facility-display';
import { DateFormatPipe } from './pipes/custom/DateFormat';
import { CustomPipe } from './pipes/custom/custom';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { Contacts } from '@ionic-native/contacts/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { MenuService } from './services/menu-service';
import { NgCalendarModule  } from 'ionic2-calendar';
import { AddAppointmentAlertPopupComponent } from './components/add-appointment-alert/add-appointment-alert-popup';
import { CustomVisitorPopupComponent } from './components/custom-visitor-popup/custom-visitor-popup';
import { IntroPageWizardComponent } from './components/intro-page-wizard/intro-page-wizard';
import { QuickPassVisitorPopupComponent } from './components/quickpass-visitor-popup/quickpass-visitor-popup';
import { UtilPopupWizardComponent } from './components/util-popup-wizard/util-popup-wizard';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { SignaturePadModule } from 'angular2-signaturepad';
import { IonicGestureConfig } from './services/util/IonicGestureConfig';
import { QuestionDocPopupComponent } from './components/question-doc-popup/question-doc-popup.component';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { PreviewAnyFile } from '@ionic-native/preview-any-file/ngx';
import { HostAccessComponent } from './components/host-access/host-access.component';
import { CountryComponentComponent } from './components/country-component/country-component.component';
import { CommonUtil } from './services/util/CommonUtil';
import { TooltipsModule } from 'ionic-tooltips';
import { ToolTipComponent } from './components/tool-tip/tool-tip.component';
import { ThemeSwitcherService } from './services/ThemeSwitcherService';
import { ViewImageComponent } from './components/view-image/view-image.component';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { FCM } from 'plugins/cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';

@NgModule({
  declarations: [AppComponent, AddAppointmentAlertPopupComponent, HostAccessComponent, ToolTipComponent,
    CustomVisitorPopupComponent, UtilPopupWizardComponent, QuestionDocPopupComponent, CountryComponentComponent,
    IntroPageWizardComponent, QuickPassVisitorPopupComponent, ViewImageComponent],
  entryComponents: [],
  exports: [AddAppointmentAlertPopupComponent,CustomVisitorPopupComponent, QuestionDocPopupComponent,HostAccessComponent,
    ToolTipComponent,ViewImageComponent,
    IntroPageWizardComponent, QuickPassVisitorPopupComponent, UtilPopupWizardComponent, CountryComponentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ BrowserModule,
    HttpClientModule,
    LongPressModule,
    CommonModule,
    SignaturePadModule,
    AppRoutingModule,
    TooltipsModule.forRoot(),
    NgCalendarModule,
    TranslateModule.forRoot(),
    PipesModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      }
    }),
    IonicModule.forRoot({
      mode: 'ios',
      scrollAssist: true,
      scrollPadding: false,
    }),
    HttpClientModule,
    ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig},
    MenuService,
    BarcodeScanner,
    StatusBar,
    SplashScreen,
    ToastService,
    File,
    Network,
    SQLite,
    FCM,
    SpinnerDialog,
    HTTP,
    EventsService,
    DecimalPipe,
    Device,
    InAppBrowser,
    RestProvider,
    ThemeSwitcherService,
    LocalNotifications,
    FileOpener,
    FileTransfer,
    Camera,
    LocationAccuracy,
    ScreenOrientation,
    FilePath,
    SocialSharing,
    NetworkProvider,
    Geolocation,
    NativeGeocoder,
    WheelSelector,
    PreviewAnyFile,
    DatePicker,
    DatePipe,
    VimsFacilityDisplay,
    DateFormatPipe,
    CustomPipe,
    StreamingMedia,
    Contacts,
    AndroidPermissions,
    CommonUtil,
    Base64],
  bootstrap: [AppComponent],
})
export class AppModule {}
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
