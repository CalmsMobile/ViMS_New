import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
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
  constructor(public navCtrl: NavController,
     private alertCtrl: AlertController,
     private toastCtrl:ToastService,
     private apiProvider: RestProvider,
     private events : EventsService,
     private router: Router,
     private translate:TranslateService) {

      if(localStorage.getItem("SEL_LANGUAGE") != undefined && localStorage.getItem("SEL_LANGUAGE") != ""){
        this.selecLang = (localStorage.getItem("SEL_LANGUAGE"));
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
              //this._app.getRootNav().setRoot(LoginPage);
              this.toastCtrl.create(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.COMPANY_DETAILS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.LOGIN_TYPE, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFY_TIME, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.PREAPPOINTMENTAUTOAPPROVE, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.SIGN_PAD, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FACILITY_VISITOR_DATA, "");
              this.navCtrl.navigateRoot("account-mapping");

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

  syncSettings() {

    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (!qrInfo) {
      this.navCtrl.navigateRoot('account-mapping');
      return;
    }
    const QRObj = JSON.parse(qrInfo);
    if(QRObj && QRObj.MAppId){

    var params  = {
      "MAppId": QRObj.MAppId,
      "HostIc":""
    }

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID){
      return;
    }
    params.HostIc = JSON.parse(hostData).HOSTIC;
    this.apiProvider.GetHostAppSettings(params, false).then(
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
            this.apiProvider.GetMasterDetails().then(
              (val) => {
                var result = JSON.parse(JSON.stringify(val));
                if(result){
                  window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
                }
              },
              (err) => {
              }
            );
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
