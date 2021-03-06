import { Component, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FCM } from "cordova-plugin-fcm-with-dependecy-updated/ionic/ngx";
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, MenuController, ModalController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from './providers/rest/rest';
import { AppSettings } from './services/app-settings';
import { EventsService } from './services/EventsService';
import { IService } from './services/IService';
import { MenuService } from './services/menu-service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers: [MenuService]
})
export class AppComponent {
  // @ViewChild(Nav) nav: Nav;


  pages: any;
  params: any;
  leftMenuTitle: string;
  lastBack: any;
  public alertShown: boolean = false;
  alertShowing = false;
  T_SVC: any;
  constructor(public platform: Platform,
    public menu: MenuController,
    private router: Router,
    public modalCtrl: ModalController,
    private menuService: MenuService,
    public statusBar: StatusBar,
    public events: EventsService,
    private fcm: FCM,
    // private ionicApp: IonicApp,
    private navCtrl: NavController,
    private apiProvider: RestProvider,
    public alertCtrl: AlertController,
    public splashScreen: SplashScreen,
    private translate: TranslateService,
    private _zone: NgZone) {
    this.initializeTransalate();
    this.initializeApp();




    events.observeDataCompany().subscribe(async (data: any) => {
      if (data.title === "addAppointment") {
        this.navCtrl.navigateRoot('home-view');
        setTimeout(() => {
          this.navCtrl.navigateRoot('home-view');
        }, 1000);
      } else if (data.title === "ReloadMenu") {
        this.loadMenuData(true);
      } else if (data.title === "Update Profile Picture") {
        var tempImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/ImageHandler.ashx?RefSlno=' + data.message + "&RefType=HP&Refresh=" + new Date().getTime();
        this.params.hostImage = tempImage;
      } else if (data.title === "AdminEnabled") {
        this.navCtrl.navigateRoot("admin-home");
      } else if (data.title === "SignPad") {
        this.navCtrl.navigateRoot('sign-pad-idle-page');
      } else if (data.title === "CheckIn Acknowledgment") {
        this.navCtrl.navigateRoot('sign-pad-idle-page');
      } else if (data.title === "UserInActive") {
        this.navCtrl.navigateRoot('account-mapping');
        let alert = this.alertCtrl.create({
          header: 'Alert',
          message: this.T_SVC['ALERT_TEXT.USER_INACTIVE'],
          cssClass: 'alert-danger',
          buttons: [{
            text: 'Okay',
            handler: () => {
              console.log('Cancel clicked');
              this.alertShowing = false;
            }
          }]
        });
        (await alert).present();
      } else if (data.title === "InValidDeviceUIDOrUnAuthorized") {
        localStorage.clear();
        if (!this.alertShowing) {
          this.alertShowing = true;
          this.navCtrl.navigateRoot('account-mapping');
          let alert = this.alertCtrl.create({
            header: 'Alert',
            message: data.message,
            cssClass: 'alert-warning-largemsg',
            buttons: [{
              text: 'Okay',
              handler: () => {
                console.log('Cancel clicked');
                this.alertShowing = false;
              }
            }]
          });
          (await alert).present();
          (await alert).onDidDismiss().then(() => {
            this.alertShowing = false;
          });
        }
      }

    });
  }
  initializeTransalate() {
    this.translate.setDefaultLang('en');
    // if (this.translate.getBrowserLang() !== undefined) {
    //     this.translate.use(this.translate.getBrowserLang());
    // } else {
    this.translate.use('en'); // Set your language here
    //}
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();

      this.translate.get(['ALERT_TEXT.ON_BACK', 'ALERT_TEXT.USER_INACTIVE']).subscribe(t => {
        this.T_SVC = t;
      });

      setTimeout(() => {
        if (this.splashScreen) {
          this.splashScreen.hide();
        }

      }, 100);
      this.splashScreen.hide();
      this.loadMenuData(false);
      if (AppSettings.SHOW_START_WIZARD) {
        // this.presentIntroModal();
      }
      this.platform.backButton.subscribe(() => {
        console.log('Back Pressed');
        try {

          if (this.menu.isOpen()) {
            this.menu.close();
          }

          try {
            if (this.router.url === '/security-manual-check-in' || this.router.url === '/security-appointment-list' || this.router.url === '/security-check-out-page') {
              this.router.navigateByUrl('security-dash-board-page');
              return;
            }
            if (this.router.url === '/account-mapping' || this.router.url === '/home' || this.router.url === 'security-dash-board-page') {
              if (!this.alertShown) {
                this.presentConfirm();
              }
            }
          } catch (e) {
            console.log('Back Pressed error: ' + e);
            if (!this.alertShown) {
              this.presentConfirm();
            }
          }
        } catch (e) {
          console.log("Back Pressed error: " + e);
          if (!this.alertShown) {
            this.presentConfirm();
          }
        }

      });
      if (this.platform.is('cordova')) {
        try {
          this.initializeFirebase();
        } catch (error) {
        }
      }

      this.menu.enable(false, "myLeftMenu");

      var qrCodeInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if (qrCodeInfo && JSON.parse(qrCodeInfo) && JSON.parse(qrCodeInfo).ApiUrl) {
        AppSettings.APP_API_SETUP.live.api_url = JSON.parse(qrCodeInfo).ApiUrl;
      }
      var scannedJson1 = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if (scannedJson1 && JSON.parse(scannedJson1).MAppId) {
        switch (JSON.parse(scannedJson1).MAppId) {
          case AppSettings.LOGINTYPES.HOSTAPPT:
            var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
            if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
              console.log("calling login Page: " + hostData);
              return;
            }
            this.GetHostAppSettings(AppSettings.LOGINTYPES.HOSTAPPT);
            this.menu.enable(true, "myLeftMenu");
            this.navCtrl.navigateRoot("");;
            break;
          case AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP:
            hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
            if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
              console.log("calling login Page: " + hostData);
              return;
            }
            this.GetHostAppSettings(AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP);
            this.menu.enable(true, "myLeftMenu");
            this.navCtrl.navigateRoot("home-view");;
            break;
          case AppSettings.LOGINTYPES.FACILITY:
            hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
            if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
              console.log("calling login Page: " + hostData);
              return;
            }
            this.GetHostAppSettings(AppSettings.LOGINTYPES.FACILITY);
            this.menu.enable(true, "myLeftMenu");
            this.navCtrl.navigateRoot("home-view");;
            break;
          case AppSettings.LOGINTYPES.DISPLAYAPP:
            this.navCtrl.navigateRoot("facility-kiosk-display");;
            this.menu.enable(false, "myLeftMenu");
            break;
          case AppSettings.LOGINTYPES.ACKAPPT:
            this.getAcknowledgementSettings();
            this.menu.enable(false, "myLeftMenu");
            this.navCtrl.navigateRoot("sign-pad-idle-page");
            break;
          case AppSettings.LOGINTYPES.SECURITYAPP:
            hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_USER_DETAILS);
            if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).MAppDevSeqId) {
              console.log("calling login Page: " + hostData);
              this.navCtrl.navigateRoot("login");
            } else {
              this.navCtrl.navigateRoot("security-dash-board-page");
            }

            break;
        }
        // }
      }

    });
  }

  GetHostAppSettings(MAppId) {
    var params = {
      "MAppId": MAppId,
      "HostIc": ""
    }
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
      return;
    }
    params.HostIc = JSON.parse(hostData).HOSTIC;
    this.apiProvider.GetHostAppSettings(params, false).then(
      (val) => {
        try {
          var result = JSON.parse(JSON.stringify(val));
          if (result) {
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS, JSON.stringify(val));
            this.loadMenuData(true);
          }
        } catch (e) {

        }

      },
      (err) => {
      }
    );
  }

  getAcknowledgementSettings() {
    var QrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (QrInfo && JSON.parse(QrInfo)) {
      var QRObj = JSON.parse(QrInfo);
      var params = {
        "RefSchoolSeqId": "",
        "RefBranchSeqId": "",
        "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
        "LocatorName": QRObj.Location,
        "MAppDevSeqId": QRObj.MAppDevSeqId
      }

      this.apiProvider.getVisitorAcknowledgeSetting(params).then(
        (val) => {
          var result = JSON.parse(val + "");
          if (result) {
            console.log(val + "");
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS, val + "");
          }
        },
        (err) => {
        }
      );
    }
  }

  initializeFirebase() {
    if (this.platform.is("cordova")) {
      this.platform.is('android') ? this.initializeFirebaseAndroid() : this.initializeFirebaseIOS();
    }
  }
  initializeFirebaseAndroid() {
    this.fcm.getToken().then(token => {
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
      console.log("Token:" + token);
    });
    this.fcm.onTokenRefresh().subscribe(token => {
      console.log("RefreshToken:" + token);
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
    })
  }
  initializeFirebaseIOS() {
    this.fcm.getToken().then(token => {
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
      console.log("Token:" + token);
    });
    this.fcm.onTokenRefresh().subscribe(token => {
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
      console.log("Token:" + token);
    });
  }

  async presentConfirm() {
    this.alertShown = true;
    let alert = this.alertCtrl.create({
      header: 'Confirm Exit',
      message: this.T_SVC['ALERT_TEXT.ON_BACK'],
      cssClass: 'alert-warning',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.alertShown = false;
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            this.alertShown = false;
            // tslint:disable-next-line:no-string-literal
            navigator['app'].exitApp();
          }
        }
      ]
    });

    (await alert).present();

    (await alert).onDidDismiss().then(() => {
      this.alertShown = false;
    });
  }

  loadMenuData(show) {
    this.pages = this.menuService.getAllPages();
    this.leftMenuTitle = this.menuService.getTitle();
    this.menuService.load(null).subscribe(snapshot => {
      //debugger;
      if (show) {
        this.params = snapshot;
      }

    });
  }

  // presentIntroModal(){
  //   const appInfoModal = this.modalCtrl.create('IntroPage');
  //   appInfoModal.present();
  // }

  openPage(page) {
    if (!page.component) {
      return;
    }
    var scannedJson1 = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (scannedJson1 && JSON.parse(scannedJson1).MAppId) {
      if (JSON.parse(scannedJson1).MAppId == AppSettings.LOGINTYPES.FACILITY) {
        if (page.component == "notifications" || page.component == "facility-booking") {
          this.router.navigateByUrl(page.component);
        } else if (page.component == "FacilityUpcomingPage") {
          this.navCtrl.navigateRoot("home-view");
          this.events.publishDataCompany({
            action: 'ChangeTab',
            title: page,
            message: 0
          });
        } else {
          // this.navCtrl.navigateRoot(page.component);
          this.events.publishDataCompany({
            action: 'ChangeTab',
            title: page,
            message: 1
          });
        }
      } else {
        switch (page.component) {
          case "create-quick-pass":
          case "add-appointment":
          case "facility-booking":
          case "facility-booking-history":
          case "notifications":
          case "my-visitors":
            this.router.navigateByUrl(page.component);
            break;
          case "home-view":
            var currentClass = this;
            this._zone.run(function () {
              // currentClass.navCtrl.navigateRoot(page.component);
              currentClass.navCtrl.navigateRoot("home-view");
              currentClass.events.publishDataCompany({
                action: 'ChangeTab',
                title: page,
                message: 0
              });
            });
            break;
          default:
            this.events.publishDataCompany({
              action: 'ChangeTab',
              title: page,
              message: 1
            });
            break;
        }

      }

    }
  }

  getPageForOpen(value: string): any {
    return null;
  }

  getServiceForPage(value: string): IService {
    return null;
  }
}
