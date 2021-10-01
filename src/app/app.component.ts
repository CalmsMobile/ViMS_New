import { Component, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FCM } from '@ionic-native/fcm/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, MenuController, ModalController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from './providers/rest/rest';
import { AppSettings } from './services/app-settings';
import { EventsService } from './services/EventsService';
import { IService } from './services/IService';
import { MenuService } from './services/menu-service';

import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ThemeSwitcherService } from './services/ThemeSwitcherService';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers: [MenuService]
})
export class AppComponent {
  // @ViewChild(Nav) nav: Nav;

  showHeader = true;
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
    private themeSwitcher: ThemeSwitcherService,
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy,
    private geolocation: Geolocation,
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
        this.navCtrl.navigateRoot('');
        setTimeout(() => {
          this.navCtrl.navigateRoot('');
        }, 1000);
      } else if (data.title === "ReloadMenu") {
        this.loadMenuData(true);
      } else if (data.title === "Update Profile Picture") {
        var tempImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/PortalImageHandler.ashx?RefSlno=' + data.message + "&ScreenType=30&Refresh=" + new Date().getTime();
        this.params.hostImage = tempImage;
      } else if (data.title === "AdminEnabled") {
        this.navCtrl.navigateRoot("admin-home");
      } else if (data.title === "SignPad") {
        this.navCtrl.navigateRoot('sign-pad-idle-page');
      } else if (data.title === "CheckIn Acknowledgment") {
        this.navCtrl.navigateRoot('sign-pad-idle-page');
      }else if (data.title === "GetLocationForTAMS") {
        this.checkGPSPermission();
      } else if (data.title === "UserInActive") {
        this.navCtrl.navigateRoot('account-mapping');
        let alert = this.alertCtrl.create({
          header: 'Alert',
          message: this.T_SVC['ALERT_TEXT.USER_INACTIVE'],
          cssClass: '',
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

      document.body.classList.toggle('dark', false);

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

      // Listen for changes to the prefers-color-scheme media query
      prefersDark.addListener((e) => {
        document.body.classList.toggle('dark', false);
      });

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
            if (this.router.url === '/account-mapping' || this.router.url ==='home-tams' || this.router.url === '/home' || this.router.url === 'security-dash-board-page') {
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

      // this.menu.enable(false, "myLeftMenu");

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
              this.navCtrl.navigateRoot("account-mapping");
              return;
            }
            this.menu.enable(true, "myLeftMenu");
            break;
          case AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP:
            hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
            if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
              console.log("calling login Page: " + hostData);
              this.navCtrl.navigateRoot("account-mapping");
              return;
            }
            this.menu.enable(true, "myLeftMenu");
            break;
          case AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS:
            this.showHeader = false;
            hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
            if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
              console.log("calling login Page: " + hostData);
              this.navCtrl.navigateRoot("account-mapping");
              return;
            }
            //this.GetHostAppSettings(AppSettings.LOGINTYPES.HOSTAPPT);
            this.getSettingsForTams();
            this.menu.enable(true, "myLeftMenu");
            this.navCtrl.navigateRoot("home-tams");
            setTimeout(() => {
              this.navCtrl.navigateRoot("home-tams");
              this.menu.enable(true, "myLeftMenu");
            }, 5000);
            break;
          case AppSettings.LOGINTYPES.FACILITY:
            hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
            if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
              console.log("calling login Page: " + hostData);
              this.navCtrl.navigateRoot("account-mapping");
              return;
            }
            this.menu.enable(true, "myLeftMenu");
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
              this.navCtrl.navigateRoot("account-mapping");
              this.navCtrl.navigateRoot("login");
            } else {
              this.navCtrl.navigateRoot("security-dash-board-page");
            }

            break;
        }
      } else {
        this.navCtrl.navigateRoot("account-mapping");
      }
    });
  }

//getLocationForTAMS Start

/**
   *
   * @param lat1
   * @param lat2
   * @param long1
   * @param long2
   * @returns
   */
 calculateDistance(lat1:number,lat2:number,long1:number,long2:number){
  let p = 0.017453292519943295;    // Math.PI / 180
  let c = Math.cos;
  let a = 0.5 - c((lat1-lat2) * p) / 2 + c(lat2 * p) *c((lat1) * p) * (1 - c(((long1- long2) * p))) / 2;
  let dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
  return dis/1000;
}
  /**
   *
   * @returns
   */
  //Check if application having GPS access permission
  checkGPSPermission() {

    if (!this.apiProvider.isRunningOnMobile()) {
      this.getLocationCoordinates(true);
      return;
    }
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {
          //If having permission show 'Turn On GPS' dialogue
          this.askToTurnOnGPS();
        } else {
          //If not having permission ask for permission
          this.requestGPSPermission();
        }
      },
      err => {

        if (err === 'cordova_not_available') {
          this.requestGPSPermission();
        } else {
          this.showAlertForLocation('Please allow location permission inorder to use attendance and try again.');
        }

      }
    );
  }

  /**
   *
   */
  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log("4");
        this.askToTurnOnGPS();
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              //Show alert if user click on 'No Thanks'
              if (error === 'cordova_not_available') {
                this.requestGPSPermission();
              } else {
                this.showAlertForLocation("Please allow location permission inorder to use attendance and try again.");
              }

            }
          );
      }
    });
  }

  /**
   *
   */
  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        // When GPS Turned ON call method to get Accurate location coordinates
        this.getLocationCoordinates(true);
      },
      error => {
        if (JSON.stringify(error) === 'cordova_not_available') {
          this.getLocationCoordinates(true);
        } else {
          // alert('Error requesting location permissions ' + JSON.stringify(error))
          this.showAlertForLocation("Your GPS seems to be disabled, please enable it to proceed.");
        }
      }
    );
  }

  async showAlertForLocation(errorMsg) {
    if (!this.alertShowing) {
      this.alertShowing = true;
      let alert = this.alertCtrl.create({
        header: 'Notification',
        message: errorMsg,
        mode:'ios',
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
          this.router.navigateByUrl('home-tams');
        });
    }

  }

  isEnabledAlready = false;

  /**
   *
   */
  getLocationCoordinates(showOnce) {
    if (!this.isEnabledAlready) {
      this.getCurrentLocation(true);
      const watchId = this.geolocation.watchPosition({ enableHighAccuracy: true,timeout:30000 });
      watchId.subscribe((data: any) => {

        if (data && data.coords) {
          console.log('watchPosition latitude location --> ', data.coords.latitude + "," + data.coords.longitude);
          // data can be a set of coordinates, or an error (if an error occurred).
          localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_LATITUDE, data.coords.latitude+"");
          localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_LONGITUDE, data.coords.longitude+"");

          if (showOnce) {
          //  this.apiProvider.showAlert('watchPosition latitude location --> '+ data.coords.latitude + "," + data.coords.longitude);
          }
        } else {
          if (showOnce) {
            this.events.publishDataCompany({
              action: 'hideLoading',
              title: 'hideLoading',
              message: 'hideLoading'
            });
            this.showAlertForLocation('Someting went wrong while fetch location and try again.');
          }

        }

        showOnce = false;
        this.isEnabledAlready = true;
      });
    }


  }

  /**
   *
   */
  getCurrentLocation(showOnce) {
    this.geolocation.getCurrentPosition({ enableHighAccuracy: true,timeout:30000}).then((resp) => {
      console.log('getCurrentPosition latitude location --> ', resp.coords.latitude + "," + resp.coords.longitude);
      localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_LATITUDE, resp.coords.latitude+"");
      localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_LONGITUDE, resp.coords.longitude+"");
      this.isEnabledAlready = true;
      if (showOnce) {
        // this.apiProvider.showAlert('getCurrentPosition latitude location --> '+ resp.coords.latitude + "," + resp.coords.longitude);
      }
      showOnce = false;
     }).catch((error) => {
       console.log('Error getting location', error);
       this.events.publishDataCompany({
          action: 'hideLoading',
          title: 'hideLoading',
          message: 'hideLoading'
        });
        this.apiProvider.showAlert('Someting went wrong while fetch location and try again');
     });
  }

  ////getLocationForTAMS Ends


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
            const appTheme = result.Table1[0].AppTheme;
            if (appTheme) {
              const appThemeObj = JSON.parse(appTheme);
              if (appThemeObj.primThemeColor) {
                this.statusBar.backgroundColorByHexString(appThemeObj.primThemeColor);
                this.themeSwitcher.setThemeNew(appThemeObj.primThemeColor, appThemeObj.primThemeTextColor, appThemeObj.btnBGColor, appThemeObj.btnTextColor);
              }
            }
          }
        } catch (e) {

        }

      },
      (err) => {
      }
    );
  }

  getSettingsForTams() {
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).HOSTIC) {
      return;
    }
    var hostId = JSON.parse(hostData).HOSTIC;
    var data = {
      "MAppId": "TAMS",
      "HostIc": hostId
    };
    this.apiProvider.requestApi(data, '/api/TAMS/getTAMSsettings', false, false, '').then(
      (val: any) => {
        const response = JSON.parse(val);
        if (response.Table && response.Table.length > 0 ) {
          if(response.Table[0].Code === 10 || response.Table[0].code === 10) {
            localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_SETTINGS, JSON.stringify(response.Table1[0]));
          }
        }
      },
      async (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
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
    this.fcm.hasPermission().then(hasPermission => {
      if (hasPermission) {
        console.log("Has permission!");
        this.fcm.getToken().then(token => {
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
          console.log("Token:" + token);
        });
        this.fcm.onTokenRefresh().subscribe(token => {
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
          console.log("Token:" + token);
        });
      }
    })

  }

  async presentConfirm() {
    this.alertShown = true;
    let alert = this.alertCtrl.create({
      header: 'Confirm Exit',
      message: this.T_SVC['ALERT_TEXT.ON_BACK'],
      cssClass: '',
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
      } else if (JSON.parse(scannedJson1).MAppId == AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS || JSON.parse(scannedJson1).MAppId == AppSettings.LOGINTYPES.TAMS) {
        if (page.component === 'home-view') {
          this.router.navigateByUrl('home-tams');
        } else {
          this.router.navigateByUrl(page.component);
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
              var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
              if (qrData) {
                const QRObj = JSON.parse(qrData);
                if (QRObj.MAppId === AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS || QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
                  currentClass.router.navigateByUrl('home-tams');
                } else {
                  currentClass.navCtrl.navigateRoot("home-view");
                  currentClass.events.publishDataCompany({
                    action: 'ChangeTab',
                    title: page,
                    message: 0
                  });
                }
              }
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
