import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';
import { NavController, AlertController, Platform, NavParams, IonItemSliding } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-ack-visitor-lis',
  templateUrl: './ack-visitor-lis.page.html',
  styleUrls: ['./ack-visitor-lis.page.scss'],
})
export class AckVisitorLisPage implements OnInit {
  ngOnInit() {
  }

  @ViewChild('visitorsList') visitorsList: any;

  scannedData = [];
  playVideoUrl = "";
  T_SVC:any;
  ackSeettings : any = {};
  options :BarcodeScannerOptions;
  isGroup = false;
  showConfirmScanBtns = false;
  logo = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  RefTypeVP= '&RefType=VP&Refresh='+ new Date().getTime();
  VisitorCategory = "";
  constructor(public navCtrl: NavController,
    public apiProvider : RestProvider,
    public alertCtrl : AlertController,
    private route: ActivatedRoute,
    private router:Router,
    private translate:TranslateService,
    private streamingMedia : StreamingMedia,
    private barcodeScanner: BarcodeScanner,
    private platform : Platform,
    public navParams: NavParams) {

      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          const passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + passData);
          var visitor = passData.scannedData;
          if(visitor){
            this.scannedData[0] = visitor;
          }
          this.playVideoUrl = passData.playVideoUrl;
          this.VisitorCategory = passData.VisitorCategory;

        }
      });
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL','ACC_MAPPING.PROCEED','ADD_VISITORS.LAB_USER_IC',
    'ACC_MAPPING.INVALID_QR', 'COMMON.OK', 'COMMON.SCAN', 'COMMON.MANUAL', 'ALERT_TEXT.UPDATE_BRIEF_STATUS', 'ALERT_TEXT.THANK_YOU_WATCH_VIDEO',
  'ALERT_TEXT.VIDEO_NOT_AVAILABLE', 'ALERT_TEXT.UPDATE_BRIEF_STATUS_TITLE', 'COMMON.VIDEO_ERROR', 'ALERT_TEXT.CONFIRMATION',
'ALERT_TEXT.ADD_MORE_VISITOR', 'ALERT_TEXT.VISITOR_ALREADY_SCANNED', 'ALERT_TEXT.REMOVE_VISITOR',
'ALERT_TEXT.VISITOR_NOT_FOUND', 'ALERT_TEXT.UPDATE_BRIEF_STATUS_GROUP']).subscribe(t => {
        this.T_SVC = t;
    });

    var ackSeettings =  window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS);
    if(ackSeettings && JSON.parse(ackSeettings)){
      var result = JSON.parse(ackSeettings);
      this.ackSeettings = result;
      this.isGroup = (this.ackSeettings.BriefingMode == AppSettings.Group);
    }

  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter AckVisitorListPage');
  }

  async addMoreVisitor(){
    let loginConfirm = this.alertCtrl.create({
      header:"<span class='failed'>" + this.T_SVC['ALERT_TEXT.CONFIRMATION'] + '</span>',
      message: this.T_SVC['ALERT_TEXT.ADD_MORE_VISITOR'],

      cssClass:'alert-danger',
      buttons: [

        {
          text: this.T_SVC['COMMON.SCAN'],
          handler: () => {
            this.AddVisitorByScan();
          }
        },
        {
          text: this.T_SVC['COMMON.MANUAL'],
          role: 'ok',
          handler: () => {

            this.AddVisitorByManual();

          }
        }
      ]
    });
    (await loginConfirm).present();
  }

  async takeActForManualEntry(){

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
          }
        },
        {
          text: this.T_SVC['ACC_MAPPING.PROCEED'],
          handler: data => {
            if (data.nric) {
              // logged in!
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

  doCapitalize(text){
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  async AddVisitorByManual(){
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

          }
        },
        {
          text: this.T_SVC['ACC_MAPPING.PROCEED'],
          handler: data => {
            if (data.nric) {
              // logged in!
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

  AddVisitorByScan(){

    var loadinWeb = true;
    if(!this.platform.is('cordova')) {
      loadinWeb = true;
    } else {
      loadinWeb = false;
    }
    if (loadinWeb) {
      this.GetVisitorDataById("123123");
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
        if(data){
          this.GetVisitorDataById(data);
        }else{
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
        // console.log(scanData); D20A6A48

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


  GetVisitorDataById(data){

    var data1 = {
      "visitor_id": data
    }
    this.apiProvider.GetVisitorDataById(data1).then(
      async (val) => {
        var result = JSON.parse(val+"");
        if(result ){
          console.log("Result: "+ JSON.stringify(result));
          var index = this.scannedData.findIndex(item => item.visitor_id === result.visitor_id);
          if(index > -1){
            let invalidQRConfirm = await this.alertCtrl.create({
              header: 'Error !',
              message: "<span class='failed'>" + this.T_SVC['ALERT_TEXT.VISITOR_ALREADY_SCANNED'] + '</span>',
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
          }else{
            if(!this.VisitorCategory){
              this.scannedData[this.scannedData.length] = result;
              return;
            }
            var index1 = this.VisitorCategory.indexOf(result.visitor_ctg_id);
            if(index1 > -1){
              this.scannedData[this.scannedData.length] = result;
            }else{
              let invalidQRConfirm = await this.alertCtrl.create({
                header: 'Error !',
                message: "<span class='failed'>" + result.visitor_ctg_id + " category not allowed to watch safety brief on this group</span>",
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
    );
  }

  async playGroupVideo(){
    var _thisData = this;

    if(this.ackSeettings.BriefingOn == AppSettings.OtherSource || this.showConfirmScanBtns){
      var sVisitor = _thisData.getAllVisitorsConfirmationID();
      if(sVisitor){
        _thisData.VimsAppUpdateVisitorVideoBriefStatus(sVisitor);
      }else{
        let invalidQRConfirm = await _thisData.alertCtrl.create({
          header: 'Notice !',
          message: "<span class='failed'>" + _thisData.T_SVC['ALERT_TEXT.UPDATE_BRIEF_STATUS'] + '</span>',
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
      }

      return;
    }



    // Play a video with callbacks
    var options : StreamingVideoOptions = {
      successCallback: function() {
        console.log("Video was closed without error.");
        if(_thisData.ackSeettings.ConfirmQrAfterBriefing){
          _thisData.showConfirmScanBtns = true;
        }else{
          _thisData.VimsAppUpdateVisitorVideoBriefStatus(_thisData.getAllVisitorsConfirmationID());
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
      },
      orientation: 'landscape',
      shouldAutoClose: true,  // true(default)/false
      controls: false // true(default)/false. Used to hide controls on fullscreen
      };

      if(!_thisData.platform.is('cordova')) {
        if(_thisData.ackSeettings.ConfirmQrAfterBriefing){
          _thisData.showConfirmScanBtns = true;
        }else{
          _thisData.VimsAppUpdateVisitorVideoBriefStatus(_thisData.getAllVisitorsConfirmationID());
        }

      }else{
        _thisData.streamingMedia.playVideo(this.playVideoUrl, options);
      }


  }

  getAllVisitorsID(){
    var vIc = "";
    for(var i = 0 ; i < this.scannedData.length; i++){

      if(vIc){
        vIc = vIc + "," +this.scannedData[i].visitor_id;
      }else{
        vIc = this.scannedData[i].visitor_id;
      }
    }

    return vIc;
  }

  getAllVisitorsConfirmationID(){
    var vIc = "";
    for(var i = 0 ; i < this.scannedData.length; i++){
      var item = this.scannedData[i];
      if(item.confirmed){
        if(vIc){
          vIc = vIc + "," +this.scannedData[i].visitor_id;
        }else{
          vIc = this.scannedData[i].visitor_id;
        }
      }

    }
    if(!vIc){
      if(!this.ackSeettings.ConfirmQrAfterBriefing || this.ackSeettings.BriefingOn == AppSettings.OtherSource){
        vIc = this.scannedData[0].visitor_id;
      }
    }
    return vIc;
  }

  async manualScan(){
    if(!this.showConfirmScanBtns){
      this.AddVisitorByManual();
      return;
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
          }
        },
        {
          text: this.T_SVC['ACC_MAPPING.PROCEED'],
          handler: data => {
            if (data.nric) {
              // logged in!
              this.processConfirmIcs(data.nric);
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

  ConfirmQrAfterBriefing1(manual){
    if(!this.showConfirmScanBtns){
      this.AddVisitorByScan();
      return;
    }
    var loadinWeb = true;
    if(manual || !this.platform.is('cordova')) {
      loadinWeb = true;
    } else {
      loadinWeb = false;
    }
    if (loadinWeb) {
      this.VimsAppUpdateVisitorVideoBriefStatus(this.getAllVisitorsConfirmationID());
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
        this.processConfirmIcs(data);
        // console.log(scanData); D20A6A48

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

  async processConfirmIcs(data){
    if(data){
      var icDetected = false;
      var item1;
      var isAlreadyDetected = false;
      for(var i = 0 ; i < this.scannedData.length ; i++){
        var item = this.scannedData[i];

        if(item.visitor_id == data){
          if(item.confirmed){
            isAlreadyDetected = true;
          }else{
            item.confirmed = true;
            icDetected = true;
            item1 = item;
          }

        }
      }
      if(isAlreadyDetected){
        let invalidQRConfirm = await this.alertCtrl.create({
          header: 'Error !',
          message: "<span class='failed'>" + this.T_SVC['ALERT_TEXT.VISITOR_ALREADY_SCANNED'] + '</span>',
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
      }else if(!icDetected){
        let invalidQRConfirm = await this.alertCtrl.create({
          header: 'Error !',
          message: "<span class='failed'>" + this.T_SVC['ALERT_TEXT.VISITOR_NOT_FOUND'] + '</span>',
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

    }
  }

  async removeVisitor(slideDOM:IonItemSliding, item){
    slideDOM.close();
    let alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: this.T_SVC['ALERT_TEXT.REMOVE_VISITOR'],
      cssClass: 'alert-warning',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            console.log('Delete clicked');
            let index = this.scannedData.indexOf(item);
            if (index > -1) {
              this.scannedData.splice(index, 1);
            }

          }
        }
      ]
    });
    alert.present();
  }

  VimsAppUpdateVisitorVideoBriefStatus(data){
    var data1 = {
      "visitor_id": data
    }
    this.apiProvider.VimsAppUpdateVisitorVideoBriefStatus(data1).then(
      async (val) => {
        var result = JSON.parse(val+"");
        if(result ){
          console.log("Result: "+ JSON.stringify(result));
          let invalidQRConfirm = await this.alertCtrl.create({
            header: 'Success',
            message: "<span class='success'> " + this.T_SVC['ALERT_TEXT.THANK_YOU_WATCH_VIDEO'] + " </span>",
            cssClass: 'alert-danger',
            buttons: [
              {
                text: this.T_SVC['COMMON.OK'],
                role: 'cancel',
                handler: () => {
                  this.navCtrl.pop();
                }
              }
            ]
          });
          invalidQRConfirm.present();

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
    );
  }

}
