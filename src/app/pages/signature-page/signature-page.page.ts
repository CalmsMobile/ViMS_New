import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, ToastController, NavController, Platform, ModalController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-page',
  templateUrl: './signature-page.page.html',
  styleUrls: ['./signature-page.page.scss'],
})
export class SignaturePagePage implements OnInit,AfterViewInit {
  @ViewChild('sPad', {static: true}) signaturePadElement;
  signaturePad: any;
  // signature='';
  public signaturePadOptions : Object = {
    'minWidth': 2,
    'canvasWidth': 340,
    'canvasHeight': 200
  };
  public signatureImage : string;
  visitor : any = {};
  visitorImage = "";
  appSettings : any;
  T_SVC:any;
  constructor(public viewCtrl: ModalController,
    private apiProvider : RestProvider,
    private alertCtrl : AlertController,
    private events : EventsService,
    private toastCtrl: ToastController,
    public navCtrl: NavController,
    private router: Router,
    private navParams: NavParams,
    private route: ActivatedRoute,
    private translate : TranslateService,
    private platform : Platform) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'ALERT_TEXT.PLEASE_SIGN',
      'ALERT_TEXT.SETTINGS_NOT_FOUND',
      'ALERT_TEXT.VISITOR_CHECKIN_SUCCESS']).subscribe(t => {
        this.T_SVC = t;
    });
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        try{
          this.visitorImage =  passData.visitorImage;
          this.visitor = JSON.parse(passData.visitor);
        }catch(e){
           this.visitor =passData.visitor;
        }

        if(!this.visitor || !this.visitor.VisitorSeqId) {
          this.navCtrl.navigateRoot('sign-pad-idle-page');
          return;
        }
      }
    });

    try {
      try{
        this.visitorImage =  navParams.get('visitorImage');
        this.visitor = JSON.parse(navParams.get('visitor'));
      }catch(e){
         this.visitor = navParams.get('visitor');
      }

      if(!this.visitor || !this.visitor.VisitorSeqId) {
        this.navCtrl.navigateRoot('sign-pad-idle-page');
        return;
      }
    } catch (error) {

    }

    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_ACK_SETTINGS);
    if(settings && JSON.parse(settings)){
      this.appSettings = JSON.parse(settings);
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
    }


  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

   //Other Functions

  drawCancel() {
    this.dismiss();
  }

   async drawComplete() {
    this.signatureImage = this.signaturePad.toDataURL();
    if(!this.signatureImage){
      let alert = await this.alertCtrl.create({
        header: 'Error',
        message: this.T_SVC['ALERT_TEXT.PLEASE_SIGN'],
        cssClass: '',
        buttons: ['Ok']
      });
        alert.present();
      return;
    }
    if(!this.visitorImage){
      this.visitorImage = "";
    }
    try {
     const parseData = JSON.parse(this.visitor+'');
     this.visitor = parseData;
    } catch (error) {

    }
    if(!this.visitor || !this.visitor.VisitorSeqId){
      return;
    }
    var params  = {
      "VisitorId": this.visitor.VisitorSeqId,
      "VisitorImg": this.visitorImage,
      "SafetyBrief": this.appSettings.VideoOption,
      "VisitorSign": this.signatureImage.split(",")[1],
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
          this.dismiss();
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
          } else if(result.message){
            message = result.message;
          }
        }
        let alert = await this.alertCtrl.create({
          header: 'Error !',
          message: message,
          cssClass: '',
          buttons: ['Okay']
        });
          alert.present();
          this.dismiss();
      }
    );

  }

  drawClear() {
    this.signaturePad.clear();
  }

  canvasResize() {
    let canvas = document.querySelector('canvas');
    this.signaturePad.set('minWidth', 1);
    this.signaturePad.set('canvasWidth', canvas.offsetWidth);
    this.signaturePad.set('canvasHeight', canvas.offsetHeight);
  }

  ngAfterViewInit() {
    // this.signaturePad.clear();
    this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement);
    this.canvasResize();
  }

  ngOnInit() {
  }

}
