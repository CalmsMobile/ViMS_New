import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BarcodeScannerOptions, BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { NavController, AlertController, ModalController, Platform, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { ToastService } from 'src/app/services/util/Toast.service';

@Component({
  selector: 'app-sign-pad-idle-page',
  templateUrl: './sign-pad-idle-page.page.html',
  styleUrls: ['./sign-pad-idle-page.page.scss'],
})
export class SignPadIdlePagePage implements OnInit {

  isListeningAppointment = false;
  isMovedToDetailPage = false;
  isFetchingSettings = false;
  timeoutInterval : any;
  timeoutIntervalSettings : any;
  companyImage = "";
  listItems=[];
  ackSeettings : any = {};
  selectedLocator : any;
  AppointmentSync_Interval : any = 5;
  SettingsSync_Interval : any = 10;
  _currentClass : any = this;
  companyData = {
    HomeTitle : "Calms Tecnologies Sdn Bhd",
    HomeContent : "You are going to do great things with calms",
    LogoImg : "",
    StorageURL :""
  }

  QRData : any = {};
  isTabletOrIpad = false;

  customStyle : any = {
    "WelcomePage":{
      backgroundcolor1 : "#5ed0b9",
      backgroundcolor2 : "#0f705d",
      "Title":{
        fontSize :  30,
        fontFamily : "Lobster"
      },
      "welcomeText":{
        fontSize :  20,
        fontFamily : "Teko"
      },
      "WelcomeDescription":{
        fontSize :  17,
        fontFamily : "Open Sans Condensed"
      }
    }

  }
  alertShowing : any = false;
  screenSize = AppSettings.SCREEN_SIZE.NORMAL_PORTRAIT;
  modal : any;
  tab_por = AppSettings.SCREEN_SIZE.TABLET_PORTRAIT;
  nor_por = AppSettings.SCREEN_SIZE.NORMAL_PORTRAIT;
  tab_land = AppSettings.SCREEN_SIZE.TABLET_LANDSCAP;
  nor_land = AppSettings.SCREEN_SIZE.NORMAL_LANDSCAP;
  T_SVC:any;
  options :BarcodeScannerOptions;
  waitForProcess = false;
  TYPE2 = AppSettings.ACK_APP.TYPE2;
  constructor(public navCtrl: NavController,
    public apiProvider : RestProvider,
    public alertCtrl : AlertController,
    private streamingMedia : StreamingMedia,
    public modalController:ModalController,
    private _zone : NgZone,
    private router: Router,
    private platform : Platform,
    private barcodeScanner: BarcodeScanner,
    private translate:TranslateService,
    private toastCtrl : ToastService,
    public statusBar: StatusBar,
    private screenOrientation: ScreenOrientation,
     public menuCtrl: MenuController) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL','ACC_MAPPING.PROCEED','ADD_VISITORS.LAB_USER_IC',
    'ACC_MAPPING.INVALID_QR', 'COMMON.OK', 'COMMON.SCAN', 'COMMON.MANUAL', 'ALERT_TEXT.UPDATE_BRIEF_STATUS', 'ALERT_TEXT.THANK_YOU_WATCH_VIDEO',
  'ALERT_TEXT.VIDEO_NOT_AVAILABLE', 'ALERT_TEXT.UPDATE_BRIEF_STATUS_TITLE', 'COMMON.VIDEO_ERROR']).subscribe(t => {
        this.T_SVC = t;
    });
    this.isTabletOrIpad = this.platform.is('tablet') || this.platform.is('ipad');
    this.menuCtrl.enable(false, 'myLeftMenu');
    var QRData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if(QRData){
      var cObj = JSON.parse(QRData);
      if(cObj){
        this.QRData = cObj
      }

    }

    this.setDisplayCss();
    this.statusBar.hide();
    if(this.platform.is('cordova')) {
      screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    }
    this.screenOrientation.onChange().subscribe(
      (data) => {
          console.log("Orientation Changed" + data);
          this.setDisplayCss();
      }
   );
  }

  setDisplayCss(){
    switch(window.orientation){
      case 0:
      case 180:
        if(this.isTabletOrIpad){
          this.screenSize = AppSettings.SCREEN_SIZE.TABLET_PORTRAIT;
        }else{
          // this.screenSize = AppSettings.SCREEN_SIZE.NORMAL_PORTRAIT;
          this.screenSize = AppSettings.SCREEN_SIZE.TABLET_PORTRAIT;
        }
      break;
      case 90:
      case -90:
        if(this.isTabletOrIpad){
          this.screenSize = AppSettings.SCREEN_SIZE.TABLET_LANDSCAP;
        }else{
          this.screenSize = AppSettings.SCREEN_SIZE.TABLET_LANDSCAP;
        }
      break;
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter SignPadIdlePage');
    this.isMovedToDetailPage = false;
    this._currentClass.isMovedToDetailPage = false;
    this._currentClass.isListeningAppointment = false;
    var ackSeettings =  window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS);
    if(ackSeettings && JSON.parse(ackSeettings)){
      var result = JSON.parse(ackSeettings);
      this.ackSeettings = result;
      if(result.HomeTitle){
        this.companyData.HomeTitle = result.HomeTitle;
       }
       if(result.HomeContent){
        this.companyData.HomeContent = result.HomeContent;
       }
       if(result.LogoImg){
        this.companyData.LogoImg = result.LogoImg;
       }
       if(this.QRData){
        var ApiUrl = this.QRData.ApiUrl;
        if(ApiUrl.indexOf("/api") > -1) {
          ApiUrl = ApiUrl.split("/api")[0];
        }
        this.companyData.StorageURL = ApiUrl + "/FS/";
       }

       if(result.AppointmentSync_Interval){
        this.AppointmentSync_Interval = result.AppointmentSync_Interval;
       }else{
        this.AppointmentSync_Interval = 5;
       }

       if(result.SettingsSync_Interval){
        this.SettingsSync_Interval = result.SettingsSync_Interval;
      }else{
        this.SettingsSync_Interval = 10;
      }

       if(result.customStyle && JSON.parse(result.customStyle)){
        this.customStyle = JSON.parse(result.customStyle);
        if(!this._currentClass.customStyle.WelcomePage.backgroundcolor1){
          this._currentClass.customStyle.WelcomePage.backgroundcolor1 = "#5acba0";
          this._currentClass.customStyle.WelcomePage.backgroundcolor2 = "#5d866a";
        }
        if(!this._currentClass.customStyle.WelcomePage.Title.fontSize){
          this._currentClass.customStyle.WelcomePage.Title = 36;
        }
        if(!this._currentClass.customStyle.WelcomePage.welcomeText.fontSize){
          this._currentClass.customStyle.WelcomePage.welcomeText.fontSize = 36;
        }
        if(!this._currentClass.customStyle.WelcomePage.WelcomeDescription.fontSize){
          this._currentClass.customStyle.WelcomePage.WelcomeDescription.fontSize = 16;
        }
       }else{
        this.customStyle  = {
          "WelcomePage":{
            backgroundcolor1 : "#5acba0",
            backgroundcolor2 : "#5d866a",
            "Title":{
              fontSize :  30,
              fontFamily : "Lobster"
            },
            "welcomeText":{
              fontSize :  20,
              fontFamily : "Teko"
            },
            "WelcomeDescription":{
              fontSize :  17,
              fontFamily : "Open Sans Condensed"
            }
          }

        }
      }
    }
    this.getAckSettings(false,this._currentClass);

    if(this.QRData.Location){
     this.listenVisitorDetails(this.QRData.Location);
    }
  }

  getAckSettings(refresh, _currentClass : any){

    if(_currentClass.QRData && _currentClass.QRData.Location){
      if(_currentClass.timeoutIntervalSettings){
       clearInterval(_currentClass.timeoutIntervalSettings);
      }

      var timeoutInterval = setInterval(function(){
          if(_currentClass.isFetchingSettings){
              console.log("Dont try..Setting is Fetching");
          }else{
            var QRData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
            if(!QRData){
              if(_currentClass.timeoutIntervalSettings){
                clearInterval(_currentClass.timeoutIntervalSettings);
              }
              return;
            }
            _currentClass.isFetchingSettings = true;
            var params  = {
              "RefSchoolSeqId": "",
              "RefBranchSeqId": "",
              "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
              "LocatorName": _currentClass.QRData.Location,
              "MAppDevSeqId": _currentClass.QRData.MAppDevSeqId
            }
            _currentClass.apiProvider.getVisitorAcknowledgeSetting(params).then(
              (val) => {
                _currentClass.isFetchingSettings = false;
                var result = JSON.parse(val+"");
                if(result){
                _currentClass.ackSeettings = result;
                console.log(val+"");
                _currentClass._zone.run(() => {
                  // _currentClass.navCtrl.push("PagesQuestionsPage", {"visitor": JSON.stringify({}) , "visitorImage" : this.HostImage});
                  if(result.HomeTitle){
                    _currentClass.companyData.HomeTitle = result.HomeTitle;
                  }
                  if(result.HomeContent){
                    _currentClass.companyData.HomeContent = result.HomeContent;
                  }
                  if(result.LogoImg){
                    _currentClass.companyData.LogoImg = result.LogoImg;
                  }
                  // _currentClass.companyData.LogoImg = "";


                  if(QRData){
                    var ApiUrl = JSON.parse(QRData).ApiUrl;
                    if(ApiUrl.indexOf("/api") > -1) {
                      ApiUrl = ApiUrl.split("/api")[0];
                    }
                    _currentClass.companyData.StorageURL = ApiUrl + "/FS/";
                  }

                  if(result.AppointmentSync_Interval){
                    _currentClass.AppointmentSync_Interval = result.AppointmentSync_Interval;
                  }else{
                    _currentClass.AppointmentSync_Interval = 5;
                  }

                  if(result.SettingsSync_Interval){
                    _currentClass.SettingsSync_Interval = result.SettingsSync_Interval;
                  }else{
                    _currentClass.SettingsSync_Interval = 10;
                  }

                  if(result.customStyle && JSON.parse(result.customStyle)){
                    _currentClass.customStyle = JSON.parse(result.customStyle);
                    if(!_currentClass.customStyle.WelcomePage.backgroundcolor1){
                      _currentClass.customStyle.WelcomePage.backgroundcolor1 = "#5acba0";
                      _currentClass.customStyle.WelcomePage.backgroundcolor2 = "#5d866a";
                    }
                    if(!_currentClass.customStyle.WelcomePage.Title.fontSize){
                      _currentClass.customStyle.WelcomePage.Title.fontSize = 36;
                    }
                    if(!_currentClass.customStyle.WelcomePage.welcomeText.fontSize){
                      _currentClass.customStyle.WelcomePage.welcomeText.fontSize = 36;
                    }
                    if(!_currentClass.customStyle.WelcomePage.WelcomeDescription.fontSize){
                      _currentClass.customStyle.WelcomePage.WelcomeDescription.fontSize = 16;
                    }
                  }else{
                    if(refresh){
                      _currentClass.customStyle = {
                        "WelcomePage":{
                          backgroundcolor1 : "#5acba0",
                          backgroundcolor2 : "#5d866a",
                          "Title":{
                            fontSize :  30,
                            fontFamily : "Lobster"
                          },
                          "welcomeText":{
                            fontSize :  20,
                            fontFamily : "Teko"
                          },
                          "WelcomeDescription":{
                            fontSize :  17,
                            fontFamily : "Open Sans Condensed"
                          }
                        }

                      }
                    }

                  }
                  window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS,val+"");
                  if(result.SettingsSync_Interval && _currentClass.SettingsSync_Interval != result.SettingsSync_Interval){
                    if(_currentClass.timeoutIntervalSettings){
                      clearInterval(_currentClass.timeoutIntervalSettings);
                    }

                    _currentClass.getAckSettings(false, _currentClass);
                  }
                  if(result.AppointmentSync_Interval && _currentClass.AppointmentSync_Interval !== result.AppointmentSync_Interval){
                    if(_currentClass.timeoutInterval){
                      clearInterval(_currentClass.timeoutInterval);
                    }
                    _currentClass.listenVisitorDetails(_currentClass.QRData.Location, _currentClass);
                  }
                });

                }
              },
              (err) => {
                _currentClass.isFetchingSettings = false;
                // if(_currentClass.timeoutIntervalSettings){
                //   clearInterval(_currentClass.timeoutIntervalSettings);
                // }
              }
            );
          }
      },_currentClass.SettingsSync_Interval * 1000);
      _currentClass.timeoutIntervalSettings = timeoutInterval;
  }
  }

  logoutMe(){
    this.translate.get(['SETTINGS.ARE_U_SURE_LOGOUT_TITLE','SETTINGS.ARE_U_SURE_LOGOUT',
     'SETTINGS.EXIT_ACCOUNT_SCUSS','SETTINGS.EXIT_ACCOUNT_FAILED'
    ,'COMMON.OK','COMMON.CANCEL','COMMON.EXIT1']).subscribe(async t => {
      let loginConfirm = await this.alertCtrl.create({
        header: t['SETTINGS.ARE_U_SURE_LOGOUT_TITLE'],
        message: t['SETTINGS.ARE_U_SURE_LOGOUT'],
        cssClass: '',
        buttons: [
          {
            text: t['COMMON.EXIT1'],
            handler: () => {
              //this._app.getRootNav().setRoot(LoginPage);
              if (this._currentClass.timeoutIntervalSettings) {
                clearInterval(this._currentClass.timeoutIntervalSettings);
              }
              this._currentClass.isListeningAppointment = false;
              this.toastCtrl.create(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
              localStorage.clear();
              this.navCtrl.navigateRoot('account-mapping');

            }
          },
          {
            text: t['COMMON.CANCEL'],
            role: 'cancel',
            handler: () => {
              // var location = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SIGN_PAD);
              if (this.QRData.Location) {
                this.listenVisitorDetails(this.QRData.Location);
              }
            }
          }
        ]
      });
      loginConfirm.present();
      loginConfirm.onDidDismiss().then(() => {
        this._currentClass.isListeningAppointment = false;
        this.getAckSettings(true, this._currentClass);
      })

      // this.modal = this.modalController.create(SignaturePage, {"visitor": {}, "visitorImage": ""});
      // this.modal.present();

    });
  }


  released(){
    // alert("Released");
  }

  pressed(){
    // alert("Pressed");
    this._currentClass.isListeningAppointment = false;
    if(this._currentClass.timeoutInterval){
      clearInterval(this._currentClass.timeoutInterval);
    }
    if(this._currentClass.timeoutIntervalSettings){
      clearInterval(this._currentClass.timeoutIntervalSettings);
    }
    this.logoutMe();

  }

  active(){
    // alert("Active");
  }

  ionViewWillLeave(){
    this.isMovedToDetailPage = true;
    if(this._currentClass.timeoutInterval){
      clearInterval(this._currentClass.timeoutInterval);
    }
    if(this.timeoutIntervalSettings){
      clearInterval(this.timeoutIntervalSettings);
    }
    console.log('ionViewWillLeave Idle Sign Pad');
  }

  listenVisitorDetails(data){

    if(this.QRData.type == AppSettings.ACK_APP.TYPE2){
      return;
    }

    if(this.isListeningAppointment){
      console.log("Dont try its fetching VisitorDetails");
    }else if(this.isMovedToDetailPage) {
      console.log("Dont try its showing VisitorDetails");
    }else{
      // if(_currentClass.timeoutInterval){
      //   clearInterval(_currentClass.timeoutInterval);
      // }

    const timeoutInterval = setTimeout(() => {
      this.isListeningAppointment  = true;
      // _currentClass._zone.run(() => {
        var params = {
          "LocatorName": data
        }
        var QRCode = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
        if(!QRCode){
          this.isListeningAppointment  = false;
          return;
        }
        var ackData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.ACK_DETAILS);
          var MAppDevSeqId = "";
          if(ackData && JSON.parse(ackData)){
            MAppDevSeqId = JSON.parse(ackData).MAppDevSeqId;
          }
          if(!MAppDevSeqId){
            return;
          }
          this.apiProvider.GetVisitorInfoFromLocator(params).then(
          (val) => {
            this.isListeningAppointment  = false;
            this.listenVisitorDetails(data);
            if(val){
              if(val && JSON.parse(val+"") && JSON.parse(val+"").length == 0 ){//
                console.log("SignPadVisitorDetailsPage open by 1");
                // this.isMovedToDetailPage = true;
                  // const data = [
                  //   {
                  //     VisitorSeqId: '123',
                  //     VisitorCompName: 'CALMS',
                  //     VisitorName: 'TEST'
                  //   }
                  // ]
                  // const navigationExtras: NavigationExtras = {
                  //   state: {
                  //     passData: {
                  //       "visitorDetails": JSON.stringify(data)
                  //     }
                  //   }
                  // };
                  // this.router.navigate(['sign-pad-visitor-details-page'], navigationExtras);
                return;
              }

              var apptData = val+"";
              var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS);
              var vDetails = JSON.parse(val+"")[0];
              if(settings){
                this.ackSeettings = JSON.parse(settings+"");
                this.isListeningAppointment = false;
                clearInterval(timeoutInterval);
                // clearInterval(listenT);
                if(this.isMovedToDetailPage || !vDetails.VisitorName) {
                  console.log("Dont try its showing VisitorDetails 1");
                  return;
                }
                // this._zone.run(() => {
                  console.log("SignPadVisitorDetailsPage open by 1");
                  this.isMovedToDetailPage = true;
                  const navigationExtras: NavigationExtras = {
                    state: {
                      passData: {
                        "visitorDetails": val+""
                      }
                    }
                  };
                  this.router.navigate(['sign-pad-visitor-details-page'], navigationExtras);
                // });

              }else{

                var params  = {
                  "RefSchoolSeqId": "",
                  "RefBranchSeqId": "",
                  "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
                  "LocatorName": data,
                  "MAppDevSeqId": this.QRData.MAppDevSeqId
                }
                this.apiProvider.getVisitorAcknowledgeSetting(params).then(
                  (val) => {
                    var result = JSON.parse(val+"");
                    if(result){
                     console.log(val+"");
                     window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS,val+"");
                     this.ackSeettings = result;
                    //  this.navCtrl.push("PagesQuestionsPage", {"visitor": {} , "visitorImage" : this.HostImage});
                     if(this.isMovedToDetailPage || !vDetails.VisitorName) {
                      console.log("Dont try its showing VisitorDetails 2");
                      return;
                    }
                    //  _currentClass._zone.run(() => {
                      console.log("SignPadVisitorDetailsPage open by 2");
                      this.isMovedToDetailPage = true;
                      const navigationExtras: NavigationExtras = {
                        state: {
                          passData: {
                            "visitorDetails": apptData
                          }
                        }
                      };
                      this.router.navigate(['sign-pad-visitor-details-page'], navigationExtras);
                    }
                  },
                  (err) => {

                  }
                );
              }


            }else{
              // let alert = _currentClass.alertCtrl.create({
              //   header: 'Error !',
              //   message: "Visitor information not available",
              //   cssClass:'',
              //   buttons: ['Okay']
              //   });
              //   alert.present();
            }
            this.isListeningAppointment  = false;
          },
          async (err) => {
            this.isListeningAppointment  = false;
            clearInterval(timeoutInterval);
            if(err && err.message == "No Internet"){
              return;
            }
            var message = "";
            if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
              message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
            } else if(err && JSON.parse(err) && JSON.parse(err).message){
              message =JSON.parse(err).message;
            }
            if(message && !this.alertShowing){
              this.alertShowing = true;
              // message = " Unknown"
              let alert = this.alertCtrl.create({
                header: 'Error !',
                message: message,
                cssClass:'',
                buttons: ['Okay']
                });
                (await alert).present();
                (await alert).onDidDismiss().then(() => {
                  this.alertShowing = false;
                });
            }
          }
        );

      // });
    }, this.AppointmentSync_Interval * 1000);

    this.timeoutInterval = timeoutInterval;
  }
  }

  async takeActForManualEntry(){

    this.isListeningAppointment  = false;
    if(this.timeoutInterval){
      clearInterval(this.timeoutInterval);
    }

    let alert = await this.alertCtrl.create({
      header: 'Manual  Search',
      cssClass: 'alert-list',
      inputs: [
        {
          name: 'nric',
          placeholder: this.T_SVC['ADD_VISITORS.LAB_USER_IC']
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
            this.waitForProcess = false;
          }
        },
        {
          text: this.T_SVC['ACC_MAPPING.PROCEED'],
          handler: data => {
            if (data.nric) {
              // logged in!
              this.waitForProcess = true;
              this.GetVisitorDataById(data.nric);
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

  takeActForScanQR(){
    this.isListeningAppointment  = false;
    if(this.timeoutInterval){
      clearInterval(this.timeoutInterval);
    }
    var loadinWeb = true;
    if(!this.platform.is('cordova')) {
      loadinWeb = true;
    } else {
      loadinWeb = false;
    }
    if (loadinWeb) {
      var data = "ABC" //"C4B9F365";
      this.GetVisitorDataById(data);
      console.log("barcodeScanner data: "+data);
    }else{
      this.options = {
        prompt : "Scan your QR Code ",
        preferFrontCamera : false, // iOS and Android
        showFlipCameraButton : true, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: false, // Android, launch with the torch switched on (if available)
        resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
        disableAnimations : false, // iOS
        disableSuccessBeep: false // iOS and Android
      }
      this.barcodeScanner.scan(this.options).then((barcodeData) => {
        var data = barcodeData.text;
        console.log("barcodeScanner data: "+data);
        if(data){
          this.GetVisitorDataById(data);
        }else{
          this.waitForProcess = false;

        }

    }, async (err) => {

        console.log("Error occured : " + err);
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
        invalidQRConfirm.onDidDismiss().then(()=> {
          this.waitForProcess = false;
        })
    });
    }
  }

  GetVisitorDataById(data){

    var data1 = {
      "visitor_id": data
    }
    this.apiProvider.GetVisitorDataById(data1).then(
      (val) => {
        var result = JSON.parse(val+"");
        if(result ){
          console.log("Result: "+ JSON.stringify(result));
          if(this.ackSeettings.BriefingOn == AppSettings.OtherSource){
            const navigationExtras: NavigationExtras = {
              state: {
                passData: {
                  scannedData : result,
                  playVideoUrl : "",
                  VisitorCategory: ''
                }
              }
            };
            this.router.navigate(['ack-visitor-lis'], navigationExtras);
          } else{
            this.playVideo1(result);
          }

        }
      },
      async (err) => {
        var message = err.message;
        try{
          var obj1 = JSON.parse(err);
          if(!message && err && obj1){
            message = obj1[0].message;
            if(!message){
              message = obj1[0].description;
            }
          }
        }catch(e){
          console.log("Result: error : "+ e);
        }
        let invalidQRConfirm = await this.alertCtrl.create({
          header: 'Error !',
          message: "<span class='failed'>" + message + '</span>',
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
        invalidQRConfirm.onDidDismiss().then(() => {
          this.waitForProcess = false;
        })
      }
    );
  }

  playVideo1(data){

    if(!data.visitor_id){
      console.log("playvideo withhout visitor id");
      return;
    }
    var QrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if(QrInfo && JSON.parse(QrInfo)){
      var QRObj = JSON.parse(QrInfo);
        var params  = {
          "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
          "VisitorId": data.visitor_id,
          "MAppDevSeqId":QRObj.MAppDevSeqId
        };
        this.apiProvider.GetSafetyBriefStatus(params).then(
          (val) => {
            var _thisData = this;
            var videoUrl = AppSettings.API_ViDEO_PATH;
            if(this.QRData){
              var ApiUrl = this.QRData.ApiUrl;
              if(ApiUrl.indexOf("/api") > -1) {
                ApiUrl = ApiUrl.split("/api")[0];
              }
              videoUrl = ApiUrl + "/FS/";
            }
              var videoUrlFromApi = "";
              var VisitorCategory = "";
              try{
                videoUrlFromApi = JSON.parse(val+"")[0].VideoUrl;
                VisitorCategory = JSON.parse(val+"")[0].VisitorCategory;
              }catch(e){
                console.log("videoUrlFromApi : "+ e);
              }
              // if(!videoUrlFromApi){

              //   return;
              // }
              videoUrl = videoUrl + videoUrlFromApi;
              //"BriefingMode":"Individual","BriefingOn":"Tablet"
              const navigationExtras: NavigationExtras = {
                state: {
                  passData: {
                    scannedData : data,
                    playVideoUrl : videoUrl,
                    VisitorCategory :VisitorCategory
                  }
                }
              };
              this.router.navigate(['ack-visitor-lis'], navigationExtras);
          },
          async (err) => {
            var message = err.message;
            try{
              var obj1 = JSON.parse(err);
              if(!message && err && obj1){
                message = obj1[0].message;
                if(!message){
                  message = obj1[0].description;
                }
              }
              if(!message && obj1[0].code == 20 && !obj1[0].VideoUrl){
                message = this.T_SVC['ALERT_TEXT.VIDEO_NOT_AVAILABLE']
              }
            }catch(e){
              console.log("Result: error : "+ e);
            }
            let invalidQRConfirm = await this.alertCtrl.create({
              header: 'Error !',
              message: "<span class='failed'>" + message + '</span>',
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
            invalidQRConfirm.onDidDismiss().then(()=> {
              this.waitForProcess = false;
            })
          }
        );
    }

  }

  ngOnInit() {
  }

}
