import { Component, OnInit } from '@angular/core';
import {ModalController,AlertController,ToastController, PopoverController} from '@ionic/angular';
import { RestProvider } from 'src/app/providers/rest/rest';
import { QuestionDocPopupComponent } from 'src/app/components/question-doc-popup/question-doc-popup.component';
import { Camera } from '@ionic-native/camera/ngx';
import {AppSettings} from '../../services/app-settings';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonUtil } from 'src/app/services/util/CommonUtil';
import { ToolTipComponent } from 'src/app/components/tool-tip/tool-tip.component';
import { DocumentModalComponent } from 'src/app/components/document-modal/document-modal.component';

@Component({
  selector: 'app-security-manual-check-in',
  templateUrl: './security-manual-check-in.page.html',
  styleUrls: ['./security-manual-check-in.page.scss'],
})
export class SecurityManualCheckInPage implements OnInit {
  T_SVC:any;
  autoApproval: any = false;
  showOption = false;
  isPastAppointment = false;
  base64Image = "";
  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage": "assets/images/profile_bg.jpg",
    "profile": ""
  };
  visitor_RemoveImg = true;
  appSettings: any = {};
  appointmentInfo: any = {};
  preAppointmentInfo: any = {};
  PURPOSELIST = [];
  MEETINGLIST = [];
  HOSTLIST = [];
  FLOORLIST = [];
  COMPANYLIST = [];
  CATEGORYLIST = [];
  GENDERLIST = [{
    code: 0,
    name: 'Male'
  },{
    code: 1,
    name: 'FeMale'
  },{
    code: 2,
    name: 'Other'
  }];
  COUNTRYLIST = CommonUtil.countryList;
  QuestionnaireEnabled = false;
  MaterialDeclareEnabled = false;
  AttachmentUploadEnabled = false;
  constructor(public apiProvider: RestProvider,
    public modalCtrl: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private popoverController: PopoverController,
    private alertCtrl: AlertController,
    private commonUtil: CommonUtil,
    private camera: Camera,
    public toastCtrl: ToastController,) {
      var masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
      if(masterDetails){
        this.FLOORLIST = JSON.parse(masterDetails).Table2;
        this.PURPOSELIST = JSON.parse(masterDetails).Table3;
        this.CATEGORYLIST = JSON.parse(masterDetails).Table4;
        this.HOSTLIST = JSON.parse(masterDetails).Table6;
        this.COMPANYLIST = JSON.parse(masterDetails).Table7;
        this.MEETINGLIST = JSON.parse(masterDetails).Table8;
      }

      const ackSeettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
      if (ackSeettings) {
        this.appSettings = JSON.parse(ackSeettings);
      }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        if (passData && passData.PreAppointment) {
          this.preAppointmentInfo = passData.PreAppointment;
          this.appointmentInfo = passData.PreAppointment;
          if (this.appointmentInfo.SettingDetail) {
            this.QuestionnaireEnabled = JSON.parse(this.appointmentInfo.SettingDetail).QuestionnaireEnabled;
            this.MaterialDeclareEnabled = JSON.parse(this.appointmentInfo.SettingDetail).MaterialDeclareEnabled
            this.AttachmentUploadEnabled = JSON.parse(this.appointmentInfo.SettingDetail).AttachmentUploadEnabled
          }

          console.log('passData : ' + JSON.stringify(this.appointmentInfo));
          if (this.appointmentInfo.VISITOR_COMPANY) {
            this.appointmentInfo.visitor_comp_code = this.commonUtil.getCompany(this.appointmentInfo.VISITOR_COMPANY, true);
          } else if (this.appointmentInfo.visitor_comp_code) {
            this.appointmentInfo.visitor_comp_code = this.commonUtil.getCompany(this.appointmentInfo.visitor_comp_code, true);
          }
          this.appointmentInfo.REASON = this.commonUtil.getPurposeCode(this.appointmentInfo.REASON, true);
          this.appointmentInfo.VISITOR_GENDER = this.commonUtil.getGender(this.appointmentInfo.VISITOR_GENDER, true);
        }

      }
    });
  }

  onChangePurpose(event){
    const PurposeCode = event?event.detail.value: '';
    console.log(""+ PurposeCode);
    this.appointmentInfo.REASON = PurposeCode;
  }

  goBack() {
    this.router.navigateByUrl('security-dash-board-page');
    console.log('goBack ');
   }

   onChangeInput($event, type) {
    this.presentPopover($event, type);
   }

   async presentPopover(ev: any, type) {
    const popover = await this.popoverController.create({
      component: ToolTipComponent,
      componentProps: {
        data: {
          title : '',
          action: type
        }
      },
      cssClass: 'my-tooltip',
      event: ev,
      animated: true,
      backdropDismiss: true,
      mode: 'ios',
      translucent: true
    });
    await popover.present().then(() => {
      setTimeout(() => {
        popover.dismiss();
      }, 2000);
    });
  }
  async openCustomDialog(action) {
    let api = '/api/Vims/GetVisitorQuestionariesByAppointmentId';
    if (action === 'doc') {
      api = '/api/Vims/GetVisitorDocsBySeqId';
    } else if (action === 'declaration'){
      api = '/api/vims/GetVisitorItemChecklistBySeqId';
    }

    var params = {
      "SEQ_ID": this.preAppointmentInfo.SEQ_ID,
      "STAFF_IC": this.preAppointmentInfo.STAFF_IC
  };
  // this.VM.host_search_id = "adam";
  this.apiProvider.requestApi(params, api, true, 'WEB').then(
    async (val) => {
      var result = JSON.parse(val.toString());
      if (result.Table && result.Table.length > 0) {
        const presentModel = await this.modalCtrl.create({
          component: QuestionDocPopupComponent,
          componentProps: {
            data: {
              seqId: this.preAppointmentInfo.SEQ_ID,
              result: result.Table,
              type: action
            }
          },
          showBackdrop: true,
          mode: 'ios',
          cssClass: 'visitorPopupModal'
        });
        presentModel.onWillDismiss().then((data) => {
        });
        return await presentModel.present();

      } else {
        let msg = 'Questionaries not added.';
        if (action === 'doc') {
          msg = 'Verification document not added.';
        } else if (action === 'declaration'){
          msg = 'Declaration not added.';
        }
        this.apiProvider.showAlert(msg);
      }
      },
    async (err) => {

      if(err && err.message == "No Internet"){
        return;
      }
      var message = "";
      if (err.status) {
        message = 'Api Not Found';
      } else if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
        message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
      } else if(err && JSON.parse(err) && JSON.parse(err).message){
        message =JSON.parse(err).message;
      }
      if(message){
        // message = " Unknown"
        let alert = this.alertCtrl.create({
          header: 'Error !',
          message: message,
          cssClass:'alert-danger',
          buttons: ['Okay']
          });
          (await alert).present();
      }
    }
  );
  }


  private async presentToast(text) {
    let toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      color: 'primary',
      position: 'bottom'
    });
    toast.present();
  }

  public capture(){
    this.takePicture(this.camera.PictureSourceType.CAMERA);
  }

  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
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
    });
  }

  async documentModal(){
    const modal = await this.modalCtrl.create({
      component: DocumentModalComponent
    });

    await modal.present();
  }
}
