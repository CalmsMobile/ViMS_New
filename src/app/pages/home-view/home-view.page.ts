import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Firebase } from '@ionic-native/firebase/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavController, Platform, MenuController, IonTabs, ModalController } from '@ionic/angular';
import { HostAccessComponent } from 'src/app/components/host-access/host-access.component';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-home-view',
  templateUrl: './home-view.page.html',
  styleUrls: ['./home-view.page.scss'],
})
export class HomeViewPage implements OnInit {

  @ViewChild("myTabs") myTabs: IonTabs;
  private firstLoaded: boolean = false;
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
  HOST_ACCESS_INTERVAL: any;
  constructor(public navCtrl: NavController,
    private localNotifications: LocalNotifications,
    private firebase: Firebase,
    private platform : Platform,
    private modalCtrl: ModalController,
    private _zone : NgZone,
    public menu: MenuController,
    private router: Router,
    private statusBar: StatusBar,
    public events: EventsService, public apiProvider: RestProvider) {
        this.statusBar.backgroundColorByHexString(AppSettings.STATUS_BAR_COLOR);
        this.events.publishDataCompany({
          action: 'user:created',
          title: "ReloadMenu",
          message: "ReloadMenu"
        });
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
        this.platform.ready().then(() => {

          if(this.platform.is('cordova')) {
            try{
              this.initializeFirebase();
              window.addEventListener('load', (data) =>{
                console.log('page changed' + data);
             });
            } catch (error) {
              this.firebase.logError(error);
            }
          }


          this.updateSettings();

        });




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
              this.GetHostAppSettings(AppSettings.LOGINTYPES.HOSTAPPT);
              break;
          case AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP:
            this.GetHostAppSettings(AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP);
            break;
          case AppSettings.LOGINTYPES.FACILITY:
            this.GetHostAppSettings(AppSettings.LOGINTYPES.FACILITY);
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
    this.showFab = true;
  }

  ionViewWillEnter(){
    this.showFab = true;

    if(this.currentPage == "quick-pass-dash-board-page"){
      this.events.publishDataCompany({
        action: 'refreshQuickPass',
        title: '',
        message: ''
      });
    }else{
      this.currentPage = "home-view";
    }

    // this.myTabs._tabs[this.myIndex].btn.onClick();
    //alert("ionViewWillEnter Cuent Page: " + this.currentPage);
    this.menu.enable(true,"myLeftMenu");
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
        var result = JSON.parse(val.toString());
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
      this.firebase.subscribe("all");
      this.platform.is('android') ? this.initializeFirebaseAndroid() : this.initializeFirebaseIOS();
    }
  }
initializeFirebaseAndroid() {
    this.firebase.getToken().then(token => {
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, ""+token);
      console.log("Token:"+ token);
    });
    this.firebase.onTokenRefresh().subscribe(token => {
      console.log("RefreshToken:"+ token);
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, ""+token);
    })
    this.subscribeToPushNotifications();
}
initializeFirebaseIOS() {
    this.firebase.grantPermission()
    .then(() => {
      this.firebase.getToken().then(token => {
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, ""+token);
        console.log("Token:"+ token);
      });
      this.firebase.onTokenRefresh().subscribe(token => {
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, ""+token);
        console.log("Token:"+ token);
      })
      this.subscribeToPushNotifications();

    })
    .catch((error) => {
      this.firebase.logError(error);
    });
  }
subscribeToPushNotifications() {
    this.firebase.onNotificationOpen().subscribe((response) => {
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

      if(response.tap){
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
    });
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
      "HostIc":""
    }

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    console.log("calling GetHostAppSettings Home Page: "+ hostData);
    if(!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID){
      return;
    }
    params.HostIc = JSON.parse(hostData).HOSTIC;

    this.apiProvider.requestApi(params, '/api/vims/GetHostAccessSettings', false).then(
      (val) => {
        try{
          var result = JSON.parse(JSON.stringify(val));
          if(result){
           const hostAccessSettings = JSON.parse(result).Table1[0];
           window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_ACCESS_SETTINGS,JSON.stringify(hostAccessSettings));
           try{
              this.isHostAccessEnable = hostAccessSettings.IsDynamicQRCodeEnabled;
              if (this.isHostAccessEnable && hostAccessSettings.QRCodeValidity && hostAccessSettings.QRCodeValidity > 0) {
                this.refreshHostAccess(hostAccessSettings.QRCodeValidity);
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
  this.HOST_ACCESS_INTERVAL = setTimeout(() => {
    console.log("refresh host access");
    this.GetHostAccessSettings();
  }, QRCodeValidity * 1000);

}

  GetHostAppSettings(MAppId){
      var params  = {
        "MAppId": MAppId,
        "HostIc":""
      }

      var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      console.log("calling GetHostAppSettings Home Page: "+ hostData);
      if(!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID){
        return;
      }
      params.HostIc = JSON.parse(hostData).HOSTIC;

      this.apiProvider.GetHostAppSettings(params).then(
        (val) => {
          try{
            var result = JSON.parse(JSON.stringify(val));
            if(result){
             console.log(JSON.stringify(val));
             window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS,JSON.stringify(val));

             try{
                var hostSettings = result.Table1[0];
                this.showQP = JSON.parse(hostSettings.QuickPassSettings).QPVisitorEnabled && hostSettings.QuickPassEnabled;
              }catch(e){
              }

             this.events.publishDataCompany({
               action: 'user:created',
               title: "ReloadMenu",
               message: "ReloadMenu"
             });
            }
          }catch(e){
          }

        },
        (err) => {
        }
      );
  }

  ionViewWillLeave(){
    this.showFab = false;
  }

  ngOnInit() {
  }

}
