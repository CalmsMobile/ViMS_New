import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, MenuController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { ThemeSwitcherService } from 'src/app/services/ThemeSwitcherService';
import { FCM } from 'plugins/cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
@Component({
  selector: 'app-home-tams',
  templateUrl: './home-tams.page.html',
  styleUrls: ['./home-tams.page.scss'],
})
export class HomeTAMSPage implements OnInit {
  hostObj: any = {

  };
  lastNotification: any = '';
  QRObj1: any;
  isNotificationClicked = false;
  notificationCount = 0;
  currentPage = "home-view";
  showFacilityAlone = false;
  showQP = false;
  showHOST = false;
  showFacility = false;
  showTAMS = false;
  showNotification = false;
  showQRAccess = false;
  isAdmin = false;
  constructor(public navCtrl: NavController,
    private events : EventsService,
    private router: Router,
    public menu: MenuController,
    private platform : Platform,
    private themeSwitcher: ThemeSwitcherService,
    private fcm: FCM,
    private localNotifications: LocalNotifications,
    private _zone : NgZone,
    private translate : TranslateService,
    private dateformat: DateFormatPipe,
    private statusBar: StatusBar,
    private alertCtrl: AlertController, public apiProvider: RestProvider) {
    events.observeDataCompany().subscribe((data1:any) => {
      if (data1.action === "NotificationReceived") {
        console.log("Notification Received: " + data1.title);
        this.showNotificationCount();
      } else if (data1.action === "ReloadTAMS") {
        console.log("ReloadMenu Received: " + data1.title);
        this.ngOnInit();
      }
    });
   }

  ngOnInit() {
    this.GetHostAppSettings();

    this.menu.enable(true, "myLeftMenu");
    if (this.showTAMS) {
      this.getSettingsForTams();
      this.getMySchedules();
      this.getMyAttendanceWhitelistedLocations();
    }

  }


  GetHostAppSettings() {
    const settings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrInfo){

      if (settings && JSON.parse(settings)) {
          try {
              var hostSettings = JSON.parse(settings).Table1[0];
              this.showQP = JSON.parse(hostSettings.QuickPassSettings).QPVisitorEnabled;
          } catch (e) {

          }
      }

      this.QRObj1 = JSON.parse(qrInfo);
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTAPPT) > -1|| this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1) {
        this.showHOST = true;
        this.isAdmin = true;
      } else{
        this.showHOST = false;
        this.isAdmin = false;
      }
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1) {
        this.showFacility = true;
      } else {
        this.showFacility = false;
      }
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTAPPT) === -1 && this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) === -1 && this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1) {
        this.showFacilityAlone = true;
      } else {
        this.showFacilityAlone = false;
      }
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.TAMS) > -1) {
        this.showTAMS = true;
      } else {
        this.showTAMS = false;
      }
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.NOTIFICATIONS) > -1) {
        this.showNotification = true;
      } else {
        this.showNotification = false;
      }
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.QR_ACCESS) > -1) {
        this.showQRAccess = true;
      } else {
        this.showQRAccess = false;
      }
    }
    if (!settings && qrInfo) {
      var params = {
        "MAppId": this.QRObj1.MAppId,
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
              this.events.publishDataCompany({
                action: 'user:created',
                title: "ReloadMenu",
                message: "ReloadMenu"
              });

              try {
                if (settings && JSON.parse(settings) && JSON.parse(settings).Table3  && JSON.parse(settings).Table3.length > 0){
                  const appTheme = JSON.parse(settings).Table3[0].AppTheme;
                  if (appTheme) {
                    const appThemeObj = JSON.parse(appTheme);
                    if (appThemeObj.primThemeColor) {
                      this.statusBar.backgroundColorByHexString(appThemeObj.primThemeColor);
                      this.themeSwitcher.setThemeNew(appThemeObj.primThemeColor, appThemeObj.primThemeTextColor, appThemeObj.btnBGColor, appThemeObj.btnTextColor);
                    }
                  }
                }
              } catch (error) {

              }
            }
          } catch (e) {

          }

        },
        (err) => {
        }
      );
    }
    const masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
    if (!masterDetails){
      this.getMasterdetails();
    }
  }


  getMasterdetails(){
    this.apiProvider.GetMasterDetails().then(
      (val: any) => {
        var result = val;
        if(result){
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
        }
      },
      (err) => {

      }
    );
  }

  getSettingsForTams() {
    const settings = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_SETTINGS);
    if (!settings) {
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

  }


  getMyAttendanceWhitelistedLocations(){
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).HOSTIC) {
      return;
    }
    var hostId = JSON.parse(hostData).HOSTIC;
    var data = {
      "MAppId": "TAMS",
      "HostIc": hostId
    };
    this.apiProvider.requestApi(data, '/api/TAMS/getMyWhitelistedLocation', false, false, '').then(
      (val: any) => {
        const response = JSON.parse(val);
        if (response.Table && response.Table.length > 0 && (response.Table[0].Code === 10 || response.Table[0].code === 10)) {
          const locationUpdatedDate = this.dateformat.transform(new Date()+"", 'yyyy-MM-dd');
          response.Table1[0].locationUpdatedDate = locationUpdatedDate;
          localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_WHITELISTED_LOCATION, JSON.stringify(response.Table1));
        }
      },
      async (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
      }
    );
  }

  getMySchedules() {
    const data = {
    "MAppId": "TAMS",
    "HostIc": "",
    };
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
      return;
    }
    data.HostIc = JSON.parse(hostData).HOSTIC;
    this.apiProvider.requestApi(data, '/api/TAMS/getMySchedule', false, false, '').then(
      (val: any) => {
        let myScheduleList = [];
        const response = JSON.parse(val);
        if (response.Table && response.Table.length > 0 && (response.Table[0].Code === 10 || response.Table[0].code === 10)) {
          myScheduleList = response.Table1
        }
        myScheduleList.forEach(element => {
          const currentDate = this.dateformat.transform(new Date() + "", "yyyy-MM-dd");
          element.scheduleDate = this.dateformat.transform(element.scheduleDate + "", "yyyy-MM-dd");
          if (new Date(currentDate) > new Date(element.scheduleDate)) {
            element.isAvailable = false;
          } else {
            element.isAvailable = true;
          }
          if (element.fromTime && element.fromTime != null){
            element.fromTime1 = this.dateformat.transform(element.fromTime + "", "HH:mm");
            element.fromTime = this.dateformat.transform(element.fromTime + "", "HH:mm a");
          }
          element.shiftName = element.shiftName.trim();
          if (element.toTime && element.fromTime != null){
            element.toTime1 = this.dateformat.transform(element.toTime + "", "HH:mm");
            element.toTime = this.dateformat.transform(element.toTime + "", "HH:mm a");
          }
        });
        localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_SCHEDULE, JSON.stringify(myScheduleList));
      },
      (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
        try {
          var result = JSON.parse(err.toString());
          if(result.message){
            this.apiProvider.showAlert(result.message);
            return;
          }
        } catch (error) {

        }
      }
    );
  }

  showNotificationCount(){
    var count = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
    if(count){
      this.notificationCount = parseInt(count);
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter UpcomingAppointmentPage');

    const settings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrInfo){

      if (settings && JSON.parse(settings)) {
          try {
              var hostSettings = JSON.parse(settings).Table1[0];
              this.showQP = JSON.parse(hostSettings.QuickPassSettings).QPVisitorEnabled;
          } catch (e) {

          }
      }

      this.QRObj1 = JSON.parse(qrInfo);
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTAPPT) > -1|| this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1) {
        this.showHOST = true;
        this.isAdmin = true;
      } else{
        this.showHOST = false;
        this.isAdmin = false;
      }
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1) {
        this.showFacility = true;
      } else {
        this.showFacility = false;
      }
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTAPPT) === -1 && this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) === -1 && this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1) {
        this.showFacilityAlone = true;
      } else {
        this.showFacilityAlone = false;
      }
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.TAMS) > -1) {
        this.showTAMS = true;
      } else {
        this.showTAMS = false;
      }
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.NOTIFICATIONS) > -1) {
        this.showNotification = true;
      } else {
        this.showNotification = false;
      }
      if (this.QRObj1.MAppId.indexOf(AppSettings.LOGINTYPES.QR_ACCESS) > -1) {
        this.showQRAccess = true;
      } else {
        this.showQRAccess = false;
      }
    }

    this.events.publishDataCompany({
      action: 'user:created',
      title: "ReloadMenu",
      message: "ReloadMenu"
    });
    if(this.platform.is('cordova')) {
      try{
        this.initializeFirebase();
        window.addEventListener('load', (data) =>{
          console.log('page changed' + data);
       });
      } catch (error) {
      }
    }
    this.events.publishDataCompany({
      action: "page",
      title:   "home-view",
      message: ''
    });
    setTimeout(() => {
      this.events.observeDataCompany().subscribe((data1: any) => {
        if (data1.action === 'page') {
          const data = data1.title;
          if(data){
            this.currentPage = data;
          }
        }

      //this.myTabs.select(this.myIndex);
    });
    }, 500);
    this.showNotificationCount();
    this.resetData();
  }

  initializeFirebase() {
    if(this.platform.is("cordova")) {
      this.platform.is('android') ? this.initializeFirebaseAndroid() : this.initializeFirebaseIOS();
    }
  }
initializeFirebaseAndroid() {
    this.fcm.getToken().then(token => {
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, ""+token);
      console.log("Token:"+ token);
    });
    this.fcm.onTokenRefresh().subscribe(token => {
      console.log("RefreshToken:"+ token);
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, ""+token);
    })
    this.subscribeToPushNotifications();
}
initializeFirebaseIOS() {
  try{
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
    });
    this.fcm.getToken().then(token => {
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
      console.log("Token:" + token);
    });
    this.fcm.onTokenRefresh().subscribe(token => {
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
      console.log("Token:" + token);
    });
  }catch(e){
    console.log('FCM error:' + e);
  }
  this.subscribeToPushNotifications();
  }
  subscribeToPushNotifications() {
    this.fcm.onNotification().subscribe((response) => {
      this.onMessageReceived(response);
    });

  }

  onMessageReceived(response) {
    console.log(JSON.stringify(response));
      var typeOfNotification = "Visitor"
      if (response.push_type != undefined && response.push_type === "10") {
        typeOfNotification = "General"
      }
      var count = 0;
      var notificationCount = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
      if(notificationCount){
        count = parseInt(notificationCount);
      }
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT, ""+(count+1));

      if(response.tap || response.wasTapped){
        var cClass = this;
        //alert('data was tapped');
        console.log("subscribeToPushNotifications:"+ response.body);
        this._zone.run(() => {
          if(!cClass.isNotificationClicked){
            cClass.isNotificationClicked = true;
            if (cClass.router.url === 'notifications' ){
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT, "0");
            }else{
              const navigationExtras: NavigationExtras = {
                state: {
                  passData: {
                    type:typeOfNotification
                  }
                }
              };
              cClass.router.navigate(['notifications'], navigationExtras);
            }
            setTimeout(()=>{
              cClass.isNotificationClicked = false;
            },2000)

          }

        });

        //Received while app in background (this should be the callback when a system notification is tapped)
        //This is empty for our app since we just needed the notification to open the app
      } else{
        var crntClass = this;
        this._zone.run(() => {
          crntClass.events.publishDataCompany({
            action: "NotificationReceived",
            title: typeOfNotification,
            message: response.body
          });
          // let view = this.navCtrl.getActive();
        //alert("Cuent Page: " + this.currentPage);
        if (crntClass.currentPage == "notifications"){
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT, "0");
        }else if (crntClass.currentPage != "Admin" && this.lastNotification !== response.body){
          this.lastNotification = response.body;
          var noti = new Date();
          crntClass.localNotifications.schedule({
             id:noti.getTime(),
             title: typeOfNotification,
             text: response.body,
             trigger: {at: noti},
             led: 'FF0000',
             sound: null,
          });
          crntClass.localNotifications.on('click').subscribe(()=>{
            crntClass._zone.run(() => {
              if(!crntClass.isNotificationClicked){
                crntClass.isNotificationClicked = true;
                if (crntClass.router.url === 'notifications' ){
                  window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT, "0");
                }else{
                  const navigationExtras: NavigationExtras = {
                    state: {
                      passData: {
                        type:typeOfNotification
                      }
                    }
                  };
                  crntClass.router.navigate(['notifications'], navigationExtras);
                }
              };
              setTimeout(()=>{
                crntClass.isNotificationClicked = false;
              },2000)
            });
          });
        }
        console.log("subscribeToPushNotifications:"+ response.body);
        });


      }
  }

  resetData() {
    const hostData = localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    const cmpnyData = localStorage.getItem(AppSettings.LOCAL_STORAGE.COMPANY_DETAILS);
    if (hostData) {
      var tempImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + 'Handler/PortalImageHandler.ashx?RefSlno='
      + JSON.parse(hostData).SEQID + "&ScreenType=30&Refresh=" + new Date().getTime();
      this.hostObj.hostImage = tempImage;
      this.hostObj.HOSTNAME = JSON.parse(hostData).HOSTNAME;
      this.hostObj.HOST_EMAIL = JSON.parse(hostData).HOST_EMAIL;
      this.hostObj.comp_name = JSON.parse(cmpnyData).comp_name;;
    }

  }

  gotoAdminPage(){
    this.router.navigateByUrl('admin-home');
  }

  gotoQRProfile() {
    this.router.navigateByUrl('qr-profile');
  }

  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

  statesClicked(page) {
    console.log(page);
    if (page === 'qraccess'){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: { "ACTION": "ShowQR",
        }
        }
      };
      this.router.navigate([page], navigationExtras);
    } else {
      this.router.navigateByUrl(page);
    }

  }

}
