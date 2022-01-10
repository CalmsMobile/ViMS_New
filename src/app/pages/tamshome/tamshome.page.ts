import { DatePipe } from '@angular/common';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonTabs, MenuController, ModalController, NavController, Platform } from '@ionic/angular';
import { FCM } from 'plugins/cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { EventsServiceNotification } from 'src/app/services/EventsServiceNotification';
import { ThemeSwitcherService } from 'src/app/services/ThemeSwitcherService';

@Component({
  selector: 'app-tamshome',
  templateUrl: './tamshome.page.html',
  styleUrls: ['./tamshome.page.scss'],
})
export class TAMSHomePage implements OnInit {

  @ViewChild("myTabs") myTabs: IonTabs;
  tab1Root: any = 'tamsmyschedule';
  tab2Root: any = 'tamsmyattendance';
  tab3Root: any = 'tamsregisterattendance';
  tab4Root: any = 'tamsmyattendancelocation';
  tab5Root: any = 'tamsmyattendancelogs';
  showTit = true;
  hostObj:any = {};
  cntrls = [
    // {"bg":"#E53935","title":"Home","icon":"siva-icon-home-3", "component": "home-view"},
    {"bg":"#512DA8","title":"Home", "root":"tab1Root" ,"icon":"siva-icon-calendar-3", "component":"tamsmyschedule"},
    // {"bg":"#512DA8","title":"Create Appointment", "root":"tab2Root" ,"icon":"siva-icon-calendar-plus-o", "component":"add-appointment"},
    {"bg":"#6A1B9A","title":"Appointment History","root":"tab3Root" ,"icon":"siva-icon-calendar-3", "component":"tamsmyattendance"},
    // {"bg":"#455A64","title":"Manage Appointments","icon":"siva-icon-list-nested", "component":"ManageAppointmentView"},
    // {"bg":"#C2185B","title":"Manage Visitors","icon":"siva-icon-user-add-outline", "component":"ManageVisitors"},
    // {"bg":"#388E3C","title":"Notification","root":"tab4Root" ,"icon":"siva-icon-bell-2", "component":"notifications"},
    // {"bg":"#AD1457","title":"Chat","icon":"siva-icon-chat-3", "component": "home-view"},
    // {"bg":"#424242","title":"Profile","icon":"siva-icon-user-outline", "component": "home-view"},
    {"bg":"#8E24AA","title":"Settings","root":"tab5Root" ,"icon":"siva-icon-sliders", "component":"tamsmyattendancelocation"},
    {"bg":"#8E24AA","title":"Admin","root":"tab6Root" ,"icon":"siva-icon-sliders", "component":"tamsmyattendancelogs"}
  ];
  lastNotification:any = '';
  notificationCount = 0;
  currentPage = "tamshome";
  appType = '';
  showFab = true;
  QRObj : any = {};
  isNotificationClicked = false;
  constructor(public navCtrl: NavController,
    private localNotifications: LocalNotifications,
    private platform : Platform,
    private modalCtrl: ModalController,
    private _zone : NgZone,
    private fcm: FCM,
    public menu: MenuController,
    private router: Router,
    private datePipe: DatePipe,
    private statusBar: StatusBar,
    private dateformat: DateFormatPipe,
    private themeSwitcher: ThemeSwitcherService,
    public events: EventsService,
    private eventsNotification: EventsServiceNotification,
    public apiProvider: RestProvider) {
    }

  ngOnInit() {
    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (!qrInfo) {
      this.navCtrl.navigateRoot('account-mapping');
      return;
    }
    this.QRObj = JSON.parse(qrInfo);
    if(this.QRObj && this.QRObj.MAppId){
      this.appType = this.QRObj.MAppId;
    }
    this.GetHostAppSettings();
    this.getSettingsForTams();
    this.menu.enable(true, "myLeftMenu");
    this.getMySchedules();
    this.getMyAttendanceWhitelistedLocations();
  }

  moveToRegisterAttendance() {
    this.router.navigateByUrl('tamsregisterattendance');
  }

  GetHostAppSettings() {
    const settings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (!settings && qrInfo) {
      const QRObj1 = JSON.parse(qrInfo);
      var params = {
        "MAppId": QRObj1.MAppId,
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
                if (result && result.Table3  && result.Table3.length > 0){
                  const appTheme = result.Table3[0].AppTheme;
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
        } else if (data1.action === 'ChangeTab') {
          const page = data1.title;
          const position = data1.message;
          console.log("position:"+ position);
          console.log("page:"+ page.component);

          var cClass = this;
          this._zone.run(function() {
            // cClass.myTabs._tabs[cClass.myIndex].btn.onClick();
            cClass.myTabs.select(page.component);
          });
        } else if (data1.action === 'page') {
          const data = data1.title;
          if(data){
            this.currentPage = data;
            switch(this.currentPage){
              case "user-profile-page":
              case "add-appointment":
              case "admin-appointment-details":
              case "Admin":
              case "appointment-details":
              case "facility-booking-history":
              case "facility-booking":
              case  "home-view1":
              case "create-quick-pass":
              case "notifications":
                this.showFab = false;
                break;
              default:
                this.showFab = true;
                break;

            }

          //  alert("subscribe Cuent Page: " + this.currentPage);
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
          console.log("Token New:" + token);
        });
        this.fcm.onTokenRefresh().subscribe(token => {
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
          console.log("Token New:" + token);
        });
      }
    });
    this.fcm.getToken().then(token => {
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
      console.log("Token New:" + token);
    });
    this.fcm.onTokenRefresh().subscribe(token => {
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
      console.log("Token New:" + token);
    });
  }catch(e){
    console.log('FCM error:' + e);
  }

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
            message: response.body
          });
          crntClass.eventsNotification.publishDataCompany({
            action: "NotificationReceivedNew",
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

  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

}
