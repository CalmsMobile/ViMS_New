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
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { EventsService } from './services/EventsService';
import { ToastService } from './services/util/Toast.service';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { RestProvider } from './providers/rest/rest';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { NetworkProvider } from './providers/network/network';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { WheelSelector } from '@ionic-native/wheel-selector/ngx';
import { Firebase } from '@ionic-native/firebase/ngx';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { CommonModule, DatePipe } from '@angular/common';
import { VimsFacilityDisplay } from './services/vims-facility-display';
import { DateFormatPipe } from './pipes/custom/DateFormat';
import { CustomPipe } from './pipes/custom/custom';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts/ngx';
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

@NgModule({
  declarations: [AppComponent, AddAppointmentAlertPopupComponent,
    CustomVisitorPopupComponent, UtilPopupWizardComponent, QuestionDocPopupComponent,
    IntroPageWizardComponent, QuickPassVisitorPopupComponent],
  entryComponents: [],
  exports: [AddAppointmentAlertPopupComponent,CustomVisitorPopupComponent, QuestionDocPopupComponent,
    IntroPageWizardComponent, QuickPassVisitorPopupComponent, UtilPopupWizardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ BrowserModule,
    HttpClientModule,
    LongPressModule,
    CommonModule,
    SignaturePadModule,
    AppRoutingModule,
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
    SpinnerDialog,
    HTTP,
    EventsService,
    Device,
    RestProvider,
    LocalNotifications,
    FileOpener,
    FileTransfer,
    Camera,
    ScreenOrientation,
    FilePath,
    SocialSharing,
    NetworkProvider,
    Network,
    WheelSelector,
    PreviewAnyFile,
    Firebase,
    DatePicker,
    DatePipe,
    VimsFacilityDisplay,
    DateFormatPipe,
    CustomPipe,
    StreamingMedia,
    Contacts,
    AndroidPermissions,
    Base64],
  bootstrap: [AppComponent],
})
export class AppModule {}
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
