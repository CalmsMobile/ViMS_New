import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { NavController, AlertController, ToastController, IonItemSliding } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-security-visitor-list-page',
  templateUrl: './security-visitor-list-page.page.html',
  styleUrls: ['./security-visitor-list-page.page.scss'],
})
export class SecurityVisitorListPagePage implements OnInit {


  visitorList = [];
  REASON = "";
  Remarks = "";
  AVAIL_REASONS = [];
  SEQ_ID = "";
  imageURL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  hoursMinutes = new Date().toString().split(':');
  imageURLType = '&RefType=VP&Refresh='+ new Date().getTime();
  imageURLTypeVPB = '&RefType=VPB&Refresh='+ new Date().getTime();
  appointment:FormGroup;
  hostSettings : any = {};
  showAddDocOption = true;
  hostIc: any= "";
  host_name = "";
  HostList = [];
  addDocs : any = [];
  loading : any;
  T_SVC:any;

  constructor(public navCtrl: NavController,
    private apiProvider : RestProvider,
    private alertCtrl : AlertController,
    private toastCtrl : ToastController,
    private androidPermissions: AndroidPermissions,
    private camera: Camera,
    private route: ActivatedRoute,
    private router: Router,
    events : EventsService,
    private translate : TranslateService,
    public sanitizer: DomSanitizer) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'ALERT_TEXT.VISITOR_CHECKED_IN',
      'ALERT_TEXT.ALERT_TEXT.SELECT_PURPOSE',
      'ADD_APPOIN.NO_VISITROS',
      'ALERT_TEXT.WISH_TO_REMOVE_VISITOR',
      'ALERT_TEXT.SELECT_STAFF',
      'ALERT_TEXT.IMAGE_SELECT_ERROR']).subscribe(t => {
        this.T_SVC = t;
    });
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        this.visitorList = passData.visitors;
        var preAppointment = passData.preAppointment;
        if(preAppointment && JSON.parse(preAppointment)){
          var preAppointment1 = JSON.parse(preAppointment);
          this.hostIc = preAppointment1.Host_IC;
          this.host_name = preAppointment1.HostName;
          this.REASON = preAppointment1.REASON;
          this.SEQ_ID = preAppointment1.SEQ_ID;
        }
      }
    });

    events.observeDataCompany().subscribe((data1:any) => {
      if (data1.action === "updateVisitor") {
        const isUpdate = data1.title;
        const visitor = data1.message;
        const position = data1.message1;
          if(isUpdate){
            this.visitorList[position] = visitor;
          } else {
            this.visitorList[this.visitorList.length] = visitor;
          }
      }

    });

    this.appointment = new FormGroup({
      purpose: new FormControl('', (this.hostSettings && this.hostSettings.PurposeEnabled && this.hostSettings.PurposeRequired) ? ([Validators.required]) : []),
      host : new FormControl('',[Validators.required])
    });
    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    if(settings && JSON.parse(settings) && JSON.parse(settings).Table1){
      this.hostSettings = JSON.parse(settings).Table1[0];
    }else{
      this.hostSettings = {
        "PurposeEnabled": true,
        "PurposeRequired": true
      }
    }

    var ackSeettings =  window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
    if(ackSeettings && JSON.parse(ackSeettings)){
      var result = JSON.parse(ackSeettings);
      if(result){
        this.hostSettings = result;
        if(this.hostSettings.PurposeEnabled == undefined){
          this.hostSettings.PurposeEnabled = true;
          this.hostSettings.PurposeRequired = true;
        }
      }
    }else{
      this.hostSettings = {
        "PurposeEnabled": true,
        "PurposeRequired": true,
        "additionalDocEnabled" : true,
        "additionalDocLimit": 6
      }
    }
  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
   }

  addDocuments(){
    var currClass = this;
   this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
    result =>{
      console.log('Has permission?',result.hasPermission)
      if(result.hasPermission){
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
          result =>{
            currClass.apiProvider.presentLoading();
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
      var doc = {
        "doc": imageData
      }
      this.addDocs[this.addDocs.length] = doc;
      switch(this.addDocs.length){
        case 1:
          if(this.hostSettings.additionalDocLimit > 1){
            this.showAddDocOption = true;
          }
        break;
        case 2:
          if(this.hostSettings.additionalDocLimit > 2){
            this.showAddDocOption = true;
          }
        break;
        case 3:
          if(this.hostSettings.additionalDocLimit > 3){
            this.showAddDocOption = true;
          }
        break;
        case 4:
          if(this.hostSettings.additionalDocLimit > 4){
            this.showAddDocOption = true;
          }
        break;
        case 5:
          if(this.hostSettings.additionalDocLimit > 5){
            this.showAddDocOption = true;
          }
        break;
        case 6:
          if(this.hostSettings.additionalDocLimit > 6){
            this.showAddDocOption = false;
          }
        break;
        default:
          this.showAddDocOption = false;
        break;
      }
      this.loading.dismiss();

    }, (err) => {
      this.presentToast(this.T_SVC['ALERT_TEXT.IMAGE_SELECT_ERROR']);
      this.loading.dismiss();
    });
  }

  private async presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      color: 'primary',
      position: 'top'
    });
    (await toast).present();
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter SecurityVisitorListPage');

    var masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
    if(masterDetails){
      this.AVAIL_REASONS = JSON.parse(masterDetails).Table3;
    }
    this.getReasons();
    this.selectHost();
  }

  getReasons(){
    this.apiProvider.GetSecurityMasterDetails().then(
      (val) => {
        var result = JSON.parse(JSON.stringify(val));
        if(result){
          this.AVAIL_REASONS = result.Table3;
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
          // if(this.VM.appointment && this.VM.appointment[0]){
          //   this.addAppointmentModel.Room = this.VM.appointment[0].Room;
          //   this.addAppointmentModel.REASON = this.VM.appointment[0].REASON;
          //   this.addAppointmentModel.Floor = this.VM.appointment[0].Floor;
          // }
        }
      },
      (err) => {
      }
    );
  }

  goToAddManageVisitors(){
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          fromListPage: true
        }
      }
    };
    this.router.navigate(['security-check-in-page'], navigationExtras);
  }

  async removeVisitor(item){

    let alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: this.T_SVC['ALERT_TEXT.WISH_TO_REMOVE_VISITOR'],
      cssClass: '',
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
            let index = this.visitorList.indexOf(item);
            if (index > -1) {
              this.visitorList.splice(index, 1);
            }
          }
        }
      ]
    });
    alert.present();
  }

  editVisitors(slideDOM:IonItemSliding, type, visitor: any){
    slideDOM.close();
    if(type == 'edit'){
      var position = 0;
      for(var i=0;i < this.visitorList.length ; i++){
        var item = this.visitorList[i];
        if(item == visitor){
          position = i;
          break;
        }

      }
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            visitor:visitor,
            position : position
          }
        }
      };
      this.router.navigate(['security-check-in-page'], navigationExtras);

    }
  }

  selectHost(){
    this.apiProvider.GetAllHostData().then(
      (val) => {
        var result = JSON.parse(JSON.stringify(val));
        if(result){
          this.HostList = result;
        }
      },
      (err) => {
      }
    );
  }

  onChangeHost(HOSTIC){
    this.hostIc = HOSTIC;
    this.HostList.forEach(element => {
      if (element.HOSTIC === HOSTIC) {
        this.host_name = element.HOSTNAME;
        console.log("Selected Host : " + JSON.stringify(element));
      }
    });
  }

  async proceedNext(){

    if(!this.visitorList || this.visitorList.length == 0){
      let toast = await this.toastCtrl.create({
        message: this.T_SVC['ADD_APPOIN.NO_VISITROS'],
        duration: 3000,
        color: 'primary',
        cssClass: '',
        position: 'bottom'
      });
      toast.present();
      return;
    }

    if(!this.host_name || !this.hostIc){
      let toast = await this.toastCtrl.create({
        message: this.T_SVC['ALERT_TEXT.SELECT_STAFF'],
        duration: 3000,
        color: 'primary',
        cssClass: '',
        position: 'bottom'
      });
      toast.present();
      return;
    }

    if(!this.REASON){
      let toast = await this.toastCtrl.create({
        message: this.T_SVC['ALERT_TEXT.ALERT_TEXT.SELECT_PURPOSE'],
        duration: 3000,
        color: 'primary',
        cssClass: '',
        position: 'bottom'
      });
      toast.present();
      return;
    }

    var ackData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    var MAppDevSeqId = "";
    if(ackData && JSON.parse(ackData)){
      MAppDevSeqId = JSON.parse(ackData).MAppDevSeqId;
    }

    var params  = {
      "DEV_SEQID":MAppDevSeqId,
      "VISITOR_ARRAY": this.visitorList,
      "AdditionalDocs": this.addDocs,
      "HOST_NAME": this.host_name,
      "HOST_IC": this.hostIc,
      "Purpose": this.REASON,
      "Remarks": this.Remarks
    }

    this.apiProvider.VimsAppSecurityCheckIn(params).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result  && result[0].Code == 10){

          let toast = await this.toastCtrl.create({
            message: this.T_SVC['ALERT_TEXT.VISITOR_CHECKED_IN'],
            duration: 3000,
            color: 'primary',
            position: 'bottom'
          });
          toast.present();
          this.navCtrl.navigateRoot('security-dash-board-page');
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
          }
        }
        if(err.message){
          message = err.message;
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

  ngOnInit() {
  }

}
