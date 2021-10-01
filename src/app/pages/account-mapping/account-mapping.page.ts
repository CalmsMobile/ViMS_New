import { Component, OnInit } from '@angular/core';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Device } from '@ionic-native/device/ngx';
import { AlertController, MenuController, NavController, Platform } from '@ionic/angular';
import { AppSettings } from 'src/app/services/app-settings';
import { ToastService } from 'src/app/services/util/Toast.service';
import { File } from '@ionic-native/file/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import * as CryptoJS from 'crypto-js';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { NavigationExtras, Router } from '@angular/router';
import { FCM } from '@ionic-native/fcm/ngx';

@Component({
  selector: 'app-account-mapping',
  templateUrl: './account-mapping.page.html',
  styleUrls: ['./account-mapping.page.scss'],
})
export class AccountMappingPage {
  selecLang = AppSettings.DEFAULT_LANGUAGE_ID['id'];
  languageSelect:any;
  scannedJson : any;
  companyInfo: any;
  hostInfo: any;
  companyImage:any;
  hostImage:any;
  options :BarcodeScannerOptions;
  T_SVC:any;
  STOPS:String = 'STOP1';
  VM = {
    "DevicePlatform": "",
    "DeviceDetails": {},
    "org_yes_chk_box":false,
    "host_search_id":"",
    "if_already_mapped":false,
    "if_already_registered_same_device":false,
    "user_yes_chk_box":false,
    "user_alreadymapremove_yes_chk_box":false,
  }
  showUI : any = false;

  constructor(private navCtrl: NavController,
     public platform : Platform,
    //  private googleVision : GoogleVision,
     public menu: MenuController,
     private file: File,
     private router: Router,
    //  private crashlytics: Crashlytics,
     private alertCtrl: AlertController,
     private toastCtrl:ToastService,
     private device: Device,
     private fcm: FCM,
     private barcodeScanner: BarcodeScanner,
     public apiProvider: RestProvider,
     private statusBar: StatusBar,
     private screenOrientation : ScreenOrientation,
     private translate:TranslateService) {
      this.statusBar.backgroundColorByHexString(AppSettings.STATUS_BAR_COLOR);
    if(localStorage.getItem("SEL_LANGUAGE") != undefined && localStorage.getItem("SEL_LANGUAGE") != ""){
      this.selecLang = (localStorage.getItem("SEL_LANGUAGE"));
    }
    this.languageSelect = {
      "title" : "SETTINGS.APP_LANGUAGE",
      "subTitle" : "SETTINGS.SELECT_LANGUAGE",
      "selectedItem": this.selecLang,
      "items" : AppSettings.AVAILABLE_LANGUAGE
    };

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

    this.STOPS = 'STOP1'; // Page Starts with Scan

    this.showUI = true;
    var scannedJson1 = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if(scannedJson1 && JSON.parse(scannedJson1).MAppId){
      switch(JSON.parse(scannedJson1).MAppId){
        case AppSettings.LOGINTYPES.ACKAPPT:
            var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.ACK_DETAILS);
            if(hostData && JSON.parse(hostData) && JSON.parse(hostData).MAppDevSeqId){
              this.showUI = false;
              return;
            }
          return;
        case AppSettings.LOGINTYPES.DISPLAYAPP:
            hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.DISPLAY_DETAILS);
            if(hostData && JSON.parse(hostData) && JSON.parse(hostData).MAppDevSeqId){
              this.showUI = false;
              return;
            }
          return;
        case AppSettings.LOGINTYPES.SECURITYAPP:
            hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_USER_DETAILS);
            if(hostData && JSON.parse(hostData) && JSON.parse(hostData).MAppDevSeqId){
              this.showUI = false;
              return;
            }
          return;
        default:
            hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
            if(hostData && JSON.parse(hostData) && JSON.parse(hostData).SEQID){
              this.showUI = false;
              return;
            }
        }
      }

  }

  ionViewDidEnter() {
    this.menu.enable(false,"myLeftMenu");
    this.initializeFirebase();
  }

  ionViewWillLeave() {

  }

  initializeFirebase() {
    if (this.platform.is("cordova")) {
      this.platform.is('android') ? this.initializeFirebaseAndroid() : this.initializeFirebaseIOS();
    }
  }
  initializeFirebaseAndroid() {
    this.fcm.getToken().then(token => {
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
      console.log("Token:" + token);
    });
    this.fcm.onTokenRefresh().subscribe(token => {
      console.log("RefreshToken:" + token);
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
    })
  }
  initializeFirebaseIOS() {
    this.fcm.hasPermission().then(hasPermission => {
      if (hasPermission) {
        console.log("Has permission!");
        this.fcm.getToken().then(token => {
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
          console.log("Token:" + token);
        });
        this.fcm.onTokenRefresh().subscribe(token => {
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FCM_ID, "" + token);
          console.log("Token:" + token);
        });
      }
    })
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
  takeActForScanQR(){

    let invalidQRCode = true;
    let invalidORG = true;

    var loadinWeb = true;
    if(this.platform.is('cordova')) {
      loadinWeb = false;
    } else {
      loadinWeb = true;
    }
    if (loadinWeb) {
        var  ApiUrl = "http://124.217.235.107:1001/api/";
        var CompanyId = "0";
        var HostId = "VijayCalms";
        var AppId = "1";
        var qrJsonString1 = "{\"ApiUrl\":\""+ApiUrl+ "\",\"CompanyId\":\"" + CompanyId + "\",\"HostId\":\""
        + HostId + "\", \"AppId\":\"" + AppId + "\", \"MAppId\":\""+ AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS+ "\"}";
        // var qrJsonString1 = "{\"CompanyId\":\"1\",\"HostId\":\""+AppSettings.TEST_DATA.SAMPLE_HOST_IC+"\",\"AppId\":\"1\",\"ApiUrl\":\"http://124.217.235.107:2026\", \"MAppId\":\""+ AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP+ "\"}";
        // ACK
        // var qrJsonString1 = "{\"MAppDevSeqId\":\""+ AppSettings.TEST_DATA.SAMPLE_DEV_ACK_SEQ_ID+"\",\"ApiUrl\":\"http://124.217.235.107:3066\", \"MAppId\":\""+ AppSettings.LOGINTYPES.ACKAPPT+ "\", \"Location\":\"ACKDemo\"}";
        // SECURITY
        // var qrJsonString1 = "{\"MAppDevSeqId\":\""+ AppSettings.TEST_DATA.SAMPLE_SECURITY_SEQ_ID+"\",\"ApiUrl\":\"http://124.217.235.107:2026\", \"MAppId\":\""+ AppSettings.LOGINTYPES.SECURITYAPP+ "\"}";
        // DISPLAY
        //   var qrJsonString1 = "{\"MAppDevSeqId\":\""+ AppSettings.TEST_DATA.SAMPLE_DISPLAY_DEV_SEQ_ID+"\",\"ApiUrl\":\"http://124.217.235.107:3067\", \"MAppId\":\""+ AppSettings.LOGINTYPES.DISPLAYAPP+ "\"}";

        var key = CryptoJS.enc.Utf8.parse('qweqweqweqweqweq');
        var iv = CryptoJS.enc.Utf8.parse('qweqweqweqweqweq');

        var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(qrJsonString1), key,
        {
            keySize: 128,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
          var qrCodeString = "" + encrypted;
          // 1001 HOST APP
          // var qrCodeString = 'o2jqjNdPaANkr4TAQK4QUSBqsZN2qkX+cxWg9WfQ5ohZjEU6Evg3rcMxk+/Ugdcex2hFM6P4LE2zMmCF/XoF6kbtLZRrN6d2wZtKDKw7wzf5ZU6E1Ud9RSlXHW9nXhMnyNXs3gJR/8IT4DDzEQdmP+K6TVrX4YXzUbuP+qEN6/U=';
          //HOSTWF 1001
        //  var qrCodeString = '1Bdg9IWu49KLrfhL8hU6JeAsWw3zP5GIdzCWAnFPnz11bpD3vS9C507kNFD1dBAvKgRqkxon3xAxkSgo9nP57wdbYrWyfyxfFmceXZvmOjvbE9TsmvT1/Jfhh+wYrNiSyx7/be5UOBSNnqLH2GVKEAsnyIrYcUvl1SQPU1E5kRA=';

        //3026 FB
        // var qrCodeString = 'JAjy9LN8AB8wHRt0BMJ4MqSSSCw4WjBwUHv8LzmWM/5fagcSKXILTm615e9l5H8mIfGEW+44G7/xXLUNEbSsewgrv5c3b8dC1uXbknygWZNylFcLYacwMhQ7BQ991ssvnBTWRS8cfHbufkNpXbDi2A==';
          //FAcility Display
          // var qrCodeString = 'IOL01+vlOtVFFbQk0tZRHV8G1p5ecpVI4nTHpoor7FqlJESbxyAyv98zjFQ0+2sBWgcuaJBA0lq5P1EBValHVBPVunS687Q8/7Hf06B4WmsOWXsylRj+rCMMx0EgAXhUReWw865+hTAeDCEKjxB1Ow==';
          //HOST 2001
          // var qrCodeString = 'o2jqjNdPaANkr4TAQK4QUSBqsZN2qkX+cxWg9WfQ5oiFeX7BsAqxUzljIRJdDWo7fjFdjd5CYtyMqUPAqE82J7INYJg3yt8iYa+5P2zoCB+8qNoUbmH80zVyCrzpZJobcHl1pkIWqja9wnesvEJzOw==';
          //ACK
          // var qrCodeString = 'qYNb75lXZms19Ri+u9GuOKEOnI+Bw2rOjRNRz3F3gK5yStsC7HV5d0FoZmKl97l5D/TzMTQCqKnahYPuTqZ6TrHijxnIJnXGCrbD93loR9n/96rUnC+77Vl8D/VZ3XTIwc3axSyZQ7DQC4g4NiQGJlH8pY7wGwxGkeDBwIRR7GA=';

          // var qrCodeString = 'o2jqjNdPaANkr4TAQK4QUSBqsZN2qkX+cxWg9WfQ5ohZjEU6Evg3rcMxk+/Ugdcex2hFM6P4LE2zMmCF/XoF6kbtLZRrN6d2wZtKDKw7wzf5ZU6E1Ud9RSlXHW9nXhMnWsmBp9G8mZXnsbxnVshwTw==';

          //Facility Display App 1001
          // var qrCodeString = 'IOL01+vlOtVFFbQk0tZRHV8G1p5ecpVI4nTHpoor7FqlJESbxyAyv98zjFQ0+2sBWgcuaJBA0lq5P1EBValHVBPVunS687Q8/7Hf06B4WmvsXGxqidWW1oDwCCbeG7M0xYw+SnR7J6F5RAATHeqKnA==';

          //SeCurity airselangor
          var qrCodeString = 'sndRQG13Bqkcb0eqGqGl+6DchZDforbmV48Mzg95uWCatmRYjPrmJy1Ir/mPwfw+P7czsyI2exHAQP67tzADnJxF02ww8RSfq6TlV/yn6KiZvSSwiw+0LMhKEzX6IC7niZG/xZyom9Bs4YZAJB5/LcigfPYIDyB0F1RtWa8nQdvFLNgVE635l+AGzAgsly9OWDMsKCIDRjXjbixTHkLONQ==';

          //Security 2001
          // var qrCodeString = 'sndRQG13Bqkcb0eqGqGl+6DchZDforbmV48Mzg95uWAq0MmJMwqMEnJN+/FqmOCBtUYX+1nAL+E2I+YaxcatPrwLlf/RgyvUhluRZaDnUGNL5t2YLmGq4DpPZkpyqVzG';
          this.processJson(qrCodeString);
    }else {
      this.options = {
        prompt : "Scan your QR Code ",
        preferFrontCamera : false, // iOS and Android
        showFlipCameraButton : true, // iOS and
        orientation: 'portrait',
        showTorchButton : true, // iOS and Android
        torchOn: false, // Android, launch with the torch switched on (if available)
        resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
        disableAnimations : false, // iOS
        disableSuccessBeep: false // iOS and Android
      }
      this.barcodeScanner.scan(this.options).then(async (barcodeData) => {
        var dd = barcodeData.text;
        // var dd = this.findAndReplace(barcodeData.text, " ", "+");
        console.log(dd);
        var scanData = this.decrypt(dd);
        console.log(scanData);
        if(scanData == ""){
          invalidQRCode = true;
          this.scannedJson = null;
        } else{
          try{
            this.scannedJson = JSON.parse(scanData);
            if(this.scannedJson.ApiUrl.indexOf("/api") > -1){
              this.scannedJson.ApiUrl = this.scannedJson.ApiUrl.split("/api")[0];
            }
          }catch(e){
            var message  = this.T_SVC['ACC_MAPPING.INVALID_QR'];
            let alert = this.alertCtrl.create({
              header: 'Error !',
              message: message,
              cssClass:'',
              buttons: ['Okay']
              });
              (await alert).present();
              return;
          }

          this.VM.host_search_id = this.scannedJson.HostId;
          //Comment this line
          // this.scannedJson.MAppId = AppSettings.LOGINTYPES.HOSTAPPT;
          if(this.scannedJson.MAppId == AppSettings.LOGINTYPES.SECURITYAPP || this.scannedJson.MAppId == AppSettings.LOGINTYPES.ACKAPPT || this.scannedJson.MAppId == AppSettings.LOGINTYPES.DISPLAYAPP){
            invalidORG = invalidQRCode = false;
          }else{
            invalidORG = invalidQRCode = this.scannedJson.CompanyId == undefined || this.scannedJson.CompanyId == null || this.scannedJson.CompanyId == "" ;
          }

        }

        if(!invalidQRCode){
          if(invalidORG){
            this.STOPS = 'STOP2';
          } else {
            if(this.scannedJson.MAppId == AppSettings.LOGINTYPES.ACKAPPT){
              if(!this.scannedJson.MAppDevSeqId){
                this.scannedJson.MAppDevSeqId = this.scannedJson.MAppSeqId;
              }
              this.checkDeviceRegisteredOrNot();
              return;
            }else if(this.scannedJson.MAppId == AppSettings.LOGINTYPES.DISPLAYAPP){
              if(!this.scannedJson.MAppDevSeqId){
                this.scannedJson.MAppDevSeqId = this.scannedJson.MAppSeqId;
              }
              this.GetDisplayAppDeviceInfo();
              return;
            }
            else if(this.scannedJson.MAppId == AppSettings.LOGINTYPES.SECURITYAPP){
              if(!this.scannedJson.MAppDevSeqId){
                this.scannedJson.MAppDevSeqId = this.scannedJson.MAppSeqId;
              }
              this.GetSecurityAppDeviceInfo();
              return;
            }
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO,JSON.stringify(this.scannedJson));
            var params = {"CompanyID":""+this.scannedJson.CompanyId};
            this.apiProvider.GetAppDetails(params).then(
              (val) => {
                console.log("val : "+JSON.stringify(val));
                this.companyInfo = val;
                window.localStorage.setItem(AppSettings.LOCAL_STORAGE.COMPANY_DETAILS,JSON.stringify(this.companyInfo));
                this.companyImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/PortalImageHandler.ashx?RefSlno='+ this.scannedJson.CompanyId+"&ScreenType=20&Refresh="+ new Date().getTime();

                if(this.scannedJson.MAppId){
                  switch(this.scannedJson.MAppId){
                    case AppSettings.LOGINTYPES.HOSTAPPT:
                      this.STOPS = 'STOP2';
                      break;
                    case AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP:
                      this.STOPS = 'STOP2';
                      break;
                    case AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS:
                      this.STOPS = 'STOP2';
                      break;
                    case AppSettings.LOGINTYPES.FACILITY:
                      this.STOPS = 'STOP2';
                      break;
                    case AppSettings.LOGINTYPES.SECURITYAPP:
                      this.STOPS = 'STOP2';
                      break;
                    case AppSettings.LOGINTYPES.DISPLAYAPP:
                      this.navCtrl.navigateRoot('facility-kiosk-display');
                      break;
                    case AppSettings.LOGINTYPES.ACKAPPT:
                      this.navCtrl.navigateRoot('sign-pad-idle-page');
                      break;
                    default:
                      this.STOPS = 'STOP2';
                      console.log("default : "+ this.scannedJson.MAppId);
                      break;

                  }

                }else{
                  this.STOPS = 'STOP2';
                }

              },
              async (err) => {
                console.log("error : "+JSON.stringify(err));
                if(err && err.message == "No Internet"){
                  return;
                }

                try {
                  var result = JSON.parse(err.toString());
                  if(result.message){
                    let alert = this.alertCtrl.create({
                      header: 'Error !',
                      message: result.message,
                      cssClass:'',
                      buttons: ['Okay']
                      });
                      (await alert).present();
                      return;
                  }
                } catch (error) {

                }

                if(err && err.message && err.message.indexOf("404 Not Found")){
                  message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
                  let alert = this.alertCtrl.create({
                    header: 'Error !',
                    message: message,
                    cssClass:'',
                    buttons: ['Okay']
                    });
                    (await alert).present();
                    return;
                }

                if(err.Table1 && err.Table1.length == 0){
                  var message  = this.T_SVC['ALERT_TEXT.DATA_NOT_FOUND'];
                  let alert = this.alertCtrl.create({
                    header: 'Error !',
                    message: message,
                    cssClass:'',
                    buttons: ['Okay']
                    });
                    (await alert).present();
                    return;
                }

                if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
                  message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
                  let alert = this.alertCtrl.create({
                    header: 'Error !',
                    message: message,
                    cssClass:'',
                    buttons: ['Okay']
                    });
                    (await alert).present();
                    return;
                }
                let invalidORGConfirm = this.alertCtrl.create({
                  header:"<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_ORG_TITLE'] + '</span>',
                  message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_ORG_DETAIL'] + '</span>',
                  cssClass:'',
                  buttons: [
                    {
                      text: this.T_SVC['COMMON.OK'],
                      role: 'cancel',
                      handler: () => {
                      }
                    }
                  ]
                });
                (await invalidORGConfirm).present();
              }
            );
          }
        } else {
          console.log("Error occured : " + JSON.stringify(this.scannedJson));
          let invalidQRConfirm = await this.alertCtrl.create({
            header: 'Error !',
            message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>',

            cssClass: '',
            buttons: [
              {
                text: this.T_SVC['COMMON.OK'],
                role: 'cancel',
                handler: () => {
                }
              }
            ]
          });
          invalidQRConfirm.present();
        }
    }, async (err) => {
        console.log("Error occured : " + err);
        let invalidQRConfirm = this.alertCtrl.create({
          header: 'Error !',
          message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>',

          cssClass: '',
          buttons: [
            {
              text: this.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        (await invalidQRConfirm).present();
    });
    }
  }

  async showAlert(){
    let invalidQRConfirm = await this.alertCtrl.create({
      header: 'Error !',
      message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>',
      cssClass: '',

      buttons: [
        {
          text: this.T_SVC['COMMON.OK'],
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    invalidQRConfirm.present();
  }

  async processJson(qrCodeString){

    console.log("New encrypt: "+ qrCodeString);
    var testQr = qrCodeString;
    //var  testQr = "1CQ/V6dC0hvxVJGNkp0ST8Cmgy1 5obPUsCvDHOsTDx/QPFVmbcnFmJOnGYBpK4e4VGgKKPOtsQ5TeUdHI9MBIR6JMlXzY2DbydgZY JQVnQ1rPKC6R sbWC8Z2bkLcp"
    // var testQr = "12345KQCvWA6nnLWEx3R75yj0nKt102YtHO6R2u4GXVSc/DAlAJltSHUucrncKYz/IxdN+EilpEnfBOmSRjtTWDFgAeZHR5OmSo0cn26te710F5qbE19xBcqRW5Vka075iOWw";
    var scanData = this.decrypt(testQr);
    // var scanData1 = this.decrypt("tj7giUScblByz+O3ODrG6g==", "qweqweqweqweqweq", "qweqweqweqweqweq");
    // this.scannedJson.MAppId = AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS;
    console.log(scanData);
    try{
      this.scannedJson = JSON.parse(scanData);
      if(this.scannedJson.ApiUrl.indexOf("/api") > -1){
        this.scannedJson.ApiUrl = this.scannedJson.ApiUrl.split("/api")[0];
      }
    }catch(e){
      var message  = "Invalid Data";
      let alert = await this.alertCtrl.create({
        header: 'Error !',
        message: message,
        cssClass: '',
        buttons: ['Okay']
      });
        alert.present();
        return;
    }
    if(!this.scannedJson.HostId){
      this.scannedJson.HostId = this.scannedJson.HostIc;
    }

    if(this.scannedJson.MAppId == AppSettings.LOGINTYPES.ACKAPPT){
      if(!this.scannedJson.MAppDevSeqId){
        this.scannedJson.MAppDevSeqId = this.scannedJson.MAppSeqId;
      }
      this.checkDeviceRegisteredOrNot();
      return;
    }else if(this.scannedJson.MAppId == AppSettings.LOGINTYPES.DISPLAYAPP){
      if(!this.scannedJson.MAppDevSeqId){
        this.scannedJson.MAppDevSeqId = this.scannedJson.MAppSeqId;
      }
      this.GetDisplayAppDeviceInfo();
      return;
    }else if(this.scannedJson.MAppId == AppSettings.LOGINTYPES.SECURITYAPP){
      if(!this.scannedJson.MAppDevSeqId){
        this.scannedJson.MAppDevSeqId = this.scannedJson.MAppSeqId;
      }
      this.GetSecurityAppDeviceInfo();
      return;
    }
    window.localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO,JSON.stringify(this.scannedJson));
    var params = {"CompanyID":""+this.scannedJson.CompanyId};
    this.VM.host_search_id = this.scannedJson.HostId;
    this.apiProvider.GetAppDetails(params).then(
      (val) => {
        this.companyInfo = val;
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.COMPANY_DETAILS,JSON.stringify(this.companyInfo));
        this.companyImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/PortalImageHandler.ashx?RefSlno='+ this.scannedJson.CompanyId +"&ScreenType=20&Refresh="+ new Date().getTime();
        if(this.scannedJson.MAppId){
          switch(this.scannedJson.MAppId){
            case AppSettings.LOGINTYPES.HOSTAPPT:
              this.STOPS = 'STOP2';
              break;
            case AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP:
              this.STOPS = 'STOP2';
              break;
            case AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS:
              this.STOPS = 'STOP2';
              break;
            case AppSettings.LOGINTYPES.FACILITY:
              this.STOPS = 'STOP2';
              break;
            case AppSettings.LOGINTYPES.SECURITYAPP:
              this.STOPS = 'STOP2';
              break;
            case AppSettings.LOGINTYPES.DISPLAYAPP:
              this.navCtrl.navigateRoot('facility-kiosk-display');
              break;
            case AppSettings.LOGINTYPES.ACKAPPT:
              this.navCtrl.navigateRoot('sign-pad-idle-page');
              break;
          }

        }else{
          this.STOPS = 'STOP2';
        }
      },
      async (err) => {

        if(err && err.message == "No Internet"){
          return;
        }
        try {
          var result = JSON.parse(err.toString());
          if(result.message){
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: result.message,
              cssClass: '',
              buttons: ['Okay']
            });
              alert.present();
              return;
          }
        } catch (error) {

        }
        if(err && err.message && err.message.indexOf("404 Not Found")){
          message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
            return;
        }

        if(err.Table1 && err.Table1.length == 0){
          var message  = this.T_SVC['ALERT_TEXT.DATA_NOT_FOUND'];
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
            return;
        }


        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
          message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
            return;
        }


        let invalidORGConfirm = await this.alertCtrl.create({
          header: this.T_SVC['ACC_MAPPING.INVALID_ORG_TITLE'],
          message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVAYLID_ORG_DETAIL'] + '</span>',
          cssClass: '',
          buttons: [
            {
              text: this.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        invalidORGConfirm.present();
      }
    );
  }

  checkDeviceRegisteredOrNot(){
    var _MyClassVar = this;
    var params = {
      "MAppDevSeqId":""+this.scannedJson.MAppDevSeqId,
      "DeviceUID": AppSettings.TEST_DATA.SAMPLE_DEVICE_ID

    }
    if(this.device.uuid){
      params = {
        "MAppDevSeqId": this.scannedJson.MAppDevSeqId,
        "DeviceUID":this.device.uuid
        }
    }
    this.apiProvider.GetAckAppDeviceInfo(params,this.scannedJson.ApiUrl).then(
      (val) => {

        var result = JSON.parse(val+"");
        _MyClassVar.hostInfo = result.Table1[0];
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.ACK_DETAILS,JSON.stringify(_MyClassVar.hostInfo));

        this.VM.DevicePlatform = this.hostInfo.DevicePlatform;
        if(this.hostInfo && this.hostInfo.DeviceDetails){
          try{
            this.VM.DeviceDetails = JSON.parse(this.hostInfo.DeviceDetails);
          }catch(e){
            this.VM.DeviceDetails = this.hostInfo.DeviceDetails;
          }
        }
        if(this.device.uuid){
          if(result.Table2 && result.Table2.length > 0){
            this.VM.if_already_mapped = false;
            this.VM.if_already_registered_same_device = true;
          } else if(this.hostInfo.DeviceUID && this.hostInfo.DeviceUID != this.device.uuid){
            this.VM.if_already_mapped = true;
            this.VM.if_already_registered_same_device = false;
          } else {
            this.VM.if_already_mapped = false;
            this.VM.if_already_registered_same_device = false;
          }

        }else if(result.Table2 && result.Table2.length > 0){
          this.VM.if_already_mapped = false;
          this.VM.if_already_registered_same_device = true;
        }else if(this.hostInfo.DeviceUID && AppSettings.TEST_DATA.SAMPLE_DEVICE_ID != this.hostInfo.DeviceUID){
          this.VM.if_already_mapped = true;
          this.VM.if_already_registered_same_device = false;
        }else{
          this.VM.if_already_mapped = false;
          this.VM.if_already_registered_same_device = false;
        }

        if(this.scannedJson.MAppId){
          switch(this.scannedJson.MAppId){
            case AppSettings.LOGINTYPES.DISPLAYAPP:
              //this.STOPS = 'STOP3';
              break;
            case AppSettings.LOGINTYPES.ACKAPPT:
              this.STOPS = 'STOP4';
              break;
          }

        }else{
          this.STOPS = 'STOP2';
        }
      },
      async (err) => {

        if(err && err.message == "No Internet"){
          return;
        }
        try {
          var result = JSON.parse(err.toString());
          if(result.message){
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: result.message,
              cssClass: '',
              buttons: ['Okay']
            });
              alert.present();
              return;
          }
        } catch (error) {

        }
        if(err && err.message){

          // this.crashlytics.addLog("Error while loading data");
          // this.crashlytics.sendNonFatalCrash(err.message || err);

          this.file.writeFile(this.file.externalDataDirectory, 'testlog.txt', err.message, {replace: true})
          .then(() => {
          })
          .catch((err) => {
            console.error(err);
          });
        }

        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
         var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
            return;
        }


        let invalidORGConfirm = await this.alertCtrl.create({
          header: "Error",
          message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.CANT_FIND_LICENSE'] + '</span>',
          cssClass: '',
          buttons: [
            {
              text: this.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        invalidORGConfirm.present();
      }
    );
  }

  GetSecurityAppDeviceInfo(){
    var _MyClassVar = this;
    var MAppSeqId = this.scannedJson.MAppDevSeqId;
    if(!MAppSeqId){
      MAppSeqId = this.scannedJson.MAppSeqId;
    }
    var params = {
      "MAppDevSeqId": MAppSeqId,
      "DeviceUID": AppSettings.TEST_DATA.SAMPLE_DEVICE_ID

    }
    if(this.device.uuid){
      params = {
        "MAppDevSeqId": MAppSeqId,
        "DeviceUID":this.device.uuid
        }
    }
    this.apiProvider.GetSecurityAppDeviceInfo(params,this.scannedJson.ApiUrl).then(
      (val) => {
        var result = JSON.parse(val+"");
        _MyClassVar.hostInfo = result.Table1[0];
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS,JSON.stringify(_MyClassVar.hostInfo));

        this.VM.DevicePlatform = this.hostInfo.DevicePlatform;
        if(this.hostInfo && this.hostInfo.DeviceDetails){
          try{
            this.VM.DeviceDetails = JSON.parse(this.hostInfo.DeviceDetails);
          }catch(e){
            this.VM.DeviceDetails = this.hostInfo.DeviceDetails;
          }
        }
        if(this.device.uuid){
          if(result.Table2 && result.Table2.length > 0){
            this.VM.if_already_mapped = false;
            this.VM.if_already_registered_same_device = true;
          } else if(this.hostInfo.DeviceUID && this.hostInfo.DeviceUID != this.device.uuid){
            this.VM.if_already_mapped = true;
            this.VM.if_already_registered_same_device = false;
          } else {
            this.VM.if_already_mapped = false;
            this.VM.if_already_registered_same_device = false;
          }

        }else if(result.Table2 && result.Table2.length > 0){
          this.VM.if_already_mapped = false;
          this.VM.if_already_registered_same_device = true;
        }else if(this.hostInfo.DeviceUID && AppSettings.TEST_DATA.SAMPLE_DEVICE_ID != this.hostInfo.DeviceUID){
          this.VM.if_already_mapped = true;
          this.VM.if_already_registered_same_device = false;
        }else{
          this.VM.if_already_mapped = false;
          this.VM.if_already_registered_same_device = false;
        }

        if(this.scannedJson.MAppId){
          switch(this.scannedJson.MAppId){
            case AppSettings.LOGINTYPES.DISPLAYAPP:
              this.STOPS = 'STOP4';
              break;
            case AppSettings.LOGINTYPES.ACKAPPT:
              this.STOPS = 'STOP4';
              break;
            case AppSettings.LOGINTYPES.SECURITYAPP:
              this.STOPS = 'STOP4';
              break;
          }

        }else{
          this.STOPS = 'STOP2';
        }
      },
      async (err) => {

        if(err && err.message == "No Internet"){
          return;
        }
        try {
          var result = JSON.parse(err.toString());
          if(result.message){
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: result.message,
              cssClass: '',
              buttons: ['Okay']
            });
              alert.present();
              return;
          }
        } catch (error) {

        }

        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
         var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
            return;
        }


        let invalidORGConfirm = await this.alertCtrl.create({
          header: "Error",
          message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.CANT_FIND_LICENSE'] + '</span>',
          cssClass: '',
          buttons: [
            {
              text: this.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        invalidORGConfirm.present();
      }
    );
  }

  GetDisplayAppDeviceInfo(){
    var _MyClassVar = this;

    var MAppSeqId = this.scannedJson.MAppDevSeqId;
    if(!MAppSeqId){
      MAppSeqId = this.scannedJson.MAppSeqId;
    }

    var params = {
      "MAppDevSeqId": MAppSeqId,
      "DeviceUID": AppSettings.TEST_DATA.SAMPLE_DEVICE_ID

    }
    if(this.device.uuid){
      params = {
        "MAppDevSeqId": MAppSeqId,
        "DeviceUID":this.device.uuid
        }
    }
    this.apiProvider.GetDisplayAppDeviceInfo(params,this.scannedJson.ApiUrl).then(
      (val) => {
        var result = JSON.parse(val+"");
        _MyClassVar.hostInfo = result.Table1[0];
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.DISPLAY_DETAILS,JSON.stringify(_MyClassVar.hostInfo));

        this.VM.DevicePlatform = this.hostInfo.DevicePlatform;
        if(this.hostInfo && this.hostInfo.DeviceDetails){
          try{
            this.VM.DeviceDetails = JSON.parse(this.hostInfo.DeviceDetails);
          }catch(e){
            this.VM.DeviceDetails = this.hostInfo.DeviceDetails;
          }
        }
        if(this.device.uuid){
          if(result.Table2 && result.Table2.length > 0){
            this.VM.if_already_mapped = false;
            this.VM.if_already_registered_same_device = true;
          } else if(this.hostInfo.DeviceUID && this.hostInfo.DeviceUID != this.device.uuid){
            this.VM.if_already_mapped = true;
            this.VM.if_already_registered_same_device = false;
          } else {
            this.VM.if_already_mapped = false;
            this.VM.if_already_registered_same_device = false;
          }

        }else if(result.Table2 && result.Table2.length > 0){
          this.VM.if_already_mapped = false;
          this.VM.if_already_registered_same_device = true;
        }else if(this.hostInfo.DeviceUID && AppSettings.TEST_DATA.SAMPLE_DEVICE_ID != this.hostInfo.DeviceUID){
          this.VM.if_already_mapped = true;
          this.VM.if_already_registered_same_device = false;
        }else{
          this.VM.if_already_mapped = false;
          this.VM.if_already_registered_same_device = false;
        }

        if(this.scannedJson.MAppId){
          switch(this.scannedJson.MAppId){
            case AppSettings.LOGINTYPES.DISPLAYAPP:
              this.STOPS = 'STOP4';
              break;
            case AppSettings.LOGINTYPES.ACKAPPT:
              this.STOPS = 'STOP4';
              break;
          }

        }else{
          this.STOPS = 'STOP2';
        }
      },
      async (err) => {

        if(err && err.message == "No Internet"){
          return;
        }
        try {
          var result = JSON.parse(err.toString());
          if(result.message){
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: result.message,
              cssClass: '',
              buttons: ['Okay']
            });
              alert.present();
              return;
          }
        } catch (error) {

        }

        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
         var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
            return;
        }


        let invalidORGConfirm = await this.alertCtrl.create({
          header: "Error",
          message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.CANT_FIND_LICENSE'] + '</span>',
          cssClass: '',
          buttons: [
            {
              text: this.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        invalidORGConfirm.present();
      }
    );
  }

  takeActionForack(){
    if(this.scannedJson.MAppId == AppSettings.LOGINTYPES.ACKAPPT){
      this.SaveAckAppDeviceInfo();
      return;
    }else if(this.scannedJson.MAppId == AppSettings.LOGINTYPES.SECURITYAPP){
      localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO,JSON.stringify(this.scannedJson));
      const navigationExtras: NavigationExtras = {
        state: {
          passData: { "QR_DETAIL": this.scannedJson,
        }
        }
      };
      this.router.navigate(['login'], navigationExtras);
      return;
    }else if(this.scannedJson.MAppId == AppSettings.LOGINTYPES.DISPLAYAPP){
      this.SaveDisplayAppDeviceInfo();
      return;
    }

  }


  SaveDisplayAppDeviceInfo(){
    var token = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.FCM_ID);
      if(!this.platform.is('cordova')) {
        token = "crINLpP4e9s:APA91bFQ7slN5VncMGZTdJJ49N3h1rZC0zYwpcv78xzO-sXG-NFTouko6v-yvnut9tkMm-YX5I0kAUlwCRaE7j5cJGYVeSgQy5UOj9TICLahItYkX70O0LwZpMTF5kD17iX2vLAiwl3g";
      }else if(!token){
        token = "";
      }
      var MAppSeqId = this.scannedJson.MAppDevSeqId;
      if(!MAppSeqId){
        MAppSeqId = this.scannedJson.MAppSeqId;
      }
      var params1 = {
          "PushNotificationId":token,
          "MAppDevSeqId": MAppSeqId,
          "DeviceUID":AppSettings.TEST_DATA.SAMPLE_DEVICE_ID,
          "DevicePlatform":"Android",
          "DeviceDetails":JSON.stringify({
           "manufacturer": "samsung",
           "version": "6.0.1",
           "model": "SM-G532G"
          })
      }
      if(this.device.uuid){
        params1 = {
          "PushNotificationId":token,
          "MAppDevSeqId": MAppSeqId,
          "DeviceUID":this.device.uuid,
          "DevicePlatform":this.device.platform,
          "DeviceDetails":JSON.stringify({
           "manufacturer": this.device.manufacturer,
           "version": this.device.version,
           "model": this.device.model
          })
        };
      }

    this.apiProvider.SaveDisplayAppDeviceInfo(params1, this.scannedJson.ApiUrl).then(
      (val) => {
        if(this.scannedJson.MAppId){
          switch(this.scannedJson.MAppId){
            case AppSettings.LOGINTYPES.DISPLAYAPP:
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO,JSON.stringify(this.scannedJson));
              this.navCtrl.navigateRoot('facility-kiosk-display');
              break;
            case AppSettings.LOGINTYPES.ACKAPPT:
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO,JSON.stringify(this.scannedJson));
              this.navCtrl.navigateRoot('sign-pad-idle-page');
              break;
          }

        }else{
          this.STOPS = 'STOP2';
        }
      },
      async (err) => {

        if(err && err.message == "No Internet"){
          return;
        }
        try {
          var result = JSON.parse(err.toString());
          if(result.message){
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: result.message,
              cssClass: '',
              buttons: ['Okay']
            });
              alert.present();
              return;
          }
        } catch (error) {

        }

        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
         var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
            return;
        }


        let invalidORGConfirm = await this.alertCtrl.create({
          header: "Error",
          message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.CANT_FIND_LICENSE'] + '</span>',
          cssClass: '',
          buttons: [
            {
              text: this.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        invalidORGConfirm.present();
      }
    );
  }

  SaveAckAppDeviceInfo(){
    var token = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.FCM_ID);
      if(!this.platform.is('cordova')) {
        token = "crINLpP4e9s:APA91bFQ7slN5VncMGZTdJJ49N3h1rZC0zYwpcv78xzO-sXG-NFTouko6v-yvnut9tkMm-YX5I0kAUlwCRaE7j5cJGYVeSgQy5UOj9TICLahItYkX70O0LwZpMTF5kD17iX2vLAiwl3g";
      }else if(!token){
        token = "";
      }
      var MAppSeqId = this.scannedJson.MAppDevSeqId;
      if(!MAppSeqId){
        MAppSeqId = this.scannedJson.MAppSeqId;
      }
      var params1 = {
          "PushNotificationId":token,
          "MAppDevSeqId": MAppSeqId,
          "DeviceUID":AppSettings.TEST_DATA.SAMPLE_DEVICE_ID,
          "DevicePlatform":"Android",
          "DeviceDetails":JSON.stringify({
           "manufacturer": "samsung",
           "version": "6.0.1",
           "model": "SM-G532G"
          })
      }
      if(this.device.uuid){
        params1 = {
          "PushNotificationId":token,
          "MAppDevSeqId": MAppSeqId,
          "DeviceUID":this.device.uuid,
          "DevicePlatform":this.device.platform,
          "DeviceDetails":JSON.stringify({
           "manufacturer": this.device.manufacturer,
           "version": this.device.version,
           "model": this.device.model
          })
        };
      }

    this.apiProvider.SaveAckAppDeviceInfo(params1, this.scannedJson.ApiUrl).then(
      (val) => {
        if(this.scannedJson.MAppId){
          switch(this.scannedJson.MAppId){
            case AppSettings.LOGINTYPES.DISPLAYAPP:
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO,JSON.stringify(this.scannedJson));
              //this.STOPS = 'STOP3';
              this.navCtrl.navigateRoot('facility-kiosk-display');
              break;
            case AppSettings.LOGINTYPES.ACKAPPT:
              var jobj = JSON.parse(val+"");
              this.scannedJson.type = jobj.AppType;
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO,JSON.stringify(this.scannedJson));
              this.navCtrl.navigateRoot('sign-pad-idle-page');
              break;
          }

        }else{
          this.STOPS = 'STOP2';
        }
      },
      async (err) => {

        if(err && err.message == "No Internet"){
          return;
        }
        try {
          var result = JSON.parse(err.toString());
          if(result.message){
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: result.message,
              cssClass: '',
              buttons: ['Okay']
            });
              alert.present();
              return;
          }
        } catch (error) {

        }

        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
         var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
            return;
        }


        let invalidORGConfirm = await this.alertCtrl.create({
          header: "Error",
          message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.CANT_FIND_LICENSE'] + '</span>',
          cssClass: '',
          buttons: [
            {
              text: this.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        invalidORGConfirm.present();
      }
    );
  }


  findAndReplace(string, target, replacement) {

    var i = 0, length = string.length;

    for (i; i < length; i++) {

      string = string.replace(target, replacement);

    }

    return string;

   }


  decrypt(encryptText){

    // encryptText = "ksuR3mg7Fb8/145cfgEnFqgJN4UfgLt64XDCPAAMwriqMhjG0OLFG09tX+fkrPdF";

    var key = CryptoJS.enc.Utf8.parse('qweqweqweqweqweq');
    var iv = CryptoJS.enc.Utf8.parse('qweqweqweqweqweq');

    var decrypted = CryptoJS.AES.decrypt(encryptText, key, {
        keySize: 128,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    var resultdata = "";
    try{
      resultdata = decrypted.toString(CryptoJS.enc.Utf8)
    }catch(e){

    }

    console.log("New Decrypt: "+resultdata);
    return resultdata;


    // var salt = [172, 137, 25, 56, 156, 100, 136, 211, 84, 67, 96, 10, 24, 111, 112, 137, 3];
    // var len = salt.length;

    // if(encryptText == null || encryptText == ""){
    //   return "";
    // }

    // // Convert
    // var words = [];
    // for (var i = 0; i < len; i++) {
    //     words[i >>> 2] |= (salt[i] & 0xff) << (24 - (i % 4) * 8);
    // }

    // var salt1 =  CryptoJS.lib.WordArray.create(words, len);

    // var key1 = CryptoJS.PBKDF2(password, salt1, {
    //     keySize: 4,
    //     iterations: 1024
    // });

    // var derivedKey = key1.toString(CryptoJS.enc.Base64)
    // var aesKey = CryptoJS.enc.Base64.parse(derivedKey);
    // var aesIv = CryptoJS.enc.Utf8.parse(iv);

    // var y = CryptoJS.AES.decrypt(encryptText, aesKey, {
    //     iv: aesIv
    // });

    // var ytext = y.toString(CryptoJS.enc.Utf8);
    // return ytext;

}

  takeActionForGoBack(stop){
    this.STOPS = stop;
  }
  takeActionForProceed(stop){
    if(stop == "FINISH"){
      var token = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.FCM_ID);
      if(!this.platform.is('cordova')) {
        token = "crINLpP4e9s:APA91bFQ7slN5VncMGZTdJJ49N3h1rZC0zYwpcv78xzO-sXG-NFTouko6v-yvnut9tkMm-YX5I0kAUlwCRaE7j5cJGYVeSgQy5UOj9TICLahItYkX70O0LwZpMTF5kD17iX2vLAiwl3g";
      }else if(!token){
        token = "YX5I0kAUlwCRaE7j5cJGYVeSgQy5UOj9TICLahItYkX70O0LwZpMTF5kD17iX2vLAiwl3g";
      }
      var params1 = {
          "PushNotificationId":token,
          "STAFF_IC": this.hostInfo.HOSTIC,
          "DeviceUID":AppSettings.TEST_DATA.SAMPLE_DEVICE_ID,
          "DevicePlatform":"Android",
          "DeviceDetails":JSON.stringify({
           "manufacturer": "samsung",
           "version": "6.0.1",
           "model": "SM-G532G"
          })
      }
      if(this.device.uuid){
        params1 = {
          "PushNotificationId":token,
          "STAFF_IC": this.hostInfo.HOSTIC,
          "DeviceUID":this.device.uuid,
          "DevicePlatform":this.device.platform,
          "DeviceDetails":JSON.stringify({
           "manufacturer": this.device.manufacturer,
           "version": this.device.version,
           "model": this.device.model
          })
        };
      }


      this.apiProvider.SavePushNotificationId(params1).then(
        (val) => {
          this.menu.enable(true,"myLeftMenu");
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS,JSON.stringify(this.hostInfo));
          if(this.scannedJson.MAppId){
            switch(this.scannedJson.MAppId){
              case AppSettings.LOGINTYPES.SECURITYAPP:
                this.navCtrl.navigateRoot('security-dash-board-page');
                break;
              case AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS:
                this.navCtrl.navigateRoot('home-tams');
                break;
              default:
                this.navCtrl.navigateRoot('');
                break;
            }
          }else{
            this.navCtrl.navigateRoot('');
          }

        },
        async (err) => {

          if(err && err.message == "No Internet"){
            return;
          }
          try {
            var result = JSON.parse(err.toString());
            if(result.message){
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: result.message,
                cssClass: '',
                buttons: ['Okay']
              });
                alert.present();
                return;
            }
          } catch (error) {

          }
          if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
            var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: message,
              cssClass: '',
              buttons: ['Okay']
            });
              alert.present();
              return;
          }
          let invalidORGConfirm = await this.alertCtrl.create({
            header: this.T_SVC['ACC_MAPPING.FCM_TITLE'],
            message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_FCM_TITLE'] + '</span>',
            cssClass: '',
            buttons: [
              {
                text: this.T_SVC['COMMON.OK'],
                role: 'cancel',
                handler: () => {
                }
              }
            ]
          });
          invalidORGConfirm.present();
        }
      );
    } else{
      var params = {
        "SearchString":""+this.VM.host_search_id,
        "DeviceUID": ""
      };
      if(!this.platform.is('cordova')) {
        params.DeviceUID = AppSettings.TEST_DATA.SAMPLE_DEVICE_ID
      }else{
        params.DeviceUID = this.device.uuid;
      }
      this.apiProvider.GetValidateHost(params).then(
        (val) => {
          var result = JSON.parse(val+"");
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.COMPANY_DETAILS,JSON.stringify(this.companyInfo));
          this.hostInfo = result.Table1[0];
          if (!this.hostInfo.BRANCH_ID){
            this.hostInfo.BRANCH_ID = result.Table2[0].RefBranchSeqId;
          }
          if (!this.hostInfo.HOST_ID){
            this.hostInfo.HOST_ID = this.hostInfo.HOSTIC;
          }
          this.hostImage =  JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/PortalImageHandler.ashx?RefSlno='+  Math.round(this.hostInfo.SEQID) + "&ScreenType=30&Refresh="+ new Date().getTime();
          if(result && result.Table2 && result.Table2.length > 0){
            if(result.Table2[0].Active){
              this.VM.DevicePlatform = result.Table2[0].DevicePlatform;
              if(result.Table2[0] && result.Table2[0].DeviceDetails){
                try{
                  this.VM.DeviceDetails = JSON.parse(result.Table2[0].DeviceDetails);
                }catch(e){
                  this.VM.DeviceDetails = result.Table2[0].DeviceDetails;
                }
              }
              if(this.device.uuid){
                if(this.device.uuid == result.Table2[0].DeviceUID){
                  this.VM.if_already_mapped = false;
                } else if(result.Table2[0].DeviceUID){
                  this.VM.if_already_mapped = true;
                }else {
                  this.VM.if_already_mapped = false;
                }

              }else if(AppSettings.TEST_DATA.SAMPLE_DEVICE_ID == result.Table2[0].DeviceUID){
                this.VM.if_already_mapped = false;
              }else if(result.Table2[0].DeviceUID){
                this.VM.if_already_mapped = true;
              }else{
                this.VM.if_already_mapped = false;
              }

              if(result.Table3 && result.Table3.length > 0){
                this.VM.if_already_registered_same_device = true;
              }else{
                this.VM.if_already_registered_same_device = false;
              }

            }

          }else{
            this.VM.if_already_mapped = false;
            if(result.Table3 && result.Table3.length > 0){
              this.VM.if_already_registered_same_device = true;
            }else{
              this.VM.if_already_registered_same_device = false;
            }
          }

          this.STOPS = stop;
        },
        async (err) => {

          if(err && err.message == "No Internet"){
            return;
          }
          try {
            var result = JSON.parse(err.toString());
            if(result.message){
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: result.message,
                cssClass: '',
                buttons: ['Okay']
              });
                alert.present();
                return;
            }
          } catch (error) {

          }
          if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
            var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: message,
              cssClass: '',
              buttons: ['Okay']
            });
              alert.present();
              return;
          }

          let invalidORGConfirm = await this.alertCtrl.create({
            header: "Error",
            message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_HOST'] + '</span>',
            cssClass: '',
            buttons: [
              {
                text: this.T_SVC['COMMON.OK'],
                role: 'cancel',
                handler: () => {
                }
              }
            ]
          });
          invalidORGConfirm.present();
        }
      );
    }
  }

  async moveToManualRegistration(){
    // this.navCtrl.push('AccountMapping2Page');
    let alert = await this.alertCtrl.create({
      header: 'Manual  Registration',
      cssClass: '',
      inputs: [
        {
          name: 'RegKey',
          placeholder: this.T_SVC['ACC_MAPPING.TYPE_MANUAL_PLACE_HOLDER']
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');

          }
        },
        {
          text: this.T_SVC['ACC_MAPPING.PROCEED'],
          handler: data => {
            if (data.RegKey) {
              // logged in!
              this.processJson(data.RegKey);
            } else {
              // invalid login
              return false;
            }
          }
        }
      ]
    });
    alert.present();
  }
}
