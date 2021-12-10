import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavController, AlertController, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { ThemeSwitcherService } from 'src/app/services/ThemeSwitcherService';
import { ToastService } from 'src/app/services/util/Toast.service';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

@Component({
  selector: 'app-settings-view-page',
  templateUrl: './settings-view-page.page.html',
  styleUrls: ['./settings-view-page.page.scss'],
})
export class SettingsViewPagePage implements OnInit {


  basicSetupData:any;

  selecLang = AppSettings.DEFAULT_LANGUAGE_ID['id'];
  languageSelect:any;
  showSyncBtn = true;
  hostInfo :any = {};
  name = "";
  notificationCount = 0;
  isAdmin = false;
  customActionSheetOptions: any = {
    header: '',
    subHeader: ''
  };
  T_SVC: any;
  isSecurityApp = false;
  QRObj: any = {};
  NOTIFICATION = AppSettings.LOGINTYPES.NOTIFICATIONS;
  showBackIcon = true;
  showNotification = true;
  showAdmin = true;
  TAMS = AppSettings.LOGINTYPES.TAMS;
  constructor(public navCtrl: NavController,
     private alertCtrl: AlertController,
     private toastCtrl:ToastService,
     private apiProvider: RestProvider,
     private events : EventsService,
     private datePipe: DatePipe,
     private router: Router,
     public menu: MenuController,
     private splashscreen: SplashScreen,
     private statusBar: StatusBar,
     private themeSwitcher: ThemeSwitcherService,
     private translate:TranslateService) {

      if(localStorage.getItem("SEL_LANGUAGE") != undefined && localStorage.getItem("SEL_LANGUAGE") != ""){
        this.selecLang = (localStorage.getItem("SEL_LANGUAGE"));
      }

      const qrinfo = localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if (qrinfo) {
        this.QRObj = JSON.parse(qrinfo);
        this.isSecurityApp = this.QRObj.MAppId === AppSettings.LOGINTYPES.SECURITYAPP;
        this.isAdmin = this.QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTAPPT) > -1 || this.QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1;
        if (this.QRObj.MAppId.split(",").length === 1 && this.QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) === -1) {
          switch (this.QRObj.MAppId) {
            case AppSettings.LOGINTYPES.SECURITYAPP:
              this.showBackIcon = true;
              this.showAdmin = false;
              this.showNotification = true;
              break;
            case AppSettings.LOGINTYPES.QR_ACCESS:
              this.showBackIcon = true;
              this.showAdmin = false;
              this.showNotification = false;
              break;
            case AppSettings.LOGINTYPES.NOTIFICATIONS:
              this.showBackIcon = true;
              this.showSyncBtn = true;
              this.showAdmin = false;
              break;
            case AppSettings.LOGINTYPES.TAMS:
              this.showBackIcon = true;
              this.showAdmin = false;
              this.showNotification = false;
              break;
            default:
              this.showAdmin = true;
              this.showNotification = false;
              this.showBackIcon = false;
              break;
          }
        } else {
          this.showBackIcon = true;
          if (this.QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.NOTIFICATIONS) === -1) {
            this.showNotification = false;
          }
        }

      }

      this.translate.get([
        'SETTINGS.APP_LANGUAGE', 'SETTINGS.SELECT_LANGUAGE', 'COMMON.OK', 'COMMON.CANCEL', 'COMMON.NOTICE', 'COMMON.MODULE_CHANGE_TEXT',]).subscribe(t => {
          this.T_SVC = t;
      });

      if (this.isSecurityApp) {
        const userInfo = localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
        if (userInfo) {
          const userInfoObj = JSON.parse(userInfo);
          this.name = userInfoObj.Name;
        }
      } else {
        var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
        if(hostData){
          this.hostInfo = JSON.parse(hostData);
          this.name = this.hostInfo.HOSTNAME;
        }
      }






      this.languageSelect = {
        "title" : this.T_SVC['SETTINGS.APP_LANGUAGE'],
        "message" : this.T_SVC['SETTINGS.SELECT_LANGUAGE'],
        "selectedItem": this.selecLang,
        "items" : AppSettings.AVAILABLE_LANGUAGE
      };

      this.customActionSheetOptions = {
        header: this.languageSelect.title,
        subHeader: this.languageSelect.message
      }

      events.observeDataCompany().subscribe((data1: any) => {
        if (data1.action === "NotificationReceived") {
          console.log("Notification Received: " + data1.title);
          this.showNotificationCount();
        }

			});
  }
  getSelectedLanguage = () => {

  };

  showNotificationCount(){
    var count = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
    if(count){
      this.notificationCount = parseInt(count);
    }
  }

  ionViewDidEnter() {
    this.events.publishDataCompany({
      action: "page",
      title: "home-view",
      message: ''
    });
		console.log('ionViewDidEnter SettingsViewPage');
    this.showNotificationCount();
  }

  ionViewWillLeave(){
    this.events.publishDataCompany({
      action: "page",
      title: "home-view1",
      message: ''
    });
  }

  gotoAdminPage(){
		this.router.navigateByUrl("admin-home");
	}

  gotoQRProfile() {
    this.router.navigateByUrl('qr-profile');
  }

  gotoNotification(){
    this.router.navigateByUrl("notifications");
  }

  onChangeLanguage(){
    if(this.languageSelect.selectedItem != ""){
      localStorage.setItem("SEL_LANGUAGE",this.languageSelect.selectedItem);
      this.translate.use(this.languageSelect.selectedItem);
      this.translate.get('SETTINGS.LAN_UPDATE_SUCCESS').subscribe((res: string) => {
        this.toastCtrl.create(res);
      });
    }
  }


  createBooking(){
    this.router.navigateByUrl('add-appointment');
  }

  goToUserProfile(){
    this.router.navigateByUrl('qr-profile');
  }
  getDuration(endDate) {
    const userInfo = localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    if (userInfo) {
      const userInfoObj = JSON.parse(userInfo);
      userInfoObj.LoginTime = userInfoObj.LoginTime.replace('-', '/');
      userInfoObj.LoginTime = userInfoObj.LoginTime.replace('-', '/');
      const startDate = new Date(userInfoObj.LoginTime);
      let difference = endDate.getTime() - startDate.getTime();
      const dDays = this.apiProvider.twoDecimals(parseInt('' +difference/(24*60*60*1000)));
      const dHours = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*60*1000)) % 24)) ;
      const dMin = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*1000)) % 60));
      const dSec = this.apiProvider.twoDecimals(parseInt('' +(difference/(1000)) % 60));
      return dDays +' Day(s), '+dHours+' Hour(s), '+dMin+' Min(s), '+dSec+' Sec(s)';
    }

  }


  logoutMe(action){
    this.translate.get(['SETTINGS.ARE_U_SURE_LOGOUT_TITLE','SETTINGS.ARE_U_SURE_LOGOUT', 'SETTINGS.UNREGISTER_ACCOUNT_SCUSS',
     'SETTINGS.EXIT_ACCOUNT_SCUSS','SETTINGS.EXIT_ACCOUNT_FAILED', 'SETTINGS.UNREGISTER','SETTINGS.ARE_U_SURE_UNREGISTER'
    ,'COMMON.OK','COMMON.CANCEL','COMMON.EXIT1']).subscribe(async t => {
      let title = t['SETTINGS.ARE_U_SURE_LOGOUT_TITLE'];
      let desc = t['SETTINGS.ARE_U_SURE_LOGOUT'];
      if (action === 'unregister') {
        desc = t['SETTINGS.ARE_U_SURE_UNREGISTER'];
      }
      let loginConfirm = await this.alertCtrl.create({
        header: title,
        message: desc,
        mode: 'ios',
        buttons: [
          {
            text: (action === 'exit') ? t['COMMON.EXIT1']: t['COMMON.OK'],
            handler: () => {
              if(this.isSecurityApp) {
                const endDate = new Date(this.datePipe.transform(new Date(), 'yyyy/MM/dd HH:mm:ss'));
                const data = {
                  'LogoutTime': endDate,
                  'Duration': this.getDuration(endDate)
                }
                console.log(JSON.stringify(data));
                this.apiProvider.requestSecurityApi(data, '/api/SecurityApp/userLogout', true).then(
                  (val: any) => {

                    if (action === 'exit') {
                      this.apiProvider.showToast(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
                      localStorage.setItem(AppSettings.LOCAL_STORAGE.SECURITY_USER_DETAILS, '');
                      localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS, '');
                      this.navCtrl.navigateRoot('login');
                    } else {
                      this.apiProvider.showToast(t['SETTINGS.UNREGISTER_ACCOUNT_SCUSS']);
                      const subscripeData = localStorage.getItem(AppSettings.LOCAL_STORAGE.SUBSCRIPE_DATA);
                      localStorage.clear();
                      if (subscripeData){
                        localStorage.setItem(AppSettings.LOCAL_STORAGE.SUBSCRIPE_DATA, subscripeData);
                      }
                      this.navCtrl.navigateRoot('account-mapping');
                    }
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

                    if(err && err.message.indexOf("Http failure response for") > -1){
                      var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
                      this.apiProvider.showAlert(message);
                      return;
                    }

                    if(err && err.Table && err.Table[0].Code !== 10 && err.Table1 && err.Table1[0].Description){

                      this.apiProvider.showAlert(err.Table1[0].Description);
                      return;
                      }
                    this.apiProvider.showAlert("<span class='failed'>" + this.T_SVC['ACC_MAPPING.CANT_FIND_LICENSE'] + '</span>');
                  }
                );
              } else {
                this.toastCtrl.create(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
                const subscripeData = localStorage.getItem(AppSettings.LOCAL_STORAGE.SUBSCRIPE_DATA);
                localStorage.clear();
                if (subscripeData){
                  localStorage.setItem(AppSettings.LOCAL_STORAGE.SUBSCRIPE_DATA, subscripeData);
                }
                this.navCtrl.navigateRoot("account-mapping");
              }
            }
          },
          {
            text: t['COMMON.CANCEL'],
            role: 'cancel',
            handler: () => {
            }
          }
        ]
      });
      loginConfirm.present();
    });
  }

  ngOnInit() {
  }

  getBranchMasterdetails(){
    const hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    let branchId = '';
    if(hostData && JSON.parse(hostData)){
      branchId = JSON.parse(hostData).BRANCH_ID;
    }
    const data = {
      "SEQ_ID":branchId
    }
    this.apiProvider.requestApi(data, '/api/vims/GetBranchHostData', false, false, '').then(
      (val: any) => {
        var result = val;
        if(result){
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.BRANCH_MASTER_DETAILS, result);
        }
      },
      (err) => {
      }
    );
  }

  getMasterdetails(){
    this.apiProvider.GetMasterDetails().then(
      (result: any) => {
        if(result){
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
        }
      },
      (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message.indexOf("Http failure response for") > -1){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else if(err && JSON.parse(err) && JSON.parse(err).message){
          message =JSON.parse(err).message;
        }
        if(message){
          // message = " Unknown"
          this.apiProvider.showAlert(message);
        }
      }
    );
  }

  getSecurityMasterdetails(){
    this.apiProvider.GetSecurityMasterDetails().then(
      (result: any) => {
        if(result){
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
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
          const currentDate = this.datePipe.transform(new Date() + "", "yyyy-MM-dd");
          element.scheduleDate = this.datePipe.transform(element.scheduleDate + "", "yyyy-MM-dd");
          if (new Date(currentDate) > new Date(element.scheduleDate)) {
            element.isAvailable = false;
          } else {
            element.isAvailable = true;
          }
          if (element.fromTime && element.fromTime != null){
            element.fromTime1 = this.datePipe.transform(element.fromTime + "", "HH:mm");
            element.fromTime = this.datePipe.transform(element.fromTime + "", "HH:mm a");
          }
          element.shiftName = element.shiftName.trim();
          if (element.toTime && element.fromTime != null){
            element.toTime1 = this.datePipe.transform(element.toTime + "", "HH:mm");
            element.toTime = this.datePipe.transform(element.toTime + "", "HH:mm a");
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
          const locationUpdatedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
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

  syncSettings() {
    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (!qrInfo) {
      this.navCtrl.navigateRoot('account-mapping');
      return;
    }
    const QRObj = JSON.parse(qrInfo);
    if(QRObj && QRObj.MAppId){
      if (this.isSecurityApp) {
        var params  = {
          "RefSchoolSeqId": "",
          "RefBranchSeqId": "",
          "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
          "MAppDevSeqId": QRObj.MAppDevSeqId
        }
        this.apiProvider.GetSecurityAppSettings(params).then(
          (val) => {
            var result1 = JSON.parse(val+"");
            if(result1){
              var result = JSON.parse(result1.SettingDetail);
              console.log(val+"");
              this.getSecurityMasterdetails();
              this.composeRunTimeCss(result);
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS, JSON.stringify(result));
            }
            this.apiProvider.showAlert('Device sync successfully.');
          },
          (err) => {
          }
        );
      } else {
        var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
        if(!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID){
          return;
        }
        var params1  = {
          "MAppId": QRObj.MAppId,
          "HostIc":""
        }
        params1.HostIc = JSON.parse(hostData).HOSTIC;
        this.apiProvider.GetHostAppSettings(params1, false).then(
          (val) => {
            try {
              var result = JSON.parse(JSON.stringify(val));
              if (result) {
                console.log(JSON.stringify(val));
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

                if (QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.TAMS) > -1) {
                  this.getMasterdetails();
                  this.getSettingsForTams();
                  this.getMySchedules();
                  this.getMyAttendanceWhitelistedLocations();
                } else if (QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTAPPT) > -1 || QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1){
                  this.getMasterdetails();
                } else if (QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1){
                  this.getMasterdetails();
                }

                if (QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTAPPT) > -1 || QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1){
                  this.getUserProfile();
                  this.getBranchMasterdetails();
                }
                let showAlert = true;
                if (result && result.Table3 && result.Table3.length > 0 && result.Table3[0].MAppId) {
                  if (result.Table3[0].MAppId !== QRObj.MAppId) {
                    showAlert = false;
                    this.showAlertForReload(result.Table3[0].MAppId);
                  }
                }

                if (showAlert){
                  this.apiProvider.showAlert('Device sync successfully.');
                }
              }
            }catch(e){
            }

          },
          (err) => {
          }
        );
      }
  }
  }


  async showAlertForReload(cMAppId) {
    const alert = this.alertCtrl.create({
      header: this.T_SVC['COMMON.NOTICE'],
      message: this.T_SVC['COMMON.MODULE_CHANGE_TEXT'],
      cssClass: 'alert-warning',
      buttons: [
        {
          text: this.T_SVC['COMMON.CANCEL'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.T_SVC['COMMON.OK'],
          handler: () => {
            console.log('Yes clicked');
            this.reload(cMAppId);
          }
        }
      ]
    });
    (await alert).present();
  }

  reload(apps) {
    // const cclass = this;
    // this.navCtrl.pop();
    // this.navCtrl.navigateRoot('/');
    // // cclass.navCtrl.navigateRoot('/');
    // this.splashscreen.show();
    // window.location.reload();
    // this.splashscreen.hide();


    this.QRObj.MAppId = apps;
    localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO, JSON.stringify(this.QRObj));

    if (apps.split(",").length === 1 && apps.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) === -1) {
      switch (apps.split(",")[0]) {
        case AppSettings.LOGINTYPES.HOSTAPPT:
          var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
          if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
            console.log("calling login Page: " + hostData);
            this.navCtrl.navigateRoot("account-mapping");
            return;
          }
          this.menu.enable(true, "myLeftMenu");
          this.router.navigateByUrl('home-view');
        break;
        case AppSettings.LOGINTYPES.FACILITY:
          hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
          if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
            console.log("calling login Page: " + hostData);
            this.navCtrl.navigateRoot("account-mapping");
            return;
          }
          this.menu.enable(true, "myLeftMenu");
          this.router.navigateByUrl('home-view');
        break;
        case AppSettings.LOGINTYPES.DISPLAYAPP:
          this.navCtrl.navigateRoot("facility-kiosk-display");;
          this.menu.enable(false, "myLeftMenu");
          break;
        case AppSettings.LOGINTYPES.ACKAPPT:
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
        case AppSettings.LOGINTYPES.QR_ACCESS:
              hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
              if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
                console.log("calling login Page: " + hostData);
                this.navCtrl.navigateRoot("account-mapping");
              } else {
                this.navCtrl.navigateRoot("qraccess");
              }
          break;
        case AppSettings.LOGINTYPES.NOTIFICATIONS:
            hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
            if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
              console.log("calling login Page: " + hostData);
              this.navCtrl.navigateRoot("account-mapping");
            } else {
              this.navCtrl.navigateRoot("notifications");
            }
          break;

        case AppSettings.LOGINTYPES.TAMS:
          hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
          if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
            console.log("calling login Page: " + hostData);
            this.navCtrl.navigateRoot("account-mapping");
          } else {
            this.menu.enable(true, "myLeftMenu");
            this.navCtrl.navigateRoot("tamshome");
          }
        break;
      }
    } else if (apps.split(",").length === 2 && apps.indexOf(AppSettings.LOGINTYPES.QR_ACCESS) > -1 && apps.indexOf(AppSettings.LOGINTYPES.NOTIFICATIONS) > -1) {
      this.navCtrl.navigateRoot("qraccess");
    } else {
      hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
        console.log("calling login Page: " + hostData);
        this.navCtrl.navigateRoot("account-mapping");
        return;
      }
      if (apps.indexOf(AppSettings.LOGINTYPES.TAMS) > -1) {
        this.getSettingsForTams();
      }
      this.events.publishDataCompany({
        action: 'user:created',
        title: "ReloadMenu",
        message: "ReloadMenu"
      });
      this.events.publishDataCompany({
        action: 'user:created',
        title: "ReloadTAMS",
        message: "ReloadTAMS"
      });


      this.menu.enable(true, "myLeftMenu");
      this.navCtrl.navigateRoot("home-tams");
    }
  }

  goBack() {

    if (this.isSecurityApp) {
      this.router.navigateByUrl('security-dash-board-page');
    } else {
      var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if (qrData) {
        const QRObj = JSON.parse(qrData);
        if (QRObj.MAppId.split(",").length === 2 && QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.QR_ACCESS) > -1 && QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.NOTIFICATIONS) > -1) {
          this.router.navigateByUrl('qraccess');
        } else if (QRObj.MAppId.split(",").length > 1 || QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1) {
          this.router.navigateByUrl('home-tams');
        } else {
          if (QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
            this.router.navigateByUrl('tamshome');
          } else if (QRObj.MAppId === AppSettings.LOGINTYPES.QR_ACCESS) {
            this.router.navigateByUrl('qraccess');
          } else if (QRObj.MAppId === AppSettings.LOGINTYPES.NOTIFICATIONS) {
            this.router.navigateByUrl('notifications');
          } else {
            if (this.isSecurityApp) {
              this.router.navigateByUrl('security-dash-board-page');
            } else {
              this.router.navigateByUrl('home-view');
            }
          }
        }

      } else {
        this.navCtrl.pop();
      }
    }
    console.log('goBack ');
   }

  composeRunTimeCss(result){

    this.statusBar.backgroundColorByHexString(result.customStyle.AppTheme);
    this.themeSwitcher.setTheme('Theme1', result.customStyle.AppTheme);
    let _css = `
    `;
    document.getElementById("MY_RUNTIME_CSS").innerHTML = _css;
  }

  getUserProfile() {

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData){
      this.QRObj = JSON.parse(qrData);
    }
    if(hostData && JSON.parse(hostData) && JSON.parse(hostData).SEQID){
      const UserSeqId = JSON.parse(hostData).SEQID;
      const memberID = JSON.parse(hostData).HOSTIC;


      var params  = {
        "UserSeqId": "",
        "MemberId":memberID,
      }

      if (!params.MemberId) {
        params.UserSeqId = UserSeqId;
      }

      if (!params.MemberId && !params.UserSeqId) {
        this.apiProvider.showAlert("User not found.");
        return;
      }

      this.apiProvider.requestApi(params, '/api/Vims/GetUserProfile', false, 'WEB', '').then(
        (val) => {
          try{
            var result = JSON.parse(JSON.stringify(val));
            if(result){
            try{
                const userProfile = JSON.parse(result).Table1[0];
                window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_PROFILE_DETAILS,JSON.stringify(userProfile));
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
  }
}
