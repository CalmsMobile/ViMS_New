import { Injectable } from  '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import {AppSettings} from './../../services/app-settings'
import { NetworkProvider } from '../network/network';
import { File } from '@ionic-native/file/ngx';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ModalController, Platform, PopoverController, ToastController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { EventsService } from 'src/app/services/EventsService';
import { Device } from '@ionic-native/device/ngx';
import { ToolTipComponent } from 'src/app/components/tool-tip/tool-tip.component';
import { DecimalPipe } from '@angular/common';
import { ViewImageComponent } from 'src/app/components/view-image/view-image.component';
import { Router } from '@angular/router';

/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestProvider {
  alertShowing = false;
  T_SVC : any;
  isLoading = false;
  constructor(public http: HttpClient,
    public networkProvider: NetworkProvider,
    public platform: Platform,
    private device: Device,
    private file : File,
    private toastCtrl: ToastController,
    private eventsService:EventsService,
    public network: Network,
    private router: Router,
    // private http1: Http,
    private decimalPipe: DecimalPipe,
    private popoverController: PopoverController,
    private modalContrl: ModalController,
    private alertCtrl: AlertController,
    private translate:TranslateService,
    public loadingCtrl: LoadingController) {
    console.log('Hello RestProvider Provider');

    this.platform.ready().then(() => {

      this.networkProvider.initializeNetworkEvents();

      this.translate.get([
        'ALERT_TEXT.NETWORK_ERROR']).subscribe(t => {
          this.T_SVC = t;
      });

     // Offline event
    this.eventsService.observeDataCompany().subscribe((data: any) => {
      //do something
      if (data.title === 'network:offline'){
        this.checkConnection();
      } else {
        //alert('network:offline ==> '+this.network.type);
        this.checkConnection();
      }
    });

    });
  }

  checkConnection(){
    var result = false;
    if (this.isNotConnected()) {
        result = true;
        this.showAlert(this.T_SVC['ALERT_TEXT.NETWORK_ERROR']);
    }
    return result;
  }

  async showToast(mesg) {
    let toast = await this.toastCtrl.create({
      message: mesg,
      duration: 3000,
      color: 'primary',
      position: 'bottom',
    });
    toast.present();
  }

  isRunningOnMobile() {
    return this.platform.is('cordova');
  }


/**
 *
 * @param deg
 * @returns
 */
deg2rad(deg) {
  return deg * (Math.PI/180)
}

/**
 *
 * @param lat1
 * @param lon1
 * @param lat2
 * @param lon2
 * @returns
 */

  getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d * 1000;
  }


  async showAlert(msg) {
    if(!this.alertShowing){
      this.alertShowing = true;
      let alert = this.alertCtrl.create({
        header: 'Notification',
        message: msg,
        mode:'ios',
        buttons: [{
            text: 'Okay',
            handler: () => {
              console.log('Cancel clicked');
              this.alertShowing = false;
            }
          }]
        });
        (await alert).present();
        (await alert).onDidDismiss().then(() => {
          this.alertShowing = false;
        });
    }
  }

  async showAlertForLocation(errorMsg) {
    let alert = this.alertCtrl.create({
      header: 'Notification',
      message: errorMsg,
      mode:'ios',
      buttons: [{
          text: 'Okay',
          handler: () => {
            console.log('Cancel clicked');
            this.alertShowing = false;
          }
        }]
      });
      (await alert).present();
      (await alert).onDidDismiss().then(() => {
        this.alertShowing = false;
        this.router.navigateByUrl('home-tams');
      });

  }

  async presentLoading() {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      message: 'Please wait...',
      backdropDismiss: true,
      showBackdrop: true
    }).then(a => {
      a.present().then(() => {
        console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async presentLoadingWithText(message1) {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      message: message1,
      backdropDismiss: false,
      showBackdrop: true
    }).then(a => {
      a.present().then(() => {
        console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async viewImage(image) {
    const presentModel = await this.modalContrl.create({
      component: ViewImageComponent,
      componentProps: {
        data: image
      },
      showBackdrop: true,
      mode: 'ios',
      cssClass: 'imageViewModal'
    });
    presentModel.onWillDismiss().then((data) => {
      this.GetQuickPassVisitorList(null, true);
    });
    return await presentModel.present();

  }

  async presentPopover(ev: any, message) {
    const popover = await this.popoverController.create({
      component: ToolTipComponent,
      componentProps: {
        data: {
          title : message
        }
      },
      cssClass: 'my-tooltip',
      event: ev,
      animated: true,
      backdropDismiss: true,
      mode: 'ios',
      translucent: true
    });
    await popover.present().then(() => {
      setTimeout(() => {
        popover.dismiss();
      }, 2000);
    });
  }

  async dismissLoading() {
    setTimeout(async () => {
      try {
        this.isLoading = false;
        return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
      } catch (error) {

      }
    }, 100);
  }

  validateUser(data, url){
    console.log('validateUser url:' + JSON.stringify(url) + ' >>> validateUser data' + JSON.stringify(data));
    var result = false;
    if(data && data.Table && data.Table.length > 0 && (data.Table[0].Code == 50 || data.Table[0].code == 50)){
      this.eventsService.publishDataCompany({
        action: "user:created",
        title:  "InValidDeviceUIDOrUnAuthorized",
        message: data.Table[0].Description
      });
      result = true;
      this.dismissLoading();
    }
    return result;
  }

  GetHostAppSettings(data, loading){
    if(!data){
      return;
    }
    data  = this.setAuthorizedInfo(data, '', '');
    console.log('GetHostAppSettings Param' + JSON.stringify(data));
    if (loading) {
      this.presentLoading();
    }
    // var loading = this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetHostAppSettings';

    return new Promise((resolve, reject) => {

      if (this.isNotConnected()) {
        this.dismissLoading();
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        this.dismissLoading();
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, url)){
          return;
        }
        console.log('Result:' + JSON.stringify(output));
        if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(output);
        }else{
          reject(output);
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async GetAckAppDeviceInfo(data, ApiUrl){
    var loading = await this.presentLoading();
    var Api = ApiUrl + '/api/Vims/GetAckAppDeviceInfo';
    console.log("API: "+ Api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.isNotConnected()) {
        this.dismissLoading();
        return;
      }

      this.http.post(Api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        this.dismissLoading();
        var output = JSON.parse(response[0].Data);
        if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(JSON.stringify(output));
        }else{
          reject(JSON.stringify(output));
        }

      }, (err) => {

        this.dismissLoading();
        reject(err);
      });
    });
  }

  GetSecurityAppDeviceInfo(data, ApiUrl){
    var loading = this.presentLoading();
    var Api = ApiUrl + '/api/SecurityApp/GetSecurityAppDeviceInfo';
    console.log("API: "+ Api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise(async (resolve, reject) => {

      if (this.isNotConnected()) {
        this.dismissLoading();
        return;
      }

      this.http.post(Api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(async response => {
        console.log("Result: "+ JSON.stringify(response));
        this.dismissLoading();
        var output = JSON.parse(response[0].Data);
        if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(JSON.stringify(output));
        }else{
          reject(JSON.stringify(output));
        }

      }, async (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async GetDisplayAppDeviceInfo(data, ApiUrl){
    var loading = await this.presentLoading();
    var Api = ApiUrl + '/api/Vims/GetDisplayAppDeviceInfo';
    console.log("API: "+ Api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.isNotConnected()) {
        this.dismissLoading();
        return;
      }

      this.http.post(Api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        this.dismissLoading();
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(JSON.stringify(output));
        }else{
          reject(JSON.stringify(output));
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async SaveDisplayAppDeviceInfo(data, ApiUrl){
    var loading = await this.presentLoading();
    var Api = ApiUrl + '/api/Vims/SaveDisplayAppDeviceInfo';
    console.log("API: "+ Api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.isNotConnected()) {
        this.dismissLoading();
        return;
      }

      this.http.post(Api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        this.dismissLoading();
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(output.Table);
        }else{
          reject(output);
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  GetDisplaySettings(data){
    // var loading = this.presentLoading();
    data = this.setAuthorizedDisplayInfo(data);
    var Api = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetDisplaySettings';
    console.log("API: "+ Api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.isNotConnected()) {
        // this.dismissLoading();
        return;
      }

      this.http.post(Api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        // this.dismissLoading();
        if(this.validateUser(output, Api)){
          return;
        }

        if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(JSON.stringify(output.Table1[0]));
        }else{
          reject(JSON.stringify(output));
        }

      }, (err) => {
        // this.dismissLoading();
        reject(err);

      });
    });
  }

  DisplayApp_FacilityMasterList(data){
    // var loading = this.presentLoading();
    data = this.setAuthorizedDisplayInfo(data);
    var Api = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/DisplayApp_FacilityMasterList';
    console.log("API: "+ Api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.isNotConnected()) {
        // this.dismissLoading();
        return;
      }

      this.http.post(Api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        // this.dismissLoading();
        if(this.validateUser(output, Api)){
          return;
        }

        if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(JSON.stringify(output.Table1));
        }else{
          reject(JSON.stringify(output));
        }

      }, (err) => {
        reject(err);
        // this.dismissLoading();
      });
    });
  }

  securityUserLogin(data, ApiUrl){
    var loading = this.presentLoading();
    var Api = ApiUrl + '/api/SecurityApp/userLogin';
    console.log("API: "+ Api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise(async (resolve, reject) => {

      if (this.isNotConnected()) {
        this.dismissLoading();
        return;
      }

      this.http.post(Api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(async response => {
        this.dismissLoading();
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(output.Table && output.Table.length > 0){
          if(output.Table[0].Code == 10) {
            resolve(output);
          } else {
            reject(JSON.stringify({message: output.Table[0].Description ? output.Table[0].Description: output.Table1[0].Description}));
          }
        }else{
          reject(output);
        }

      }, async (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async SaveAckAppDeviceInfo(data, ApiUrl){
    var loading = await this.presentLoading();
    var Api = ApiUrl + '/api/Vims/SaveAckAppDeviceInfo';
    console.log("API: "+ Api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.isNotConnected()) {
        this.dismissLoading();
        return;
      }

      this.http.post(Api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        this.dismissLoading();
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(JSON.stringify(output.Table[0]));
        }else{
          reject(output);
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async GetAppDetails(data){
    var loading = await this.presentLoading();
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetAppDetails');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.isNotConnected()) {
        this.dismissLoading();
        return;
      }

      // alert("data: "+ JSON.stringify(data));
      // var headers1 = new HttpHeaders();
      // headers1.set('Content-Type', 'application/json');
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetAppDetails', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        this.dismissLoading();
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(output.Table1 && output.Table1.length > 0){
          resolve(output.Table1[0]);
        }else{
          reject(output);
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async SavePushNotificationId(data){
    var loading = await this.presentLoading();
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/SavePushNotificationId');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/SavePushNotificationId', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        this.dismissLoading();
        var output = JSON.parse(response[0].Data);
        if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(output.Table[0]);
        }else{
          reject({
            "message":output.Table1[0].Description
          });
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async VimsAdminLogin(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAdminLogin');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        reject({
            "message":"No Internet"
          });
          this.dismissLoading();
          return;
      }
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAdminLogin', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        this.dismissLoading();
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, '/api/Vims/VimsAdminLogin')){
          return;
        }
        if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(JSON.stringify(output.Table1[0]));
        }else{
          reject({
            "message":output.Table1[0].Description
          });
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async GetValidateHost(data){
    var loading = await this.presentLoading();
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetValidateHost');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetValidateHost', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'GetValidateHost')){
          return;
        }
        //Table 2 -- new regis or already diff device
        // Table 3 -- same device different account
        if(output.Table1 && output.Table1.length > 0){
          if( output.Table2 && output.Table2.length > 0 && output.Table2[0].Active){
            resolve(JSON.stringify(output));
          }else{
            this.dismissLoading();
            this.eventsService.publishDataCompany(
              {
                action: "user:created",
                title:  "UserInActive",
                message: 'UserInActive'
              });
            // reject(output);
          }
        }else{
          reject(output);
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  twoDecimals(number) {
    // number = ""+number;
    return number.toFixed(0);
}

  setAuthorizedSecurityInfo(data){
    var MAppDevSeqId = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);

    data.Authorize = {
      "userID": MAppDevSeqId ? JSON.parse(MAppDevSeqId).userID: '',
      "AuDeviceUID": (this.device && this.device.uuid) ? this.device.uuid: AppSettings.TEST_DATA.SAMPLE_DEVICE_ID,
      "AuMAppDevSeqId": MAppDevSeqId ? JSON.parse(MAppDevSeqId).MAppDevSeqId: ''
    }
    let branchID = MAppDevSeqId ? JSON.parse(MAppDevSeqId).RefBranchSeqid: '';
    if (!branchID) {
      branchID = MAppDevSeqId ? JSON.parse(MAppDevSeqId).RefBranchSeqId: '';
    }
    data.Branch = branchID;
    return data;
  }

  setAuthorizedDisplayInfo(data){
    var ackData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.DISPLAY_DETAILS);
      var MAppDevSeqId = "";
      if(ackData && JSON.parse(ackData)){
        MAppDevSeqId = JSON.parse(ackData).MAppDevSeqId;
      }
    if(!this.platform.is('cordova')) {
      data.Authorize = {
        "AuDeviceUID": AppSettings.TEST_DATA.SAMPLE_DEVICE_ID,
        "AuMAppDevSeqId": MAppDevSeqId
      }
    }else{

      data.Authorize = {
        "AuDeviceUID": this.device.uuid,
        "AuMAppDevSeqId": MAppDevSeqId
      }
    }
    return data;
  }

  setAuthorizedAckInfo(data){
    var ackData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.ACK_DETAILS);
      var MAppDevSeqId = "";
      if(ackData && JSON.parse(ackData)){
        MAppDevSeqId = JSON.parse(ackData).MAppDevSeqId;
      }
    if(!this.platform.is('cordova')) {
      data.Authorize = {
        "AuDeviceUID": AppSettings.TEST_DATA.SAMPLE_DEVICE_ID,
        "AuMAppDevSeqId": MAppDevSeqId
      }
    }else{
      data.Authorize = {
        "AuDeviceUID": this.device.uuid,
        "AuMAppDevSeqId": MAppDevSeqId
      }
    }
    return data;
  }

  setAuthorizedInfoCommon(data){

      var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      var AuHostSeqId = "";
      if(hostData && JSON.parse(hostData)){
        AuHostSeqId = JSON.parse(hostData).SEQID;
      }
      data.Authorize = {
        "AuDeviceUID": "WEB",
        "AuHostSeqId": AuHostSeqId
      }

    return data;
  }

  setAuthorizedInfo(data, IsWEB, branchID){
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      var AuHostSeqId = IsWEB;
      let branchId = '';
      if(hostData && JSON.parse(hostData) && !IsWEB){
        AuHostSeqId = JSON.parse(hostData).SEQID;
        branchId = JSON.parse(hostData).BRANCH_ID;
      }
      data.Authorize = {
        "AuDeviceUID": IsWEB? IsWEB : (this.device && this.device.uuid) ? this.device.uuid : AppSettings.TEST_DATA.SAMPLE_DEVICE_ID,
        "AuHostSeqId": AuHostSeqId,
        "AuMAppDevSeqId":''
      };
      data.Branch = branchID? (branchID === 'All' ? '' :branchID): branchId;
    return data;
  }

  DisplayApp_GetBookingSlots(data){
    data  = this.setAuthorizedDisplayInfo(data);
    // var loading = this.presentLoading();
    var ApiUrl = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/DisplayApp_GetBookingSlots';
    console.log("API: "+ ApiUrl);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
          // this.dismissLoading();
          return;
      }
      var body =  JSON.stringify(data);
      this.http.post(ApiUrl, body,{
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, ApiUrl)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0){
            if(output.Table[0].Code && output.Table[0].Code == 10){
              if(output.Table1){
                resolve(JSON.stringify(output.Table1));
              }else{
                reject(JSON.stringify(output.Table));
              }

            }else{
              reject(JSON.stringify(output));
            }
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
        // this.dismissLoading();
      }, (err) => {
        reject(err);
        // this.dismissLoading();
      });
    });
  }



  SearchHost(data){

    data  = this.setAuthorizedInfo(data, '', '');

    //var loading = this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/SearchHost';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
         // this.dismissLoading();
          return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, url)){
          return;
        }
        if(output.Table2 != undefined && output.Table2.length > 0){
          resolve(JSON.stringify(output.Table2));
        }else{
          reject(JSON.stringify(output));
        }
        //this.dismissLoading();
      }, (err) => {
        reject(err);
        //this.dismissLoading();
      });
    });
  }

  SearchExistVisitor(data){
    data  = this.setAuthorizedInfo(data, '', '');
    //var loading = this.presentLoading();
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/SearchExistVisitor');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
         // this.dismissLoading();
          return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/SearchExistVisitor', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, '/api/Vims/SearchExistVisitor')){
          return;
        }
        if(output.Table2 != undefined && output.Table2.length > 0){
          resolve(JSON.stringify(output.Table2));
        }else{
          reject(JSON.stringify(output));
        }
        //this.dismissLoading();
      }, (err) => {
        reject(err);
        //this.dismissLoading();
      });
    });
  }

  GetVisitorsListByHost(data, showLoading){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading;
    if(showLoading){
      loading = this.presentLoading();
    }
    var URL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetVisitorsListByHost';
    console.log("API: "+ URL);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
         this.dismissLoading();
          return;
      }
      this.http.post(URL, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        if(showLoading && loading){
          this.dismissLoading();
        }
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, URL)){
          return;
        }
        if(output.Table != undefined && output.Table.length > 0 && (output.Table[0].code == 10 || output.Table[0].Code == 10)){
          resolve(JSON.stringify(output.Table1));
        }else{
          reject(JSON.stringify(output));
        }

      }, (err) => {
        if(showLoading && loading){
          this.dismissLoading();
        }
        reject(err);
      });
    });
  }

  GetMasterDetails(){
    var data  = this.setAuthorizedInfo({}, 'WEB', '');
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetMasterDetails');
    console.log("Params: "+ JSON.stringify(data));
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
          // this.dismissLoading();
          return;
      }
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetMasterDetails', data, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, 'GetMasterDetails')){
          return;
        }
        if(output != undefined){
          resolve(output);
        }else{
          reject(output);
        }
        //this.dismissLoading();
      }, (err) => {
        reject(err);
        //this.dismissLoading();
      });
    });
  }

  GetAddVisitorSettings(data){
    data  = this.setAuthorizedInfo(data, '', '');
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetAddVisitorSettings');
    console.log("Params: "+ JSON.stringify(data));
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetAddVisitorSettings', data, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, 'GetAddVisitorSettings')){
          return;
        }
        if(output != undefined){
          resolve(output);
        }else{
          reject(output);
        }
      }, (err) => {
        reject(err);
      });
    });
  }

  GetSecurityMasterDetails(){
    var data  = this.setAuthorizedSecurityInfo({});
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/GetMasterDetails';
    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
          // this.dismissLoading();
          return;
      }
      this.http.post(url, data, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, url)){
          return;
        }
        if(output != undefined){
          resolve(output);
        }else{
          reject(output);
        }
        //this.dismissLoading();
      }, (err) => {
        reject(err);
        //this.dismissLoading();
      });
    });
  }

  GetAllHostData(){
    // var data  = this.setAuthorizedInfo({});
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetAllHostData';
    console.log("API: "+ url);

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
          // this.dismissLoading();
          return;
      }
      this.http.post(url, {}, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, url)){
          return;
        }
        if(output != undefined){
          resolve(output);
        }else{
          reject(output);
        }
        //this.dismissLoading();
      }, (err) => {
        reject(err);
        //this.dismissLoading();
      });
    });
  }



  GetVisitorCompany(data){
    //var loading = this.presentLoading();
    data  = this.setAuthorizedInfoCommon(data);
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetVisitorCompany');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        reject({
            "message":"No Internet"
          });
          // this.dismissLoading();
          return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetVisitorCompany', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, 'GetVisitorCompany')){
          return;
        }
        if(output.Table2 != undefined &&  output.Table2.length > 0){
          resolve(JSON.stringify(output.Table2));
        }else{
          reject(JSON.stringify(output));
        }
        //this.dismissLoading();
      }, (err) => {
        reject(err);
        //this.dismissLoading();
      });
    });
  }

  async AddVisitor(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/AddVisitor');
    console.log("Params: "+ JSON.stringify(data));
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
            "message":"No Internet"
          });

          return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/AddVisitor', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'AddVisitor')){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }


      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }


  async UpdateVisitor(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/UpdateVisitor');
    console.log("Params: "+ JSON.stringify(data));
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
          reject({
            "message":"No Internet"
          });
          return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/UpdateVisitor', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        this.dismissLoading();
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, 'UpdateVisitor')){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){

            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }


  async CreateQuickPassVisitor(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/vims/CreateQuickPassVisitor';
    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
            "message":"No Internet"
          });
          return;
      }
     this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }


      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async addVisitorCompany(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/addVisitorCompany');
    console.log("Params: "+ JSON.stringify(data));
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
            "message":"No Internet"
          });

          return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/addVisitorCompany', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        this.dismissLoading();
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, 'addVisitorCompany')){
          return;
        }
        if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
          resolve(JSON.stringify(output));
        }else{
          reject(JSON.stringify(output));
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }


  async AddAppointment(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();

    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/AddAppointment');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
          reject({
            "message":"No Internet"
          });

          return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/AddAppointment', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'AddAppointment')){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async RemindAppointment(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();

    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/RemindAppointment');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
          reject({
            "message":"No Internet"
          });

          return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/RemindAppointment', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'RemindAppointment')){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
    }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  isNotConnected(): boolean {
    let conntype = this.network.type;
    var connected = conntype == null || (conntype !== 'unknown' && conntype !== 'none');
    return !connected;
  }

  syncAppointment(data, upcoming, showLoading){
    data  = this.setAuthorizedInfo(data, '', '');
    data.IsMobile = true;
    var loading ;
    if(showLoading){
      loading = this.presentLoading();
    }
    return new Promise(async (resolve, reject) => {

      // alert("data: "+ JSON.stringify(data));
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });

        return;
      }
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/syncAppointment', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(async response => {
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'syncAppointment')){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            if(upcoming){
              resolve(JSON.stringify(output.Table1));
            }else{
              resolve(JSON.stringify(output.Table3));
            }

          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  AppointmentApprovalList(data,showLoading){
    data  = this.setAuthorizedInfo(data, '', '');
    data.IsMobile = true;
    var loading ;
    if(showLoading){
      loading = this.presentLoading();
    }
    var URL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/AppointmentApprovalList';
    console.log("API: "+ URL);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(URL, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, URL)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && (!output.Table[0].Code || output.Table[0].Code === 10)){
            resolve(JSON.stringify(output.Table));
          }else{
            try {
              reject(JSON.stringify({message: output.Table[0].descripion}));
            } catch (error) {
              reject(JSON.stringify(output));
            }

          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  GetAllQuickPassVisitorsHistory(data, showLoading){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = null
    if(showLoading){
      loading = this.presentLoading();
    }
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/vims/GetAllQuickPassVisitorsHistory';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
     if (this.checkConnection()) {
      this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();

        if(output){
          if(output.Table != undefined){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  GetQuickPassVisitorList(data, showLoading){
    data  = this.setAuthorizedSecurityInfo(data);
    data.IsMobile = true;
    var loading = null
    if(showLoading){
      loading = this.presentLoading();
    }
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/GetQuickPassVisitorList';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      // alert("data: "+ JSON.stringify(data));
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table2));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }


  VimsAppGetCheckInVisitorList(data, showLoading){
    data  = this.setAuthorizedSecurityInfo(data);
    data.IsMobile = true;
    var loading = null
    if(showLoading){
      loading = this.presentLoading();
    }
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/VimsAppGetCheckInVisitorList';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      // alert("data: "+ JSON.stringify(data));
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table2));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  VimsAppGetSecurityStatsDetail(data, showLoading){
    data  = this.setAuthorizedSecurityInfo(data);
    data.IsMobile = true;
    var loading = null;
    if(showLoading){
      loading = this.presentLoading();
    }
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/VimsAppGetSecurityStatsDetail';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();

        reject(err);
      });
    });
  }

  async VimsAppUpdateVisitorCheckOut(data){
    data  = this.setAuthorizedSecurityInfo(data);
    data.IsMobile = true;
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/VimsAppUpdateVisitorCheckOut';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      // alert("data: "+ JSON.stringify(data));
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0){
            if(output.Table[0].Code == 10) {
              resolve(JSON.stringify(output.Table));
            } else {
              reject(JSON.stringify({message: output.Table[0].description}));
            }

          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async DeleteQuickPassVisitor(data){
    data  = this.setAuthorizedInfo(data, '', '');
    data.IsMobile = true;
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/vims/DeleteQuickPassVisitor';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async GetQuickPassVisitorDetail(data){
    data  = this.setAuthorizedInfoCommon(data);
    data.IsMobile = true;
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/vims/GetQuickPassVisitorDetail';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table1[0]));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async UpdateQPVisitorCheckOutTime(data){
    data  = this.setAuthorizedInfoCommon(data);
    data.IsMobile = true;
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/UpdateQPVisitorCheckOutTime';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && (output.Table[0].code == 10 || output.Table[0].Code == 10)){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify({"message":output.Table[0].description}));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async VimsAppUpdateVisitorQRCheckOut(data){
    data  = this.setAuthorizedInfoCommon(data);
    data.IsMobile = true;
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/VimsAppUpdateVisitorQRCheckOut';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && (output.Table[0].code == 10 || output.Table[0].Code == 10)){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify({"message":output.Table[0].description}));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async UpdateQPVisitorCheckInTime(data){
    data  = this.setAuthorizedSecurityInfo(data);
    data.IsMobile = true;
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/UpdateQPVisitorCheckInTime';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && (output.Table[0].code == 10 || output.Table[0].Code == 10)){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  VimsAppGetSecurityStats(data){
    data  = this.setAuthorizedSecurityInfo(data);
    data.IsMobile = true;
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/VimsAppGetSecurityStats';
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
          return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        reject(err);
      });
    });
  }

  async AppointmentApprovalByVisitor(data) {
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();

    var URL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/AppointmentApprovalByVisitor';
    console.log("API: "+ URL);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(URL, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, URL)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
              resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify({
              "message": (output.Table1 && output.Table1.length > 0) ? output.Table1[0].Description: output.Table2[0].description
            }));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async ChangeAppointmentStatus(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();

    var URL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/ChangeAppointmentStatus';
    console.log("API: "+ URL);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(URL, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, URL)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
              resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify({
              "message": (output.Table1 && output.Table1.length > 0) ? output.Table1[0].Description: output.Table2[0].description
            }));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async ChangeApppointmentApprovalSettings(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();

    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/ChangeApppointmentApprovalSettings');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      // alert("data: "+ JSON.stringify(data));
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/ChangeApppointmentApprovalSettings', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'ChangeApppointmentApprovalSettings')){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
              resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify({
              "message": output.Table1[0].Description
            }));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async getHostNotification(data, WEB){
    data  = this.setAuthorizedInfo(data, WEB, '');
    var loading = await this.presentLoading();

    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/getHostNotification');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      // alert("data: "+ JSON.stringify(data));
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/getHostNotification', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'getHostNotification')){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
              resolve(JSON.stringify(output.Table2));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async UpdateReadNotificationStatus(data, WEB){
    data  = this.setAuthorizedInfo(data, WEB, '');
    var loading = await this.presentLoading();

    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/UpdateReadNotificationStatus';
    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      // alert("data: "+ JSON.stringify(data));
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
              resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }

  async DeleteNotification(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/RemovePushNotification';
    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
              resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify({
              "message": output.Table1[0].Description
            }));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);
      });
    });
  }


  GetPreAppointmentSettings(data){
   // var loading = this.presentLoading();
    data  = this.setAuthorizedInfo(data, '', '');
    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetPreAppointmentSettings');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
         // this.dismissLoading();
          return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetPreAppointmentSettings', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, 'GetPreAppointmentSettings')){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table1));
          }else{
            reject(JSON.stringify({"message":output.Table1[0].Description}));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
       // this.dismissLoading();
      }, (err) => {
        reject(err);
        // this.dismissLoading();
      });
    });
  }


  async GetAppointmentByGroupId(data){
    data  = this.setAuthorizedInfo(data, '', '');
    data.IsMobile = true;
    var loading = await this.presentLoading();

    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetAppointmentByGroupId');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetAppointmentByGroupId', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'GetAppointmentByGroupId')){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table1));
          }else{
            reject(JSON.stringify({"message":output.Table1[0].Description}));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async VimsAppGetAppointmentByHexCode(data, loading){
    data  = this.setAuthorizedSecurityInfo(data);
    data.IsMobile = true;
    if (loading) {
      await this.presentLoading();
    }
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/VimsAppGetAppointmentByHexCode';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify({"message":output.Table1[0].Description}));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async EditAppointment(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();

    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/EditAppointment');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/EditAppointment', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'EditAppointment')){
          return;
        }
        if(output ){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async UpdateHostInfo(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();

    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/UpdateHostInfo');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/UpdateHostInfo', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'UpdateHostInfo')){
          return;
        }
        if(output ){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async RemoveAppointment(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();

    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/RemoveAppointment');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/RemoveAppointment', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(output ){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }


      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }


  async FBBookingEndSession(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/FBBookingEndSession';
    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output ){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0]){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }


      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async FBDisplayEndSession(data){
    data  = this.setAuthorizedDisplayInfo(data);
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/FBDisplayEndSession';
    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output ){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0]){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }


      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async VimsAppFBBookingCancel(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppFBBookingCancel';
    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output ){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0]){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }


      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async VimsAppUpdateFacilityBookings(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppUpdateFacilityBookings';

    console.log("API: "+ url);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(url, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output ){ // 0 - No record  2- Expired
          if(output.Table != undefined &&  output.Table.length > 0){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async VimsAppDeleteFBFacilityBooking(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();

    console.log("API: "+ JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppDeleteFBFacilityBooking');
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      // alert("data: "+ JSON.stringify(data));
      this.http.post(JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppDeleteFBFacilityBooking', JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, 'VimsAppDeleteFBFacilityBooking')){
          return;
        }
        if(output ){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].code == "S"){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }


      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }


  VimsAppFacilityBookingSetting(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppFacilityBookingSetting';
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.isNotConnected()) {
          // this.dismissLoading();
          return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, url)){
          return;
        }
        if(output != undefined && output.Table && output.Table[0] && (output.Table[0].code == 10 || output.Table[0].Code == 10)){
          resolve(output.Table1);
        }else{
          reject(output);
        }
        //this.dismissLoading();
      }, (err) => {
        reject(err);
        //this.dismissLoading();
      });
    });
  }

  async VimsAppFacilityMasterList(data, edit){
    data  = this.setAuthorizedInfo(data, '', '');
    if(edit){
      var loading = await this.presentLoading();
    }
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppFacilityMasterList';
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.isNotConnected()) {
        if(edit){
          this.dismissLoading();
        }
        return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(edit){
          this.dismissLoading();
        }
        if(this.validateUser(output, url)){
          return;
        }
        if(output != undefined && output.Table && output.Table[0] && output.Table[0].Code == 10){
          resolve(output.Table1);
        }else{
          reject(output);
        }

      }, (err) => {
        if(edit){
          this.dismissLoading();
        }
        reject(err);

      });
    });
  }

  VimsAppFacilityPurposeList(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppFacilityPurposeList';
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.isNotConnected()) {
          // this.dismissLoading();
          return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, url)){
          return;
        }
        if(output != undefined && output.Table && output.Table[0] && (output.Table[0].code == 10 || output.Table[0].Code == 10)){
          resolve(output.Table1);
        }else{
          reject(output);
        }
        //this.dismissLoading();
      }, (err) => {
        reject(err);
        //this.dismissLoading();
      });
    });
  }

  async VimsAppGetBookingSlot(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppGetBookingSlot';
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          this.dismissLoading();
          return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output != undefined && output.Table){
          resolve(output.Table);
        }else{
          reject(output);
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async VimsAppFacilityBookingSave(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppFacilityBookingSave';
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          this.dismissLoading();
          return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output != undefined && output.Table && output.Table[0]){
          resolve(JSON.stringify(output.Table[0]));
        }else{
          reject(JSON.stringify(output));
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  VimsAppGetHostFacilityBookingList(data, showLoaading){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading;
    if(showLoaading){
      loading = this.presentLoading();
    }

    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppGetHostFacilityBookingList';
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.isNotConnected()) {
        if(showLoaading){
          this.dismissLoading();
        }

          return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, url)){
          return;
        }
        if(output != undefined && output.Table && output.Table[0] && output.Table[0].Code == 10){
          resolve(JSON.stringify(output.Table2));
        }else{
          reject(JSON.stringify(output));
        }
        if(showLoaading){
          this.dismissLoading();
        }
      }, (err) => {
        if(showLoaading){
          this.dismissLoading();
        }
        reject(err);

      });
    });
  }

  GetDynamicQRCodeForVisitor(data) {
    data  = this.setAuthorizedInfo(data, '', '');
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetDynamicQRCodeForVisitor';
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          this.dismissLoading();
          return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        // if(this.validateUser(output, url)){
        //   return;
        // }
        if(output != undefined){
          resolve(JSON.stringify(output.Table1[0]));
        }else{
          reject(JSON.stringify(output));
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  GetAppointmentDetailBySeqId(data) {
    data  = this.setAuthorizedInfo(data, '', '');
    // this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetAppointmentDetailBySeqId';
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          this.dismissLoading();
          return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output != undefined && output.Table && output.Table[0] && output.Table[0].Code == 10){
          resolve(JSON.stringify(output));
        }else{
          reject(JSON.stringify(output));
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  requestSecurityApi(data, API, loading) {
    data  = this.setAuthorizedSecurityInfo(data);
    if (loading) {
      this.presentLoading();
    }
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + API;
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          this.dismissLoading();
          return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log(API + " --> Result : "+ JSON.stringify(response));
        this.dismissLoading();
        if (response[0].Data) {
          var output = JSON.parse(response[0].Data);
          if(this.validateUser(output, url)){
            return;
          }
          if(output != undefined && output.Table){
            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify(output));
          }
        } else {
          reject(JSON.stringify({message: response[0].ErrorLog[0].Error}));
        }


      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

   requestApi(data, API, loading, IsWEB, branchID) {
    data  = this.setAuthorizedInfo(data, IsWEB, branchID);
    if (loading) {
      this.presentLoading();
    }
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + API;
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          this.dismissLoading();
          return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log(API+ " Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }

        if(output){
          if(output.Table){
            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async VimsAppGetFacilityBookingDetails(data){
    data  = this.setAuthorizedInfo(data, '', '');
    var loading = await this.presentLoading();
    var url = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppGetFacilityBookingDetails';
    console.log("API: "+ url);
    var params = JSON.stringify(data);
    console.log("params: "+ params);
    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          this.dismissLoading();
          return;
      }
      this.http.post(url, params, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, url)){
          return;
        }
        if(output != undefined && output.Table && output.Table[0] && output.Table[0].Code == 10){
          resolve(JSON.stringify(output));
        }else{
          reject(JSON.stringify(output));
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async GetLocatorName(){
    var address;
    try{
      address = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if(!address){
       return;
      }
    }catch(e){

    }

    var loading = await this.presentLoading();
    var ApiUrl = JSON.parse(address).ApiUrl+ '/api/Vims/GetLocatorName';
    console.log("API: "+ ApiUrl);
    console.log("Params: {}");

    return new Promise((resolve, reject) => {

      // alert("data: "+ JSON.stringify(data));
      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }
      this.http.post(ApiUrl, {}, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        this.dismissLoading();
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table1));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  GetVisitorDataById(data){
    data  = this.setAuthorizedAckInfo(data);
    // var loading = this.presentLoading();
    var qr = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    var ApiUrl = JSON.parse(qr).ApiUrl + '/api/Vims/GetVisitorDataById';
    console.log("API: "+ ApiUrl);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
          // this.dismissLoading();
          return;
      }
      var body =  JSON.stringify(data);
      this.http.post(ApiUrl, body,{
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        // console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, ApiUrl)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0){
            if(output.Table[0].code && (output.Table[0].code == 10 || output.Table[0].Code == 10)){
              if(output.Table1){
                resolve(JSON.stringify(output.Table1[0]));
              }else{
                reject(JSON.stringify(output.Table));
              }

            }else{
              reject(JSON.stringify(output.Table));
            }
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
        // this.dismissLoading();
      }, (err) => {
        reject(err);
        // this.dismissLoading();
      });
    });
  }

  getVisitorAcknowledgeSetting(data){
    data  = this.setAuthorizedAckInfo(data);
    // var loading = this.presentLoading();
    var qr = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    var ApiUrl = JSON.parse(qr).ApiUrl + '/api/Vims/getVisitorAcknowledgeSetting';
    console.log("API: "+ ApiUrl);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
          // this.dismissLoading();
          return;
      }
      var body =  JSON.stringify(data);
      this.http.post(ApiUrl, body,{
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        // console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, ApiUrl)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0){
            if(output.Table[0].Code && output.Table[0].Code == 10){
              if(output.Table1){
                const rObj = output.Table1[0];
                rObj.Questions = output.Table2;
                resolve(JSON.stringify(rObj));
              }else{
                reject(JSON.stringify(output.Table));
              }

            }else{
              reject(JSON.stringify(output));
            }
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
        // this.dismissLoading();
      }, (err) => {
        reject(err);
        // this.dismissLoading();
      });
    });
  }

  GetSecurityAppSettings(data){
    data  = this.setAuthorizedSecurityInfo(data);
    // var loading = this.presentLoading();
    var qr = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    var ApiUrl = JSON.parse(qr).ApiUrl + '/api/SecurityApp/GetSecurityAppSettings';
    console.log("API: "+ ApiUrl);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
          // this.dismissLoading();
          return;
      }
      var body =  JSON.stringify(data);
      this.http.post(ApiUrl, body,{
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        // console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, ApiUrl)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0){
            if(output.Table[0].Code && output.Table[0].Code == 10){
              if(output.Table1){
                resolve(JSON.stringify(output.Table1[0]));
              }else{
                reject(JSON.stringify(output.Table));
              }

            }else{
              reject(JSON.stringify(output));
            }
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
        // this.dismissLoading();
      }, (err) => {
        reject(err);
        // this.dismissLoading();
      });
    });
  }


  GetVisitorInfoFromLocator(data){
    data  = this.setAuthorizedAckInfo(data);
    // var loading = this.presentLoading();
    var QRCode = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if(!QRCode){
      return;
    }
    data.LocatorName = JSON.parse(QRCode).Location;
    var ApiUrl = JSON.parse(QRCode).ApiUrl + '/api/Vims/GetVisitorInfoFromLocator';
    console.log("API: "+ ApiUrl);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      // alert("data: "+ JSON.stringify(data));
      if (this.checkConnection()) {
          reject({
            "message":"No Internet"
          });
          // this.dismissLoading();
          return;
      }
      this.http.post(ApiUrl, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        if(this.validateUser(output, ApiUrl)){
          return;
        }
        if(output){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table1));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }
        // this.dismissLoading();
      }, (err) => {
        reject(err);
        // this.dismissLoading();
      });
    });
  }

  async SaveVisitorCheckinInfo(data){
    data  = this.setAuthorizedAckInfo(data);
    var loading = await this.presentLoading();
    var api = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/SaveVisitorCheckinInfo';
    console.log("API: "+ api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      this.http.post(api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, api)){
          return;
        }
        if(output ){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
              reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
            } else {
              reject(JSON.stringify({"message":"Error"}));
            }
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async VimsAppSecurityCheckIn(data){
    data  = this.setAuthorizedSecurityInfo(data);
    var loading = await this.presentLoading();
    var api = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/SecurityApp/VimsAppSecurityCheckIn';
    console.log("API: "+ api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      this.http.post(api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, api)){
          return;
        }
        if(output ){
          if(output.Table != undefined &&  output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output.Table));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async VimsAppUpdateVisitorVideoBriefStatus(data){
    data  = this.setAuthorizedAckInfo(data);
    var loading = await this.presentLoading();
    var api = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/VimsAppUpdateVisitorVideoBriefStatus';
    console.log("API: "+ api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      this.http.post(api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, api)){
          return;
        }
        if(output ){ //output.Table[0].Code
          if(output.Table && output.Table.length > 0 && output.Table[0].Code == 10){
            resolve(JSON.stringify(output));
          }if(output.Table && output.Table.length > 0 && output.Table[0].Code == 20){
            reject({"message":output.Table[0].description});
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

  async GetSafetyBriefStatus(data){
    data  = this.setAuthorizedAckInfo(data);
    var loading = await this.presentLoading();
    var api = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/api/Vims/GetSafetyBriefStatus';
    console.log("API: "+ api);
    console.log("Params: "+ JSON.stringify(data));

    return new Promise((resolve, reject) => {

      if (this.checkConnection()) {
        this.dismissLoading();
        reject({
          "message":"No Internet"
        });
        return;
      }

      this.http.post(api, JSON.stringify(data), {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(response => {
        console.log("Result: "+ JSON.stringify(response));
        var output = JSON.parse(response[0].Data);
        this.dismissLoading();
        if(this.validateUser(output, api)){
          return;
        }
        if(output ){
          if(output.length > 0 && (output[0].code == 10 || output[0].Code == 10)){
            resolve(JSON.stringify(output));
          }else{
            reject(JSON.stringify(output));
          }
        }else{
          if(response[0] && response[0].ErrorLog && response[0].ErrorLog[0] && response[0].ErrorLog[0].Error) {
            reject(JSON.stringify({"message":response[0].ErrorLog[0].Error}));
          } else {
            reject(JSON.stringify({"message":"Error"}));
          }
        }

      }, (err) => {
        this.dismissLoading();
        reject(err);

      });
    });
  }

}


