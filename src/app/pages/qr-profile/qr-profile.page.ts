import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera } from '@ionic-native/camera/ngx';
import { Device } from '@ionic-native/device/ngx';
import { ActionSheetController, NavController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-qr-profile',
  templateUrl: './qr-profile.page.html',
  styleUrls: ['./qr-profile.page.scss'],
})
export class QrProfilePage implements OnInit {
  T_SVC: any;
  UserSeqId = '';
  memberID = '';
  userProfile: any = {};
  userImage = '';
  qrCode = '';
  QRObj :any;
  isSecurityApp = false;
  data: any = {
    "profile": {}
  };
  base64Image: any = "";
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiProvider: RestProvider,
    private events: EventsService,
    private camera: Camera,
    private platform: Platform,
    private device: Device,
    private translate: TranslateService,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController,
    private navCntrl: NavController) {
      this.translate.get([
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
        'USER_PROFILE.SUCCESS.REGISTER_TITLE',
        'ALERT_TEXT.IMAGE_SELECT_ERROR']).subscribe(t => {
          this.T_SVC = t;
        });
     }

  ngOnInit() {
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData){
      this.QRObj = JSON.parse(qrData);
    }
    if(hostData && JSON.parse(hostData) && JSON.parse(hostData).SEQID){
      this.UserSeqId = JSON.parse(hostData).SEQID;
      this.memberID = JSON.parse(hostData).HOSTIC;
    }

    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        if (passData) {
          this.userProfile = passData;
          this.updateImage();
        }
      }
    });

    if(this.QRObj.MAppId === AppSettings.LOGINTYPES.SECURITYAPP){
      this.isSecurityApp = true;
    } else {
      const profile = localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_PROFILE_DETAILS);
      if (profile){
        this.userProfile = JSON.parse(profile);
        this.updateImage();
      } else {
        this.getUserProfile();
      }
    }


  }

  updateImage() {
    this.userImage =  this.QRObj.ApiUrl + 'Handler/PortalImageHandler.ashx?RefSlno='
      + this.userProfile.UserSeqId + "&ScreenType=30&Refresh=" + new Date().getTime();

    this.qrCode = this.QRObj.ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=' + this.userProfile.MemberId + '&RefType=QR&Refresh='+ new Date().getTime();

  }

  closePage() {
    this.goBack();
  }

  getUserProfile() {
    var params  = {
      "UserSeqId": "",
      "MemberId":"",
    }

    params.MemberId = this.memberID;
    if (!params.MemberId) {
      params.UserSeqId = this.UserSeqId;
    }

    if (!params.MemberId && !params.UserSeqId) {
      this.apiProvider.showAlert("User not found.");
      return;
    }

    this.apiProvider.requestApi(params, '/api/Vims/GetUserProfile', false, 'WEB', '').then(
      (val) => {
        try{
          var result = JSON.parse(JSON.stringify(val));
          if(result){
           try{
              this.userProfile = JSON.parse(result).Table1[0];
              this.updateImage();
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_PROFILE_DETAILS,JSON.stringify(this.userProfile));
            }catch(e){
            }
          }
        }catch(e){
        }

      },
      (err) => {
      }
    );
  }


  goBack() {
    this.navCntrl.pop();
    console.log('goBack ');
   }


   async presentActionSheet() {
     if (this.QRObj.MAppId !== AppSettings.LOGINTYPES.SECURITYAPP){
      let actionSheet = await this.actionSheetCtrl.create({
        header: 'Select Image Source',
        cssClass: '',
        buttons: [
          {
            text: 'Gallery',
            handler: () => {
              this.apiProvider.presentLoading();
              this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
            }
          },
          {
            text: 'Camera',
            handler: () => {
              this.apiProvider.presentLoading();
              this.takePicture(this.camera.PictureSourceType.CAMERA);
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      });
      actionSheet.present();
     }

  }

  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: sourceType,
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
      this.data.profile.HostImage = imageData;
      this.apiProvider.dismissLoading();
      this.UpdateProfile();

    }, (err) => {
      this.presentToast(this.T_SVC['ALERT_TEXT.IMAGE_SELECT_ERROR']);
      this.apiProvider.dismissLoading();
    });
  }

  private async presentToast(text) {
    let toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      color: 'primary',
      position: 'top'
    });
    toast.present();
  }


  UpdateProfile() {

    var hostInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (hostInfo && (JSON.parse(hostInfo).HOSTIC || JSON.parse(hostInfo).HOST_ID)) {
      this.data.profile = JSON.parse(hostInfo);
      if (!this.data.profile.SEQID) {
        this.data.profile.SEQID = "0";
      }
    }

    if (!this.data.profile.HostImage) {
      this.data.profile.HostImage = "";
    }

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (hostData) {
      this.data.profile.HOSTIC = JSON.parse(hostData).HOSTIC;
      if (!this.data.profile.HOSTIC) {
        this.data.profile.HOSTIC = JSON.parse(hostData).HOSTIC?JSON.parse(hostData).HOSTIC:JSON.parse(hostData).HOST_ID;
      }
    }
    if (!this.data.profile.HOSTIC) {
      this.apiProvider.showToast(this.T_SVC['ERROR_UPDATE_IC']);
      return;
    }



    if (!this.data.profile.DeviceID) {
      if (!this.platform.is('cordova')) {
        this.data.profile.DeviceID = AppSettings.TEST_DATA.SAMPLE_DEVICE_ID;
      } else {
        this.data.profile.DeviceID = this.device.uuid;
      }

    }
    if (!this.data.profile.DevicePlatform) {
      if (!this.platform.is('cordova')) {
        this.data.profile.DevicePlatform = "Android";
      } else {
        this.data.profile.DevicePlatform = this.device.platform;
      }

    }
    this.data.profile.PushNotificationId = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.FCM_ID);
    if (!this.data.profile.PushNotificationId) {
      this.data.profile.PushNotificationId = "";
    }
    if (!this.data.profile.PushToken) {
      this.data.profile.PushToken = "";
    }

    this.apiProvider.UpdateHostInfo(this.data.profile).then(
      (val) => {
        var result = JSON.parse(val.toString());
        if (result && result[0].Code == 10) {
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS, JSON.stringify(this.data.profile));

          this.apiProvider.showToast(this.T_SVC['USER_PROFILE.SUCCESS.REGISTER_TITLE']);
          this.updateUserPic("Update Profile Picture");
          return;
        }

        this.apiProvider.showToast('Server Error');
      },
      (err) => {

        if (err && err.message == "No Internet") {
          return;
        }
        var message1 = "";
        if (err && err.message == "Http failure response for (unknown url): 0 Unknown Error") {
          message1 = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else {
          var result = JSON.parse(err.toString());
          if (result && result["Table2"] != undefined) {
            message1 = result["Table2"][0].Status ? result["Table2"][0].Status : result["Table2"][0].Description;
          } else if (result && result["Table1"] != undefined) {
            message1 = result["Table1"][0].Status ? result["Table1"][0].Status : result["Table1"][0].Description;
          } else if (result.message){
            message1 = result.message;
          }
        }
        this.apiProvider.showAlert(message1);
      }
    );
  }

  updateUserPic(user) {
    console.log('User created!')
    this.events.publishDataCompany({
      action: 'user:created',
      title: user,
      message: this.data.profile.SEQID
    });
  }

}
