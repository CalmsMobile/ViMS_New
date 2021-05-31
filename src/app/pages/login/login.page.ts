import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Device } from '@ionic-native/device/ngx';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginData = {
    userID: '',
    Password: '',
    LoginTime: '',
    PushNotificationId: '',
    MAppDevSeqId: '',
    DeviceUID: '',
    DevicePlatform: 'Android',
    DeviceDetails: ''
  }
  T_SVC:any;
  scannedJson: any;
  constructor(private translate:TranslateService,
    private alertCtrl: AlertController,
    private apiProvider : RestProvider,
    private platform : Platform,
    private datePipe: DatePipe,
    private device: Device,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router) {
    this.translate.get(['ACC_MAPPING.INVALID_QR', 'ACC_MAPPING.INVALID_ORG_TITLE',
    'ACC_MAPPING.INVALID_ORG_DETAIL',
    'ACC_MAPPING.INVALID_FCM_TITLE',
    'ACC_MAPPING.FCM_TITLE',
    'ALERT_TEXT.DATA_NOT_FOUND',
    'ACC_MAPPING.PROCEED',
    'ACC_MAPPING.TYPE_MANUAL_PLACE_HOLDER',
    'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
    'ACC_MAPPING.CANT_FIND_LICENSE',
    'ACC_MAPPING.INVALID_HOST',
    'COMMON.OK','COMMON.CANCEL']).subscribe(t => {
      this.T_SVC = t;
    });
   }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + JSON.stringify(passData.QR_DETAIL));
        this.scannedJson = passData.QR_DETAIL;
      }
    });
  }

  goBack() {
    this.navCtrl.navigateBack("account-mapping");
  }

  securityUserLogin(){

    if (!this.loginData.userID){
      this.apiProvider.showToast(" * Please enter user id");
      return;
    }
    if (!this.loginData.Password){
      this.apiProvider.showToast(" * Please enter password");
      return;
    }

    var token = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.FCM_ID);
    if(this.platform.is('cordova')) {
      token = "";
    }else if(!token){
      token = "crINLpP4e9s:APA91bFQ7slN5VncMGZTdJJ49N3h1rZC0zYwpcv78xzO-sXG-NFTouko6v-yvnut9tkMm-YX5I0kAUlwCRaE7j5cJGYVeSgQy5UOj9TICLahItYkX70O0LwZpMTF5kD17iX2vLAiwl3g";
    }
    var MAppSeqId = this.scannedJson.MAppDevSeqId;
    if(!MAppSeqId){
      MAppSeqId = this.scannedJson.MAppSeqId;
    }
    this.loginData.PushNotificationId = token;
    this.loginData.MAppDevSeqId = MAppSeqId;
    this.loginData.LoginTime = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    this.loginData.DeviceUID = (this.device && this.device.uuid) ? this.device.uuid : AppSettings.TEST_DATA.SAMPLE_DEVICE_ID;
    this.loginData.DevicePlatform = (this.device && this.device.platform) ? this.device.platform : 'Android';
    this.loginData.DeviceDetails = JSON.stringify({
      "manufacturer": (this.device && this.device.manufacturer) ? this.device.manufacturer : "samsung",
      "version": (this.device&& this.device.version) ? this.device.version : "6.0.1",
      "model": (this.device && this.device.model) ? this.device.model:"SM-G532G"
      });

    this.apiProvider.securityUserLogin(this.loginData, this.scannedJson.ApiUrl).then(
      (val: any) => {
        if (val.Table1[0].UserName) {
          this.apiProvider.showToast("Welcome " + val.Table1[0].UserName);
        }

        const security_device = localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
        if(security_device) {
          const sDObj = JSON.parse(security_device);
          sDObj.LoginTime = this.loginData.LoginTime;
          sDObj.userID = this.loginData.userID;
          sDObj.UserName = val.Table1[0].UserName;
          sDObj.userImage = val.Table1[0].userImage;
          localStorage.setItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS, JSON.stringify(sDObj));
        }
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO, JSON.stringify(this.scannedJson));
        localStorage.setItem(AppSettings.LOCAL_STORAGE.SECURITY_USER_DETAILS, JSON.stringify(val.Table2[0]));
        this.navCtrl.navigateRoot('security-dash-board-page');
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
  }

}
