import { AfterViewInit, Component, NgZone, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { BarcodeScannerOptions, BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NavController, Platform, AlertController, ModalController, ToastController,IonSlides,AnimationController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { DatePipe } from '@angular/common';
import * as Chart from 'chart.js';
import { ThemeSwitcherService } from 'src/app/services/ThemeSwitcherService';
import { CommonUtil } from 'src/app/services/util/CommonUtil';
import { StatusBar } from '@ionic-native/status-bar/ngx';
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
  @ViewChild("barCanvas5") barCanvas5: ElementRef;
  private barChart1: Chart;
  private barChart2: Chart;
  private barChart3: Chart;
  private barChart4: Chart;
  private barChart5: Chart;
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
  dataSets5 = {
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
  hostImage = '';
  userInfoObj: any;
  statsCountData: any = {};
  lastLoggedIn: any;
  footerHeight = '0px';
  networkError = false;
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
    private commonUtil: CommonUtil,
    private statusBar : StatusBar,
    private animationCtrl: AnimationController,) {
      this.translate.get(['ACC_MAPPING.INVALID_QR', 'ACC_MAPPING.INVALID_ORG_TITLE',
      'ACC_MAPPING.INVALID_FCM_TITLE', 'ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS',
      'ACC_MAPPING.FCM_TITLE', 'ALERT_TEXT.CONFIRMATION',
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
    this.refreshLastLoggedIn();
    const hostData = localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (hostData) {
      var tempImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/PortalImageHandler.ashx?RefSlno='
      + JSON.parse(hostData).SEQID + "&ScreenType=30&Refresh=" + new Date().getTime();
      this.hostImage = tempImage;
    }
    const ackSeettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
    if (ackSeettings) {
      this.appSettings = JSON.parse(ackSeettings);
      this.composeRunTimeCss();
      this.getSecurityStats();
      this.updateSyncInterval();
      this.enableMyKad();
      const masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
      if (!masterDetails) {
        this.apiProvider.GetSecurityMasterDetails().then(
          (result: any) => {
            if(result){
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
            }
          },
          (err) => {

          }
        );
      }


    } else {
      this.getSecuritySettings();
    }
  }

  composeRunTimeCss(){
    if (!this.appSettings.customStyle) {
      this.appSettings = AppSettings.DEFAULT_SETTINGS;
    }
    this.statusBar.backgroundColorByHexString(this.appSettings.customStyle.AppTheme);
    this.themeSwitcher.setTheme('Theme1', this.appSettings.customStyle.AppTheme);
    let _css = `
    .dashboardToolbar {
      --background: `+ this.appSettings.customStyle.AppTheme +` !important;
      --min-height: ` + (this.appSettings.FooterTab.IconSize * 2) + `px !important;
    }`;
    document.getElementById("MY_RUNTIME_CSS").innerHTML = _css;
  }

  async updateSyncInterval() {
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
          this.getSecurityStats();
          this.updateSyncInterval();
          this.apiProvider.GetSecurityMasterDetails().then(
            (result: any) => {
              if(result){
                window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
              }
            },
            (err) => {

            }
          );
          this.enableMyKad();
        }
      },
      (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message == "Http failure response for"){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else if(err && JSON.parse(err) && JSON.parse(err).message){
          message =JSON.parse(err).message;
        }
        if(message){
          // message = " Unknown"
          this.apiProvider.showAlert(message);
        }
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
      }, 100);
    }
  }

  hideLoading(currentClass){
    if(currentClass.loading){
      currentClass.loading.dismiss();
      currentClass = null;
    }
  }

  proceedNext(type){

    setTimeout(() => { console.log("Click -->" + type); }, 10);
    if(type == 'IN'){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
          }
        },
        replaceUrl: true
      };
      this.router.navigate(['security-manual-check-in'], navigationExtras);
      // this.enableMyKad();
    } else if(type == 'OUT'){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            Type : '60'
          }
        }
      };
      this.router.navigate(['security-check-out-page'], navigationExtras);
    } else if(type == 'APPOINTMENT'){
      this.scanPreAppointmentQR();
      // this.enableMyKad();
    } else if(type === 'QR_PROFILE'){
      this.scanVerifyHostQR();
    } else if(type == 'QUICK_PASS_OUT'){
      this.quickPassOut();
    }else if(type == 'QUICK_PASS'){
      // this.scanQuickPassQR()
      this.quickPassOut();
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

  gotoSettings(){
    this.router.navigateByUrl('settings-view-page');
  }

  logout() {
    this.translate.get(['SETTINGS.ARE_U_SURE_LOGOUT_TITLE','SETTINGS.ARE_U_SURE_LOGOUT',
     'SETTINGS.EXIT_ACCOUNT_SCUSS','SETTINGS.EXIT_ACCOUNT_FAILED'
    ,'COMMON.OK','COMMON.CANCEL','COMMON.EXIT1']).subscribe(async t => {
      let loginConfirm = await this.alertCtrl.create({
        header: t['SETTINGS.ARE_U_SURE_LOGOUT_TITLE'],
        message: t['SETTINGS.ARE_U_SURE_LOGOUT'],
        cssClass: 'alert-warning-logout',
        mode: 'ios',
        buttons: [
          {
            text: t['COMMON.EXIT1'],
            handler: () => {
              const endDate = new Date(this.datePipe.transform(new Date(), 'yyyy/MM/dd HH:mm:ss'));
                const data = {
                  'LogoutTime': endDate,
                  'Duration': this.getDurationToLogout(endDate)
                }
                console.log(JSON.stringify(data));
                this.apiProvider.requestSecurityApi(data, '/api/SecurityApp/userLogout', true).then(
                  (val: any) => {
                    localStorage.setItem(AppSettings.LOCAL_STORAGE.SECURITY_USER_DETAILS, '');
                    localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS, '');
                    this.apiProvider.showToast(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
                    this.navCtrl.navigateRoot('login');
                  },
                  async (err) => {
                    if(err && err.message == "No Internet"){
                      return;
                    }
                    try {
                      var result = JSON.parse(err.toString());
                      if(result.message){
                        this.apiProvider.showAlert(result.message);
                        return;
                      }
                    } catch (error) {

                    }

                    if(err && err.message == "Http failure response for"){
                      var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
                      this.apiProvider.showAlert(message);
                      return;
                    }

                    if(err && err.Table && err.Table[0].Code !== 10 && err.Table1 && err.Table1[0].Description){

                      this.apiProvider.showAlert(err.Table1[0].Description);
                      return;
                      }
                    this.apiProvider.showAlert("<span class='failed'>" + this.T_SVC['ACC_MAPPING.CANT_FIND_LICENSE'] + '</span>');
                  }
                );
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

  active(){
    // alert("Active");
  }

  enableMyKad(){
    if(this.appSettings.MyKad_Enabled) {
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
            currentClass.apiProvider.presentLoading();
            description = resultObj.Description;
            break;
          case "INSERT":
            description = resultObj.Description;
            break;
          case "CARD READ PROGRESS":
            currentClass.apiProvider.presentLoading();
            description = resultObj.Description;
            break;
          case "CANCEL":
            currentClass.apiProvider.dismissLoading();
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
      var data = "0002721385" //"C4B9F365";
      var params = {"hexcode":""+ data};
      this.getAppointmentByQR(params);
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
            this.getAppointmentByQR(params);
        } else{
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
    });
    }
  }

  getAppointmentByQR(params) {
    this.apiProvider.VimsAppGetAppointmentByHexCode(params, true).then(
      async (val) => {
        var visitorDetail = val+"";
        var vOb1 = JSON.parse(visitorDetail);
        var message = this.T_SVC['ALERT_TEXT.APPOINTMENT_NOT_FOUND'];
        if(vOb1 && vOb1.Table1 && vOb1.Table1.length > 0) {
          var vOb = vOb1.Table1[0];
          vOb.Hexcode = params.hexcode;
          const resultObj = this.commonUtil.checkQRCode(vOb.START_TIME, vOb.END_TIME, this.dateformat);
          if(resultObj.isInValid){
            message = this.T_SVC['ALERT_TEXT.QR_INVALID_TODAY'];
            if(resultObj.isExpired){
              message = this.T_SVC['ALERT_TEXT.QR_EXPIRED'];
            }
            this.apiProvider.showAlert(message);
          } else {
            if ((vOb.att_check_in === null || vOb.att_check_in === 0) || (vOb.att_check_in === 1 && vOb.att_check_out === 1)) {
              const navigationExtras: NavigationExtras = {
                state: {
                  passData: {
                    PreAppointment : vOb
                  }
                }
              };
              this.router.navigate(['security-manual-check-in'], navigationExtras);
            } else if (vOb.att_check_in === 1 && (vOb.att_check_out === null || vOb.att_check_out === 0)){
              const navigationExtras: NavigationExtras = {
                state: {
                  passData: vOb,
                  fromAppointment: true,
                  showCheckoutAlert: true
                }
              };
              this.router.navigate(['visitor-information'], navigationExtras);
            } else {
              this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.QR_INVALID_TODAY']);
            }

          }
        } else {
          this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.QR_INVALID_TODAY']);
        }
      },
      async (err) => {
        console.log("error : "+JSON.stringify(err));
        if(err && err.message == "No Internet"){
          return;
        }

        if(err.Table1 && err.Table1.length == 0){
          var message  = this.T_SVC['ALERT_TEXT.INVALID_QR'];
          this.apiProvider.showAlert(message);
            return;
        }

        if(err && err.message == "Http failure response for"){
          message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          this.apiProvider.showAlert(message);
          return;
        }
        if (err.message){
          this.apiProvider.showAlert(err.message);
          return;
        }
        message = this.T_SVC['ACC_MAPPING.INVALID_QR'];

        if(err && JSON.parse(err) && JSON.parse(err).Table && JSON.parse(err).Table[0].description){
          message = JSON.parse(err).Table[0].description;
        }else if(err && JSON.parse(err) && JSON.parse(err).message){
          message = JSON.parse(err).message;
        }
        this.apiProvider.showAlert(message);
      }
    );
  }

  scanVerifyHostQR(){
    let invalidQRCode = false;

    var loadinWeb = true;
    if(!this.platform.is('cordova')) {
      loadinWeb = true;
    } else {
      loadinWeb = false;
    }
    if (loadinWeb) {
      var data = "VijayCalmwws"
      this.getUserProfile(data);
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
            this.getUserProfile(data);
        } else{
          let invalidQRConfirm = await this.alertCtrl.create({
            header: 'Error !',
            message: this.T_SVC['ACC_MAPPING.INVALID_QR'],
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
        }
    }, async (err) => {
        console.log("Error occured : " + err);
        let invalidQRConfirm = await this.alertCtrl.create({
          header: 'Error !',
          message: this.T_SVC['ACC_MAPPING.INVALID_QR'],
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
    });
    }
  }


  getUserProfile(QRData) {
    var params  = {
      "UserSeqId": "",
      "MemberId":"",
    }
    params.MemberId = QRData;
    if (!params.MemberId) {
      this.apiProvider.showAlert("User not found.");
      return;
    }

    this.apiProvider.requestApi(params, '/api/Vims/GetUserProfile', false, 'WEB', '').then(
      (val) => {
        try{
          var result = JSON.parse(JSON.stringify(val));
          if(result){
            const userProfile = JSON.parse(result).Table1[0];
            if (userProfile.Code && userProfile.Code > 10) {
              this.apiProvider.showAlert('QR code is invalid, please verify the QR code or contact system administrator for further assistance');
            } else {
              const navigationExtras: NavigationExtras = {
                state: {
                  passData: userProfile
                }
              };
              this.router.navigate(['qr-profile'], navigationExtras);
            }

          }
        }catch(e){
        }

      },
      (err) => {
      }
    );
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

    this.userInfoObj.LoginTime = this.userInfoObj.LoginTime.replace('-', '/');
    const startDate = new Date(this.userInfoObj.LoginTime);
    let difference = endDate.getTime() - startDate.getTime();

    const dDays = this.apiProvider.twoDecimals(parseInt('' +difference/(24*60*60*1000)));
    const dHours = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*60*1000)) % 24)) ;
    const dMin = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*1000)) % 60));
    this.lastLoggedIn = dDays +' day, '+dHours+' hour, '+dMin+' min';
  }

  getDurationToLogout(endDate) {
    const userInfo = localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    if (userInfo) {
      const userInfoObj = JSON.parse(userInfo);
      const startDate = new Date(userInfoObj.LoginTime);
      userInfoObj.LoginTime = userInfoObj.LoginTime.replace('-', '/');
      userInfoObj.LoginTime = userInfoObj.LoginTime.replace('-', '/');
      let difference = endDate.getTime() - startDate.getTime();
      const dDays = this.apiProvider.twoDecimals(parseInt('' +difference/(24*60*60*1000)));
      const dHours = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*60*1000)) % 24)) ;
      const dMin = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*1000)) % 60));
      const dSec = this.apiProvider.twoDecimals(parseInt('' +(difference/(1000)) % 60));
      return dDays +' Day(s), '+dHours+' Hour(s), '+dMin+' Min(s), '+dSec+' Sec(s)';
    }

  }

  refreshLastLoggedIn() {
   this.loggedInInterval = setInterval(() => {
      const endDate = new Date(this.datePipe.transform(new Date(), 'yyyy/MM/dd HH:mm:ss'));
      this.getDuration(endDate);
    }, 1000);
  }

  async getSecurityStats(){
    var params = {
    }
    this.apiProvider.VimsAppGetSecurityStats(params).then(
      (data: any) => {
        this.networkError = false;
       const result = JSON.parse(data);
       this.statsCountData = result.Table1[0];
       this.dataSets1.labels = [];
       this.dataSets2.labels = [];
       this.dataSets3.labels = [];
       this.dataSets4.labels = [];
       this.dataSets5.labels = [];
       result.Table2 = result.Table2 ? result.Table2.reverse(): [];
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

       if (result.Table6) {
        const TenDaysUpcomingAppointmentTotalCount = [];
        result.Table6.forEach(element => {
          this.dataSets5.labels.push(element.VisitorCategory);
          TenDaysUpcomingAppointmentTotalCount.push(element.AppointmentCount);
         });
         this.dataSets5.datasets = [{
          label: 'Upcoming Appointment',
          data: TenDaysUpcomingAppointmentTotalCount,
          backgroundColor: this.colorArray, // array should have same number of elements as number of dataset
          borderColor: this.colorArray,// array should have same number of elements as number of dataset
          borderWidth: 1,
          keepTooltipOpen: true
        }];
        if (this.barChart5) {
          this.barChart5.update();
        }
       }

      },
      (err) => {
        this.networkError = true;
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
    switch (type) {
      case '10':
      case '20':
      case '30':
      case '40':
      case '60':
        this.router.navigate(['security-check-out-page'], navigationExtras);
        break;
      case '50':
        this.router.navigate(['security-appointment-list'], navigationExtras);
        break;
      default:
        break;
    }

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

      let options1 = {
        legend: {
          display: true,
          position: 'bottom',
          labels:{
            usePointStyle: true,
            fontSize: 8,
            fontColor: '#333',
        }
       },
       tooltips: {
        enabled: true
      },
      plugins: {
          datalabels: {
              formatter: (value, ctx) => {
                  let sum = 0;
                  let dataArr = ctx.chart.data.datasets[0].data;
                  dataArr.map(data => {
                      sum += data;
                  });
                  let percentage = (value*100 / sum).toFixed(2)+"%";
                  return percentage;
              },
              color: '#fff',
          }
      }

      };


      const nativeElm5 = document.getElementById('barCanvas5');
      this.barChart5 = new Chart(nativeElm5, {
        type: 'pie',
        data: this.dataSets5,
        options: options1
      });
    } catch (error) {

    }
  }

  ngAfterViewInit(){
  }

}
