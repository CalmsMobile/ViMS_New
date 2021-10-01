import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { ThemeSwitcherService } from 'src/app/services/ThemeSwitcherService';
import { ToastService } from 'src/app/services/util/Toast.service';

@Component({
  selector: 'app-settings-view-page',
  templateUrl: './settings-view-page.page.html',
  styleUrls: ['./settings-view-page.page.scss'],
})
export class SettingsViewPagePage implements OnInit {


  basicSetupData:any;

  selecLang = AppSettings.DEFAULT_LANGUAGE_ID['id'];
  languageSelect:any;

  hostInfo :any = {};
  name = "";
  notificationCount = 0;
  isAdmin = true;
  customActionSheetOptions: any = {
    header: '',
    subHeader: ''
  };
  T_SVC: any;
  isSecurityApp = false;
  QRObj: any = {};
  HOSTWTTAMS = AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS;
  TAMS = AppSettings.LOGINTYPES.TAMS;
  constructor(public navCtrl: NavController,
     private alertCtrl: AlertController,
     private toastCtrl:ToastService,
     private apiProvider: RestProvider,
     private events : EventsService,
     private datePipe: DatePipe,
     private router: Router,
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
        if (this.QRObj.MAppId === AppSettings.LOGINTYPES.FACILITY){
          this.isAdmin = false;
        }
      }

      this.translate.get([
        'SETTINGS.APP_LANGUAGE', 'SETTINGS.SELECT_LANGUAGE']).subscribe(t => {
          this.T_SVC = t;
      });

      var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      if(hostData){
        this.hostInfo = JSON.parse(hostData);
        this.name = this.hostInfo.HOSTNAME;
      }

      const userInfo = localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
      if (userInfo) {
        const userInfoObj = JSON.parse(userInfo);
        this.name = userInfoObj.Name;
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
    this.router.navigateByUrl('user-profile-page');
  }
  getDuration(endDate) {
    const userInfo = localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    if (userInfo) {
      const userInfoObj = JSON.parse(userInfo);
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
                const endDate = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss'));
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
                      localStorage.clear();
                      this.navCtrl.navigateRoot('account-mapping');
                    }
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

                    if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
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
                localStorage.clear();
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

  getMasterdetails(){
    this.apiProvider.GetMasterDetails().then(
      (result: any) => {
        if(result){
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
        }
      },
      (err) => {

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
          "MAppId": QRObj.MAppId === AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS ? AppSettings.LOGINTYPES.HOSTAPPT: QRObj.MAppId,
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
                const appTheme = result.Table1[0].AppTheme;
                if (appTheme) {
                  const appThemeObj = JSON.parse(appTheme);
                  if (appThemeObj.primThemeColor) {
                    this.statusBar.backgroundColorByHexString(appThemeObj.primThemeColor);
                    this.themeSwitcher.setThemeNew(appThemeObj.primThemeColor, appThemeObj.primThemeTextColor, appThemeObj.btnBGColor, appThemeObj.btnTextColor);
                  }
                }
                this.getMasterdetails();
                if (QRObj.MAppId === AppSettings.LOGINTYPES.FACILITY) {
                  this.getSettingsForTams();
                  this.getMyAttendanceWhitelistedLocations();
                }
                this.apiProvider.showAlert('Device sync successfully.');
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

  goBack() {

    if (this.isSecurityApp) {
      this.router.navigateByUrl('security-dash-board-page');
    } else {
      var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if (qrData) {
        const QRObj = JSON.parse(qrData);
        if (QRObj.MAppId === AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS || QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
          this.router.navigateByUrl('home-tams');
        } else {
          if (this.isSecurityApp) {
            this.router.navigateByUrl('security-dash-board-page');
          } else {
            this.router.navigateByUrl('home-view');
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
}
