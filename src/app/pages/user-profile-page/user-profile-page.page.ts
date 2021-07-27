import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera/ngx';
import { Device } from '@ionic-native/device/ngx';
import { NavController, ToastController, Platform, ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { HostInfoModel } from 'src/app/model/hostInfoModel';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-user-profile-page',
  templateUrl: './user-profile-page.page.html',
  styleUrls: ['./user-profile-page.page.scss'],
})
export class UserProfilePagePage implements OnInit {

  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage": "assets/images/profile_bg.jpg",
    "profile": {},
    "AVAIL_FLOOR": []
  };
  RefType = '&RefType=HP&Refresh=' + new Date().getTime();
  userUpdateModal = new HostInfoModel();
  public error: string;
  userProfile: FormGroup;
  USER_INFO: any;
  passModal: any = {
    currentPassword: "",
    newPassword: ""
  }
  translation: any = {};
  base64Image: any = "";
  T_SVC: any;
  constructor(public navCtrl: NavController,

    public toastCtrl: ToastController,
    private translate: TranslateService,
    public apiProvider: RestProvider,
    public events: EventsService,
    private camera: Camera,
    private platform: Platform,
    private device: Device,
    public actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'USER_PROFILE.SUCCESS.REGISTER_TITLE',
      'ALERT_TEXT.IMAGE_SELECT_ERROR']).subscribe(t => {
        this.T_SVC = t;
      });
    //let EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.userProfile = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9 ]*'), Validators.minLength(4), Validators.maxLength(100)]),
      //password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]),
      // email: new FormControl('', [Validators.required, Validators.pattern(EMAILPATTERN)]),
      icPassport: new FormControl('', [Validators.required]),
      emailAlert: new FormControl('', []),
      hostId: new FormControl('', []),
      floor: new FormControl('', []),
    });

    var hostInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (hostInfo && (JSON.parse(hostInfo).HOSTIC || JSON.parse(hostInfo).HOST_ID)) {
      this.data.profile = JSON.parse(hostInfo);
      if (!this.data.profile.SEQID) {
        this.data.profile.SEQID = "0";
      }
    }
    this.getProfileInfo();
    if (localStorage.getItem("USER_INFO") != undefined) {
      this.USER_INFO = JSON.parse(localStorage.getItem("USER_INFO"));
      this.userUpdateModal.username = this.USER_INFO['username'];
      this.userUpdateModal.email = this.USER_INFO['email'];
      this.userUpdateModal.country = this.USER_INFO['country'];
      this.userUpdateModal.city = this.USER_INFO['city'];
    }
    this.translate.get(['USER_PROFILE.ERROR.OLD_PASSWORD_REQUIRED', 'USER_PROFILE.ERROR.OLD_PASSWORD_MIN4',
      'USER_PROFILE.ERROR.OLD_PASSWORD_MAX20', 'USER_PROFILE.ERROR.NEW_PASSWORD_REQUIRED', 'USER_PROFILE.ERROR.NEW_PASSWORD_MIN4',
      'USER_PROFILE.ERROR.NEW_PASSWORD_MAX20']).subscribe(t => {
        this.translation = t;
      });
    this.loadMasterData();
  }

  updateUserPic(user) {
    console.log('User created!')
    this.events.publishDataCompany({
      action: 'user:created',
      title: user,
      message: this.data.profile.SEQID
    });
  }

  loadMasterData() {
    var masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
    if (masterDetails) {
      this.data.AVAIL_FLOOR = JSON.parse(masterDetails).Table2;
    } else {
      this.apiProvider.GetMasterDetails().then(
        (val) => {
          var result = JSON.parse(JSON.stringify(val));
          if (result) {
            this.data.AVAIL_FLOOR = result.Table2;
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS, JSON.stringify(result));
          }
        },
        (err) => {
        }
      );
    }
  }

  ionViewDidEnter() {
    this.events.publishDataCompany({
      action: "page",
      title: "user-profile-page",
      message: ''
    });
    console.log('ionViewDidEnter RegisterPage');
  }


  public async presentActionSheet() {
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


  getProfileInfo() {
    var params = {
      "SearchString":""+ this.data.profile.HOST_ID ? this.data.profile.HOST_ID : this.data.profile.HOSTIC,
      "DeviceUID": ""
    };
    if(this.platform.is('cordova')) {
      params.DeviceUID = this.device.uuid;
    }else{
      params.DeviceUID = AppSettings.TEST_DATA.SAMPLE_DEVICE_ID
    }
    this.apiProvider.GetValidateHost(params).then(
      (val) => {
        var result = JSON.parse(val+"");
        this.data.profile = result.Table1[0];
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS,JSON.stringify(this.data.profile));
      },
      async (err) => {
      }
    );
  }


  async UpdateProfile() {

    if (!this.data.profile.HostImage) {
      this.data.profile.HostImage = "";
    }

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (hostData) {
      this.data.profile.HOSTIC = JSON.parse(hostData).HOSTIC;
      if (!this.data.profile.HOSTIC) {
        this.data.profile.HOSTIC = JSON.parse(hostData).HOST_ID;
      }
    }
    if (!this.data.profile.HOSTIC) {
      let toast = await this.toastCtrl.create({
        message: this.T_SVC['ERROR_UPDATE_IC'],
        duration: 3000,
        color: 'primary',
        position: 'bottom'
      });
      toast.present();
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
      async (val) => {
        var result = JSON.parse(val.toString());
        if (result && result[0].Code == 10) {

          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS, JSON.stringify(this.data.profile));

          let toast = await this.toastCtrl.create({
            message: this.T_SVC['USER_PROFILE.SUCCESS.REGISTER_TITLE'],
            duration: 3000,
            color: 'primary',
            position: 'bottom'
          });
          toast.present();
          this.updateUserPic("Update Profile Picture");
          return;
        }
        let toast = await this.toastCtrl.create({
          message: 'Server Error',
          duration: 3000,
          color: 'primary',
          position: 'bottom'
        });
        toast.present();
      },
      async (err) => {

        if (err && err.message == "No Internet") {
          return;
        }
        var message = "";
        if (err && err.message == "Http failure response for (unknown url): 0 Unknown Error") {
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else {
          var result = JSON.parse(err.toString());
          if (result && result["Table2"] != undefined) {
            message = result["Table2"][0].Status ? result["Table2"][0].Status : result["Table2"][0].Description;
          } else if (result && result["Table1"] != undefined) {
            message = result["Table1"][0].Status ? result["Table1"][0].Status : result["Table1"][0].Description;
          }
        }
        let alert = await this.alertCtrl.create({
          header: 'Error !',
          message: message,
          cssClass: '',
          buttons: ['Okay']
        });
        alert.present();
      }
    );
  }

  onEvent = (event: string): void => {
  }
  takeActionForChangePassword(passData) {
  }


  ngOnInit() {
  }


  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

}
