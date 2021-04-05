import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BarcodeScannerOptions, BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NavController, Platform, AlertController, ModalController, ToastController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { ToastService } from 'src/app/services/util/Toast.service';
declare var cordova: any;

@Component({
  selector: 'app-security-dash-board-page',
  templateUrl: './security-dash-board-page.page.html',
  styleUrls: ['./security-dash-board-page.page.scss'],
})
export class SecurityDashBoardPagePage implements OnInit {


  VM = {
    visitors : []
  }

  TotalVisitorsIn = 0;
  TotalVisitorsOut = 0;
  VisitorsInside = 0;
  OverstayVisitor = 0;

  options :BarcodeScannerOptions;
  T_SVC:any;
  GO_SETTINGS_COUNT:number = 0;
  GO_SETTINGS_TIMER:any = null;
  isFetchingSettings = false;
  timeoutInterval : any;
  timeoutIntervalSettings : any;
  AppointmentSync_Interval : any = 5000;
  SettingsSync_Interval : any = 10000;
  _currentClass : any = this;
  MyKad_Enabled = true;
  tabSelected = "";
  companyData = {
    HomeTitle : "Calms Tecnologies Sdn Bhd",
    HomeContent : "Card Application Life Cycle Management System",
    LogoImgUrl : "",
    StorageURL :""
  }

  showQuickPass = true;
  showPreAppointment = false;
  loading : any;
  QRData : any = {};
  customStyle : any = {
    "WelcomePage":{
      "Title":{
        fontSize :  36,
        fontFamily : "Germania"
      },
      "CheckInBtn":{
        fontSize :  20,
        bckgrndColor : "#DD2C00"
      },
      "CheckOutBtn":{
        fontSize :  20,
        bckgrndColor : "#FF5722"
      },
      "WelcomeDescription":{
        fontSize :  16,
        fontFamily : "Prompt"
      }
    }

  }
  constructor(public navCtrl: NavController,
    private platform : Platform,
    private router: Router,
    private alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private barcodeScanner: BarcodeScanner,
    public apiProvider: RestProvider,
    private translate:TranslateService,
    private toastCtrl : ToastController,
    private toastCtrl1 : ToastService,
    private dateformat : DateFormatPipe,
    private events : EventsService,
    private _zone : NgZone,
    public navParams: NavParams) {

      this.translate.get(['ACC_MAPPING.INVALID_QR', 'ACC_MAPPING.INVALID_ORG_TITLE',
      'ACC_MAPPING.INVALID_FCM_TITLE',
      'ACC_MAPPING.FCM_TITLE',
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'ALERT_TEXT.QR_INVALID_TODAY',
      'ALERT_TEXT.QR_USED',
      'ALERT_TEXT.APPOINTMENT_NOT_FOUND',
      'ALERT_TEXT.QR_EXPIRED',
      'ALERT_TEXT.INVALID_QR',
      'COMMON.OK','COMMON.CANCEL']).subscribe(t => {
        this.T_SVC = t;
      });

      events.observeDataCompany().subscribe((data1:any) => {
        if(data1.action === "addVisitor") {
          this.VM.visitors[this.VM.visitors.length] = data1.title;
        }

      });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter SecurityDashBoardPage');
    var ackSeettings =  window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
    if(ackSeettings && JSON.parse(ackSeettings)){
      var result1 = JSON.parse(ackSeettings);
      if(result1){
        var result = JSON.parse(result1.SettingDetail);
        this.MyKad_Enabled = result.MyKad_Enabled;
      }
      this.enableMyKad();
    }
  }

  ionViewWillEnter(){
    var QRData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    var ackSeettings =  window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
    if(ackSeettings && JSON.parse(ackSeettings)){
      var result1 = JSON.parse(ackSeettings);
      if(result1){
        var result = JSON.parse(result1.SettingDetail);
        if(result.HomeTitle){
          this.companyData.HomeTitle = result.HomeTitle;
        }
        if(result.HomeContent){
          this.companyData.HomeContent = result.HomeContent;
        }

        if(result.LogoImgUrl){
          this.companyData.LogoImgUrl = result.LogoImgUrl;
        }

        if(QRData){
          var ApiUrl = JSON.parse(QRData).ApiUrl;
          if(ApiUrl.indexOf("/api") > -1) {
            ApiUrl = ApiUrl.split("/api")[0];
          }
          this.companyData.StorageURL = ApiUrl + "/FS/";
        }

        if(result.SettingsSync_Interval){
          this.SettingsSync_Interval = result.SettingsSync_Interval*1000;
        }else{
          this.SettingsSync_Interval = 10000;
        }
        this.showPreAppointment = result.showPreAppointment
        this.showQuickPass = result.showQuickPass
        if(result.customStyle){
          this.customStyle = result.customStyle;
         if(!this.customStyle.WelcomePage.Title.fontSize){
            this.customStyle.WelcomePage.Title.fontSize = 36;
          }
          if(!this.customStyle.WelcomePage.WelcomeDescription.fontSize){
            this.customStyle.WelcomePage.WelcomeDescription.fontSize = 16;
          }
          if(!this.customStyle.WelcomePage.CheckInBtn.fontSize){
            this.customStyle.WelcomePage.CheckInBtn.fontSize = 20;
          }
          if(!this.customStyle.WelcomePage.CheckOutBtn.fontSize){
            this.customStyle.WelcomePage.CheckOutBtn.fontSize = 20;
          }
        }else{

        this.customStyle = {
          "WelcomePage":{
           "Title":{
              fontSize :  36,
              fontFamily : "Open Sans Condensed"
            },
            "CheckInBtn":{
              fontSize :  20,
              bckgrndColor : "#DD2C00"
            },
            "CheckOutBtn":{
              fontSize :  20,
              bckgrndColor : "#FF5722"
            },
            "WelcomeDescription":{
              fontSize :  16,
              fontFamily : "Fira Sans Condensed"
            }
          }

        }
      }
      }
    }
    this.activateListenAckSettings(true, this);
    this.getAckSettings(this, true);


  }

  getAckSettings(_currentClass, refresh){
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
              "MAppDevSeqId": JSON.parse(QRData).MAppDevSeqId
            }
            _currentClass.apiProvider.GetSecurityAppSettings(params).then(
              (val) => {

                _currentClass.isFetchingSettings = false;
                var result1 = JSON.parse(val+"");
                if(result1){
                  var result = JSON.parse(result1.SettingDetail);
                  console.log(val+"");
                  _currentClass._zone.run(() => {

                  _currentClass.showPreAppointment = result.showPreAppointment
                  _currentClass.showQuickPass = result.showQuickPass
                  if(result.HomeTitle){
                    _currentClass.companyData.HomeTitle = result.HomeTitle;
                  }
                  if(result.HomeContent){
                    _currentClass.companyData.HomeContent = result.HomeContent;
                  }
                  if(result.LogoImgUrl){
                    _currentClass.companyData.LogoImgUrl = result.LogoImgUrl;
                  }
                  // _currentClass.companyData.LogoImg = "";
                  if(QRData){
                    var ApiUrl = JSON.parse(QRData).ApiUrl;
                    if(ApiUrl.indexOf("/api") > -1) {
                      ApiUrl = ApiUrl.split("/api")[0];
                    }
                    _currentClass.companyData.StorageURL = ApiUrl + "/FS/";
                  }

                  if(result.SettingsSync_Interval){
                    _currentClass.SettingsSync_Interval = result.SettingsSync_Interval*1000;
                  }else{
                    _currentClass.SettingsSync_Interval = 10000;
                  }

                  if(result.customStyle ){
                    _currentClass.customStyle = result.customStyle;
                   if(!_currentClass.customStyle.WelcomePage.Title.fontSize){
                      _currentClass.customStyle.WelcomePage.Title.fontSize = 36;
                    }
                    if(!_currentClass.customStyle.WelcomePage.WelcomeDescription.fontSize){
                      _currentClass.customStyle.WelcomePage.WelcomeDescription.fontSize = 16;
                    }
                    if(!_currentClass.customStyle.WelcomePage.CheckInBtn.fontSize){
                      _currentClass.customStyle.WelcomePage.CheckInBtn.fontSize = 20;
                    }
                    if(!_currentClass.customStyle.WelcomePage.CheckOutBtn.fontSize){
                      _currentClass.customStyle.WelcomePage.CheckOutBtn.fontSize = 20;
                    }
                  }else{
                    if(refresh){
                      _currentClass.customStyle = {
                        "WelcomePage":{
                          backgroundcolor1 : "#DD2C00",
                          backgroundcolor2 : "#FF5722",
                          "Title":{
                            fontSize :  36,
                            fontFamily : "Open Sans Condensed"
                          },
                          "CheckInBtn":{
                            fontSize :  20,
                            bckgrndColor : "#DD2C00"
                          },
                          "CheckOutBtn":{
                            fontSize :  20,
                            bckgrndColor : "#FF5722"
                          },
                          "WelcomeDescription":{
                            fontSize :  16,
                            fontFamily : "Fira Sans Condensed"
                          }
                        }

                      }
                    }

                  }
                  window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS,val+"");
                  if(result.SettingsSync_Interval && _currentClass.SettingsSync_Interval != result.SettingsSync_Interval){
                    if(_currentClass.timeoutIntervalSettings){
                      clearInterval(_currentClass.timeoutIntervalSettings);
                    }

                    _currentClass.activateListenAckSettings(false, _currentClass);
                  }

                });
                _currentClass.getSecurityStats(_currentClass);
                }
              },
              (err) => {
                _currentClass.isFetchingSettings = false;
                if(_currentClass.timeoutIntervalSettings){
                  clearInterval(_currentClass.timeoutIntervalSettings);
                }
              }
            );
  }

  showLoading(currentClass){
    if(!currentClass.loading){
      currentClass.loading = currentClass.loadingCtrl.create({
        content: 'Please wait...',
        dismissOnPageChange: true,
        showBackdrop: true,
        enableBackdropDismiss: true
      });
      currentClass.loading.present();
    }

  }

  hideLoading(currentClass){
    if(currentClass.loading){
      currentClass.loading.dismiss();
      currentClass = null;
    }
  }

  proceedNext(type){
    this.tabSelected = type;

    if(type == 'IN'){
      this.router.navigateByUrl("security-check-in-page");
      // this.enableMyKad();
    }else if(type == 'QUICK_PASS_OUT'){
      // this.scanPreAppointmentQR();
      this.quickPassOut();
    }else if(type == 'QUICK_PASS'){
      this.scanQuickPassQR();
    }else {
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            Type : '60'
          }
        }
      };
      this.router.navigate(['security-check-out-page'], navigationExtras);
    }
  }

  enableMyKad(){
    if(this.MyKad_Enabled && this.platform.is('cordova')) {
      var currentClass = this;
      var success = async function(result) {
        console.log(result);

        var resultObj = JSON.parse(result);
        var description = "";
        switch(resultObj.ACTION){
          case "CARD_READ_PHOTO_SUCCESS":
            var base64 = resultObj.RESULT;
            currentClass.events.publishDataCompany({
              action: "MyKadPhoto",
              title: base64,
              message: ''
            });
            // alert(base64);
            break;
          case "CARD_READ_SUCCESS":
            // alert(result);
            var MyKadData = JSON.parse(resultObj.RESULT);
            var visitorData = {
              "MyKad": true,
              "VISITOR_IC": MyKadData.icNo,
              "VISITOR_NAME": MyKadData.name,
              "visitor_comp_code": 0,
              "VISITOR_COMPANY": "",
              "REASON": "",
              "PLATE_NUM": "",
              "Host_IC": "",
              "HostName": "",
              "EMAIL": "",
              "VisitorCategory": "",
              "TELEPHONE_NO": "",
              "VISITOR_GENDER": "",
              "START_DATE": "",
              "END_DATE": "",
              "Hexcode": ""
            }
            currentClass.hideLoading(currentClass);
            const navigationExtras: NavigationExtras = {
              state: {
                passData: {
                  PreAppointment : JSON.stringify(visitorData)
                }
              }
            };
            currentClass.router.navigate(['security-check-in-page'], navigationExtras);
            break;
          case "InitDone":
            description = resultObj.Description;
            break;
          case "READER_INSERTED":
            description = resultObj.Description;
            break;
          case "CARD_REMOVE":
            currentClass.hideLoading(currentClass);
            description = resultObj.Description;
            break;
          case "WAITING":
            currentClass.showLoading(currentClass);
            description = resultObj.Description;
            break;
          case "INSERT":
            description = resultObj.Description;
            break;
          case "CARD READ PROGRESS":
            currentClass.showLoading(currentClass);
            description = resultObj.Description;
            break;
          case "CANCEL":
            currentClass.hideLoading(currentClass);
            description = resultObj.Description;
            break;
        }
        if(description){
          let toast = await currentClass.toastCtrl.create({
            message: description,
            duration: 3000,
            position: 'bottom'
          });
          toast.present();
        }
      }
      var failure = function(result) {
        console.log(result);
        // alert(result);
      }
      // try{
      //   window['cordova']['plugins']['MyKad']['initMyKad']({}, success, failure);
      // }catch(e){

      // }
      var success1 = function(result) {
        alert(JSON.stringify(result, undefined, 2));
      }
      var failure1 = function(result) {
        alert(JSON.stringify(result, undefined, 2));
      }
      cordova.plugins.MyKadReader.coolMethod({
        _sMessage: "Hello World"
      }, success, failure);
    }
  }

  quickPassOut() {
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          Type : '50'
        }
      }
    };
    this.router.navigate(['security-check-out-page'], navigationExtras);
  }

  scanPreAppointmentQR(){
    let invalidQRCode = false;

    var loadinWeb = true;
    if(!this.platform.is('cordova')) {
      loadinWeb = true;
    } else {
      loadinWeb = false;
    }
    if (loadinWeb) {
      var data = "AA328A36" //"C4B9F365";
      var params = {"hexcode":""+ data};
      this.apiProvider.VimsAppGetAppointmentByHexCode(params).then(
        async (val) => {
         console.log("val : "+JSON.stringify(val));
         var visitorDetail = val+"";
         var vOb1 = JSON.parse(visitorDetail);
         var vOb;
         var message = this.T_SVC['ALERT_TEXT.APPOINTMENT_NOT_FOUND'];
          if(vOb1){
            if(vOb1.Table1 && vOb1.Table1.length > 0){
              vOb = vOb1.Table1[0];
              // if(vOb1.Table2 && vOb1.Table2.length > 0 && vOb1.Table2[0].CheckinStatus == 10){
              //   message = this.T_SVC['ALERT_TEXT.QR_USED'];
              //   vOb = null;
              // }
            }
            // if(!vOb){
            //   let alert = this.alertCtrl.create({
            //     header: 'Error !',
            //     message: message,
            //     cssClass:'alert-danger',
            //     buttons: ['Okay']
            //     });
            //     alert.present();
            //   return;
            // }
            var startDate = vOb.START_DATE.split("T")[0];
            var fDate = this.dateformat.transform(startDate+"", "yyyy-MM-dd");
            var fTime = new Date(fDate).getTime();
            var endDate = vOb.END_DATE.split("T")[0];
            var eDate = this.dateformat.transform(endDate+"", "yyyy-MM-dd");
            var eTime = new Date(eDate).getTime();
            var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-dd");
            var cTime = new Date(cDate).getTime();
            if((fDate == cDate) || (fTime <= cTime && cTime <= eTime)){
              const navigationExtras: NavigationExtras = {
                state: {
                  passData: {
                    PreAppointment : JSON.stringify(vOb)
                  }
                }
              };
              this.router.navigate(['security-check-in-page'], navigationExtras);
            }else{
              message = this.T_SVC['ALERT_TEXT.QR_INVALID_TODAY'];
              if(fTime < cTime && eTime < cTime){
                message = this.T_SVC['ALERT_TEXT.QR_EXPIRED'];
              }
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: message,
                cssClass: 'alert-danger',
                buttons: ['Okay']
              });
                alert.present();
            }

          }


        },
        async (err) => {
          console.log("error : "+JSON.stringify(err));
          if(err && err.message == "No Internet"){
            return;
          }

          if(err.Table1 && err.Table1.length == 0){
            var message  = this.T_SVC['ALERT_TEXT.INVALID_QR'];
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: message,
              cssClass: 'alert-danger',
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
              cssClass: 'alert-danger',
              buttons: ['Okay']
            });
              alert.present();
              return;
          }
          message = this.T_SVC['ACC_MAPPING.INVALID_QR'];

          if(err && JSON.parse(err) && JSON.parse(err).Table && JSON.parse(err).Table[0].description){
            message = JSON.parse(err).Table[0].description;
          }
          let invalidORGConfirm = await this.alertCtrl.create({
            header: 'Error !',
            message: "<span class='failed'>" + message + '</span>',
            cssClass: 'alert-danger',
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
      this.barcodeScanner.scan(this.options).then(async (barcodeData) => {
        var data = barcodeData.text;
        console.log("barcodeScanner data: "+data);
        // console.log(scanData); D20A6A48
        if(data == ""){
          invalidQRCode = true;
        }

        if(!invalidQRCode){

            var params = {"hexcode":""+ data};
            this.apiProvider.VimsAppGetAppointmentByHexCode(params).then(
              async (val) => {
                if(val){
                  console.log("val : "+JSON.stringify(val));
                  var visitorDetail = val+"";
                  var vOb1 = JSON.parse(visitorDetail);
                  var vOb;
                  var message = this.T_SVC['ALERT_TEXT.APPOINTMENT_NOT_FOUND'];
                   if(vOb1){
                     if(vOb1.Table1 && vOb1.Table1.length > 0){
                       vOb = vOb1.Table1[0];
                      //  if(vOb1.Table2 && vOb1.Table2.length > 0 && vOb1.Table2[0].CheckinStatus == 10){
                      //    message = this.T_SVC['ALERT_TEXT.QR_USED'];
                      //    vOb = null;
                      //  }
                     }
                    //  if(!vOb){
                    //    let alert = this.alertCtrl.create({
                    //      header: 'Error !',
                    //      message: message,
                    //      cssClass:'alert-danger',
                    //      buttons: ['Okay']
                    //      });
                    //      alert.present();
                    //    return;
                    // }
                   var startDate = vOb.START_DATE.split("T")[0];
                   var fDate = this.dateformat.transform(startDate+"", "yyyy-MM-dd");
                   var fTime = new Date(fDate).getTime();
                   var endDate = vOb.END_DATE.split("T")[0];
                   var eDate = this.dateformat.transform(endDate+"", "yyyy-MM-dd");
                   var eTime = new Date(eDate).getTime();
                   var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-dd");
                   var cTime = new Date(cDate).getTime();
                   if((fDate == cDate) || (fTime <= cTime && cTime <= eTime)){
                    const navigationExtras: NavigationExtras = {
                      state: {
                        passData: {
                          PreAppointment : JSON.stringify(vOb)
                        }
                      }
                    };
                    this.router.navigate(['security-check-in-page'], navigationExtras);
                   }else{
                    message = this.T_SVC['ALERT_TEXT.QR_INVALID_TODAY'];
                    if(fTime < cTime && eTime < cTime){
                      message = this.T_SVC['ALERT_TEXT.QR_EXPIRED'];
                    }
                    let alert = await this.alertCtrl.create({
                      header: 'Error !',
                      message: message,
                      cssClass: 'alert-danger',
                      buttons: ['Okay']
                    });
                      alert.present();
                  }

                  }

                }else{
                  let alert = await this.alertCtrl.create({
                    header: 'Error !',
                    message: this.T_SVC['ALERT_TEXT.INVALID_QR'],
                    cssClass: 'alert-danger',
                    buttons: ['Okay']
                  });
                    alert.present();
                }




              },
              async (err) => {
                console.log("error : "+JSON.stringify(err));
                if(err && err.message == "No Internet"){
                  return;
                }

                if(err.Table1 && err.Table1.length == 0){
                  var message  = this.T_SVC['ALERT_TEXT.INVALID_QR'];
                  let alert = await this.alertCtrl.create({
                    header: 'Error !',
                    message: message,
                    cssClass: 'alert-danger',
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
                    cssClass: 'alert-danger',
                    buttons: ['Okay']
                  });
                    alert.present();
                    return;
                }
                message = this.T_SVC['ACC_MAPPING.INVALID_QR'];

                if(err && JSON.parse(err) && JSON.parse(err).Table && JSON.parse(err).Table[0].description){
                  message = JSON.parse(err).Table[0].description;
                }

                let invalidORGConfirm = await this.alertCtrl.create({
                  header: 'Error !',
                  message: "<span class='failed'>" + message + '</span>',
                  cssClass: 'alert-danger',
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
          let invalidQRConfirm = await this.alertCtrl.create({
            header: 'Error !',
            message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>',
            cssClass: 'alert-danger',
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
        let invalidQRConfirm = await this.alertCtrl.create({
          header: 'Error !',
          message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>',
          cssClass: 'alert-danger',
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
    });
    }
  }

  scanQuickPassQR(){
    let invalidQRCode = false;

    var loadinWeb = true;
    if(!this.platform.is('cordova')) {
      loadinWeb = true;
    } else {
      loadinWeb = false;
    }
    if (loadinWeb) {
      var data = "9EA927C8";
      var params = {"HexCode":""+ data};
      this.apiProvider.GetQuickPassVisitorDetail(params).then(
        async (val) => {
         console.log("val : "+JSON.stringify(val));
         var visitorDetail = val+"";
         var vOb = JSON.parse(visitorDetail);
          if(vOb){

            // var endDate = vOb.ExpiryTime.split("T")[0];
            // var eDate = this.dateformat.transform(endDate+"", "yyyy-MM-dd");
            // var eTime = new Date(eDate).getTime();
            // var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-dd");
            // var cTime = new Date(cDate).getTime();
            var eDateTime = this.dateformat.transform(vOb.ExpiryTime+"", "yyyy-MM-ddTHH:mm:ss");
            var eDTime = new Date(eDateTime).getTime();

            var cDateTime = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
            var cDTime = new Date(cDateTime).getTime();
            // if(vOb.IsCheckedIn || vOb.CheckInTime){
            //   let alert = this.alertCtrl.create({
            //     header: 'Error !',
            //     message: this.T_SVC['ALERT_TEXT.QR_USED'],
            //     cssClass:'alert-danger',
            //     buttons: ['Okay']
            //     });
            //     alert.present();
            // }else
            if(eDTime > cDTime){

              //   const modalOptions: ModalOptions = {
              //     cssClass: "signInModal"
              //   };
              //   let contactModal = this.modalCtrl.create(QuickPassVisitorPopupComponent,
              //     {
              //       QPAppointment : visitorDetail,
              //       CheckIn : true
              //     }, modalOptions);
              //  contactModal.present();
              const navigationExtras: NavigationExtras = {
                state: {
                  passData: {
                    QPAppointment : visitorDetail,
                    CheckIn : true
                  }
                }
              };
              this.router.navigate(['quick-pass-details-page'], navigationExtras);
            }else{
                 let alert = await this.alertCtrl.create({
                   header: 'Error !',
                   message: this.T_SVC['ALERT_TEXT.QR_EXPIRED'],
                   cssClass: 'alert-danger',
                   buttons: ['Okay']
                 });
                    alert.present();
            }

          }


        },
        async (err) => {
          console.log("error : "+JSON.stringify(err));
          if(err && err.message == "No Internet"){
            return;
          }

          if(err.Table1 && err.Table1.length == 0){
            var message  = this.T_SVC['ALERT_TEXT.INVALID_QR'];
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: message,
              cssClass: 'alert-danger',
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
              cssClass: 'alert-danger',
              buttons: ['Okay']
            });
              alert.present();
              return;
          }
          message = this.T_SVC['ACC_MAPPING.INVALID_QR'];

          if(err && JSON.parse(err) && JSON.parse(err).Table && JSON.parse(err).Table[0].description){
            message = JSON.parse(err).Table[0].description;
          }
          let invalidORGConfirm = await this.alertCtrl.create({
            header: 'Error !',
            message: "<span class='failed'>" + message + '</span>',
            cssClass: 'alert-danger',
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
      this.barcodeScanner.scan(this.options).then(async (barcodeData) => {
        var data = barcodeData.text;
        console.log("barcodeScanner data: "+data);
        // console.log(scanData); D20A6A48
        if(data == ""){
          invalidQRCode = true;
        }

        if(!invalidQRCode){

            var params = {"HexCode":""+ data};
            this.apiProvider.GetQuickPassVisitorDetail(params).then(
              async (val) => {
                if(val){
                  console.log("val : "+JSON.stringify(val));
                  var visitorDetail = val+"";
                  var vOb = JSON.parse(visitorDetail);
                  if(vOb){

                    var eDateTime = this.dateformat.transform(vOb.ExpiryTime+"", "yyyy-MM-ddTHH:mm:ss");
                    var eDTime = new Date(eDateTime).getTime();

                    var cDateTime = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
                    var cDTime = new Date(cDateTime).getTime();
                    // if(vOb.IsCheckedIn || vOb.CheckInTime){
                    //   let alert = this.alertCtrl.create({
                    //     header: 'Error !',
                    //     message: this.T_SVC['ALERT_TEXT.QR_USED'],
                    //     cssClass:'alert-danger',
                    //     buttons: ['Okay']
                    //     });
                    //     alert.present();
                    // }else
                     if(eDTime > cDTime){
                    //   const modalOptions: ModalOptions = {
                    //     cssClass: "signInModal"
                    //   };
                    //   let contactModal = this.modalCtrl.create(QuickPassVisitorPopupComponent,
                    //     {
                    //       QPAppointment : visitorDetail,
                    //       CheckIn : true
                    //     }, modalOptions);
                    //  contactModal.present();
                    const navigationExtras: NavigationExtras = {
                      state: {
                        passData: {
                          QPAppointment : visitorDetail,
                          CheckIn : true
                        }
                      }
                    };
                    this.router.navigate(['quick-pass-details-page'], navigationExtras);
                    }else{
                        let alert = await this.alertCtrl.create({
                          header: 'Error !',
                          message: this.T_SVC['ALERT_TEXT.QR_EXPIRED'],
                          cssClass: 'alert-danger',
                          buttons: ['Okay']
                        });
                            alert.present();
                    }

                  }

                }else{
                  let alert = await this.alertCtrl.create({
                    header: 'Error !',
                    message: this.T_SVC['ALERT_TEXT.INVALID_QR'],
                    cssClass: 'alert-danger',
                    buttons: ['Okay']
                  });
                    alert.present();
                }




              },
              async (err) => {
                console.log("error : "+JSON.stringify(err));
                if(err && err.message == "No Internet"){
                  return;
                }

                if(err.Table1 && err.Table1.length == 0){
                  var message  = this.T_SVC['ALERT_TEXT.INVALID_QR'];
                  let alert = await this.alertCtrl.create({
                    header: 'Error !',
                    message: message,
                    cssClass: 'alert-danger',
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
                    cssClass: 'alert-danger',
                    buttons: ['Okay']
                  });
                    alert.present();
                    return;
                }

                message = this.T_SVC['ACC_MAPPING.INVALID_QR'];

                if(err && JSON.parse(err) && JSON.parse(err).Table && JSON.parse(err).Table[0].description){
                  message = JSON.parse(err).Table[0].description;
                }

                let invalidORGConfirm = await this.alertCtrl.create({
                  header: 'Error !',
                  message: "<span class='failed'>" + message + '</span>',
                  cssClass: 'alert-danger',
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
          let invalidQRConfirm = await this.alertCtrl.create({
            header: 'Error !',
            message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>',
            cssClass: 'alert-danger',
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
        let invalidQRConfirm = await this.alertCtrl.create({
          header: 'Error !',
          message: "<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>',
          cssClass: 'alert-danger',
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
    });
    }
  }

  ionViewWillLeave(){
    if(this.GO_SETTINGS_TIMER != null){
      this.GO_SETTINGS_COUNT = 0;
      clearTimeout(this.GO_SETTINGS_TIMER);
    }
    if(this.timeoutIntervalSettings){
      clearInterval(this.timeoutIntervalSettings);
    }

  }

  async gotoCountClickSettings(){
    let numOfClicks = 5;
    this.GO_SETTINGS_COUNT++;
    if(this.GO_SETTINGS_TIMER != null){
      clearTimeout(this.GO_SETTINGS_TIMER);
    }
    this.GO_SETTINGS_TIMER = setTimeout(()=>{
      this.GO_SETTINGS_COUNT = 0;
      console.log("Click Cleared;")
    },2000);
    if(this.GO_SETTINGS_COUNT === numOfClicks){
      this.GO_SETTINGS_COUNT = 0;
      clearTimeout(this.GO_SETTINGS_TIMER);
      this.logoutMe();
    }
    if(this.GO_SETTINGS_COUNT > 5 && this.GO_SETTINGS_COUNT < numOfClicks){
       (await this.toastCtrl.create(
        {
          message: "Need " + (numOfClicks - this.GO_SETTINGS_COUNT) + " more clicks go to Settings",
          duration: 2000,
          position: 'top'
        })).present();
    }
  }

  logoutMe(){
    this.translate.get(['SETTINGS.ARE_U_SURE_LOGOUT_TITLE','SETTINGS.ARE_U_SURE_LOGOUT',
     'SETTINGS.EXIT_ACCOUNT_SCUSS','SETTINGS.EXIT_ACCOUNT_FAILED'
    ,'COMMON.OK','COMMON.CANCEL','COMMON.EXIT1']).subscribe(async t => {
      let loginConfirm = await this.alertCtrl.create({
        header: "<span class='failed'>" + t['SETTINGS.ARE_U_SURE_LOGOUT_TITLE'] + '</span>',
        message: t['SETTINGS.ARE_U_SURE_LOGOUT'],
        cssClass: 'alert-warning',
        buttons: [
          {
            text: t['COMMON.EXIT1'],
            handler: () => {

              this.toastCtrl1.create(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.ACK_DETAILS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.COMPANY_DETAILS, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.LOGIN_TYPE, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFY_TIME, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.PREAPPOINTMENTAUTOAPPROVE, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.SIGN_PAD, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, "");
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FACILITY_VISITOR_DATA, "");
              this.navCtrl.navigateRoot('account-mapping')

            }
          },
          {
            text: t['COMMON.CANCEL'],
            role: 'cancel',
            handler: () => {
            }
          }
        ]
      });
      loginConfirm.present();
    });
  }



  activateListenAckSettings(refresh, _currentClass : any){

      if(_currentClass.timeoutIntervalSettings){
       clearInterval(_currentClass.timeoutIntervalSettings);
      }

      var timeoutInterval = setInterval(function(){
          if(_currentClass.isFetchingSettings){
              console.log("Dont try..Setting is Fetching");
          }else{
            _currentClass.getAckSettings(_currentClass, false);
          }
      },_currentClass.SettingsSync_Interval);
      _currentClass.timeoutIntervalSettings = timeoutInterval;
  }

  getSecurityStats(_currentClass){
    var params = {

    }
    _currentClass.apiProvider.VimsAppGetSecurityStats(params).then(
      (val) => {
       console.log("val : "+JSON.stringify(val));
       var data = JSON.parse(val);
       _currentClass.TotalVisitorsIn = data.TotalVisitorsIn;
       _currentClass.TotalVisitorsOut = data.TotalVisitorsOut;
       _currentClass.VisitorsInside = data.VisitorsInside;
       _currentClass.OverstayVisitor = data.OverstayVisitor;
      },
      (err) => {
        console.log("error : "+JSON.stringify(err));
        if(err && err.message == "No Internet"){
          return;
        }


        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
          var message  = _currentClass.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          let alert = _currentClass.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass:'alert-danger',
            buttons: ['Okay']
            });
            // alert.present();
            return;
        }
        let invalidORGConfirm = _currentClass.alertCtrl.create({
          header: 'Error !',
          message: "<span class='failed'>" + _currentClass.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>',
          cssClass:'alert-danger',
          buttons: [
            {
              text: _currentClass.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        // invalidORGConfirm.present();
      }
    );
  }

  statesClicked(type){
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          Type: type
        }
      }
    };
    this.router.navigate(['security-check-out-page'], navigationExtras);
  }

  ngOnInit() {
  }

}
