import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { NavController, ToastController, Platform, ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-quick-pass-details-page',
  templateUrl: './quick-pass-details-page.page.html',
  styleUrls: ['./quick-pass-details-page.page.scss'],
})
export class QuickPassDetailsPagePage implements OnInit {


  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage": "assets/images/profile_bg.jpg",
    "profile": ""
  };
  RefTypeVP = '&RefType=QP&Refresh=' + new Date().getTime();
  QPAppointment: any = {};
  securitySettings: any = {};
  CheckIn = false;
  base64Image = "";
  visitor_RemoveImg = true;
  T_SVC: any;
  qrCodeString = "";
  fromCreate = false;

  constructor(public navCtrl: NavController,
    public toastCtrl: ToastController,
    private platform: Platform,
    private events: EventsService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private apiProvider: RestProvider,
    public socialSharing: SocialSharing,
    private alertCtrl: AlertController,
    private camera: Camera,
    private transfer: FileTransfer,
    private file: File,
    private androidPermissions: AndroidPermissions,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    private translate: TranslateService) {
    this.translate.get(['ACC_MAPPING.INVALID_QR', 'ACC_MAPPING.INVALID_ORG_TITLE',
      'ACC_MAPPING.INVALID_FCM_TITLE',
      'ACC_MAPPING.FCM_TITLE', 'ALERT_TEXT.QRSHARE_SUCCESS',
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'ALERT_TEXT.IMAGE_SELECT_ERROR', 'ALERT_TEXT.VISITOR_CHECKED_IN',
      'ALERT_TEXT.VISITOR_CHECKIN_FAIL',
      'COMMON.OK', 'COMMON.CANCEL']).subscribe(t => {
        this.T_SVC = t;
      });
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        var QPAppointment = passData.QPAppointment;
        if (QPAppointment) {
          this.QPAppointment = JSON.parse(QPAppointment);
        }
        if (passData.fromCreate) {
          this.fromCreate = passData.fromCreate;
        }
        this.CheckIn = passData.CheckIn;

        this.qrCodeString = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/ImageHandler.ashx?RefSlno=' + this.QPAppointment["HexCode"] + '&RefType=QR&Refresh=' + new Date().getTime();

      }
    });


    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    var QRObj = JSON.parse(qrInfo);
    if (QRObj && QRObj.MAppId) {
      if (QRObj.MAppId == AppSettings.LOGINTYPES.SECURITYAPP) {
        var ackSeettings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
        if (ackSeettings) {
          this.securitySettings = JSON.parse(ackSeettings);
        }
      } else {
        var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
        if (settings && JSON.parse(settings)) {
          try {
            var hostSettings = JSON.parse(settings).Table1[0];
            var QPData = JSON.parse(hostSettings.QuickPassSettings);
            if (QPData) {
              this.securitySettings.QuickPass = {
                "ImageCaptureEnabled": false,
                "ImageCaptureRequired": false,
                "ShowVisitorExpiryTime": QPData.CreatePass.VisitorExpiryTimeEnabled,
                "VisitorExpiryTimeRequired": QPData.CreatePass.VisitorExpiryTimeRequirred,
                "ShowVehicleNo": QPData.CreatePass.VehicleNoEnabled,
                "VehicleNoRequired": QPData.CreatePass.VehicleNoRequired,
                "ShowRemarks": QPData.CreatePass.RemarksEnabled,
                "RemarksRequired": QPData.CreatePass.RemarksRequired,
                "BackgroundColor1": QPData.ViewPassBackgroundColor1,
                "BackgroundColor2": QPData.ViewPassBackgroundColor2
              }
            }

          } catch (e) {

          }
        }
      }
      if (!this.securitySettings || !this.securitySettings.QuickPass) {
        // this.securitySettings.ImageCaptureEnabled = true;
        this.securitySettings.QuickPass = {
          "VisitorExpiryTimeRequired": true,
          "VehicleNoRequired": false,
          "RemarksRequired": false,
          "ImageCaptureEnabled": true,
          "ImageCaptureRequired": false,
          "ShowVisitorExpiryTime": true,
          "ShowVehicleNo": true,
          "ShowRemarks": true,
          "BackgroundColor1": "#cc99ff",
          "BackgroundColor2": "#9966ff"

        }
      }
      this.events.publishDataCompany({
        action: "page",
        title: "home-view1",
        message: ''
      });
    }
  }

  public async presentActionSheet() {
    if (this.securitySettings && this.securitySettings.QuickPass && this.securitySettings.QuickPass.ImageCaptureEnabled && this.CheckIn) {
      if (this.visitor_RemoveImg) {
        this.takePicture();
        return;
      }
      var option = [
        {
          text: 'Camera',
          handler: () => {
            this.takePicture();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ];
      if (this.base64Image || this.data.profile) {
        option = [
          {
            text: 'Camera',
            handler: () => {
              this.takePicture();
            }
          },
          {
            text: 'Remove Photo',
            handler: () => {
              this.visitor_RemoveImg = true;
              this.base64Image = '';
              this.data.profile = '';
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ];
      }
      let actionSheet = await this.actionSheetCtrl.create({
        header: 'Select Image Source',
        cssClass: '',
        buttons: option
      });
      actionSheet.present();
    } else if (this.QPAppointment['HexCode']) {
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            image: this.data.logo + this.QPAppointment['HexCode'] + this.RefTypeVP
          }
        }
      };
      this.router.navigate(['pages-view-image-page'], navigationExtras);
    }
  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }


  ionViewWillLeave() {
    if (this.fromCreate) {
      this.events.publishDataCompany({
        action: 'page',
        title: 'quick-pass-dash-board-page',
        message: ''
      });
    }
  }

  public takePicture() {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      // destinationType: this.camera.DestinationType.FILE_URI,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      allowEdit: true,
      targetWidth: 400,
      targetHeight: 400
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imageData) => {

      this.base64Image = 'data:image/jpeg;base64,' + imageData;
      this.data.profile = imageData;
      this.visitor_RemoveImg = false;
    }, (err) => {
      this.presentToast(this.T_SVC['ALERT_TEXT.IMAGE_SELECT_ERROR']);
    });
  }

  private async presentToast(text) {
    let toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      color: 'primary',
      position: 'bottom'
    });
    toast.present();
  }

  async UpdateQPVisitorCheckInTime() {

    if (this.QPAppointment && this.QPAppointment["HexCode"]) {

      if (this.CheckIn) {
        if (this.securitySettings && this.securitySettings.QuickPass && this.securitySettings.QuickPass.ImageCaptureEnabled && this.securitySettings.QuickPass.ImageCaptureRequired && !this.data.profile) {
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: this.T_SVC['ALERT_TEXT.QUICKPASS_USER_PROFILE_REQUIRED'],
            cssClass: '',
            buttons: ['Okay']
          });
          alert.present();
          return
        }
        var params = {
          "HexCode": this.QPAppointment["HexCode"],
          "VisitorImg": this.data.profile
        }
        this.apiProvider.UpdateQPVisitorCheckInTime(params).then(
          async (val) => {
            if (val) {
              console.log("val : " + JSON.stringify(val));
              this.navCtrl.pop();
              this.presentToast(this.T_SVC['ALERT_TEXT.VISITOR_CHECKED_IN']);

            } else {
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: this.T_SVC['ALERT_TEXT.VISITOR_CHECKIN_FAIL'],
                cssClass: '',
                buttons: ['Okay']
              });
              alert.present();
            }




          },
          async (err) => {
            console.log("error : " + JSON.stringify(err));
            if (err && err.message == "No Internet") {
              return;
            }

            if (err.Table1 && err.Table1.length == 0) {
              var message = this.T_SVC['ALERT_TEXT.VISITOR_CHECKIN_FAIL'];
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: message,
                cssClass: '',
                buttons: ['Okay']
              });
              alert.present();
              return;
            }

            if (err && err.message.indexOf("Http failure response for") > -1) {
              message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: message,
                cssClass: '',
                buttons: ['Okay']
              });
              alert.present();
              return;
            }

            if (err && JSON.parse(err) && JSON.parse(err).message) {
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: JSON.parse(err).message,
                cssClass: '',
                buttons: ['Okay']
              });
              alert.present();
              return;
            }
            let invalidORGConfirm = await this.alertCtrl.create({
              header: 'Error !',
              message: "<span class='failed'>" + this.T_SVC['ALERT_TEXT.VISITOR_CHECKIN_FAIL'] + '</span>',
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
      } else {
        var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
        var hostName = "";
        if (hostData) {
          hostName = JSON.parse(hostData).HOSTNAME;
        }
        var data = "Hi, I have shared the QR code for our appointment. Please use the QR code for your registration when you visit me." +
          "\n" + "Thanks," + "\n" + "[" + hostName + "]";

        const fileTransfer: FileTransferObject = this.transfer.create();
        const url = this.qrCodeString;
        // var filename = url.split("/").pop();
        var path = this.file.externalRootDirectory;
        if (!path) {
          path = (this.file.externalDataDirectory || this.file.dataDirectory);
        }
        var targetPath = path + 'Pictures/' + "shareQRCode.jpg";

        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
          result => {
            console.log('Has permission?', result.hasPermission)
            if (result.hasPermission) {
              this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
                async result => {
                  let loading = await this.loadingCtrl.create({
                    message: 'Please wait...'
                  });
                  loading.present();
                  console.log('Has permission?', result.hasPermission);
                  fileTransfer.download(url, targetPath).then((entry) => {
                    loading.dismiss();
                    this.socialSharing.share(data, 'Your appointment QR code', targetPath, "").then(() => {
                    }).catch(async (error) => {
                      // Error!
                      loading.dismiss();
                      console.log("" + error);
                      let toast = await this.toastCtrl.create({
                        message: 'Error',
                        duration: 3000,
                        color: 'primary',
                        position: 'bottom'
                      });
                      toast.present();
                    });
                  }, async (error) => {
                    // handle error
                    loading.dismiss();
                    console.log("" + error);
                    let toast = await this.toastCtrl.create({
                      message: 'Download Error',
                      duration: 3000,
                      color: 'primary',
                      position: 'bottom'
                    });
                    toast.present();
                    console.log("Download Error: " + error);
                  });
                },
                err => {
                  this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE);
                }
              );
            } else {
              this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
            }
          },
          err => {
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
          }
        );
      }
    }
  }

  ngOnInit() {
  }

}
