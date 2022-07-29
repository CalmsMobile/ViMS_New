import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController, MenuController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

export class activeEvent{
  XYZ_Bookid:string = "";
  XYZ_PURP:string = "";
  XYZ_ROOM:string = "";
  XYZ_REASON:string = "";
  XYZ_CRETBY:string = "";
  XYZ_STIME:string = "";
  XYZ_ETIME:string = "";
  XYZ_STIME_1:string = "";
  XYZ_ETIME_1:string = "";
  XYZ_NO_PERSON:string = "";
  XYZ_STATUS:string = "";
  SessionEnd : any;
}

@Component({
  selector: 'app-facility-kiosk-display',
  templateUrl: './facility-kiosk-display.page.html',
  styleUrls: ['./facility-kiosk-display.page.scss'],
})
export class FacilityKioskDisplayPage implements OnInit {

  APP_DEFAULT_LOGO:string = "../../assets/images/icon.png";
  APP_DEFAULT_BG:string = "../../assets/images/background/app_bg.png";
  ACTIVE_BLOCK_CURRENT_DATA:activeEvent = new activeEvent();
  UPCOMING_DATA_LIST:Array<activeEvent> = [];
  CURRENT_TIME:Date = new Date();
  CURRENT_SIDEMENU_GEAR:string = "close";
  K_PROPERTIES:any = {};
  SELECTED_FACILITIE:any = {};
  GO_SETTINGS_COUNT:number = 0;
  GO_SETTINGS_TIMER:any = null;
  GET_BOOKING_SLOT_TIMER = null;
  GET_SETTING_TIMER = null;
  T_SVC:any;
  isNetworkError = false;
  showStopButton = false;
  API_URL = "";
  constructor(
    public navCtrl: NavController,

     private datePipe:DatePipe,
     private toastCtrl:ToastController,
     private router: Router,
     private menuCtrl: MenuController,
     private alertCtrl:AlertController,
     private apiProvider : RestProvider,
     private translate : TranslateService) {
      this.translate.get([
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
        'ALERT_TEXT.SESSION_EXPIRED',
        'ALERT_TEXT.SLOT_OCCUPIED',
        'ALERT_TEXT.WISH_TO_END_BOOK',
        'NOTIFICATION.TITLE',
        'ALERT_TEXT.SESSION_ENDED']).subscribe(t => {
          this.T_SVC = t;
      });
      this.menuCtrl.enable(false, 'myLeftMenu');
      var properties = localStorage.getItem(AppSettings.LOCAL_STORAGE.FASILITY_DISPLAY_KIOSK_SETUP);
      if(properties != undefined && properties  != ""){
        this.K_PROPERTIES = JSON.parse(properties);
      }
      const qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if(qrData){
        this.API_URL = JSON.parse(qrData).ApiUrl;
      }

      this.resetGetSettingsTimer();
      var currentClasss = this;
      setInterval(()=>{
        currentClasss.CURRENT_TIME = new Date();
      },1000);
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter FacilityKioskDisplayPage');
    var sFacilityList = localStorage.getItem(AppSettings.LOCAL_STORAGE.SEL_FASILITY_DISPLAY_KIOSK_FACILITY);
    if( sFacilityList != undefined && sFacilityList  != ""){
      this.SELECTED_FACILITIE = JSON.parse(sFacilityList);
      this.resetGetBookingSlotTimer();
    } else{
      this.apiProvider.showAlert('Please select your facility');
      this.router.navigateByUrl("facility-kiosk-settings");
    }
  }

  ionViewWillLeave(){
    if(this.GET_BOOKING_SLOT_TIMER){
      clearInterval(this.GET_BOOKING_SLOT_TIMER);
    }

    if(this.GET_SETTING_TIMER){
      clearInterval(this.GET_SETTING_TIMER);
    }
    console.log('ionViewWillLeave FacilityKioskDisplayPage');
  }
  updateKioskSetup(){
    var ackData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.DISPLAY_DETAILS);
    var MAppDevSeqId = "";
    if(ackData && JSON.parse(ackData)){
      MAppDevSeqId = JSON.parse(ackData).MAppDevSeqId;
    }
    var param = {
      "MAppDevSeqId":MAppDevSeqId

    }
    this.apiProvider.GetDisplaySettings(param).then((data : any) => {
      var result = JSON.parse(data);
      if(result){
        var property = {
          "common": JSON.parse(result.CommonSetup),
          "screen_ui": JSON.parse(result.ScreenSetup)
        }
        this.K_PROPERTIES = property;
        localStorage.setItem(AppSettings.LOCAL_STORAGE.FASILITY_DISPLAY_KIOSK_SETUP, JSON.stringify(this.K_PROPERTIES));
        this.APP_DEFAULT_LOGO = (this.K_PROPERTIES['common']['LogoImg'] != "") ? this.API_URL + "/FS/" + this.K_PROPERTIES['common']['LogoImg']  : this.APP_DEFAULT_LOGO;
        this.APP_DEFAULT_BG = (this.K_PROPERTIES['common']['BGImg'] != "") ? this.API_URL + "/FS/" +this.K_PROPERTIES['common']['BGImg']  : this.APP_DEFAULT_BG;;
        this.updateThemeScreen();
      }

    }, (err) => {

    });

    // this.vfkioskAPI.localPostMethod("getCommon", JSON.stringify({})).subscribe(response => {
    //     this.K_PROPERTIES = this.vfkioskAPI.sampleJSONProperties();
    //     localStorage.setItem(AppSettings.LOCAL_STORAGE.FASILITY_DISPLAY_KIOSK_SETUP, JSON.stringify(this.K_PROPERTIES));
    //     this.APP_DEFAULT_LOGO = (this.K_PROPERTIES['common']['LogoImg'] != "") ? this.K_PROPERTIES['common']['LogoImg']  : this.APP_DEFAULT_LOGO;
    //     this.APP_DEFAULT_BG = (this.K_PROPERTIES['common']['BGImg'] != "") ? this.K_PROPERTIES['common']['BGImg']  : this.APP_DEFAULT_BG;;
    //     this.updateThemeScreen();
    // }, (err) => {
    //   this.alertCtrl.create({
    //     header: '<h2 color="primary">Error !</h2>',
    //     subheader: '' + err,
    //     buttons: ['OK']
    //   }).present();
    // });

  }
  resetGetSettingsTimer(){
    let slot_update_time_interval=1;
    var currentClass = this;
    try{
      slot_update_time_interval = this.K_PROPERTIES['common']['sync']['setupAutoSynServrTimIntr'] || 1;
      if(this.GET_SETTING_TIMER){
        clearInterval(this.GET_SETTING_TIMER);
      }
    }catch(e){
      slot_update_time_interval = 1;
    }

    this.updateKioskSetup();
    if(slot_update_time_interval >= 1){
      this.GET_SETTING_TIMER = setInterval(()=>{
        currentClass.updateKioskSetup();
      },(slot_update_time_interval * 60 * 1000));
    }
  }
  resetGetBookingSlotTimer(){
    var currentClass = this;
    let slot_update_time_interval = this.K_PROPERTIES['common']['sync']['setupAutoSynServrTimIntr'] || 1;
    clearInterval(this.GET_BOOKING_SLOT_TIMER);
    this.getFacilityBookingSlats();
    if(slot_update_time_interval >= 1){
      this.GET_BOOKING_SLOT_TIMER = setInterval(()=>{
        currentClass.getFacilityBookingSlats();
      },(slot_update_time_interval * 60 * 1000));
    }
  }
  updateThemeScreen(){
    let _css = `
    [custom-header]{
      background: linear-gradient(to top left, ` +this.K_PROPERTIES['screen_ui']['header']['header_bg_grad1'] +`, ` + this.K_PROPERTIES['screen_ui']['header']['header_bg_grad2']+`) !important;
    }
    [custom-footer]{
      background: linear-gradient(to top left, ` +this.K_PROPERTIES['screen_ui']['footer']['footer_bg_grad1'] +`, ` + this.K_PROPERTIES['screen_ui']['footer']['footer_bg_grad2']+`) !important;
    }
    [active-room][bg-type='normal']{
      background: linear-gradient(to top left, ` +this.K_PROPERTIES['screen_ui']['active_block']['normal_bg_grad_clr1'] +`, ` + this.K_PROPERTIES['screen_ui']['active_block']['normal_bg_grad_clr2']+`) !important;
    }
    [active-room][bg-type='bystatus'][status-type='engaged']{
      background: linear-gradient(to top left, ` +this.K_PROPERTIES['screen_ui']['active_block']['engaged_bg_grad_clr1'] +`, ` + this.K_PROPERTIES['screen_ui']['active_block']['engaged_bg_grad_clr2']+`) !important;
    }
    [active-room][bg-type='bystatus'][status-type='avail']{
      background: linear-gradient(to top left, ` +this.K_PROPERTIES['screen_ui']['active_block']['avail_bg_grad_clr1'] +`, ` + this.K_PROPERTIES['screen_ui']['active_block']['avail_bg_grad_clr2']+`) !important;
    }
    [upcoming-room]{
      background: linear-gradient(to top left, ` +this.K_PROPERTIES['screen_ui']['upcoming_block']['bg_grad_clr1'] +`, ` + this.K_PROPERTIES['screen_ui']['upcoming_block']['bg_grad_clr2']+`) !important;
    }
    [upcoming-room] [header]{
      background: linear-gradient(to top left, ` +this.K_PROPERTIES['screen_ui']['upcoming_block']['upcoming_header']['bg_grad_clr1'] +`, ` + this.K_PROPERTIES['screen_ui']['upcoming_block']['upcoming_header']['bg_grad_clr2']+`) !important;
    }

    [upcoming-room] [ion-item][status-type='avail']{
      background: linear-gradient(to top left, ` +this.K_PROPERTIES['screen_ui']['upcoming_block']['avail_tile_grad_clr1'] +`, ` + this.K_PROPERTIES['screen_ui']['upcoming_block']['avail_tile_grad_clr2']+`) !important;
    }

    [upcoming-room] [ion-item][status-type='engaged']{
      background: linear-gradient(to top left, ` +this.K_PROPERTIES['screen_ui']['upcoming_block']['engaged_tile_grad_clr1'] +`, ` + this.K_PROPERTIES['screen_ui']['upcoming_block']['engaged_tile_grad_clr2']+`) !important;
    }

    `;
    document.getElementById("MY_RUNTIME_CSS").innerHTML = _css;
  }
  toggleSideMenuGear(){
    if(this.CURRENT_SIDEMENU_GEAR === "close")
      this.CURRENT_SIDEMENU_GEAR = "open";
    else
      this.CURRENT_SIDEMENU_GEAR = "close";
  }
  async gotoCountClickSettings(){
    let numOfClicks = 8;
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
      this.router.navigateByUrl("facility-kiosk-settings");
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
  async getFacilityBookingSlats(event?:any){
    if(this.SELECTED_FACILITIE['FacilityCode'] !=''){
      let byDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
      // let prepare = "SEPurse&FacilityCode="+ this.SELECTED_FACILITIE['FacilityCode'] +"&checkDate="+byDate+"&UserName=MOB_USER"
      var flag = true;
     var param = {
        "FacilityCode":this.SELECTED_FACILITIE['FacilityCode'],
        "CheckDate":byDate
      }
      if (flag) {
        this.apiProvider.DisplayApp_GetBookingSlots(param).then((data : any) =>
        {
          this.isNetworkError = false;
          if(event){
            event.target.complete();
          }
          var result = JSON.parse(data);
          if(result && result.length > 0){
              this._calcBookingDetails(result);
            }
          }, (err) => {
            this.isNetworkError = true;
            if(event){
              event.target.complete();
            }
        })
        // this.vfkioskAPI.localGetMethod("getBookingSlats", prepare)
        // .subscribe((data:any) => {

        // },err=>{

        // });
      }else{
        if(event){
          event.complete();
        }
      }
    } else{
      if(event){
        event.complete();
      }
      (await this.alertCtrl.create({
        header: this.T_SVC['NOTIFICATION.TITLE'],
        message: 'Please select your facility',
        cssClass: '',
        buttons: ['OK']
      })).present();

      this.router.navigateByUrl("facility-kiosk-settings");
    }
  }
  _calcBookingDetails(_fulBookingData:any) {
    var _UPDT_BOOK = [];
    var loc_k_properties = this.K_PROPERTIES;
    var loc_sel_facility = this.SELECTED_FACILITIE;
    var loc_datepipe = this.datePipe;
    var _pre = new activeEvent();
    for (var i = 0; i < _fulBookingData.length; i++) {
        var chkStartTime = (_fulBookingData[i].StartTime).replace(/T/g, " ");
        var chkEndTime = (_fulBookingData[i].EndTime).replace(/T/g, " ");
        var init_pre = function () {
            let _evntType = _fulBookingData[i].BookPurps;
            if ((_evntType).trim() === "" || _fulBookingData[i].SessionEnd) {
                _evntType = loc_k_properties['screen_ui']['upcoming_block']['no_booking_txt'];
            }
            _pre = {
                XYZ_Bookid: _fulBookingData[i].BookingID,
                XYZ_PURP: _evntType,
                XYZ_ROOM: loc_sel_facility['FacilityName'],
                XYZ_REASON: _fulBookingData[i].BookingREMK,
                XYZ_CRETBY: _fulBookingData[i].BookedBy,
                XYZ_STIME: loc_datepipe.transform(new Date(chkStartTime), 'hh:mm a'),
                XYZ_ETIME: chkEndTime,
                XYZ_STIME_1: _fulBookingData[i].StartTime,
                XYZ_ETIME_1: _fulBookingData[i].EndTime,
                XYZ_NO_PERSON:"",
                XYZ_STATUS: (_fulBookingData[i].BookingID != "" && !_fulBookingData[i].SessionEnd)?"engaged":"avail",
                SessionEnd : _fulBookingData[i].SessionEnd
            }
        }
        if (i > 22) {
          console.log(i + ' ' + _fulBookingData[i].BookingID);
        }
        if (i === 0) {
            init_pre();
        } else if (i !== (_fulBookingData.length - 1)) {
            if (_fulBookingData[i].BookingID === _pre.XYZ_Bookid) {
                _pre.XYZ_ETIME = chkEndTime;
            } else {
                if (new Date() < new Date(_pre.XYZ_ETIME)) { // Check End Time with Current Time
                    _pre.XYZ_ETIME = this.datePipe.transform(new Date(_pre.XYZ_ETIME), 'hh:mm a');
                    _UPDT_BOOK.push(_pre); // insert Old One and Create New _pre
                }
                init_pre();
            }
        } else {
            if (new Date() < new Date(chkEndTime)) { // Check End Time with Current Time
                _pre.XYZ_ETIME = this.datePipe.transform(new Date(chkEndTime), 'hh:mm a');
                _UPDT_BOOK.push(_pre); // insert Old One and Create New _pre
            }
        }
    }
    //console.log(JSON.stringify(_UPDT_BOOK));
    this.UPCOMING_DATA_LIST = _UPDT_BOOK;
    if(_UPDT_BOOK.length > 0){
      this.ACTIVE_BLOCK_CURRENT_DATA = _UPDT_BOOK[0];
      if(!this.ACTIVE_BLOCK_CURRENT_DATA.SessionEnd && this.ACTIVE_BLOCK_CURRENT_DATA.XYZ_Bookid){
        this.showStopButton = true;
      }else{
        this.showStopButton = false;
      }

      this.UPCOMING_DATA_LIST = this.UPCOMING_DATA_LIST.splice(1,this.UPCOMING_DATA_LIST.length);
    }

    console.log("-- " + this.datePipe.transform(new Date(), 'hh:mm:ss a') + " -- APP EVENT DATA UPDATED");
    //APP_GEN._updateScreen();
  }

  // let alert = this.alertCtrl.create({
  //   header: 'Alert',
  //   message: 'Please select your facility',
  //   cssClass: '',
  //   buttons: [{
  //     text: 'Okay',
  //     handler: () => {
  //       console.log('Cancel clicked');
  //       this.alertShowing = false;
  //     }
  //   }]
  // });
  // (await alert).present();

  async takeActForStopEvent(){
    let alert = await this.alertCtrl.create({
      header: this.T_SVC['ALERT_TEXT.WISH_TO_END_BOOK'],
      cssClass: '',
      inputs: [
        {
          name: 'stopcode',
          placeholder: 'Code',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'danger',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'End',
          cssClass: '',
          handler: data => {
            var displayData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.DISPLAY_DETAILS);
            var MAppDevSeqId = JSON.parse(displayData).MAppDevSeqId;
            if (data.stopcode) {
              this.FBDisplayEndSession(data.stopcode, this.ACTIVE_BLOCK_CURRENT_DATA.XYZ_STIME_1, this.ACTIVE_BLOCK_CURRENT_DATA.XYZ_ETIME_1, this.ACTIVE_BLOCK_CURRENT_DATA.XYZ_Bookid, MAppDevSeqId);
              // logged in!
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


  FBDisplayEndSession(PinNumber,StartDateTime ,EndDateTime, BookingID, StaffSeqId){
    var params = {
      "PinNumber": PinNumber,
      "StartTime":StartDateTime,
      "EndTime":EndDateTime,
      "BookingID": BookingID,
      "UpdatedBy":StaffSeqId
    }
    this.apiProvider.FBDisplayEndSession(params).then(
      async (val) => {
        if(val){
          var message = "Success"; // 0- used 1.success 2.Expired
          if(JSON.parse(val+"")[0].code === 10){
            let alert = await this.alertCtrl.create({
              header: 'Success',
              message: this.T_SVC['ALERT_TEXT.SESSION_ENDED'],
              cssClass: '',
              buttons: ['Okay']
            });
            alert.present();
            this.showStopButton = false;
            this.resetGetBookingSlotTimer();
          }else{
            message = "QR code is invalid, please verify the QR code or contact system administrator for further assistance";
            if(JSON.parse(val+"")[0].Status === "0"){
              message = this.T_SVC['ALERT_TEXT.SLOT_OCCUPIED'];
            }else if(JSON.parse(val+"")[0].Status === "2"){
              message = this.T_SVC['ALERT_TEXT.SESSION_EXPIRED'];
            }
            let alert = await this.alertCtrl.create({
              header: 'Failed',
              message: message,
              cssClass: '',
              buttons: ['Okay']
            });
            alert.present();
          }

        }
      },
      async (err) => {
        if(err && err.message === "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message === "Http failure response for"){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else if(err && JSON.parse(err) && JSON.parse(err).message){
          message =JSON.parse(err).message;
        }
        if(message){
          // message = " Unknown"
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: message,
              cssClass: '',
              buttons: ['Okay']
            });
            alert.present();
        }
      }
    );
  }

  ngOnInit() {
  }

}
