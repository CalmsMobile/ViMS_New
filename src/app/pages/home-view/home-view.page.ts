import { DatePipe } from '@angular/common';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { FCM } from 'plugins/cordova-plugin-fcm-with-dependecy-updated/ionic/ngx/FCM';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavController, Platform, MenuController, IonTabs, ModalController } from '@ionic/angular';
import { HostAccessComponent } from 'src/app/components/host-access/host-access.component';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { ThemeSwitcherService } from 'src/app/services/ThemeSwitcherService';

@Component({
  selector: 'app-home-view',
  templateUrl: './home-view.page.html',
  styleUrls: ['./home-view.page.scss'],
})
export class HomeViewPage implements OnInit {

  @ViewChild("myTabs") myTabs: IonTabs;
  tab1Root: any = 'upcoming-appointment-page';
  tab3Root: any = 'appointment-history';
  tab5Root: any = 'settings-view-page';
  tab6Root: any = 'manage-appointment';
  tab7Root: any = 'quick-pass-dash-board-page';
  showTit = true;

  HOSTAPPT = AppSettings.LOGINTYPES.HOSTAPPT;
  HOSTAPPT_FACILITYAPP = AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP;
  FACILITY = AppSettings.LOGINTYPES.FACILITY;


  cntrls = [
    // {"bg":"#E53935","title":"Home","icon":"siva-icon-home-3", "component": "home-view"},
    {"bg":"#512DA8","title":"Home", "root":"tab1Root" ,"icon":"siva-icon-calendar-3", "component":"upcoming-appointment-page"},
    // {"bg":"#512DA8","title":"Create Appointment", "root":"tab2Root" ,"icon":"siva-icon-calendar-plus-o", "component":"add-appointment"},
    {"bg":"#6A1B9A","title":"Appointment History","root":"tab3Root" ,"icon":"siva-icon-calendar-3", "component":"appointment-history"},
    // {"bg":"#455A64","title":"Manage Appointments","icon":"siva-icon-list-nested", "component":"ManageAppointmentView"},
    // {"bg":"#C2185B","title":"Manage Visitors","icon":"siva-icon-user-add-outline", "component":"ManageVisitors"},
    // {"bg":"#388E3C","title":"Notification","root":"tab4Root" ,"icon":"siva-icon-bell-2", "component":"notifications"},
    // {"bg":"#AD1457","title":"Chat","icon":"siva-icon-chat-3", "component": "home-view"},
    // {"bg":"#424242","title":"Profile","icon":"siva-icon-user-outline", "component": "home-view"},
    {"bg":"#8E24AA","title":"Settings","root":"tab5Root" ,"icon":"siva-icon-sliders", "component":"settings-view-page"},
    {"bg":"#8E24AA","title":"Admin","root":"tab6Root" ,"icon":"siva-icon-sliders", "component":"admin-login"}
  ];

  currentPage = "home-view";
  appType = '';
  showFab = true;
  QRObj : any = {};
  isNotificationClicked = false;
  isHostAccessEnable = false;
  showQP = false;
  HOST_QRVALUE = '';
  HOST_ACCESS_INTERVAL: any;
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
    private themeSwitcher: ThemeSwitcherService,
    public events: EventsService, public apiProvider: RestProvider) {
  }

  updateSettings(){
    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (!qrInfo) {
      this.navCtrl.navigateRoot('account-mapping');
      return;
    }
    this.QRObj = JSON.parse(qrInfo);
    if(this.QRObj && this.QRObj.MAppId){
      this.appType = this.QRObj.MAppId;
      switch(this.QRObj.MAppId){
          case AppSettings.LOGINTYPES.HOSTAPPT:
            this.updateMenu();
              break;
          case AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP:
            this.updateMenu();
            break;
          case AppSettings.LOGINTYPES.FACILITY:
            this.updateMenu();
            this.tab1Root = 'facility-upcoming';
            this.tab3Root = 'facility-booking-history';
            this.tab5Root = 'settings-view-page';
            this.tab6Root = 'manage-appointment';
            var cClass = this;
              this._zone.run(function() {
                // cClass.myTabs._tabs[cClass.myIndex].btn.onClick();
                setTimeout(() => {
                  cClass.myTabs.select('facility-upcoming');
                }, 1000);
              });
            break;
          case AppSettings.LOGINTYPES.DISPLAYAPP:

            break;
          case AppSettings.LOGINTYPES.ACKAPPT:

            break;
      }
      // this.myTabs.select(this.tab1Root);
      this.GetHostAccessSettings();
    }
  }

  updateMenu() {
    try{
      const settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
      var hostSettings = JSON.parse(settings).Table1[0];
      this.showQP = JSON.parse(hostSettings.QuickPassSettings).QPVisitorEnabled;


      const appTheme = hostSettings.AppTheme;
      if (appTheme) {
        const appThemeObj = JSON.parse(appTheme);
        if (appThemeObj.primThemeColor) {
          this.statusBar.backgroundColorByHexString(appThemeObj.primThemeColor);
          this.themeSwitcher.setThemeNew(appThemeObj.primThemeColor, appThemeObj.primThemeTextColor, appThemeObj.btnBGColor, appThemeObj.btnTextColor);
        }
      }
    }catch(e){
    }

    this.events.publishDataCompany({
      action: 'user:created',
      title: "ReloadMenu",
      message: "ReloadMenu"
    });
    this.GetHostAppSettings(this.QRObj.MAppId === AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS ? AppSettings.LOGINTYPES.HOSTAPPT: this.QRObj.MAppId);

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
          }

          const appTheme = result.Table1[0].AppTheme;
          if (appTheme) {
            const appThemeObj = JSON.parse(appTheme);
            if (appThemeObj.primThemeColor) {
              this.statusBar.backgroundColorByHexString(appThemeObj.primThemeColor);
              this.themeSwitcher.setThemeNew(appThemeObj.primThemeColor, appThemeObj.primThemeTextColor, appThemeObj.btnBGColor, appThemeObj.btnTextColor);
            }
          }

        } catch (e) {

        }

      },
      (err) => {
      }
    );
    const masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
    if (!masterDetails){
      this.getMasterdetails();
    }
  }

  createBooking(){
    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if(this.currentPage == "quick-pass-dash-board-page"){
      this.router.navigateByUrl("create-quick-pass");
    }else if(qrInfo && JSON.parse(qrInfo) && JSON.parse(qrInfo).MAppId == AppSettings.LOGINTYPES.FACILITY){
      this.router.navigateByUrl("facility-booking");
    }else{
      this.router.navigateByUrl('add-appointment');
    }

  }
  ionViewDidEnter() {
    console.log("ionViewDidEnter");
    this.showFab = true;

    this.events.publishDataCompany({
      action: 'user:created',
      title: "ReloadMenu",
      message: "ReloadMenu"
    });
    this.platform.ready().then(() => {

      if(this.platform.is('cordova')) {
        try{
          this.initializeFirebase();
          window.addEventListener('load', (data) =>{
            console.log('page changed' + data);
         });
        } catch (error) {
        }
      }


      this.updateSettings();
    });

    if(this.currentPage == "quick-pass-dash-board-page"){
      this.events.publishDataCompany({
        action: 'refreshQuickPass',
        title: '',
        message: ''
      });
    }else{
      this.currentPage = "home-view";
    }
    this.menu.enable(true,"myLeftMenu");

    this.showFab = true;

    setTimeout(() => {
      this.events.observeDataCompany().subscribe((data1: any) => {
        if (data1.action === 'ChangeTab') {
          const page = data1.title;
          const position = data1.message;
          console.log("position:"+ position);
          console.log("page:"+ page.component);
          switch(page.component){
            case "home-view":
              this.updateSettings();
            break;
            case "appointment-history":
            break;
            case "settings-view-page":
            break;
            case "facility-booking-history":
            break;
            case "manage-appointment":
            break;
            case "facility-upcoming":
              this.updateSettings();
            break;
            case "quick-pass-dash-board-page":
              break;
          }

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
  }

  showTabTitle(showTit){
    switch (showTit) {
      case 0:

      break;
      case 1:

      break;
      case 2:

      break;
      case 3:

      break;
      case 4:

      break;
      default:
        break;
    }

  }

  getMasterdetails(){
    this.apiProvider.GetMasterDetails().then(
      (val) => {
        var result = val;
        if(result){
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
        }
      },
      (err) => {

      }
    );
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


  async openHostAccess() {
    console.log("Host access clicked");
    const presentModel = await this.modalCtrl.create({
      component: HostAccessComponent,
      componentProps: {
        data: {
        }
      },
      showBackdrop: true,
      mode: 'ios',
      cssClass: 'hostAccessModal'
    });
    presentModel.onWillDismiss().then((data) => {
    });
    return await presentModel.present();
  }

  GetHostAccessSettings(){
    var params  = {
      "MAppId": this.appType,
      "HostIc":"",
      "CurrentDate": this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID){
      return;
    }
    params.HostIc = JSON.parse(hostData).HOSTIC;

    this.apiProvider.requestApi(params, '/api/vims/GetHostAccessSettings', false, '', '').then(
      (val) => {
        try{
          var result = JSON.parse(JSON.stringify(val));
          if(result){
           const hostAccessSettings = JSON.parse(result).Table1[0];
           window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_ACCESS_SETTINGS,JSON.stringify(hostAccessSettings));
           try{
              this.isHostAccessEnable = hostAccessSettings.IsDynamicQRCodeEnabled;
              if (hostAccessSettings.IsDynamicKey) {
                this.HOST_QRVALUE = hostAccessSettings.DynamicCode;
              } else {
                this.HOST_QRVALUE = hostAccessSettings.HostCardSerialNo;
              }
              if (this.isHostAccessEnable && hostAccessSettings.QRCodeValidity && hostAccessSettings.QRCodeValidity > 0) {
                clearInterval(this.HOST_ACCESS_INTERVAL);
                this.refreshHostAccess(hostAccessSettings.QRCodeValidity);
              } else {
                clearInterval(this.HOST_ACCESS_INTERVAL);
              }
            }catch(e){
            }
          }
        }catch(e){
        }

      },
      (err) => {
      }
    );
}

refreshHostAccess(QRCodeValidity) {
  if (this.HOST_ACCESS_INTERVAL) {
    clearInterval(this.HOST_ACCESS_INTERVAL);
  }
  let timeout = QRCodeValidity;
  localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_ACCESS_TIMEOUT, timeout);
  this.HOST_ACCESS_INTERVAL = setInterval(() => {
    timeout = timeout - 1;
    localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_ACCESS_TIMEOUT, timeout);
    if (timeout === 0) {
      clearInterval(this.HOST_ACCESS_INTERVAL);
      this.GetHostAccessSettings();
    }
  }, 1000);

}



  ionViewWillLeave(){
    this.showFab = false;
    if (this.HOST_ACCESS_INTERVAL){
      // clearInterval(this.HOST_ACCESS_INTERVAL);
    }
  }

  ngOnInit() {
  }

}
