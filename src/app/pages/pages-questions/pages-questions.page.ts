import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { NavController, Platform, ToastController, AlertController, ModalController, IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { SignaturePagePage } from '../signature-page/signature-page.page';
import * as anime from 'animejs';
@Component({
  selector: 'app-pages-questions',
  templateUrl: './pages-questions.page.html',
  styleUrls: ['./pages-questions.page.scss'],
})
export class PagesQuestionsPage implements OnInit {


  @ViewChild(IonContent) content:IonContent;

  T_SVC:any;
  disableCheckbox = true;
  isChecked = false;
  visitor : any = {};
  isVideoPlaying = false;
  appSettings :any = {};
  visitorImage = "";
  allowVideo = false;
  VideoUrl = "";
  QRData : any = {};
  screenHeight = 0;
  customStyle : any = {
    "DetailsPage":{
      backgroundcolor1 : "#5ed0b9",
      backgroundcolor2 : "#0f705d",
    }
  }
  currentQuestionPos = 0;
  alert : any;
  timeoutInterval : any ;
  bufferTimeToCheck : any = AppSettings.IdleListenBufferTime;
  alertShowing : any = false;
  isProceedClicked : any = false;
  // modal : any;
  constructor(public navCtrl: NavController,
    private streamingMedia: StreamingMedia,
    private platform : Platform,
    private _zone : NgZone,
    private router: Router,
    private toastCtrl : ToastController,
    private alertCtrl : AlertController,
    private events : EventsService,
    private apiProvider : RestProvider,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private alertCntrl : AlertController,
    public modalController:ModalController) {

      this.translate.get([
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
        'ALERT_TEXT.ACK_IDLE_TIME_MESSAGE',
        'ALERT_TEXT.SETTINGS_NOT_FOUND',
        'ALERT_TEXT.VISITOR_CHECKIN_SUCCESS', 'COMMON.VIDEO_ERROR', 'COMMON.OK']).subscribe(t => {
          this.T_SVC = t;
      });
      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          const passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + passData);
          const visitor = passData.visitor;
          if(!visitor) {
            this.navCtrl.navigateRoot('sign-pad-idle-page');
            return;
          }
          this.visitor = JSON.parse(visitor);
          this.visitor.Questions = [];
          this.visitorImage =  passData.visitorImage;
          var QRData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
          if(QRData){
            var cObj = JSON.parse(QRData);
            if(cObj){
              this.QRData = cObj
            }
          }
        }
      });

    platform.ready().then((readySource) => {
      console.log('Width: ' + platform.width());
      console.log('Height: ' + platform.height());
      this.screenHeight = platform.height();
    });

    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS);
    if(settings && JSON.parse(settings)){
      this.appSettings = JSON.parse(settings);
      this.appSettings.VisitorDetails = JSON.parse(this.appSettings.VisitorDetails);
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
      var params  = {
        "RefSchoolSeqId": "",
        "RefBranchSeqId": "",
        "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
        "LocatorName": this.QRData.Location,
        "MAppDevSeqId": this.QRData.MAppDevSeqId
      }
      this.apiProvider.getVisitorAcknowledgeSetting(params).then(
        (val) => {
          var result = JSON.parse(val+"");
          if(result){
           console.log(val+"");
           this.appSettings = result;
           if(result.customStyle){
            this.customStyle = result.customStyle;
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
          let alert = await this.alertCntrl.create({
            header: 'Error !',
            message: this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND'],
            cssClass: 'alert-danger',
            buttons: ['Okay']
          });
            alert.present();
        }
      );
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter PagesQuestionsPage');

    this.getVideoOptionAvailable();
    this.checkAppointmentFinished();
  }

callAnime() {
  try {
    anime({
      targets: '.animate-me',
      translateX: [
        { value: 100, duration: 1200 },
        { value: 0, duration: 800 }
      ],
      rotate: '1turn',
      backgroundColor: '#ff00ff',
      duration: 2000
    });
  } catch (error) {

  }
}

  pressAnswerBtn(currentQuesPos, answer) {
    const sItem = this.appSettings.Questions[currentQuesPos];
    sItem.Answer = answer;
    if ((currentQuesPos + 1) >= this.appSettings.Questions.length) {
      const item = {
        "Answer": answer,
        "ValidationRequired":  sItem.ValidationRequired,
        "QuestionariesSeqId": sItem.QuestionariesSeqId};
      this.visitor.Questions[this.currentQuestionPos] = item;
      this.proceedToNextStep();
    } else {
      const item = {
        "Answer": answer,
        "ValidationRequired":  sItem.ValidationRequired,
        "QuestionariesSeqId": sItem.QuestionariesSeqId};
      this.visitor.Questions[this.currentQuestionPos] = item;
      this.currentQuestionPos = currentQuesPos + 1;
    }
    this.callAnime();
  }

  proceedToBackStep() {
    if (this.currentQuestionPos > 0) {
      this.currentQuestionPos = this.currentQuestionPos -1;
    } else {
      this.navCtrl.pop();
    }

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
              if(!moveToWelcome && vDetails && _currentClass.visitor && vDetails.VisitorSeqId != _currentClass.visitor.VisitorSeqId){
                moveToWelcome = true;
                console.log("SignPadVisitorDetailsPage by 1");
              }
            }
            if(moveToWelcome){
              if(_currentClass.modalController){
                _currentClass.modalController.dismiss();
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

  getVideoOptionAvailable(){
    var QrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if(QrInfo && JSON.parse(QrInfo)){
      var QRObj = JSON.parse(QrInfo);
        var params  = {
          "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
          "VisitorId": (this.visitor && this.visitor.VisitorSeqId) ? this.visitor.VisitorSeqId : "",
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

  proceedToNextStep(){
    var _thisData = this;
    if(!this.platform.is('cordova')) {
      this.allowVideo = false;
    }
    if(!this.visitorImage){
      this.visitorImage = "";
    }
    // this.appSettings.QuestionsEnabled = true;
    if(this.appSettings.TermsAndConditionEnabled){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {"visitor": JSON.stringify(this.visitor) , "visitorImage" : this.visitorImage}
        }
      };
      this.router.navigate(['sign-pad-terms-and-condition-page'], navigationExtras);
    }else if(this.appSettings.VideoOption && this.allowVideo){
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
              componentProps: {"visitor": _thisData.visitor, "visitorImage" : _thisData.visitorImage},
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
          cssClass: 'alert-danger',
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
          componentProps: {"visitor": JSON.stringify(_thisData.visitor), "visitorImage" : _thisData.visitorImage},
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
    var visitorObj = this.visitor;
    var params  = {
      "VisitorId": visitorObj.VisitorSeqId,
      "VisitorImg": this.visitorImage,
      "SafetyBrief": this.appSettings.VideoOption,
      "VisitorSign": "",
      "AttSeqId": visitorObj.AttSeqId,
      "QuestAnswer": visitorObj.Questions ? JSON.stringify(visitorObj.Questions) : ''
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
                  data: JSON.stringify(visitorObj)
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
        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else {
          var result = JSON.parse(err.toString());
          if(result  && result["Table"] != undefined){
            message = result["Table"][0].description? result["Table"][0].description : result["Table"][0].Description;
          }else if(result  && result["Table1"] != undefined){
            message = result["Table1"][0].Status? result["Table1"][0].Status : result["Table1"][0].Description;
          } else if(result.message){
            message = result.message;
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

  ngOnInit() {
  }

}
