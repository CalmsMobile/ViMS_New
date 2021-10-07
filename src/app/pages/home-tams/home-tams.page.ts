import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, MenuController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FCM } from '@ionic-native/fcm/ngx';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { ThemeSwitcherService } from 'src/app/services/ThemeSwitcherService';

@Component({
  selector: 'app-home-tams',
  templateUrl: './home-tams.page.html',
  styleUrls: ['./home-tams.page.scss'],
})
export class HomeTAMSPage implements OnInit {
  hostObj: any = {

  };

  isNotificationClicked = false;
  notificationCount = 0;
  currentPage = "home-view";
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
      }
    });
   }

  ngOnInit() {
    this.GetHostAppSettings();
    this.getSettingsForTams();
    this.menu.enable(true, "myLeftMenu");
    this.getMySchedules();
    this.getMyAttendanceWhitelistedLocations();
  }


  GetHostAppSettings() {
    const settings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    if (!settings) {
      var params = {
        "MAppId": AppSettings.LOGINTYPES.HOSTAPPT,
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
          // if (element.fromTime) {
          //   if (element.fromTime.split(":")[0] > 11) {
          //     let hours: any = (element.fromTime.split(":")[0] % 12);
          //     if (element.fromTime.split(":")[0] === '12') {
          //       hours = 12;
          //     } else if (hours < 10) {
          //       hours = '0' + hours;
          //     }
          //     element.fromTime = hours + ':' + element.fromTime.split(":")[1] + 'pm ';
          //   } else {
          //     element.fromTime = element.fromTime + 'am';
          //   }
          // }
          // if (element.toTime) {
          //   if (element.toTime.split(":")[0] > 11) {
          //     let hours: any = (element.toTime.split(":")[0] % 12);
          //     if (element.toTime.split(":")[0] === '12') {
          //       hours = 12;
          //     } else if (hours < 10) {
          //       hours = '0' + hours;
          //     }
          //     element.toTime = hours + ':' + element.toTime.split(":")[1] + 'pm ';
          //   } else {
          //     element.toTime = element.toTime + 'am';
          //   }
          // }
        });
        localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_SCHEDULE, JSON.stringify(myScheduleList));
      },
      async (err) => {
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
      this.subscribeToPushNotifications();
    }
  })

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
      }else{
        var crntClass = this;
        this._zone.run(() => {
          crntClass.events.publishDataCompany({
            action: "NotificationReceived",
            title: typeOfNotification,
            message: ''
          });
          // let view = this.navCtrl.getActive();
        //alert("Cuent Page: " + this.currentPage);
        if (crntClass.currentPage == "notifications"){
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT, "0");
        }else if (crntClass.currentPage != "Admin"){
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
      var tempImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/PortalImageHandler.ashx?RefSlno='
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

  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

  statesClicked(page) {
    console.log(page);
    this.router.navigateByUrl(page);
  }

}
