import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {ModalController,AlertController,ToastController, PopoverController, NavController} from '@ionic/angular';
import { RestProvider } from 'src/app/providers/rest/rest';
import { QuestionDocPopupComponent } from 'src/app/components/question-doc-popup/question-doc-popup.component';
import { Camera } from '@ionic-native/camera/ngx';
import {AppSettings} from '../../services/app-settings';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonUtil } from 'src/app/services/util/CommonUtil';
import { ToolTipComponent } from 'src/app/components/tool-tip/tool-tip.component';
import { DocumentModalComponent } from 'src/app/components/document-modal/document-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { ItemChecklistModalComponent } from 'src/app/components/item-checklist-modal/item-checklist-modal.component';

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
  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage": "assets/images/profile_bg.jpg",
    "profile": ""
  };
  visitor_RemoveImg = true;
  appSettings: any = {};
  appointmentInfo: any = {};
  preAppointmentInfo: any = {};
  visitorImagePath = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  imageURLType = '&RefType=VPB&Refresh='+ new Date().getTime();
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
  imageType = '';
  constructor(public apiProvider: RestProvider,
    public modalCtrl: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private popoverController: PopoverController,
    private alertCtrl: AlertController,
    private commonUtil: CommonUtil,
    private navCtrl: NavController,
    private camera: Camera,
    private cdr: ChangeDetectorRef,
    private dateformat : DateFormatPipe,
    public toastCtrl: ToastController,
    private translate : TranslateService,
    public sanitizer: DomSanitizer) {
      setTimeout(() => this.setChanged(), 0);

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
      this.checkAllInputs();
  }

  setChanged() {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  viewImage(base64) {
    this.apiProvider.viewImage(base64);
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
          this.checkAllInputs();
        } else {
          this.appointmentInfo.START_TIME = this.dateformat.transform(new Date() + '', "yyyy-MM-ddTHH:mm:ss")
        }
      }
    });
  }

  onSelectChange(event, action) {
    this.checkAllInputs();
    if (action === 'Purpose') {
      const PurposeCode = event?event.detail.value: '';
      console.log(""+ PurposeCode);
      this.appointmentInfo.REASON = PurposeCode;
    }

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
  this.apiProvider.requestApi(params, api, true, 'WEB', '').then(
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
        let msg = 'Visitor yet to submit the questionaries';
        if (action === 'doc') {
          msg = 'Visitor yet to submit the documents';
        } else if (action === 'declaration'){
          msg = 'Visitor yet to submit the  declaration';
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

  public capture(action){
    this.imageType = action;
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
      allowEdit: false,
      targetWidth: 400,
      targetHeight: 400
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imageData) => {

      if (this.imageType === 'PROFILE_IMAGE') {
        this.visitor_RemoveImg = false;
        this.appointmentInfo.visitorImage = imageData;
      } else {
        this.appointmentInfo.visitorIDImage = imageData;
      }

    }, (err) => {
    });
  }

  async documentModal(){
    const modal = await this.modalCtrl.create({
      component: DocumentModalComponent,
      componentProps: {
        data: this.appointmentInfo.additionalDocList
      },
    });

    await modal.present();
    modal.onDidDismiss().then((response)=> {
      if (response && response.data) {
        console.log("data:" + JSON.stringify(response.data));
        this.appointmentInfo.additionalDocList = response.data ? response.data: [];
      }
    })
  }

  onChangeID($event) {
    const value = $event.target.value;
    if (value.length > 2) {
      this.checkAllInputs();
      let api = '/api/Vims/SearchExistVisitor';
      var params = {
        "SearchString": value,
        "OffSet": "0",
        "Rows": "1"
      };
      // this.VM.host_search_id = "adam";
      this.apiProvider.requestApi(params, api, false, 'WEB', '').then(
        async (val) => {
          var result = JSON.parse(val.toString());
          if (result.Table && result.Table.length > 0 && result.Table2 && result.Table2.length > 0) {
            console.log(JSON.stringify(result.Table2[0]));
            const visitorData = result.Table2[0];
            this.appointmentInfo.VISITOR_IC = value;
            this.appointmentInfo.VisitorCategory = visitorData.VisitorCategory;
            this.appointmentInfo.VisitorCategory_ID = visitorData.VisitorCategory;
            this.appointmentInfo.TELEPHONE_NO = visitorData.TELEPHONE_NO;
            this.appointmentInfo.EMAIL = visitorData.EMAIL;
            this.appointmentInfo.VISITOR_NAME = visitorData.VISITOR_NAME;
            this.appointmentInfo.VISITOR_COMPANY = visitorData.VISITOR_COMPANY;
            this.appointmentInfo.visitor_comp_code = this.commonUtil.getCompany(visitorData.VISITOR_COMPANY_ID, true);
            this.appointmentInfo.VISITOR_COMPANY_ID = this.appointmentInfo.visitor_comp_code;
            this.appointmentInfo.VISITOR_GENDER = this.commonUtil.getGender(visitorData.VISITOR_GENDER, true);
            this.appointmentInfo.VISITOR_ADDRESS = visitorData.visitor_address_1;
            this.appointmentInfo.VISITOR_COUNTRY = visitorData.visitor_country;
            this.appointmentInfo.PLATE_NUM = visitorData.PLATE_NUM;
          }
          },
        async (err) => {
        }
      );
    }
  }

  onInputChange($event, field) {
    this.checkAllInputs();
  }

  checkAllInputs() {
    this.appSettings.addVisitor.showVisitorNameError = this.appSettings.addVisitor.NameEnabled && this.appSettings.addVisitor.NameRequired && !this.appointmentInfo.VISITOR_NAME;
    this.appSettings.addVisitor.showVisitorICError = this.appSettings.addVisitor.IdProofEnabled && this.appSettings.addVisitor.IdProofRequired && !this.appointmentInfo.VISITOR_IC;
    this.appSettings.addVisitor.showEmailError = this.appSettings.addVisitor.EmailEnabled && this.appSettings.addVisitor.EmailRequired && !this.appointmentInfo.EMAIL;
    this.appSettings.addVisitor.showPhoneNumberError = this.appSettings.addVisitor.ContactNumberEnabled && this.appSettings.addVisitor.ContactNumberRequired && !this.appointmentInfo.TELEPHONE_NO;
    this.appSettings.addVisitor.showAddressError = this.appSettings.addVisitor.AddressEnabled && this.appSettings.addVisitor.AddressRequired && !this.appointmentInfo.VISITOR_ADDRESS;
    this.appSettings.addVisitor.showVehicleNumberError = this.appSettings.addVisitor.VehicleNumberEnabled && this.appSettings.addVisitor.VehicleNumberRequired && !this.appointmentInfo.PLATE_NUM;

    this.appSettings.addVisitor.showCategoryError = this.appSettings.addVisitor.CategoryEnabled && this.appSettings.addVisitor.CategoryRequired && !this.appointmentInfo.VisitorCategory;
    this.appSettings.addVisitor.showGenderError = this.appSettings.addVisitor.GenderEnabled && this.appSettings.addVisitor.GenderRequired && (this.appointmentInfo.VISITOR_GENDER === undefined || this.appointmentInfo.VISITOR_GENDER === null || this.appointmentInfo.VISITOR_GENDER === '');
    this.appSettings.addVisitor.showCountryError = this.appSettings.addVisitor.CountryEnabled && this.appSettings.addVisitor.CountryRequired && !this.appointmentInfo.VISITOR_COUNTRY;
    this.appSettings.addVisitor.showCompanyError = this.appSettings.addVisitor.CompanyEnabled && this.appSettings.addVisitor.CompanyRequired && !this.appointmentInfo.visitor_comp_code;

    this.appSettings.addVisitor.showTemperatureError = this.appSettings.addVisitor.TemperatureEnabled && this.appSettings.addVisitor.TemperatureRequired && !this.appointmentInfo.att_bodytemperature;

    this.appSettings.addVisitor.showHostError = this.appSettings.General.ShowHost && this.appSettings.General.MandatoryHost && !this.appointmentInfo.Host_IC;
    this.appSettings.addVisitor.showPurposeError = this.appSettings.General.ShowPurpose && this.appSettings.General.MandatoryPurpose && !this.appointmentInfo.REASON;
    this.appSettings.addVisitor.showFloorError = this.appSettings.General.ShowFloor && this.appSettings.General.MandatoryFloor && !this.appointmentInfo.Floor;
    this.appSettings.addVisitor.showRoomError = this.appSettings.General.ShowRoom && this.appSettings.General.MandatoryRoom && !this.appointmentInfo.MEETING_LOCATION;
    this.appSettings.addVisitor.showRemarksError = this.appSettings.General.ShowRemarks && this.appSettings.General.MandatoryRemarks && !this.appointmentInfo.Remarks;

  }

  processCheckIn() {

    this.checkAllInputs();
    if (this.appSettings.addVisitor.showVisitorNameError || this.appSettings.addVisitor.showVisitorICError ||
      this.appSettings.addVisitor.showEmailError || this.appSettings.addVisitor.showPhoneNumberError ||
      this.appSettings.addVisitor.showAddressError || this.appSettings.addVisitor.showVehicleNumberError ||
      this.appSettings.addVisitor.showCategoryError || this.appSettings.addVisitor.showGenderError ||
      this.appSettings.addVisitor.showCountryError || this.appSettings.addVisitor.showCompanyError ||
      this.appSettings.addVisitor.showHostError || this.appSettings.addVisitor.showPurposeError ||
      this.appSettings.addVisitor.showFloorError || this.appSettings.addVisitor.showTemperatureError ||
      this.appSettings.addVisitor.showRoomError || this.appSettings.addVisitor.showRemarksError) {
        this.apiProvider.showToast(" Please fill mandatory fields ");
      return;
    }

    if(this.appSettings.addVisitor.IdImgUploadEnabled && this.appSettings.addVisitor.IdImgUploadRequired && !this.appointmentInfo.visitorIDImage) {
      this.apiProvider.showAlert(" * required ID image ");
      return;
    }

    if(this.appSettings.addVisitor.ImageUploadEnabled && this.appSettings.addVisitor.ImageUploadRequired && !this.appointmentInfo.visitorImage) {
      this.apiProvider.showAlert(" * required profile image ");
      return;
    }

    if(this.appSettings.addVisitor.VerificationDocEnabled && this.appSettings.addVisitor.VerificationDocRequired && !this.appointmentInfo.additionalDocList) {
      this.apiProvider.showAlert(" * required additional document ");
      return;
    }

    var ackData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    var MAppDevSeqId = "";
    if(ackData && JSON.parse(ackData)){
      MAppDevSeqId = JSON.parse(ackData).MAppDevSeqId;
    }

    if(!this.preAppointmentInfo.Hexcode) {
      this.preAppointmentInfo.Hexcode = this.preAppointmentInfo.HexCode;
    }
    if(!this.appointmentInfo.Hexcode) {
      this.appointmentInfo.Hexcode = this.appointmentInfo.HexCode;
    }

    const visitor = [{
      VISITOR_NAME: this.appointmentInfo.VISITOR_NAME? this.appointmentInfo.VISITOR_NAME: '',
      VISITOR_IC : this.appointmentInfo.VISITOR_IC? this.appointmentInfo.VISITOR_IC: '',
      EMAIL: this.appointmentInfo.EMAIL? this.appointmentInfo.EMAIL: '',
      TELEPHONE_NO:this.appointmentInfo.TELEPHONE_NO? this.appointmentInfo.TELEPHONE_NO: '',
      VISITOR_COMPANY:this.appointmentInfo.visitor_comp_code? this.appointmentInfo.visitor_comp_code: '',
      VISITOR_COMPANY_ID:this.appointmentInfo.visitor_comp_code? this.appointmentInfo.visitor_comp_code: '',
      VISITOR_ADDRESS:this.appointmentInfo.VISITOR_ADDRESS? this.appointmentInfo.VISITOR_ADDRESS: '',
      VisitorCategory:this.appointmentInfo.VisitorCategory? this.appointmentInfo.VisitorCategory: '',
      VisitorCategory_ID: this.appointmentInfo.VisitorCategory? this.appointmentInfo.VisitorCategory: '',
      VISITOR_GENDER: (this.appointmentInfo.VISITOR_GENDER != null && this.appointmentInfo.VISITOR_GENDER != '')? this.appointmentInfo.VISITOR_GENDER: 0,
      VISITOR_COUNTRY: this.appointmentInfo.VISITOR_COUNTRY? this.appointmentInfo.VISITOR_COUNTRY: '',
      VisitorDesignation: "",
      VISITOR_TEMPERATURE: this.appointmentInfo.att_bodytemperature? this.appointmentInfo.att_bodytemperature: '',
      VISITOR_IMG: this.appointmentInfo.visitorImage?this.appointmentInfo.visitorImage: '',
      VISITOR_ID_IMG:this.appointmentInfo.visitorIDImage? this.appointmentInfo.visitorIDImage: '',
      PLATE_NUM: this.appointmentInfo.PLATE_NUM?this.appointmentInfo.PLATE_NUM: '',
      SEQ_ID: this.preAppointmentInfo.SEQ_ID ? this.preAppointmentInfo.SEQ_ID: (this.appointmentInfo.SEQ_ID? this.appointmentInfo.SEQ_ID: ''),
      Hexcode :  this.preAppointmentInfo.Hexcode ? this.preAppointmentInfo.Hexcode:  (this.appointmentInfo.Hexcode? this.appointmentInfo.Hexcode: '')
    }];

    const additionDocs = [];
    if (this.appointmentInfo.additionalDocList) {
      this.appointmentInfo.additionalDocList.forEach(element => {
        additionDocs.push({
          'doc': element
        });
      });
    }

    var params  = {
      DEV_SEQID: MAppDevSeqId,
      VISITOR_ARRAY: visitor,
      START_DATE: this.appointmentInfo.START_TIME? this.dateformat.transform(new Date() + '', "yyyy-MM-ddTHH:mm:ss"): '',
      END_DATE: this.appointmentInfo.END_TIME? this.dateformat.transform(new Date() + '', "yyyy-MM-ddTHH:mm:ss"): '',
      Purpose: this.appointmentInfo.REASON? this.appointmentInfo.REASON: '',
      HOST_NAME: this.appointmentInfo.Host_IC? this.appointmentInfo.Host_IC: '',
      HOST_IC: this.appointmentInfo.Host_IC? this.appointmentInfo.Host_IC: '',
      FLOOR: this.appointmentInfo.Floor? this.appointmentInfo.Floor: '',
      MEETING_LOCATION: this.appointmentInfo.MEETING_LOCATION? this.appointmentInfo.MEETING_LOCATION: '',
      Remarks: this.appointmentInfo.Remarks? this.appointmentInfo.Remarks: '',
      AdditionalDocs: additionDocs,
      Declaration: this.appointmentInfo.declarationList ? JSON.stringify(this.appointmentInfo.declarationList): ''
    }

    this.apiProvider.VimsAppSecurityCheckIn(params).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result  && result[0].Code == 10){

          this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.VISITOR_CHECKED_IN']);
          this.navCtrl.navigateRoot('security-dash-board-page');
          return;
        }
        this.apiProvider.showAlert('Server Error');
      },
      async (err) => {

        if(err && err.message == "No Internet"){
          return;
        }
        var message = "Error in server";
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
        this.apiProvider.showAlert(message);

      }
    );
  }

  async checklistmodal(){
    const modal = await this.modalCtrl.create({
      component: ItemChecklistModalComponent
    });

    await modal.present();
  }
}
