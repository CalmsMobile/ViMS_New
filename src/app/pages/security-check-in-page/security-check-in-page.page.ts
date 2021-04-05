import { Content } from '@angular/compiler/src/render3/r3_ast';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BarcodeScannerOptions, BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { NavController, NavParams, AlertController, ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { VisitorInfoModal } from 'src/app/model/visitorInfoModal';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { ToastService } from 'src/app/services/util/Toast.service';
declare var cordova: any;
@Component({
  selector: 'app-security-check-in-page',
  templateUrl: './security-check-in-page.page.html',
  styleUrls: ['./security-check-in-page.page.scss'],
})
export class SecurityCheckInPagePage implements OnInit {


  @ViewChild(Content) content: Content;
  active: boolean;

  lastImage: string = null;
  loading: any;
  visitor_RemoveImg = false;
  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage":"assets/images/profile_bg.jpg",
    "profile":"",
    "contact":""
  };
  VM = {
    "aData":{},
    "visitors":[]
  };
  visitorList = [];
  visitorSEQID = "0";
  imageType = "&RefType=VPB&Refresh="+ new Date().getTime();
  fromListPage = false;
  disableIc = false;
  edit = false;
  preAppointment = "";
  visitorInfoModal = new VisitorInfoModal();
  public error: string;
  visitorProfile:FormGroup;
  VISITOR_CATEGORY:any;
  translation:any = {};
  base64Image:any = "";
  hostSettings : any = {};
  visitor:any = {};
  position = 0;
  // visitorSEQID = "0";
  // visitorHexCode = "";
  OCR_Enabled = false;
  MyKad_Enabled = false;
  GenderList = [
  {"name": "Male", "value": "1"},
  {"name": "Female", "value": "2"}
  ]
  T_SVC:any;
  options :BarcodeScannerOptions;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastService: ToastService,
    private translate:TranslateService,
    public apiProvider: RestProvider,
    private alertCtrl: AlertController,
    private camera: Camera,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public platform: Platform,
    public events: EventsService,
    private router:Router,
    private route: ActivatedRoute,
    private dateformat : DateFormatPipe,
    private barcodeScanner: BarcodeScanner,
    private sanitizer: DomSanitizer,
    private _zone : NgZone,
    public loadingCtrl: LoadingController) {
      this.translate.get([
        'ACC_MAPPING.INVALID_QR', 'ACC_MAPPING.INVALID_ORG_TITLE',
        'ACC_MAPPING.INVALID_FCM_TITLE',
        'ACC_MAPPING.FCM_TITLE',
        'ALERT_TEXT.VISITOR_UPDATED',
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
        'ALERT_TEXT.IMAGE_SELECT_ERROR',
        'ALERT_TEXT.QR_INVALID_TODAY',
        'ALERT_TEXT.QR_USED',
        'ALERT_TEXT.APPOINTMENT_NOT_FOUND',
        'ALERT_TEXT.QR_EXPIRED',
        'ALERT_TEXT.INVALID_QR',
        'ALERT_TEXT.SELECT_VISITOR_COMPANY',
        'COMMON.OK','COMMON.CANCEL']).subscribe(t => {
          this.T_SVC = t;
      });
      var ackSeettings =  window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
      if(ackSeettings && JSON.parse(ackSeettings)){
        var result1 = JSON.parse(ackSeettings);
        if(result1){
          var result = JSON.parse(result1.SettingDetail);
          this.OCR_Enabled = result.OCR_Enabled;
          this.MyKad_Enabled = result.MyKad_Enabled;
          this.hostSettings = result.addVisitor;
        }
      }else{
        this.hostSettings = {
          "NameEnabled":true,
          "IdProofEnabled":true,
          "EmailEnabled":true,
          "CategoryEnabled":true,
          "CompanyEnabled":true,
          "ContactNumberEnabled":true,
          "VehicleNumberEnabled":true,
          "GenderEnabled":true
        }
      }

      let EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
      this.visitorProfile = new FormGroup({
        username: new FormControl('', (this.hostSettings && this.hostSettings.NameEnabled && this.hostSettings.NameRequired) ? ([Validators.required, Validators.minLength(4), Validators.maxLength(100)]): []),
        email: new FormControl('', (this.hostSettings && this.hostSettings.EmailEnabled && this.hostSettings.EmailRequired) ? ([Validators.required, Validators.pattern(EMAILPATTERN)]) : []),
        icPassport: new FormControl('', (this.hostSettings && this.hostSettings.IdProofEnabled && this.hostSettings.IdProofRequired) ? ([Validators.required]) : []),
        contact: new FormControl('', (this.hostSettings && this.hostSettings.ContactNumberEnabled && this.hostSettings.ContactNumberRequired) ? ([Validators.required]) : []),
        vechile: new FormControl('', (this.hostSettings && this.hostSettings.VehicleNumberEnabled && this.hostSettings.VehicleNumberRequired) ? ([Validators.required]) : []),
        gender: new FormControl('', (this.hostSettings && this.hostSettings.GenderEnabled && this.hostSettings.GenderRequired) ? ([Validators.required]) : []),
        vistorCategory:new FormControl('', (this.hostSettings && this.hostSettings.CategoryEnabled && this.hostSettings.CategoryRequired) ? ([Validators.required]) : []),
        vistorCompany:new FormControl('', [])
        //country: new FormControl('', [Validators.pattern('[a-zA-Z0-9 ]*')]),
        //city: new FormControl('', [Validators.pattern('[a-zA-Z0-9 ]*')]),
      });
      this.translate.get(['ADD_VISITORS.SUCCESS.ADD_VISITOR_COMPANY_SUCCESS', 'USER_PROFILE.ERROR.SERVER_ERROR']).subscribe(t => {
        this.translation = t;
      });

      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          const passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + passData);
          this.visitor = passData.visitor;
          this.position =  passData.position;
          this.preAppointment  = passData.PreAppointment;
          // var vList = passData.visitors;
          // if(vList){
          //   this.visitorList = vList;
          // }

          if(this.preAppointment){
            var preAppointment = JSON.parse(this.preAppointment);

            this.visitorInfoModal.visitor_ic = preAppointment.VISITOR_IC;
            this.visitorInfoModal.visitor_id = preAppointment.VISITOR_IC;
            if(preAppointment.VISITOR_IC){
              this.disableIc = true;
            }
            this.visitorInfoModal.visitor_ctg_name = preAppointment.VisitorCategory;
            this.visitorInfoModal.visitor_ctg_id = preAppointment.VisitorCategory;
            this.visitorInfoModal.visitor_comp_id = preAppointment.visitor_comp_code;
            this.visitorInfoModal.visitor_comp_name = preAppointment.VISITOR_COMPANY;
            this.visitorInfoModal.visitor_name = preAppointment.VISITOR_NAME;
            this.visitorInfoModal.visitor_gender = preAppointment.VISITOR_GENDER;
            this.visitorInfoModal.vehicle_no = preAppointment.PLATE_NUM;
            this.visitorInfoModal.visitor_mobile_no = preAppointment.TELEPHONE_NO;
            this.visitorInfoModal.visitor_email = preAppointment.EMAIL;
            this.visitorInfoModal.visitor_id = preAppointment.VISITOR_IC;
            this.visitorSEQID = preAppointment.SEQ_ID;
            this.visitorInfoModal.visitor_seq_id = preAppointment.SEQ_ID;
            this.visitorInfoModal.visitorHexCode  = preAppointment.Hexcode;
            if(preAppointment.SEQ_ID){
              this.imageType = "&RefType=VPB&Refresh="+ new Date().getTime();
            }
            this.data.profile = preAppointment.VISITOR_IMG ? preAppointment.VISITOR_IMG : "";
            if(preAppointment.VISITOR_IMG){
              this.base64Image = 'data:image/jpeg;base64,' + this.data.profile;
            }
            if(preAppointment.MyKad){
              this.visitorInfoModal.MyKad = preAppointment.MyKad;
            }else{
              this.visitorInfoModal.MyKad = false;
            }

          }

          if(this.visitor){
            this.visitorInfoModal.visitor_id = this.visitor.visitor_id;
            if(this.visitor.visitor_id && !this.visitor.VISITOR_IC){
              this.visitor.visitor_ic = this.visitor.visitor_id;
            }
            if(!this.visitor.visitor_id && this.visitor.visitor_ic){
              this.visitor.visitor_id = this.visitor.VISITOR_IC;
            }
            this.visitorInfoModal.visitor_ic = this.visitor.VISITOR_IC;
            if(this.visitor.VISITOR_IC){
              this.disableIc = true;
            }
            this.visitorInfoModal.visitor_ctg_name = this.visitor.VisitorCategory;
            this.visitorInfoModal.visitor_ctg_id = this.visitor.VisitorCategory_ID;
            this.visitorInfoModal.visitor_comp_id = this.visitor.VISITOR_COMPANY_ID;
            this.visitorInfoModal.visitor_comp_name = this.visitor.VISITOR_COMPANY;
            this.visitorInfoModal.visitor_name = this.visitor.VISITOR_NAME;
            this.visitorInfoModal.visitor_gender = this.visitor.VISITOR_GENDER;
            this.visitorInfoModal.vehicle_no = this.visitor.PLATE_NUM;
            this.visitorInfoModal.visitor_mobile_no = this.visitor.TELEPHONE_NO;
            this.visitorInfoModal.visitor_email = this.visitor.EMAIL;
            this.visitorInfoModal.visitor_id = this.visitor.VISITOR_IC;
            this.visitorSEQID = this.visitor.SEQ_ID;
            this.visitorInfoModal.visitor_seq_id = this.visitor.SEQ_ID;

            if(this.visitor.SEQ_ID){
              this.imageType = "&RefType=VPB&Refresh="+ new Date().getTime();
            }
            this.data.profile = this.visitor.VISITOR_IMG ? this.visitor.VISITOR_IMG : "";
            if(this.visitor.VISITOR_IMG){
              this.base64Image = 'data:image/jpeg;base64,' + this.data.profile;
            }
          }
          this.fromListPage = passData.fromListPage;
          var visitor_company = passData.data;
          if(visitor_company){
            this.VM.visitors = visitor_company;
            this.VM.aData = passData.aData;
          }

          this._prepareForNewVisitor();
        }
      });


      events.observeDataCompany().subscribe((data1:any) => {
        //"MyKadPhoto", (data:string) => {
          if (data1.action === 'MyKadPhoto') {
            this.data.profile = data1.title;
            if(data1.title){
              this._zone.run(() => {
              // this.base64Image = this.getImgContent();
              this.base64Image = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64, '+ data1.title);
              });
            }
          } else if (data1.action === 'user:created') {
            console.log('Welcome', data1.title, 'at', data1.message);
            // this.params.hostImage = "assets/images/logo/2.png";
            // alert(this.params.hostImage);
            if( data1.title == "visitorCompany"){
              var cData= JSON.parse(data1.message);
              this.visitorInfoModal.visitor_comp_name = cData.visitor_comp_name;
              this.visitorInfoModal.visitor_comp_id = cData.visitor_comp_code;
            }
          }
      });
  }

  getImgContent(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64,'+this.data.profile);
  }

  scanQrCode(){

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
      var data = "ED6F9206" //"C4B9F365";
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
                    //  if(vOb1.Table2 && vOb1.Table2.length > 0 && vOb1.Table2[0].CheckinStatus == 10){
                    //    message = this.T_SVC['ALERT_TEXT.QR_USED'];
                    //    vOb = null;
                    //  }
                   }
            //        if(!vOb){
            //          let alert = this.alertCtrl.create({
            //            header: 'Error !',
            //            message: message,
            //            cssClass:'alert-danger',
            //            buttons: ['Okay']
            //            });
            //            alert.present();
            //          return;
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

              this.preAppointment  = JSON.stringify(vOb);
              if(this.preAppointment){
                var preAppointment = JSON.parse(this.preAppointment);
                this.visitorInfoModal.visitor_ic = preAppointment.VISITOR_IC;
                this.visitorInfoModal.visitor_id = preAppointment.VISITOR_IC;
                if(preAppointment.VISITOR_IC){
                  this.disableIc = true;
                }
                this.visitorInfoModal.visitor_ctg_name = preAppointment.VisitorCategory;
                this.visitorInfoModal.visitor_ctg_id = preAppointment.VisitorCategory;
                this.visitorInfoModal.visitor_comp_id = preAppointment.visitor_comp_code;
                this.visitorInfoModal.visitor_comp_name = preAppointment.VISITOR_COMPANY;
                this.visitorInfoModal.visitor_name = preAppointment.VISITOR_NAME;
                this.visitorInfoModal.visitor_gender = preAppointment.VISITOR_GENDER;
                this.visitorInfoModal.vehicle_no = preAppointment.PLATE_NUM;
                this.visitorInfoModal.visitor_mobile_no = preAppointment.TELEPHONE_NO;
                this.visitorInfoModal.visitor_email = preAppointment.EMAIL;
                this.visitorInfoModal.visitor_id = preAppointment.VISITOR_IC;
                this.visitorInfoModal.visitor_seq_id = preAppointment.SEQ_ID;
                this.visitorSEQID = preAppointment.SEQ_ID;
                this.visitorInfoModal.visitorHexCode = preAppointment.Hexcode;
                if(preAppointment.SEQ_ID){
                  this.imageType = "&RefType=VPB&Refresh="+ new Date().getTime();
                }
                this.data.profile = preAppointment.VISITOR_IMG ? preAppointment.VISITOR_IMG : "";

                if(preAppointment.VISITOR_IMG){
                  this.base64Image = 'data:image/jpeg;base64,' + this.data.profile;
                }

              }
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

          if(err && JSON.parse(err) && JSON.parse(err).message){
            message =JSON.parse(err).message;
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              cssClass: 'alert-danger',
              message: message,
              buttons: ['Okay']
            });
              alert.present();
              return;
          }
          let invalidORGConfirm = await this.alertCtrl.create({
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
                    this.preAppointment  = JSON.stringify(vOb);
                    if(this.preAppointment){
                      var preAppointment = JSON.parse(this.preAppointment);
                      this.visitorInfoModal.visitor_ic = preAppointment.VISITOR_IC;
                      this.visitorInfoModal.visitor_id = preAppointment.VISITOR_IC;
                      if(preAppointment.VISITOR_IC){
                        this.disableIc = true;
                      }
                      this.visitorInfoModal.visitor_ctg_name = preAppointment.VisitorCategory;
                      this.visitorInfoModal.visitor_ctg_id = preAppointment.VisitorCategory;
                      this.visitorInfoModal.visitor_comp_id = preAppointment.visitor_comp_code;
                      this.visitorInfoModal.visitor_comp_name = preAppointment.VISITOR_COMPANY;
                      this.visitorInfoModal.visitor_name = preAppointment.VISITOR_NAME;
                      this.visitorInfoModal.visitor_gender = preAppointment.VISITOR_GENDER;
                      this.visitorInfoModal.vehicle_no = preAppointment.PLATE_NUM;
                      this.visitorInfoModal.visitor_mobile_no = preAppointment.TELEPHONE_NO;
                      this.visitorInfoModal.visitor_email = preAppointment.EMAIL;
                      this.visitorInfoModal.visitor_id = preAppointment.VISITOR_IC;
                      this.visitorInfoModal.visitor_seq_id = preAppointment.SEQ_ID;
                      this.visitorSEQID = preAppointment.SEQ_ID;
                      this.visitorInfoModal.visitorHexCode = preAppointment.Hexcode;
                      if(preAppointment.SEQ_ID){
                        this.imageType = "&RefType=VPB&Refresh="+ new Date().getTime();
                      }
                      this.data.profile = preAppointment.VISITOR_IMG ? preAppointment.VISITOR_IMG : "";
                      if(preAppointment.VISITOR_IMG){
                        this.base64Image = 'data:image/jpeg;base64,' + this.data.profile;
                      }
                    }
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
                let invalidORGConfirm = await this.alertCtrl.create({
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

  scanOcr(){

  }

  public async presentActionSheet() {
    if(this.hostSettings && this.hostSettings.ImageUploadEnabled){
      var option = [{
        text: 'Gallery',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ];
    if(this.base64Image || this.data.profile) {
      option = [{
        text: 'Gallery',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Remove Photo',
        handler: () => {
          this.visitor_RemoveImg = true;
          this.base64Image = '';
          this.data.profile = '';
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ];
    }
      let actionSheet = await this.actionSheetCtrl.create({
        header: 'Select Image Source',
        cssClass: 'alert-warning',
        buttons: option
      });
      actionSheet.present();
    }
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
      this.data.profile = imageData;
      this.visitor_RemoveImg = false;
    }, (err) => {
      this.presentToast(this.T_SVC['ALERT_TEXT.IMAGE_SELECT_ERROR']);
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

UpdateVisitor(){

  if(!this.visitor.SEQ_ID){
    this.visitor.SEQ_ID = "";
  }
  if(!this.visitor.visitor_oldicno){
    this.visitor.visitor_oldicno = "";
  }
  if(!this.visitor.visitor_tel_no){
    this.visitor.visitor_tel_no = "";
  }

  if(this.visitor_RemoveImg){
    this.data.profile = "";
  }

  var ImageChanged = (this.visitor.ImageChanged ? this.visitor.ImageChanged : 0);
  if(ImageChanged || this.visitor_RemoveImg || this.data.profile){
    ImageChanged = 1;
  }
  var visitorObj = {
    VISITOR_IC :this.visitorInfoModal.visitor_ic,
    VISITOR_NAME:this.visitorInfoModal.visitor_name,
    VISITOR_COMPANY:this.visitorInfoModal.visitor_comp_name,
    VISITOR_COMPANY_ID:this.visitorInfoModal.visitor_comp_id,
    EMAIL:this.visitorInfoModal.visitor_email,
    TELEPHONE_NO:this.visitorInfoModal.visitor_mobile_no,
    VISITOR_GENDER:this.visitorInfoModal.visitor_gender,
    VisitorDesignation: "",
    VisitorCategory:this.visitorInfoModal.visitor_ctg_name,
    VisitorCategory_ID:this.visitorInfoModal.visitor_ctg_id,
    VISITOR_IMG:this.data.profile,
    PLATE_NUM:this.visitorInfoModal.vehicle_no,
    checked : true,
    visitor_RemoveImg : this.visitor_RemoveImg,
    SEQ_ID: this.visitorInfoModal.visitor_seq_id ? this.visitorInfoModal.visitor_seq_id : (this.visitor.SEQ_ID ? this.visitor.SEQ_ID : ""),
    ImageChanged : ImageChanged
  }

  this.navCtrl.pop();
  this.events.publishDataCompany({
    action: 'updateVisitor',
    title: true,
    message: visitorObj,
    message1: this.position
  });
}

// Always get the accurate path to your apps folder
public pathForImage(img) {
  if (img === null) {
    return '';
  } else {
    return cordova.file.dataDirectory + img;
  }
}

ionViewDidEnter() {
  }
  _prepareForNewVisitor(){
    this._getVisitorCategory();
  }

  onChangeCategory(category){
    this.visitorInfoModal.visitor_ctg_id = category.visitor_ctg_id;
    this.visitorInfoModal.visitor_ctg_name = category.visitor_ctg_desc;
  }
  _getVisitorCategory(){

    var masterDetails = this.getCategory(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
    if(masterDetails){
      this.VISITOR_CATEGORY = JSON.parse(masterDetails).Table4;

      if(this.visitor){
        for(var i1 = 0 ; i1 < this.VISITOR_CATEGORY.length ; i1++){
          if(this.VISITOR_CATEGORY[i1].visitor_ctg_desc == this.visitor.VisitorCategory){
            this.visitorInfoModal.visitor_ctg_id = this.VISITOR_CATEGORY[i1].visitor_ctg_id;
            this.visitorInfoModal.visitor_ctg_name = this.VISITOR_CATEGORY[i1].visitor_ctg_desc;
            break;
          }
        }
      }
    }else{
      this.apiProvider.GetSecurityMasterDetails().then(
        (val) => {
          var result = JSON.parse(JSON.stringify(val));
          if(result){
            //this.storage.set(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(val));
            this.VISITOR_CATEGORY = result.Table4;
          }
        },
        (err) => {
        }
      );
    }
  }

  public getCategory(settingName){
    return window.localStorage.getItem(settingName);
  }

  async addVisitors(){

    if(this.hostSettings && this.hostSettings.CompanyEnabled && this.hostSettings.CompanyRequired && !this.visitorInfoModal["visitor_comp_id"]){
      let toast = await this.toastCtrl.create({
        message: this.T_SVC['ALERT_TEXT.SELECT_VISITOR_COMPANY'],
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }

    if(!this.visitorInfoModal.visitor_id && this.visitorInfoModal.visitor_ic){
      this.visitorInfoModal.visitor_id = this.visitorInfoModal.visitor_ic;
    }else if(this.visitorInfoModal.visitor_id && !this.visitorInfoModal.visitor_ic){
      this.visitorInfoModal.visitor_ic = this.visitorInfoModal.visitor_id;
    }

    if(this.visitor){
      this.UpdateVisitor();
      return;
    }

    if(!this.visitorInfoModal.visitor_id){
      this.visitorInfoModal.visitor_id = ""+new Date().getTime();
    }

    var visitorObj = {
        VISITOR_IC :this.visitorInfoModal.visitor_ic,
        VISITOR_NAME:this.visitorInfoModal.visitor_name,
        VISITOR_COMPANY:this.visitorInfoModal.visitor_comp_name,
        VISITOR_COMPANY_ID:this.visitorInfoModal.visitor_comp_id,
        EMAIL:this.visitorInfoModal.visitor_email,
        TELEPHONE_NO:this.visitorInfoModal.visitor_mobile_no,
        VISITOR_GENDER:this.visitorInfoModal.visitor_gender,
        VisitorDesignation: "",
        VisitorCategory:this.visitorInfoModal.visitor_ctg_name,
        VisitorCategory_ID:this.visitorInfoModal.visitor_ctg_id,
        VISITOR_IMG:this.data.profile,
        PLATE_NUM:this.visitorInfoModal.vehicle_no,
        checked : true,
        SEQ_ID: this.visitorInfoModal.visitor_seq_id,
        Hexcode : this.visitorInfoModal.visitorHexCode,
        MyKad : this.visitorInfoModal.MyKad
      }
      this.visitorList[this.visitorList.length] = visitorObj;
      this.navCtrl.pop();
      if(this.fromListPage){
        this.events.publishDataCompany({
          action: 'updateVisitor',
          title: false,
          message: visitorObj,
          message1: this.position
        });
      }else{
        const navigationExtras: NavigationExtras = {
          state: {
            passData: {
              visitors: this.visitorList,
              preAppointment : this.preAppointment
            }
          }
        };
        this.router.navigate(['security-visitor-list-page'], navigationExtras);
      }
  }

  clearData(){
    this.visitorInfoModal.vehicle_no = "";
    this.visitorInfoModal.visitor_comp_id = "";
    this.visitorInfoModal.visitor_comp_name = "";
    this.visitorInfoModal.visitor_ctg_id = "";
    this.visitorInfoModal.visitor_ctg_name = "";
    this.visitorInfoModal.visitor_email = "";
    this.visitorInfoModal.visitor_gender = "";
    this.visitorInfoModal.visitor_ic = "";
    this.visitorInfoModal.visitor_id = "";
    this.visitorInfoModal.visitor_mobile_no = "";
    this.visitorInfoModal.visitor_name = "";

  }

  isClassActive() {
      return this.active;
  }

  openVisitorCompany(){
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          data: this.visitorInfoModal
        }
      }
    };
    this.router.navigate(['visitor-company-page'], navigationExtras);
  }

  ionViewWillEnter(){

  }

  getCompanyList(company){

      var params = {"SearchString":company,
      "OffSet":"0",
      "Rows":"200"};
      // this.VM.host_search_id = "adam";
      this.apiProvider.GetVisitorCompany(params).then(
        (val) => {
          var allowAdd = true;
            var companyList = JSON.parse(val.toString());
            for(var i = 0 ; i < companyList.length ; i++){
              if(company == companyList[i].visitor_comp_name){
                this.visitorInfoModal.visitor_comp_name = companyList[i].visitor_comp_name;
                this.visitorInfoModal.visitor_comp_id = companyList[i].visitor_comp_code;
                allowAdd = false;
                break;
              }
            }

            if(allowAdd){
              this.addVisitorsNewCompany(company);
            }
        },
        async (err) => {

            this.addVisitorsNewCompany(company);
            var companyList = [];

            var message = "";
            if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
              message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
            } else if(err && JSON.parse(err) && JSON.parse(err).message){
              message =JSON.parse(err).message;
            }
            if(message){
              // message = " Unknown"
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: message,
                cssClass: 'alert-danger',
                buttons: ['Okay']
              });
                alert.present();
            }
          }
      );
  }

  addVisitorsNewCompany(company){
    var params = {
      "visitor_comp_name": company,
      "visitor_comp_addr1": "",
      "visitor_comp_addr2": "",
      "visitor_comp_addr3": "",
      "visitor_comp_postcode": "",
      "visitor_comp_city": "",
      "visitor_comp_state": "",
      "visitor_comp_contact": "",
      "visitor_comp_country": "",
      "visitor_comp_fax_no": "",
      "visitor_comp_tel_no":"",
      "visitor_comp_email":"",
    }
    this.apiProvider.addVisitorCompany(params).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result && result.Table && result.Table1 && result.Table[0].Code == 10){
            let toast = await this.toastCtrl.create({
              message: this.translation['ADD_VISITORS.SUCCESS.ADD_VISITOR_COMPANY_SUCCESS'],
              duration: 3000,
              position: 'bottom'
            });
            toast.present();
            this.visitorInfoModal.visitor_comp_id = result.Table1[0].visitor_company_code;
            result.Table[0].visitor_comp_name = params.visitor_comp_name;
            this.visitorInfoModal.visitor_comp_name = result.Table[0].visitor_comp_name;

            return;
        }
        let toast = await this.toastCtrl.create({
          message: this.translation['USER_PROFILE.ERROR.SERVER_ERROR'],
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
          if(result && result["Table1"] != undefined){
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

  subscribeToIonScroll() {
    if (this.content && this.content['ionScroll']) {
        this.content['ionScroll'].subscribe((d) => {
            if (d && d.scrollTop < 80 ) {
                this.active = false;
                return;
            }
            this.active = true;
        });
    }
}

  ngOnInit() {
  }

}
