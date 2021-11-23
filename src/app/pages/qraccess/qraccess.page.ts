import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-qraccess',
  templateUrl: './qraccess.page.html',
  styleUrls: ['./qraccess.page.scss'],
})
export class QRAccessPage implements OnInit {
  hostObj: any = {

  };
  showProfileHeader = false;
  lastGenOn = '';
  TIMEOUT = 0;
  qrCodePath = '';
  HOST_QRVALUE = '';
  HOST_ACCESS_INTERVAL: any;
  showQRImage= false;
  showNotification = false;
  IsDynamicKey = false;
  constructor(private router: Router,
    private translate: TranslateService,
    private navCtrl: NavController,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private apiProvider: RestProvider) { }

  ngOnInit() {
    console.log('ngOnInit ');
    const hostData = localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    const cmpnyData = localStorage.getItem(AppSettings.LOCAL_STORAGE.COMPANY_DETAILS);
    if (hostData) {
      var tempImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/PortalImageHandler.ashx?RefSlno='
      + JSON.parse(hostData).SEQID + "&ScreenType=30&Refresh=" + new Date().getTime();
      this.hostObj.hostImage = tempImage;
      this.hostObj.HOSTNAME = JSON.parse(hostData).HOSTNAME;
      this.hostObj.HOST_EMAIL = JSON.parse(hostData).HOST_EMAIL;
      this.hostObj.comp_name = JSON.parse(cmpnyData).comp_name;;
    }
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      const QRObj = JSON.parse(qrData);
      this.showProfileHeader = QRObj.MAppId === AppSettings.LOGINTYPES.QR_ACCESS;
      if (QRObj.MAppId.split(',').length === 2 && QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.NOTIFICATIONS) > -1) {
        this.showNotification = true;
        this.showProfileHeader = true;
      }
    }
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData.isFromLogin);
        this.showQRImage = passData.ACTION === 'ShowQR';
        if (this.showQRImage){
          this.GetHostAccessSettings();
        }

      }
    });
    this.lastGenOn = localStorage.getItem(AppSettings.LOCAL_STORAGE.QR_ACCESS_LAST_GEN_ON);
  }

  goBack() {

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
          this.router.navigateByUrl('home-view');
      }
      }
    } else {
      this.navCtrl.pop();
    }
    console.log('goBack ');
   }

  showQR() {
    this.showQRImage = !this.showQRImage;
    if (this.showQRImage){
      this.GetHostAccessSettings();
    } else {
      clearInterval(this.HOST_ACCESS_INTERVAL);
    }
  }

  gotoNotifiations() {
    this.router.navigateByUrl('notifications');
  }

  gotoSettings(){
    this.router.navigateByUrl('settings-view-page');
  }


  GetHostAccessSettings(){
    var params  = {
      "MAppId": AppSettings.LOGINTYPES.HOSTAPPT,
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
              if (hostAccessSettings.IsDynamicKey) {
                this.HOST_QRVALUE = hostAccessSettings.DynamicCode;
              } else {
                this.HOST_QRVALUE = hostAccessSettings.HostCardSerialNo;
              }
              this.IsDynamicKey = hostAccessSettings.IsDynamicKey;
              this.qrCodePath = hostAccessSettings.DataString;
              const lastGenOn = this.datePipe.transform(new Date(), 'dd MMM yyyy hh:mm a');
              this.lastGenOn = localStorage.getItem(AppSettings.LOCAL_STORAGE.QR_ACCESS_LAST_GEN_ON);
              localStorage.setItem(AppSettings.LOCAL_STORAGE.QR_ACCESS_LAST_GEN_ON, lastGenOn);
              if (hostAccessSettings.QRCodeValidity && hostAccessSettings.QRCodeValidity > 0 && hostAccessSettings.IsDynamicKey) {
                clearInterval(this.HOST_ACCESS_INTERVAL);
                this.refreshHostAccess(hostAccessSettings.QRCodeValidity);
              } else {
                clearInterval(this.HOST_ACCESS_INTERVAL);
              }
            }catch(e){
            }
            if (!this.qrCodePath){
              clearInterval(this.HOST_ACCESS_INTERVAL);
              this.showAlert('Unable to get your access code due to server issue, please try again or contact system administrator.');
            }
          }
        }catch(e){
        }

      },
      (err) => {
      }
    );
}

  async showAlert(msg){
  let alert = this.alertCtrl.create({
    header: 'Notification',
    message: msg,
    mode:'ios',
    buttons: [{
        text: 'Okay',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    (await alert).present();
    (await alert).onDidDismiss().then(() => {
      this.showQRImage = false;
    });
}

refreshHostAccess(QRCodeValidity) {
  if (this.HOST_ACCESS_INTERVAL) {
    clearInterval(this.HOST_ACCESS_INTERVAL);
  }
  let timeout = QRCodeValidity;
  this.TIMEOUT = timeout ? (+timeout): QRCodeValidity;

  localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_ACCESS_TIMEOUT, timeout);
  this.HOST_ACCESS_INTERVAL = setInterval(() => {
    timeout = timeout - 1;
    this.TIMEOUT = this.TIMEOUT - 1;
    localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_ACCESS_TIMEOUT, timeout);
    if (timeout <= 0) {
      clearInterval(this.HOST_ACCESS_INTERVAL);
      this.GetHostAccessSettings();
    }
  }, 1000);

}

ionViewWillEnter(){
}

ionViewWillLeave(){
  if (this.HOST_ACCESS_INTERVAL){
    clearInterval(this.HOST_ACCESS_INTERVAL);
  }
}

  logout() {
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
              localStorage.clear();
              this.apiProvider.showToast(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
              this.navCtrl.navigateRoot('account-mapping');
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

}