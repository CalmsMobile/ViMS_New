import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  constructor(public navCtrl: NavController,
     private alertCtrl: AlertController,
     private toastCtrl:ToastService,
     private apiProvider: RestProvider,
     private events : EventsService,
     private datePipe: DatePipe,
     private router: Router,
     private themeSwitcher: ThemeSwitcherService,
     private translate:TranslateService) {

      if(localStorage.getItem("SEL_LANGUAGE") != undefined && localStorage.getItem("SEL_LANGUAGE") != ""){
        this.selecLang = (localStorage.getItem("SEL_LANGUAGE"));
      }

      const qrinfo = localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if (qrinfo) {
        const qrCodeInfo = JSON.parse(qrinfo);
        this.isSecurityApp = qrCodeInfo.MAppId === AppSettings.LOGINTYPES.SECURITYAPP;
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

  }

  ionViewWillEnter() {
    this.events.publishDataCompany({
      action: "page",
      title: "home-view",
      message: ''
    });
		console.log('ionViewWillEnter SettingsViewPage');
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
      const startDate = new Date(userInfoObj.LoginTime);
      let difference = endDate.getTime() - startDate.getTime();

      const dDays = this.apiProvider.twoDecimals(parseInt('' +difference/(24*60*60*1000)));
      const dHours = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*60*1000)) % 24)) ;
      const dMin = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*1000)) % 60));
      const dSec = this.apiProvider.twoDecimals(parseInt('' +(difference/(1000)) % 60));
      return dDays +' Day(s), '+dHours+' Hour(s), '+dMin+' Min(s), '+dSec+' Sec(s)';
    }

  }


  logoutMe(){
    this.translate.get(['SETTINGS.ARE_U_SURE_LOGOUT_TITLE','SETTINGS.ARE_U_SURE_LOGOUT',
     'SETTINGS.EXIT_ACCOUNT_SCUSS','SETTINGS.EXIT_ACCOUNT_FAILED'
    ,'COMMON.OK','COMMON.CANCEL','COMMON.EXIT1']).subscribe(async t => {
      let loginConfirm = await this.alertCtrl.create({
        header: t['SETTINGS.ARE_U_SURE_LOGOUT_TITLE'],
        message: t['SETTINGS.ARE_U_SURE_LOGOUT'],
        cssClass: 'alert-warning-logout',
        mode: 'ios',
        buttons: [
          {
            text: t['COMMON.EXIT1'],
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
                    this.apiProvider.showToast(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
                    localStorage.clear();
                    this.navCtrl.navigateRoot('account-mapping');
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
              this.getMasterdetails();
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
                this.getMasterdetails();
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
      this.router.navigateByUrl('home-view');
    }

    console.log('goBack ');
   }

  composeRunTimeCss(result){
    this.themeSwitcher.setTheme('Theme1', result.customStyle.AppTheme);
    let _css = `
    `;
    document.getElementById("MY_RUNTIME_CSS").innerHTML = _css;
  }
}
