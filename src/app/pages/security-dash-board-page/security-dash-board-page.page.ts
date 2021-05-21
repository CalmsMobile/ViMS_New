import { AfterViewInit, Component, NgZone, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BarcodeScannerOptions, BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NavController, Platform, AlertController, ModalController, ToastController,IonSlides,AnimationController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { ToastService } from 'src/app/services/util/Toast.service';
import { DatePipe } from '@angular/common';
import { Chart } from 'chart.js';
import { ThemeSwitcherService } from 'src/app/services/ThemeSwitcherService';
import * as ChartJs from 'chart.js'


declare var cordova: any;

@Component({
  selector: 'app-security-dash-board-page',
  templateUrl: './security-dash-board-page.page.html',
  styleUrls: ['./security-dash-board-page.page.scss'],
})
export class SecurityDashBoardPagePage implements OnInit, AfterViewInit{
  // @ViewChild("myChart") totCheckinGraph: ElementRef;
  // @ViewChild('slides', { static: true }) slider: IonSlides;
  @ViewChild("barCanvas1") barCanvas1: ElementRef;
  @ViewChild("barCanvas2") barCanvas2: ElementRef;
  @ViewChild("barCanvas3") barCanvas3: ElementRef;
  @ViewChild("barCanvas4") barCanvas4: ElementRef;
  private barChart1: Chart;
  private barChart2: Chart;
  private barChart3: Chart;
  private barChart4: Chart;
  colorArray = ["#a63cb8", "#e93574", "#ffc720", "#98c95c", "#f4564a", "#1db2f6", "#883b56", "#6a808a", "#25e0a1",
"#147ed8"];
  segment = 'Summary';
  dataSets1 = {
    labels: [],
    datasets: []
  };
  dataSets2 = {
    labels: [],
    datasets: []
  };
  dataSets3 = {
    labels: [],
    datasets: []
  };
  dataSets4 = {
    labels: [],
    datasets: []
  };
  VM = {
    visitors : []
  }

  options :BarcodeScannerOptions;
  T_SVC:any;
  GO_SETTINGS_COUNT:number = 0;
  GO_SETTINGS_TIMER:any = null;
  loggedInInterval:any = null;
  timeoutInterval : any;
  Sync_Interval : any = 5000;
  loading : any;
  QRData : any = {};
  appSettings: any = {};
  userInfoObj: any;
  statsCountData: any = {};
  lastLoggedIn: any;
  constructor(public navCtrl: NavController,
    private platform : Platform,
    private router: Router,
    private alertCtrl: AlertController,
    public modalCtrl: ModalController,
    private barcodeScanner: BarcodeScanner,
    public apiProvider: RestProvider,
    private translate:TranslateService,
    private datePipe: DatePipe,
    private toastCtrl : ToastController,
    private themeSwitcher: ThemeSwitcherService,
    private dateformat : DateFormatPipe,
    private events : EventsService,
    private _zone : NgZone,
    private animationCtrl: AnimationController,) {
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
      const userInfo = localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
      if (userInfo) {
        this.userInfoObj = JSON.parse(userInfo);
      }

      const QRDataInfo = localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if (QRDataInfo) {
        this.QRData = JSON.parse(QRDataInfo);
      }

      events.observeDataCompany().subscribe((data1:any) => {
        if(data1.action === "addVisitor") {
          this.VM.visitors[this.VM.visitors.length] = data1.title;
        }

      });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter SecurityDashBoardPage');
    this.enableMyKad();
    const ackSeettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
      if (ackSeettings) {
        this.appSettings = JSON.parse(ackSeettings);
        this.composeRunTimeCss();
        this.updateSyncInterval();
      }
  }

  composeRunTimeCss(){
    this.themeSwitcher.setTheme('Theme1', this.appSettings.customStyle.AppTheme);
    let _css = `
    // ion-toolbar {
    //   --background: `+ this.appSettings.customStyle.AppTheme +` !important;
    // }
    `;
    document.getElementById("MY_RUNTIME_CSS").innerHTML = _css;
  }

  ionViewWillEnter(){
    this.getSecuritySettings();
    this.refreshLastLoggedIn();
  }

  updateSyncInterval() {
    if (this.timeoutInterval) {
      clearInterval(this.timeoutInterval);
    }
    this.timeoutInterval = setInterval(() => {
      this.getSecurityStats();
    }, this.appSettings.Sync_Interval * 1000);
  }

  getSecuritySettings(){
    var QRData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if(!QRData){
      return;
    }
    var params  = {
      "RefSchoolSeqId": "",
      "RefBranchSeqId": "",
      "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
      "MAppDevSeqId": this.QRData.MAppDevSeqId
    }
    this.apiProvider.GetSecurityAppSettings(params).then(
      (val) => {
        var result1 = JSON.parse(val+"");
        if(result1){
          this.appSettings = JSON.parse(result1.SettingDetail);
          console.log(val+"");
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS, JSON.stringify(this.appSettings));
          this.composeRunTimeCss();
        }
      },
      (err) => {
      }
    );
  }

  gotoNotifiations() {
    this.router.navigateByUrl('notifications');
  }

  segmentChanged(event) {
    console.log(this.segment);
    if (this.segment === 'Graph') {
      setTimeout(() => {
        this.displayChart();
      }, 1500);
    }
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

  released(){
    // alert("Released");
  }

  pressed(){
    this.router.navigateByUrl('settings-view-page');
  }

  active(){
    // alert("Active");
  }

  enableMyKad(){
    if(this.appSettings.MyKad_Enabled && this.platform.is('cordova')) {
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
      var data = "6578425602";
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
    if(this.timeoutInterval){
      clearInterval(this.timeoutInterval);
    }
    if(this.loggedInInterval){
      clearInterval(this.loggedInInterval);
    }

  }

  gotoCountClickSettings(){
    let numOfClicks = 5;
    this.GO_SETTINGS_COUNT++;
    console.log("Click count:  "+ this.GO_SETTINGS_COUNT);
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
    }
    if(this.GO_SETTINGS_COUNT > 5 && this.GO_SETTINGS_COUNT < numOfClicks){
       this.apiProvider.showToast("Need " + (numOfClicks - this.GO_SETTINGS_COUNT) + " more clicks go to Settings");
    }
  }

  getDuration(endDate) {
    const startDate = new Date(this.userInfoObj.LoginTime);
    let difference = endDate.getTime() - startDate.getTime();

    const dDays = this.apiProvider.twoDecimals(parseInt('' +difference/(24*60*60*1000)));
    const dHours = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*60*1000)) % 24)) ;
    const dMin = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*1000)) % 60));
    this.lastLoggedIn = dDays +' day, '+dHours+' hour, '+dMin+' min';
  }

  refreshLastLoggedIn() {
   this.loggedInInterval = setInterval(() => {
      const endDate = new Date(this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss'));
      this.getDuration(endDate);
    }, 1000);
  }

  getSecurityStats(){
    var params = {
      "Branch":11001
    }
    this.apiProvider.VimsAppGetSecurityStats(params).then(
      (data: any) => {
       console.log("Stats : "+ data);
       const result = JSON.parse(data);
       this.statsCountData = result.Table1[0];
       this.dataSets1.labels = [];
       this.dataSets2.labels = [];
       this.dataSets3.labels = [];
       this.dataSets4.labels = [];
       if (result.Table2) {
        const TenDaysAppointmentCount = [];
        result.Table2.forEach(element => {
          this.dataSets1.labels.push(this.datePipe.transform(element.Date, 'MMM dd'));
          TenDaysAppointmentCount.push(element.TenDaysAppointmentCount);
         });
         this.dataSets1.datasets = [{
          label: '',
          data: TenDaysAppointmentCount,
          backgroundColor: this.colorArray, // array should have same number of elements as number of dataset
          borderColor: this.colorArray,// array should have same number of elements as number of dataset
          borderWidth: 1
        }];
        if (this.barChart1) {
          this.barChart1.update();
        }

       }

       if (result.Table3) {
        const TenDaysCheckinCount = [];
        result.Table3.forEach(element => {
          this.dataSets2.labels.push(this.datePipe.transform(element.Date, 'MMM dd'));
          TenDaysCheckinCount.push(element.TenDaysCheckinCount);
         });
         this.dataSets2.datasets = [{
          label: 'Check-in count',
          data: TenDaysCheckinCount,
          backgroundColor: this.colorArray, // array should have same number of elements as number of dataset
          borderColor: this.colorArray,// array should have same number of elements as number of dataset
          borderWidth: 1
        }];
        if (this.barChart2) {
          this.barChart2.update();
        }
       }


       if (result.Table4) {
        const TenDaysCheckOutCount = [];
        result.Table4.forEach(element => {
          this.dataSets3.labels.push(this.datePipe.transform(element.Date, 'MMM dd'));
          TenDaysCheckOutCount.push(element.TenDaysCheckOutCount);
         });
         this.dataSets3.datasets = [{
          label: 'Check-out count',
          data: TenDaysCheckOutCount,
          backgroundColor: this.colorArray, // array should have same number of elements as number of dataset
          borderColor: this.colorArray,// array should have same number of elements as number of dataset
          borderWidth: 1
        }];
        if (this.barChart3) {
          this.barChart3.update();
        }
       }

       if (result.Table5) {
        const TenDaysOverStayTotalCount = [];
        result.Table5.forEach(element => {
          this.dataSets4.labels.push(this.datePipe.transform(element.Date, 'MMM dd'));
          TenDaysOverStayTotalCount.push(element.TenDaysOverStayTotalCount);
         });
         this.dataSets4.datasets = [{
          label: 'Overstay count',
          data: TenDaysOverStayTotalCount,
          backgroundColor: this.colorArray, // array should have same number of elements as number of dataset
          borderColor: this.colorArray,// array should have same number of elements as number of dataset
          borderWidth: 1
        }];
        if (this.barChart4) {
          this.barChart4.update();
        }
       }

      },
      (err) => {
        console.log("error : "+JSON.stringify(err));
        if(err && err.message == "No Internet"){
          return;
        }
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

  displayChart(){
    try {
      const nativeElm = document.getElementById('barCanvas1');
      this.barChart1 = new Chart(nativeElm, {
        type: 'bar',
        data: this.dataSets1,
        options: {
          legend: {
            display: false
         },
          scales: {
            // yAxes: [{
            //   ticks: {
            //     beginAtZero: true
            //   }
            // }]
          }
        }
      });
      const nativeElm2 = document.getElementById('barCanvas2');
      this.barChart2 = new Chart(nativeElm2, {
        type: 'bar',
        data: this.dataSets2,
        options: {
          legend: {
            display: false
         },
          scales: {
            // yAxes: [{
            //   ticks: {
            //     beginAtZero: true
            //   }
            // }]
          }
        }
      });
      const nativeElm3 = document.getElementById('barCanvas3');
      this.barChart3 = new Chart(nativeElm3, {
        type: 'bar',
        data: this.dataSets3,
        options: {
          legend: {
            display: false
         },
          scales: {
            // yAxes: [{
            //   ticks: {
            //     beginAtZero: true
            //   }
            // }]
          }
        }
      });
      const nativeElm4 = document.getElementById('barCanvas4');
      this.barChart4 = new Chart(nativeElm4, {
        type: 'bar',
        data: this.dataSets4,
        options: {
          legend: {
            display: false
         },
          scales: {
            // yAxes: [{
            //   ticks: {
            //     beginAtZero: true
            //   }
            // }]
          }
        }
      });
    } catch (error) {

    }
  }

  ngAfterViewInit(){
    setTimeout(() => {
      // this.segment = 'Summary';
    }, 2000);
  }

}
