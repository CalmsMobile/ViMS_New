import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { NavController, AlertController, ToastController, ModalController, Platform, ActionSheetController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { SignaturePagePage } from '../signature-page/signature-page.page';

@Component({
  selector: 'app-sign-pad-visitor-details-page',
  templateUrl: './sign-pad-visitor-details-page.page.html',
  styleUrls: ['./sign-pad-visitor-details-page.page.scss'],
})
export class SignPadVisitorDetailsPagePage implements OnInit {

   base64Image = "";
  HostImage = "";
  visitor : any = {};
  logo = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  hostlogo = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'Handler/PortalImageHandler.ashx?RefSlno=';
  coverImage = "assets/images/profile_bg.jpg";
  appSettings : any;
  RefType = '&ScreenType=30&Refresh='+ new Date().getTime();
  RefTypeVP= '&RefType=VP&Refresh='+ new Date().getTime();
  screenHeight = 1;
  screenWidth = 0;
  following = false;
  user = {
    name: 'Paula Bolliger',
    profileImage: 'assets/images/logo/2.png',
    coverImage: 'assets/images/profile_bg.jpg',
    occupation: 'Designer',
    location: 'Seattle, WA',
    description: 'A wise man once said: The more you do something, the better you will become at it.',
    followers: 456,
    following: 1052,
    posts: 35
  };
  isTabletOrIpad = false;
  screenSize = AppSettings.SCREEN_SIZE.NORMAL_PORTRAIT;
  tab_por = AppSettings.SCREEN_SIZE.TABLET_PORTRAIT;
  nor_por = AppSettings.SCREEN_SIZE.NORMAL_PORTRAIT;
  tab_land = AppSettings.SCREEN_SIZE.TABLET_LANDSCAP;
  nor_land = AppSettings.SCREEN_SIZE.NORMAL_LANDSCAP;

  allowVideo = false;
  T_SVC:any;
  modal : any;
  VideoUrl = "";
  customStyle : any = {
    "DetailsPage":{
      backgroundcolor1 : "#5ed0b9",
      backgroundcolor2 : "#0f705d",
    }

  }
  alert : any;
  timeoutInterval : any ;
  bufferTimeToCheck : any = AppSettings.IdleListenBufferTime
  alertShowing : any = false;
  isProceedClicked : any = false;
  constructor(public navCtrl: NavController,
    private alertCtrl : AlertController,
    private apiProvider : RestProvider,
    private androidPermissions: AndroidPermissions,
    private toastCtrl : ToastController,
    public modalController:ModalController,
    private camera: Camera,
    private events : EventsService,
    private platform : Platform,
    private router: Router,
    private route: ActivatedRoute,
    private statusBar : StatusBar,
    private translate: TranslateService,
    private screenOrientation : ScreenOrientation,
    private streamingMedia : StreamingMedia,
    private actionSheetCtrl : ActionSheetController) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'ALERT_TEXT.VISITOR_CHECKIN_SUCCESS',
      'ALERT_TEXT.ACK_IDLE_TIME_MESSAGE',
      'ALERT_TEXT.SETTINGS_NOT_FOUND',
      'ALERT_TEXT.IMAGE_SELECT_ERROR',
    'COMMON.VIDEO_ERROR','COMMON.OK']).subscribe(t => {
        this.T_SVC = t;
    });

    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        try{
          this.visitor = JSON.parse(passData.visitorDetails)[0];
        }catch(e){

        }
        if(!this.visitor){
          this.visitor = JSON.parse(passData.visitorDetails);
        }
        if(!this.visitor || !this.visitor.VisitorSeqId) {
          this.navCtrl.navigateRoot('sign-pad-idle-page');
          return;
        }
      }
    });
    this.platform.ready().then(() => {
      this.isTabletOrIpad = this.platform.is('tablet') || this.platform.is('ipad');
      this.screenHeight = platform.height();
      this.screenWidth = platform.width();

      this.setDisplayCss();
      this.statusBar.hide();
      this.screenOrientation.onChange().subscribe(
        (data) => {

            this.setDisplayCss();

        }
      );
    });

    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS);
    if(settings && JSON.parse(settings)){
      this.appSettings = JSON.parse(settings);
      this.appSettings.VisitorDetails = JSON.parse(this.appSettings.VisitorDetails);
      if(!this.appSettings.VisitorDetails.Floor){
        this.appSettings.VisitorDetails.Floor = {
          name : "Floor",
          value : true
        }
      }

      // this.appSettings.ImageCaptureEnabled = true;
      if(this.appSettings.customStyle && JSON.parse(this.appSettings.customStyle)){
        this.customStyle = JSON.parse(this.appSettings.customStyle);
       }
       if(!this.customStyle || !this.customStyle.DetailsPage || !this.customStyle.DetailsPage.backgroundcolor1){
        this.customStyle  = {
          "DetailsPage":{
            backgroundcolor1 : "#148F77",
            backgroundcolor2 : "#73C6B6"
          }
        }

      }
    }else{
      var QRData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if(QRData){
        var cObj = JSON.parse(QRData);
        if(cObj){
          var params  = {
            "RefSchoolSeqId": "",
            "RefBranchSeqId": "",
            "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
            "LocatorName": cObj.Location,
            "MAppDevSeqId": cObj.MAppDevSeqId
          }
          this.apiProvider.getVisitorAcknowledgeSetting(params).then(
            (val) => {
              var result = JSON.parse(val+"");
              if(result){
              console.log(val+"");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS,val+"");
              this.appSettings = result;
              this.appSettings.VisitorDetails = JSON.parse(this.appSettings.VisitorDetails);
              if(!this.appSettings.VisitorDetails.Floor){
                this.appSettings.VisitorDetails.Floor = {
                  name : "Floor",
                  value : true
                }
              }
              if(result.customStyle && JSON.parse(this.appSettings.customStyle)){
                this.customStyle = JSON.parse(this.appSettings.customStyle);
              }

               if(!this.customStyle || !this.customStyle.DetailsPage || !this.customStyle.DetailsPage.backgroundcolor1){
                this.customStyle  = {
                  "DetailsPage":{
                    backgroundcolor1 : "#148F77",
                    backgroundcolor2 : "#73C6B6"
                  }
                }

              }
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS,val+"");
              }
            },
            async (err) => {
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND'],
                cssClass: '',
                buttons: ['Okay']
              });
                alert.present();
            }
          );

        }
      }
      // this.appSettings = {
      //   ImageCaptureEnabled:true,
      //   VisitorDetails :
      //   {
      //     VisitorName: {
      //       name:"MUHAMMAD SHAKIR BIN RANI",
      //       value : true
      //     },
      //     VisitorEmail: {
      //       name  : "Email",
      //       value : true
      //     },
      //     VisitorMobNo : {
      //       name  : "MobNo",
      //       value : true
      //     }


      //   }
      // }
      // this.visitor = {
      //   VisitorName : "Vijay",
      //   VisitorEmail : "vijay@calms.com.my",
      //   VisitorMobNo : "+60 243254654",
      //   // HostName : "Karthik",
      //   // DeptDesc : "Research and Development",
      //   // HostEmail: "karthi@calms.com.my"
      //   HostName : "",
      //   DeptDesc : "",
      //   HostEmail: ""
      // }
    }

  }

  setDisplayCss(){
    console.log("Orientation Changed : " + window.orientation);
    switch(window.orientation){
      case 0:
      case 180:
        if(this.isTabletOrIpad){
          this.screenSize = AppSettings.SCREEN_SIZE.TABLET_PORTRAIT;
        }else{
          this.screenSize = AppSettings.SCREEN_SIZE.NORMAL_PORTRAIT;
        }
      break;
      case 90:
      case -90:
        if(this.isTabletOrIpad){
          this.screenSize = AppSettings.SCREEN_SIZE.TABLET_LANDSCAP;
        }else{
          this.screenSize = AppSettings.SCREEN_SIZE.NORMAL_LANDSCAP;
        }
      break;
    }
  }

  getVideoOptionAvailable(){
    if(!this.visitor || !this.visitor.VisitorSeqId) {
      this.navCtrl.navigateRoot('sign-pad-idle-page');
      return;
    }
    var QrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if(QrInfo && JSON.parse(QrInfo)){
      var QRObj = JSON.parse(QrInfo);
        var params  = {
          "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
          "VisitorId": this.visitor.VisitorSeqId,
          "MAppDevSeqId":QRObj.MAppDevSeqId
        };
        this.apiProvider.GetSafetyBriefStatus(params).then(
          (val) => {
            this.allowVideo = true;
            this.VideoUrl = JSON.parse(val+"")[0].VideoUrl;
          },
          (err) => {
            this.allowVideo = false;
          }
        );
      }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter SignPadVisitorDetailsPage');

    this.getVideoOptionAvailable();
    this.checkAppointmentFinished();
  }

  checkAppointmentFinished(){

    var _currentClass = this;
    var timeoutInterval = setInterval(function(){
      // _currentClass._zone.run(() => {
        var params = {
          "LocatorName": ""
        }
        var QRCode = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
        if(!QRCode){

          return;
        }
        _currentClass.apiProvider.GetVisitorInfoFromLocator(params).then(
          (val) => {
            var moveToWelcome = false;
            if(val){
              if(val && JSON.parse(val+"") && JSON.parse(val+"").length == 0 ){//
                moveToWelcome = true;
              }

              var vDetails = JSON.parse(val+"")[0];
              if(!moveToWelcome && vDetails && vDetails.VisitorSeqId != _currentClass.visitor.VisitorSeqId){
                moveToWelcome = true;
                console.log("SignPadVisitorDetailsPage by 1");
              }
            }
            if(moveToWelcome){
              if(_currentClass.modal){
                _currentClass.modal.dismiss();
              }
              _currentClass.events.publishDataCompany({
                action: 'user:created',
                title: "CheckIn Acknowledgment",
                message: "CheckIn Acknowledgment"
              });
              return;
            }
          },
          (err) => {
            if(err && err.message == "No Internet"){
              return;
            }
          }
        );

      // });
    }, this.bufferTimeToCheck);

    _currentClass.timeoutInterval = timeoutInterval;
  }


  ionViewWillLeave(){
    clearInterval(this.timeoutInterval);
  }
  proceedToNextStep(){
    var _thisData = this;
    var web = false;
    if(!this.platform.is('cordova')) {
      web = true;
    }
    if(!this.HostImage){
      this.HostImage = "";
    }
    // this.appSettings.QuestionsEnabled = true;
    if (this.appSettings.EnableQuestionaries && this.appSettings.Questions && this.appSettings.Questions.length > 0) {
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {"visitor": JSON.stringify(this.visitor) , "visitorImage" : this.HostImage}
        }
      };
      this.router.navigate(['pages-questions'], navigationExtras);

    } else if(this.appSettings.TermsAndConditionEnabled){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {"visitor": JSON.stringify(this.visitor) , "visitorImage" : this.HostImage}
        }
      };
      this.router.navigate(['sign-pad-terms-and-condition-page'], navigationExtras);
    } else if(this.appSettings.VideoOption && !web && this.allowVideo){
      clearInterval(this.timeoutInterval);
      // Play a video with callbacks
      var options : StreamingVideoOptions = {
      successCallback: function() {
        console.log("Video was closed without error.");

        if(_thisData.appSettings.SignatureEnabled){
          _thisData.checkAppointmentFinished();
          setTimeout(async () => {
            const presentModel = await _thisData.modalController.create({
              component: SignaturePagePage,
              componentProps: {"visitor": _thisData.visitor, "visitorImage" : _thisData.HostImage},
              showBackdrop: true,
              mode: 'ios',
              cssClass: 'appointmentModel'
            });
            presentModel.onWillDismiss().then((data) => {
            });
            return await presentModel.present();
          }, 300);
        }else{
          _thisData.checkInVisitor();
        }
      },
      errorCallback: async function(errMsg) {
        console.log("Error! " + errMsg);
        let invalidQRConfirm = await _thisData.alertCtrl.create({
          header: 'Error !',
          message: "<span class='failed'>" + _thisData.T_SVC['COMMON.VIDEO_ERROR'] + '</span>',
          cssClass: '',
          buttons: [
            {
              text: _thisData.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        invalidQRConfirm.present();
        _thisData.checkAppointmentFinished();
      },
      orientation: 'landscape',
      shouldAutoClose: true,  // true(default)/false
      controls: false  // true(default)/false. Used to hide controls on fullscreen
      };
      var videoUrl = AppSettings.API_ViDEO_PATH;
      var QRData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if(QRData){
        var ApiUrl = JSON.parse(QRData).ApiUrl;
        if(ApiUrl.indexOf("/api") > -1) {
          ApiUrl = ApiUrl.split("/api")[0];
        }
        videoUrl = ApiUrl + "/FS/";
      }
      this.streamingMedia.playVideo(videoUrl+ this.VideoUrl, options);

    }else if(this.appSettings.SignatureEnabled){
      setTimeout(async () => {
        const presentModel = await _thisData.modalController.create({
          component: SignaturePagePage,
          componentProps: {"visitor": JSON.stringify(_thisData.visitor), "visitorImage" : _thisData.HostImage},
          showBackdrop: true,
          mode: 'ios',
          cssClass: 'appointmentModel'
        });
        presentModel.onWillDismiss().then((data) => {
        });
        return await presentModel.present();
      }, 300);
    }else{
      this.checkInVisitor();
    }

  }

  private checkInVisitor(){
    if(!this.visitor || !this.visitor.VisitorSeqId){
      return;
    }
    var params  = {
      "VisitorId": this.visitor.VisitorSeqId,
      "VisitorImg": this.HostImage,
      "SafetyBrief": this.appSettings.VideoOption,
      "VisitorSign": "",
      "AttSeqId": this.visitor.AttSeqId,
      "QuestAnswer": this.visitor.Questions ? JSON.stringify(this.visitor.Questions) : ''
    }
    this.apiProvider.SaveVisitorCheckinInfo(params).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result  && result[0].Code == 10){

          let toast = await this.toastCtrl.create({
            message: this.T_SVC['ALERT_TEXT.VISITOR_CHECKIN_SUCCESS'],
            duration: 3000,
            color: 'primary',
            position: 'bottom'
          });
          toast.present();
          if(this.appSettings.EnableACSQr){
            const navigationExtras: NavigationExtras = {
              state: {
                passData: {
                  data: JSON.stringify(this.visitor)
                }
              }
            };
            this.router.navigate(['qr-code-image-page'], navigationExtras);
          }else{
            this.events.publishDataCompany({
              action: 'user:created',
              title: "CheckIn Acknowledgment",
              message: "CheckIn Acknowledgment"
            });
          }
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

        if(err && err.message == "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message == "Http failure response for"){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else {
          var result = JSON.parse(err.toString());
          if(result  && result["Table"] != undefined){
            message = result["Table"][0].description? result["Table"][0].description : result["Table"][0].Description;
          }else if(result  && result["Table1"] != undefined){
            message = result["Table1"][0].Status? result["Table1"][0].Status : result["Table1"][0].Description;
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

  public presentActionSheet() {
    if(!this.appSettings.ImageCaptureEnabled){
      return;
    }

    let actionSheet = this.actionSheetCtrl.create({
      header: 'Select Image Source',
      cssClass :'',
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
   // actionSheet.present();
   var currClass = this;
   this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
    result =>{
      console.log('Has permission?',result.hasPermission)
      if(result.hasPermission){
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
          result =>{
            currClass.apiProvider.presentLoading();
            currClass.alertShowing = false;
            currClass.isProceedClicked = true;
            currClass.takePicture(currClass.camera.PictureSourceType.CAMERA);
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
      this.HostImage = imageData;
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


  ngOnInit() {
  }

}
