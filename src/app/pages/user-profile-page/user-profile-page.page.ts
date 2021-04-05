import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Camera } from '@ionic-native/camera/ngx';
import { Device } from '@ionic-native/device/ngx';
import { NavController, NavParams, ToastController, Platform, ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
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
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage":"assets/images/profile_bg.jpg",
    "profile":{},
    "AVAIL_FLOOR":[]
  };
  RefType = '&RefType=HP&Refresh='+ new Date().getTime();
  userUpdateModal = new HostInfoModel();
  public error: string;
  userProfile:FormGroup;
  USER_INFO:any;
  passModal:any = {
    currentPassword:"",
    newPassword:""
  }
  translation:any = {};
  base64Image:any = "";
  loading: any;
  T_SVC : any;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private translate:TranslateService,
    public apiProvider: RestProvider,
    public events: EventsService,
    private camera: Camera,
    private platform : Platform,
    private device : Device,
    public actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController) {
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
        hostId :  new FormControl('', []),
        floor: new FormControl('', []),
      });

      var hostInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      if(hostInfo && JSON.parse(hostInfo).HOSTIC){
        this.data.profile = JSON.parse(hostInfo);
        if(!this.data.profile.SEQID){
          this.data.profile.SEQID = "0";
        }
      }

      if(localStorage.getItem("USER_INFO") != undefined){
        this.USER_INFO = JSON.parse(localStorage.getItem("USER_INFO"));
        this.userUpdateModal.username = this.USER_INFO['username'];
        this.userUpdateModal.email = this.USER_INFO['email'];
        this.userUpdateModal.country = this.USER_INFO['country'];
        this.userUpdateModal.city = this.USER_INFO['city'];
      }
      this.translate.get(['USER_PROFILE.ERROR.OLD_PASSWORD_REQUIRED', 'USER_PROFILE.ERROR.OLD_PASSWORD_MIN4',
      'USER_PROFILE.ERROR.OLD_PASSWORD_MAX20','USER_PROFILE.ERROR.NEW_PASSWORD_REQUIRED', 'USER_PROFILE.ERROR.NEW_PASSWORD_MIN4',
      'USER_PROFILE.ERROR.NEW_PASSWORD_MAX20']).subscribe(t => {
        this.translation = t;
      });
      this.loadMasterData();
  }

  updateUserPic(user) {
    console.log('User created!')
    this.events.publishDataCompany({
      action:'user:created',
      title: user,
      message: this.data.profile.SEQID
    });
  }

  loadMasterData(){
    var masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
    if(masterDetails){
      this.data.AVAIL_FLOOR = JSON.parse(masterDetails).Table2;
    }else{
      this.apiProvider.GetMasterDetails().then(
        (val) => {
          var result = JSON.parse(JSON.stringify(val));
          if(result){
            this.data.AVAIL_FLOOR = result.Table2;
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
          }
        },
        (err) => {
        }
      );
    }
  }

  ionViewDidEnter() {
    this.events.publishDataCompany({
      action:"page",
      title: "Profile",
      message: ''
    });
    console.log('ionViewDidEnter RegisterPage');
  }


  public async presentActionSheet() {
    let actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      cssClass: 'alert-warning',
      buttons: [
        {
          text: 'Gallery',
          handler: () => {
            this.loading = this.loadingCtrl.create({
              message: 'Please wait...'
            });
            this.loading.present();
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Camera',
          handler: () => {
            this.loading = this.loadingCtrl.create({
              message: 'Please wait...'
            });
            this.loading.present();
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
      this.loading.dismiss();

    }, (err) => {
      this.presentToast(this.T_SVC['ALERT_TEXT.IMAGE_SELECT_ERROR']);
      this.loading.dismiss();
    });
  }

  private async presentToast(text) {
    let toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }


  async UpdateProfile(){

    if(!this.data.profile.HostImage){
      this.data.profile.HostImage = "";
    }

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      this.data.profile.HOSTIC =  JSON.parse(hostData).HOSTIC;
      if(!this.data.profile.HOSTIC){
        this.data.profile.HOSTIC = JSON.parse(hostData).HOST_ID;
      }
    }
    if(!this.data.profile.HOSTIC){
      let toast = await this.toastCtrl.create({
        message: this.T_SVC['ERROR_UPDATE_IC'],
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }



    if(!this.data.profile.DeviceID){
      if(!this.platform.is('cordova')) {
        this.data.profile.DeviceID = AppSettings.TEST_DATA.SAMPLE_DEVICE_ID;
      }else{
        this.data.profile.DeviceID = this.device.uuid;
      }

    }
    if(!this.data.profile.DevicePlatform){
      if(!this.platform.is('cordova')) {
        this.data.profile.DevicePlatform = "Android";
      }else{
        this.data.profile.DevicePlatform = this.device.platform;
      }

    }
    this.data.profile.PushNotificationId = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.FCM_ID);
    if(!this.data.profile.PushNotificationId){
      this.data.profile.PushNotificationId = "";
    }
    if(!this.data.profile.PushToken){
      this.data.profile.PushToken = "";
    }




    this.apiProvider.UpdateHostInfo(this.data.profile).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result && result[0].Code == 10){

          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS, JSON.stringify(this.data.profile));

          let toast = await this.toastCtrl.create({
            message: this.T_SVC['USER_PROFILE.SUCCESS.REGISTER_TITLE'],
            duration: 3000,
            position: 'bottom'
          });
          toast.present();
          this.updateUserPic("Update Profile Picture");
          return;
      }
      let toast = await this.toastCtrl.create({
        message: 'Server Error',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      },
      async (err) => {

        if(err && err.message == "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else {
          var result = JSON.parse(err.toString());
          if(result && result["Table2"] != undefined){
            message = result["Table2"][0].Status? result["Table2"][0].Status : result["Table2"][0].Description;
          }else if(result && result["Table1"] != undefined){
            message = result["Table1"][0].Status? result["Table1"][0].Status : result["Table1"][0].Description;
          }
        }
        let alert = await this.alertCtrl.create({
          header: 'Error !',
          message: message,
          cssClass: 'alert-danger',
          buttons: ['Okay']
        });
          alert.present();
      }
    );
  }

  onEvent = (event: string): void => {
    // if (event == 'onUpdateProfile') {
    //   let loder_msg:string;
    //   this.translate.get('COMMON.LOADER_MSG.REGISTER_LODER').subscribe(t => {
    //     loder_msg = t;
    //   });
    //   var register_loader = this.loadingCtrl.create({
    //     spinner: 'bubbles',
    //     content: loder_msg,
    //     dismissOnPageChange:true,
    //   });
    //   register_loader.present();
    //     this.producttagProvider.updateProfile(this.userUpdateModal).subscribe(
    //       (result) => {
    //         register_loader.dismiss();
    //         this.translate.get(['USER_PROFILE.SUCCESS.REGISTER_TITLE','USER_PROFILE.SUCCESS.REGISTER_message','COMMON.OK','COMMON.CANCEL']).subscribe(t => {
    //           let loginConfirm = this.alertCtrl.create({
    //             header: "<span class='success'>" + t['USER_PROFILE.SUCCESS.REGISTER_TITLE'] + "</span>",
    //             message: t['USER_PROFILE.SUCCESS.REGISTER_message'],
    //             buttons: [
    //               {
    //                 text: t['COMMON.OK'],
    //                 role: 'cancel',
    //                 handler: () => {
    //                 }
    //               }
    //             ]
    //           });
    //           loginConfirm.present();
    //         });
    //       },
    //       (err) => {
    //         register_loader.dismiss();
    //         this.error = 'Registration failed ('+ err.error.message +')';
    //         this.translate.get(['USER_PROFILE.ERROR.REG_FAILED_TITLE','USER_PROFILE.ERROR.REG_FAILED_SUB_TITLE','COMMON.OK','COMMON.CANCEL']).subscribe(t => {
    //           let loginConfirm = this.alertCtrl.create({
    //             header: "<span class='failed'>" + t['USER_PROFILE.ERROR.REG_FAILED_TITLE'] + "</span>",
    //             message: t['USER_PROFILE.ERROR.REG_FAILED_SUB_TITLE']
    //             +"<div>"+ err.error.message+ "</div>",
    //             buttons: [
    //               {
    //                 text: t['COMMON.OK'],
    //                 role: 'cancel',
    //                 handler: () => {
    //                 }
    //               }
    //             ]
    //           });
    //           loginConfirm.present();
    //         });
    //       }
    //     );
    // } else if (event == 'onChangePassword') {
    //   this.translate.get(['USER_PROFILE.CHANGE_PASSWORD','USER_PROFILE.NEW_PASS','USER_PROFILE.OLD_PASS','USER_PROFILE.CHANGE',
    //   'COMMON.OK','COMMON.CANCEL']).subscribe(t => {
    //     let alert = this.alertCtrl.create({
    //       header: '<span class="failed">' + t['USER_PROFILE.CHANGE_PASSWORD'] + '</span>',
    //       inputs: [
    //         {
    //           name: 'currentPassword',
    //           type: 'password',
    //           placeholder: t['USER_PROFILE.OLD_PASS']
    //         },
    //         {
    //           name: 'newPassword',
    //           placeholder: t['USER_PROFILE.NEW_PASS'],
    //           type: 'password'
    //         }
    //       ],
    //       buttons: [
    //         {
    //           text: t['COMMON.CANCEL'],
    //           role: 'cancel',
    //           handler: data => {
    //           }
    //         },
    //         {
    //           text: t['USER_PROFILE.CHANGE'],
    //           handler: data => {
    //             let _newPassword = (data.newPassword).toString().trim();
    //             let _oldPassword = (data.currentPassword).toString().trim();
    //             if( _oldPassword.length == 0){
    //               this.toastCtrl.create(this.translation['USER_PROFILE.ERROR.OLD_PASSWORD_REQUIRED']);
    //               return false;
    //             } else if( _oldPassword.length > 20){
    //               this.toastCtrl.create(this.translation['USER_PROFILE.ERROR.OLD_PASSWORD_MAX20']);
    //               return false;
    //             } else if(_oldPassword.length < 4){
    //               this.toastCtrl.create(this.translation['USER_PROFILE.ERROR.OLD_PASSWORD_MIN4']);
    //               return false;
    //             } else if( _newPassword.length == 0){
    //               this.toastCtrl.create(this.translation['USER_PROFILE.ERROR.NEW_PASSWORD_REQUIRED']);
    //               return false;
    //             } else if( _newPassword.length > 20){
    //               this.toastCtrl.create(this.translation['USER_PROFILE.ERROR.NEW_PASSWORD_MAX20']);
    //               return false;
    //             } else if(_newPassword.length < 4){
    //               this.toastCtrl.create(this.translation['USER_PROFILE.ERROR.NEW_PASSWORD_MIN4']);
    //               return false;
    //             } else if(_oldPassword.length >= 4 && _oldPassword.length <= 20 &&
    //               _newPassword.length >= 4 && _newPassword.length <= 20){
    //               this.takeActionForChangePassword({currentPassword:_oldPassword, newPassword:_newPassword});
    //             }
    //           }
    //         }
    //       ]
    //     });
    //     alert.present();
    //   });
    // }
  }
  takeActionForChangePassword(passData){
    // let loder_msg:string;
    // this.translate.get('COMMON.LOADER_MSG.LOADING').subscribe(t => {
    //   loder_msg = t;
    // });
    // var changePass_loader = this.loadingCtrl.create({
    //   spinner: 'bubbles',
    //   content: loder_msg,
    //   dismissOnPageChange:true,
    // });
    // changePass_loader.present();
    // this.producttagProvider.changePassword(passData).subscribe(data => {
    //   console.log(data);
    //   changePass_loader.dismiss();
    //   this.translate.get(['USER_PROFILE.SUCCESS.CHANGE_PASS_SUCCESS',
    //   'COMMON.OK','COMMON.CANCEL']).subscribe(t => {
    //     let loginConfirm = this.alertCtrl.create({
    //       header: "<span class='success'>" + t['USER_PROFILE.SUCCESS.CHANGE_PASS_SUCCESS'] + "</span>",
    //       buttons: [
    //         {
    //           text: t['COMMON.OK'],
    //           role: 'cancel',
    //           handler: () => {
    //           }
    //         }
    //       ]
    //     });
    //     loginConfirm.present();
    //   });
    // },
    // (err) => {
    //   changePass_loader.dismiss();
    //   this.translate.get(['USER_PROFILE.ERROR.CHANGE_PASS_ERROR',
    //   'COMMON.OK','COMMON.CANCEL']).subscribe(t => {
    //     let loginConfirm = this.alertCtrl.create({
    //       header: "<span class='failed'>" + t['USER_PROFILE.ERROR.CHANGE_PASS_ERROR'] + "</span>",
    //       message:"<div>"+ (err.error.message || "")+ "</div>",
    //       buttons: [
    //         {
    //           text: t['COMMON.OK'],
    //           role: 'cancel',
    //           handler: () => {
    //           }
    //         }
    //       ]
    //     });
    //     loginConfirm.present();
    //   });
    // });
  }


  ngOnInit() {
  }

}
