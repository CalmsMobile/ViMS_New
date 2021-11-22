import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  FacilityCode= 0;
  deviceId=AppSettings.TEST_DATA.SAMPLE_DEVICE_ID;
  constructor(
    public navCtrl: NavController,
    private menuCtrl: MenuController,
    private router: Router,
    private device: Device,
    private ngZone: NgZone,
    private toastCtrl : ToastService,
    private alertCtrl : AlertController,
    private translate:TranslateService,
    private apiProvider : RestProvider) {
    this.menuCtrl.enable(false, 'myLeftMenu');
    this._getRoomDetails();
    if(this.device.uuid){
      this.deviceId = this.device.uuid;
    }
  }

  ionViewDidEnter() {
    const cclass = this;
    var sFacilityList = localStorage.getItem(AppSettings.LOCAL_STORAGE.SEL_FASILITY_DISPLAY_KIOSK_FACILITY);
    if(sFacilityList != undefined && sFacilityList  != ""){
      this.ngZone.run(() => {
        cclass.SELECTED_FACILITIE = JSON.parse(sFacilityList);
        cclass.FacilityCode = cclass.SELECTED_FACILITIE.FacilityCode;
      });
    }
  }
  _getRoomDetails(){
    var flag = true;
    if (flag) {
      this.apiProvider.DisplayApp_FacilityMasterList({}).then((data : any) => {
        this.ngZone.run(() => {
          this.AVAIL_FACILITIES = JSON.parse(data);
        });
        console.log(data);
      }, (err) => {
        console.log(""+ err);
      })

    }
  }
  onChangeFacility(event: any){

    const FacilityCode = event?event.detail.value: '';
    console.log(""+ FacilityCode);
    this.FacilityCode = FacilityCode;

    let sel_facility_item = this.AVAIL_FACILITIES.find(item => item['FacilityCode'] === FacilityCode);
    localStorage.setItem(AppSettings.LOCAL_STORAGE.SEL_FASILITY_DISPLAY_KIOSK_FACILITY, JSON.stringify(sel_facility_item))
  }

  goToUserAbout(){

  }

  goBack() {
    this.router.navigateByUrl('facility-kiosk-display');
    console.log('goBack ');
  }

  logoutMe(){
    this.translate.get(['SETTINGS.ARE_U_SURE_LOGOUT_TITLE','SETTINGS.ARE_U_SURE_LOGOUT',
     'SETTINGS.EXIT_ACCOUNT_SCUSS','SETTINGS.EXIT_ACCOUNT_FAILED'
    ,'COMMON.OK','COMMON.CANCEL','COMMON.EXIT1']).subscribe(async t => {
      let loginConfirm = await this.alertCtrl.create({
        header: t['SETTINGS.ARE_U_SURE_LOGOUT_TITLE'],
        message: t['SETTINGS.ARE_U_SURE_LOGOUT'],
        cssClass: '',
        buttons: [
          {
            text: t['COMMON.EXIT1'],
            handler: () => {
              //this._app.getRootNav().setRoot(LoginPage);
              this.toastCtrl.create(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
              localStorage.clear();

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
