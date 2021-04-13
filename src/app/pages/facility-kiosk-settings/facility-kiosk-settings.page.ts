import { Component, OnInit } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';
import { NavController, MenuController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { ToastService } from 'src/app/services/util/Toast.service';

@Component({
  selector: 'app-facility-kiosk-settings',
  templateUrl: './facility-kiosk-settings.page.html',
  styleUrls: ['./facility-kiosk-settings.page.scss'],
})
export class FacilityKioskSettingsPage implements OnInit {
  customActionSheetOptions: any = {
    header: 'Select Your Facility',
    subHeader: ''
  };
  AVAIL_FACILITIES:any = [];
  SELECTED_FACILITIE:any = {};
  deviceId=AppSettings.TEST_DATA.SAMPLE_DEVICE_ID;
  constructor(
    public navCtrl: NavController,
    private menuCtrl: MenuController,

    private device: Device,
    private toastCtrl : ToastService,
    private alertCtrl : AlertController,
    private translate:TranslateService,
    private apiProvider : RestProvider) {
    this.menuCtrl.enable(false, 'myLeftMenu');
    this._getRoomDetails();
    var sFacilityList = localStorage.getItem(AppSettings.LOCAL_STORAGE.SEL_FASILITY_DISPLAY_KIOSK_FACILITY);
    if( sFacilityList != undefined && sFacilityList  != ""){
      this.SELECTED_FACILITIE = JSON.parse(sFacilityList);
    }
    if(this.device.uuid){
      this.deviceId = this.device.uuid;
    }
  }

  ionViewDidEnter() {
  }
  _getRoomDetails(){
    var flag = true;
    if (flag) {
      this.apiProvider.DisplayApp_FacilityMasterList({}).then((data : any) => {
        this.AVAIL_FACILITIES = JSON.parse(data);
        console.log(data);
      }, (err) => {
        console.log(""+ err);
      })

    }
  }
  onChangeFacility(){
    let sel_facility_item = this.AVAIL_FACILITIES.find(item => item['FacilityCode'] === this.SELECTED_FACILITIE['FacilityCode']);
    localStorage.setItem(AppSettings.LOCAL_STORAGE.SEL_FASILITY_DISPLAY_KIOSK_FACILITY, JSON.stringify(sel_facility_item))
  }

  goToUserAbout(){

  }

  logoutMe(){
    this.translate.get(['SETTINGS.ARE_U_SURE_LOGOUT_TITLE','SETTINGS.ARE_U_SURE_LOGOUT',
     'SETTINGS.EXIT_ACCOUNT_SCUSS','SETTINGS.EXIT_ACCOUNT_FAILED'
    ,'COMMON.OK','COMMON.CANCEL','COMMON.EXIT1']).subscribe(async t => {
      let loginConfirm = await this.alertCtrl.create({
        header: t['SETTINGS.ARE_U_SURE_LOGOUT_TITLE'],
        message: t['SETTINGS.ARE_U_SURE_LOGOUT'],
        cssClass: 'alert-warning',
        buttons: [
          {
            text: t['COMMON.EXIT1'],
            handler: () => {
              //this._app.getRootNav().setRoot(LoginPage);
              this.toastCtrl.create(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FACILITY_VISITOR_DATA, "");
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
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.DISPLAY_DETAILS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.ACK_DETAILS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FASILITY_DISPLAY_KIOSK_SETUP, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.SEL_FASILITY_DISPLAY_KIOSK_FACILITY, "");

              this.navCtrl.navigateRoot("account-mapping");
            }
          }, {
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

}
