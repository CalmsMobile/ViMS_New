import { Component, OnInit } from '@angular/core';
import {AppSettings} from '../../services/app-settings'
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import * as CryptoJS from 'crypto-js';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { TranslateService } from '@ngx-translate/core';
import { ToastController, Platform, LoadingController, ModalController, NavParams } from '@ionic/angular';

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
export class CustomVisitorPopupComponent{

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
  constructor(public viewCtrl: ModalController,
    public toastCtrl: ToastController,
    private platform: Platform,
    private androidPermissions : AndroidPermissions,
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

      this.userImgPath = this.data.logo + this.visitor.VisitorBookingSeqId + this.visitorType + new Date().getTime();


      // var qrJsonString1 = "{\"aptid\":\""+this.aptid+ "\",\"aptgid\":\"" + this.aptgid + "\",\"cid\":\"" + this.cid + "\"}";
      this.qrJsonString1 = HexCode;
      this.translate.get(['ALERT_TEXT.QRSHARE_SUCCESS']).subscribe(t => {
        this.T_SVC = t;
      });
      this.qrCodePath = this.data.logo+this.qrJsonString1+this.imageURLType;
      console.log(this.qrCodePath);
  }

  dismiss() {
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
                  // Success!
                  // let toast = this.toastCtrl.create({
                  //   message: this.T_SVC['ALERT_TEXT.QRSHARE_SUCCESS'],
                  //   duration: 3000,
                  //   position: 'bottom'
                  // });
                  // toast.present();
                }).catch(async (error) => {
                  // Error!
                  loading.dismiss();
                  console.log(""+error);
                  let toast = await this.toastCtrl.create({
                    message: 'Error',
                    duration: 3000,
                    color: 'primary',
                    position: 'bottom',
                  });
                  toast.present();
                });
              }, async (error) => {
                // handle error
                loading.dismiss();
                console.log(""+error);
                let toast = await this.toastCtrl.create({
                  message: 'Download Error',
                  duration: 3000,
                  position: 'bottom',
                  color: 'primary'
                });
                toast.present();
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
    //     cssClass:'alert-danger',
    //     position: 'bottom'
    //   });
    //   toast.present();
    // });
  }

}
