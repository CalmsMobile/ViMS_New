import { Component, OnInit } from '@angular/core';
import {AppSettings} from '../../services/app-settings'
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import * as CryptoJS from 'crypto-js';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { TranslateService } from '@ngx-translate/core';
import { ToastController, Platform, LoadingController, ModalController, NavParams, AlertController } from '@ionic/angular';
import { RestProvider } from 'src/app/providers/rest/rest';
import { DatePipe } from '@angular/common';
import { CommonUtil } from 'src/app/services/util/CommonUtil';

/**
 * Generated class for the CustomVisitorPopupComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'custom-visitor-popup',
  templateUrl: 'custom-visitor-popup.html'
})
export class CustomVisitorPopupComponent implements OnInit{

  text: string;
  visitor: any = {};
  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage":"assets/images/profile_bg.jpg"
  };
  imageURLType: any = "&RefType=QR&Refresh="+ new Date().getTime();
  visitorType ="&RefType=VPB&Refresh=";
  aptid:any = "";
  aptgid:any = "";
  cid:any = "";
  // qrCodeString: any = "";
  qrJsonString1:any = "";
  T_SVC:any;
  qrCodePath = '';
  userImgPath = ''
  INTERVAL: any;
  TIMEOUT = 0;
  IsDynamicQR = false;
  settings: any;
  constructor(public viewCtrl: ModalController,
    public toastCtrl: ToastController,
    private apiProvider: RestProvider,
    private datePipe: DatePipe,
    private commonUtil: CommonUtil,
    private androidPermissions : AndroidPermissions,
    private alertCtrl: AlertController,
    private loadingCtrl : LoadingController,
    private translate: TranslateService,
    private transfer: FileTransfer, private file: File,
    public socialSharing: SocialSharing,
    public navParams: NavParams) {
      this.visitor = navParams.data.data.visitor;
      this.aptid = navParams.data.data.aptid;
      this.aptgid = navParams.data.data.aptgid;
      this.cid = navParams.data.data.cid;
      var HexCode = navParams.data.data.HexCode;
      const sett = navParams.data.data.appointmentSettingsDetails;
      if (sett) {
        this.settings = JSON.parse(sett);
      }
      this.userImgPath = this.data.logo + this.visitor.VisitorBookingSeqId + this.visitorType + new Date().getTime();

      this.visitor.VisitorCategory = commonUtil.getCategory(this.visitor.VisitorCategory, false);

      // var qrJsonString1 = "{\"aptid\":\""+this.aptid+ "\",\"aptgid\":\"" + this.aptgid + "\",\"cid\":\"" + this.cid + "\"}";
      this.qrJsonString1 = HexCode;
      this.translate.get(['ALERT_TEXT.QRSHARE_SUCCESS']).subscribe(t => {
        this.T_SVC = t;
      });
      if (this.visitor && this.visitor.Approval_Status === 'Approved'){
        this.getDynamicQRCode();
      }

      console.log(this.qrCodePath);
  }
  ngOnInit(): void {

    console.log('Host access');
  }

  getCountryName() {
    let country_name = "";
    if (this.visitor.Country) {
      CommonUtil.countryList.forEach(element => {
        if (element.code === this.visitor.Country || element.name === this.visitor.Country) {
          country_name = element.name;
        }
        return;
      });
    }
    return country_name;
  }

  getDynamicQRCode() {
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    if(settings && JSON.parse(settings)){
      const objSetting = JSON.parse(settings);
      this.IsDynamicQR = objSetting.Table1[0].IsDynamicQR;
      if (this.IsDynamicQR) {
        if(hostData){
          var HOSTIC = JSON.parse(hostData).HOSTIC;
          var params = {
          "STAFF_IC":HOSTIC,
          "QRCodeValue": this.visitor.HexCode,
          "QRCodeValidity": objSetting.Table1[0].QRCodeValidity,
          "CurrentDate": this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')
          };
          this.resetQR(params);
        }
      } else {
        this.qrCodePath = this.data.logo+this.qrJsonString1+this.imageURLType;
      }
    }
  }

  resetQR(params) {
    params.CurrentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    this.apiProvider.GetDynamicQRCodeForVisitor(params).then(
      (val) => {
        var result = JSON.parse(JSON.stringify(val));
        if(result){
          const dataResult = JSON.parse(result);
          this.qrCodePath = 'data:image/jpeg;base64,'+ dataResult.DataQRCodeString;
          this.qrJsonString1 = dataResult.DataValueString;
          clearInterval(this.INTERVAL);
          this.TIMEOUT = +params.QRCodeValidity;
          this.INTERVAL = setInterval(() => {
            this.TIMEOUT = this.TIMEOUT - 1;
            console.log("resetValues host access::" + this.TIMEOUT);
            if (this.TIMEOUT <= 0) {
              clearInterval(this.INTERVAL);
              this.resetQR(params);
            }
          }, 1000);
        }
      },
      (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
        }
      );
  }

  dismiss() {
    clearInterval(this.INTERVAL);
    this.viewCtrl.dismiss();
  }

  share(){

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    var hostName = "";
    if(hostData){
      hostName = JSON.parse(hostData).HOSTNAME;
    }
    var qrCodeString = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=' + this.qrJsonString1 + '&RefType=QR&Refresh='+ new Date().getTime();

    var data = "Hi, I have shared the QR code for our appointment. Please use the QR code for your registration when you visit me."+
    "\n"+"Thanks,"+"\n"+"["+hostName+"]";
    if (this.IsDynamicQR) {
      var seqId = this.commonUtil.encryptData(this.visitor.VisitorBookingSeqId);
      var dynamicurl = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl +
      "/Common/DynamicQRGenerator.aspx?q=" + seqId;
      data =   "Hi there, i have shared the appointment link for you to generate the access QR code for you to access the building on appointment day. "+ dynamicurl;
      this.socialSharing.share(data, 'Your appointment QR code', targetPath , "").then(() => {
      }).catch((error) => {
        console.log(""+error);
        this.apiProvider.showToast('Error');
      });
    } else {
      const fileTransfer: FileTransferObject = this.transfer.create();
      const url = qrCodeString;
      // var filename = url.split("/").pop();
      var path = this.file.externalRootDirectory;
      if(!path){
        path = (this.file.externalDataDirectory || this.file.dataDirectory);
      }
      var targetPath = path + 'Pictures/' + "shareQRCode.jpg";

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
        result =>{
          console.log('Has permission?',result.hasPermission)
          if(result.hasPermission){
            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
              async result =>{
                let loading = await this.loadingCtrl.create({
                  message: 'Please wait...'
                });
                loading.present();
                console.log('Has permission?',result.hasPermission);
                fileTransfer.download(url, targetPath).then((entry) => {
                  loading.dismiss();
                  this.socialSharing.share(data, 'Your appointment QR code', targetPath , "").then(() => {
                    loading.dismiss();
                  }).catch((error) => {
                    // Error!
                    loading.dismiss();
                    console.log(""+error);
                    this.apiProvider.showToast('Error');
                  });
                }, (error) => {
                  // handle error
                  loading.dismiss();
                  console.log(""+error);
                  this.apiProvider.showToast('Download Error');
                  console.log("Download Error: "+ error);
                });
              } ,
              err => {
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE);
              }
            );
          }else{
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
          }
        } ,
        err => {
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
        }
      );
    }



    const imagepath = this.data.logo+qrCodeString+this.imageURLType;
      console.log(imagepath);
    // Share via email
    // this.socialSharing.share('Please click below URL and use the QRCode for Appointment', 'VIMS Appointment QRCode', null ,this.data.logo+this.qrCodeString+this.imageURLType).then(() => {
    //   // Success!
    //   this.dismiss();
    // }).catch(() => {
    //   // Error!
    //   let toast = this.toastCtrl.create({
    //     message: 'Error',
    //     duration: 3000,
    //     cssClass:'',
    //     position: 'bottom'
    //   });
    //   toast.present();
    // });
  }

}
