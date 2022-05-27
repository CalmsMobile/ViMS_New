import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {ModalController,AlertController,ToastController, PopoverController, NavController} from '@ionic/angular';
import { RestProvider } from 'src/app/providers/rest/rest';
import { QuestionDocPopupComponent } from 'src/app/components/question-doc-popup/question-doc-popup.component';
import { Camera } from '@ionic-native/camera/ngx';
import {AppSettings} from '../../services/app-settings';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonUtil } from 'src/app/services/util/CommonUtil';
import { ToolTipComponent } from 'src/app/components/tool-tip/tool-tip.component';
import { DocumentModalComponent } from 'src/app/components/document-modal/document-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { ItemChecklistModalComponent } from 'src/app/components/item-checklist-modal/item-checklist-modal.component';
import { EventsService } from 'src/app/services/EventsService';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
declare var cordova: any;
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
  disableEmail = false;
  disableTELEPHONE_NO = false;
  disableCategory = false;
  disableHost_IC = false;
  disableREASON = false;
  disableFloor = false;
  disableMEETING_LOCATION = false;
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
    name: 'FeMale'
  },{
    code: 1,
    name: 'Male'
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
    private callNumber: CallNumber,
    private dateformat : DateFormatPipe,
    public events: EventsService,
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
    this.initSettings();
  }

  setChanged() {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  viewImage(base64) {
    this.apiProvider.viewImage(base64);
  }

  scanTemperature() {
    const cClass = this;
    try {
      var success = function(result) {
        // alert(JSON.stringify(result, undefined, 2));
        const data = JSON.parse(result);
        if (data){
          switch (data.ACTION) {
            case "START_CONNECTION":

              break;
            case "TEMPERATURE":
              const temperature = data.TEMPERATURE;
              if (temperature){
                cClass.appointmentInfo.att_bodytemperature = temperature;
              }
              cClass.checkAllInputs();
              break;
            case "ERROR":
              const message = data.MESSAGE;
              cClass.apiProvider.showAlert(message);
              break;

            default:
              break;
          }
        }
      }
      var failure = function(result) {
        cClass.apiProvider.showAlert(result);
      }
      cordova.plugins.VCardTemp.scan({
        _sMessage: "scan"
      }, success, failure);
    } catch (error) {

    }
  }

  callToNumber() {
    if (!this.appointmentInfo.HostExt){
      return;
    }
    this.callNumber.callNumber(this.appointmentInfo.HostExt, true)
  .then(res => console.log('Launched dialer!', res))
  .catch(err => console.log('Error launching dialer', err));
  }

  intSDKTemperature() {
    const cClass = this;
    try{
      var success = function(result) {
        // alert(JSON.stringify(result, undefined, 2));
      }
      var failure = function(result) {
        cClass.apiProvider.showAlert(result);
      }
      cordova.plugins.VCardTemp.intSDK({
        _sMessage: "intSDK"
      }, success, failure);
    } catch(e){

    }
  }

  closeConnection() {
    try {
      const cClass = this;
      var success = function(result) {
        // alert(JSON.stringify(result, undefined, 2));
      }
      var failure = function(result) {
        cClass.apiProvider.showAlert(result);
      }
      cordova.plugins.VCardTemp.closeConnection({
        _sMessage: "closeConnection"
      }, success, failure);
    } catch (error) {

    }
  }

  ngOnInit() {
    this.initSettings();
    console.log("SecurityManualCheckInPage oninit");
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras && this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        if (passData && passData.PreAppointment) {
          this.preAppointmentInfo = passData.PreAppointment;
          if (this.preAppointmentInfo && this.preAppointmentInfo.EMAIL && this.preAppointmentInfo.EMAIL.length > 0){
            this.disableEmail = true;
          }
          if (this.preAppointmentInfo && this.preAppointmentInfo.TELEPHONE_NO){
            this.disableTELEPHONE_NO = true;
          }

          if (this.preAppointmentInfo && this.preAppointmentInfo.VisitorCategory){
            this.disableCategory = true;
          }

          if (this.preAppointmentInfo && this.preAppointmentInfo.Host_IC){
            this.disableHost_IC = true;
          }

          if (this.preAppointmentInfo && this.preAppointmentInfo.REASON){
            this.disableREASON = true;
          }

          if (this.preAppointmentInfo && this.preAppointmentInfo.Floor){
            this.disableFloor = true;
          }
          if (this.preAppointmentInfo && this.preAppointmentInfo.MEETING_LOCATION){
            this.preAppointmentInfo.MEETING_LOCATION = +this.preAppointmentInfo.MEETING_LOCATION;
            this.disableMEETING_LOCATION = true;
          }

          if (this.preAppointmentInfo && this.preAppointmentInfo.TELEPHONE_NO){
            this.disableTELEPHONE_NO = true;
          }

          this.appointmentInfo = passData.PreAppointment;
          if (this.appointmentInfo.Host_IC){
            this.appointmentInfo.STAFF_IC = this.appointmentInfo.Host_IC;
          }

          if (this.appointmentInfo.STAFF_IC){
            this.preAppointmentInfo.Host_IC = this.appointmentInfo.STAFF_IC;
            this.appointmentInfo.Host_IC = this.appointmentInfo.STAFF_IC;
            const host = this.HOSTLIST.find(item => item.HOSTIC === this.appointmentInfo.Host_IC);
            if (host) {
              this.appointmentInfo.HOSTNAME = host.HOSTNAME;
              this.appointmentInfo.HostExt = host.HostExt;

            }

          }

          if (this.appointmentInfo.Address){
            this.appointmentInfo.VISITOR_ADDRESS = this.appointmentInfo.Address;
          }

          if(this.appointmentInfo.visitor_country){
            this.appointmentInfo.VISITOR_COUNTRY = this.appointmentInfo.visitor_country;
          }

          if (this.appointmentInfo.SettingDetail) {
            this.QuestionnaireEnabled = JSON.parse(this.appointmentInfo.SettingDetail).QuestionnaireEnabled;
            this.MaterialDeclareEnabled = JSON.parse(this.appointmentInfo.SettingDetail).MaterialDeclareEnabled
            this.AttachmentUploadEnabled = JSON.parse(this.appointmentInfo.SettingDetail).AttachmentUploadEnabled
          }

          console.log('passData : ' + JSON.stringify(this.appointmentInfo));
          if (this.appointmentInfo.VISITOR_COMPANY) {
            this.appointmentInfo.visitor_comp_code = this.commonUtil.getCompany(this.appointmentInfo.VISITOR_COMPANY, true);
            this.appointmentInfo.VISITOR_COMPANY =  this.commonUtil.getCompany(this.appointmentInfo.visitor_comp_code, false);
          } else if (this.appointmentInfo.visitor_comp_code) {
            this.appointmentInfo.visitor_comp_code = this.commonUtil.getCompany(this.appointmentInfo.visitor_comp_code, true);
            this.appointmentInfo.VISITOR_COMPANY =  this.commonUtil.getCompany(this.appointmentInfo.visitor_comp_code, false);
            this.appointmentInfo.visitor_comp_name = this.appointmentInfo.VISITOR_COMPANY;
          }
          if(this.appointmentInfo.MEETING_LOCATION){
            this.appointmentInfo.MEETING_LOCATION = +this.appointmentInfo.MEETING_LOCATION;
          }

          const comapnyCode = this.appointmentInfo.visitor_comp_code? this.appointmentInfo.visitor_comp_code: (this.appointmentInfo.VISITOR_COMPANY? this.appointmentInfo.VISITOR_COMPANY: this.appointmentInfo.VisitorCompany);
          const companyExist = this.commonUtil.companyExist(comapnyCode, true);
          if (!companyExist){
            this.getSecurityMasterdetails();
          }

          if (this.appointmentInfo.VISITOR_COUNTRY) {
            this.appointmentInfo.VISITOR_COUNTRY = this.commonUtil.getCountry(this.appointmentInfo.VISITOR_COUNTRY, true);
          }

          this.appointmentInfo.REASON = this.commonUtil.getPurposeCode(this.appointmentInfo.REASON, true);
          this.appointmentInfo.VISITOR_GENDER = this.commonUtil.getGender(this.appointmentInfo.VISITOR_GENDER, true);
          this.checkAllInputs();
        } else {
          this.appointmentInfo.START_TIME = this.dateformat.transform(new Date() + '', "yyyy-MM-ddTHH:mm:ss")
        }
      }
    });
    this.events.observeDataCompany().subscribe(async (data: any) => {
      const user = data.title;
      const time = data.message;
    // events.observeDataCompany('user:created', (user, data) => {
      // user and time are the same arguments passed in `events.publish(user, time)`
      console.log('Welcome', user, 'at', time);
      // this.params.hostImage = "assets/images/logo/2.png";
      // alert(this.params.hostImage);
      if(data.action === 'user:created' && user == "visitorCompany"){
        var cData= JSON.parse(time);
        this.appointmentInfo.visitor_comp_name = cData.visitor_comp_name;
        this.appointmentInfo.visitor_comp_code = cData.visitor_comp_code;
        this.appointmentInfo.VISITOR_COMPANY_ID = cData.visitor_comp_code;
      } else if(data.action === 'user:created' && user == "StaffSelection"){
        var cData= JSON.parse(time);
        this.appointmentInfo.HOSTNAME = cData.HOSTNAME;
        this.appointmentInfo.Host_IC = cData.HOSTIC;
        this.appointmentInfo.HostExt = cData.HostExt;
      }

    });
  }

  ionViewDidEnter(){
    console.log("SecurityManualCheckInPage ionViewDidEnter");
    this.initSettings();
    // this.intSDKTemperature();
  }

  ionViewWillLeave(){
    console.log("SecurityManualCheckInPage ionViewWillLeave");
    // this.closeConnection();
  }

  initSettings() {
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


  getSecurityMasterdetails(){
    this.apiProvider.GetSecurityMasterDetails().then(
      (result: any) => {
        if(result){
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
          const comapnyCode = this.appointmentInfo.visitor_comp_code? this.appointmentInfo.visitor_comp_code: (this.appointmentInfo.VISITOR_COMPANY? this.appointmentInfo.VISITOR_COMPANY: this.appointmentInfo.VisitorCompany);
          const companyExist = this.commonUtil.companyExist(comapnyCode, true);
          if (companyExist){
            this.appointmentInfo.VISITOR_COMPANY = this.commonUtil.getCompany(comapnyCode, false);
            this.appointmentInfo.visitor_comp_code = this.commonUtil.getCompany(comapnyCode, true);
          }
        }
      },
      (err) => {

      }
    );
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

   openVisitorCompany(){
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          data: {}
        }
      }
    };
    this.router.navigate(['visitor-company-page'], navigationExtras);
  }


  openStaffSelection(){
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          data: this.appointmentInfo.Host_IC
        }
      }
    };
    this.router.navigate(['select-staff'], navigationExtras);
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
      } else if(err && err.message && err.message.indexOf("Http failure response for") > -1){
        message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
      } else if(err && JSON.parse(err) && JSON.parse(err).message){
        message =JSON.parse(err).message;
      }
      if(message){
        // message = " Unknown"
        let alert = this.alertCtrl.create({
          header: 'Error !',
          message: message,
          cssClass:'',
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
            if (this.appointmentInfo.VISITOR_IC === visitorData.VISITOR_IC) {
              this.appointmentInfo.VISITOR_IC = visitorData.VISITOR_IC;
              this.appointmentInfo.VisitorCategory = visitorData.VisitorCategory;
              this.appointmentInfo.VisitorCategory_ID = visitorData.VisitorCategory;
              this.appointmentInfo.TELEPHONE_NO = visitorData.TELEPHONE_NO;
              this.appointmentInfo.EMAIL = visitorData.EMAIL;
              this.appointmentInfo.VISITOR_NAME = visitorData.VISITOR_NAME;
              this.appointmentInfo.VISITOR_COMPANY = visitorData.VISITOR_COMPANY;
              this.appointmentInfo.visitor_comp_name = visitorData.VISITOR_COMPANY_NAME;
              this.appointmentInfo.visitor_comp_code = this.commonUtil.getCompany(visitorData.VISITOR_COMPANY_ID, true);
              this.appointmentInfo.VISITOR_COMPANY_ID = this.appointmentInfo.visitor_comp_code;
              this.appointmentInfo.VISITOR_GENDER = this.commonUtil.getGender(visitorData.VISITOR_GENDER, true);
              this.appointmentInfo.VISITOR_ADDRESS = visitorData.visitor_address_1;
              this.appointmentInfo.VISITOR_COUNTRY = visitorData.visitor_country;
              this.appointmentInfo.PLATE_NUM = visitorData.PLATE_NUM;
              const comapnyCode = this.appointmentInfo.visitor_comp_code? this.appointmentInfo.visitor_comp_code: (this.appointmentInfo.VISITOR_COMPANY? this.appointmentInfo.VISITOR_COMPANY: this.appointmentInfo.VisitorCompany);
              if (comapnyCode){
                const companyExist = this.commonUtil.companyExist(comapnyCode, true);
                if (!companyExist){
                  this.getSecurityMasterdetails();
                }
              }

            }

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

  isString(o) {
      return typeof o == "string" || (typeof o == "object" && o.constructor === String);
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

    if (this.appointmentInfo.visitor_comp_code) {
      if(this.isString(this.appointmentInfo.visitor_comp_code)) {
        this.appointmentInfo.visitor_comp_code = this.commonUtil.getCompany(this.appointmentInfo.visitor_comp_code, true);
      }
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
      VISITOR_GENDER: (this.appointmentInfo.VISITOR_GENDER !== null && this.appointmentInfo.VISITOR_GENDER !== '')? this.appointmentInfo.VISITOR_GENDER: '',
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
      END_DATE: this.appointmentInfo.END_TIME? this.dateformat.transform(new Date(this.appointmentInfo.END_TIME) + '', "yyyy-MM-ddTHH:mm:ss"): '',
      Purpose: this.appointmentInfo.REASON? this.appointmentInfo.REASON: '',
      HOST_NAME: this.appointmentInfo.Host_IC? this.appointmentInfo.Host_IC: '',
      HOST_IC: this.appointmentInfo.Host_IC? this.appointmentInfo.Host_IC: '',
      FLOOR: this.appointmentInfo.Floor? this.appointmentInfo.Floor: '',
      MEETING_LOCATION: this.appointmentInfo.MEETING_LOCATION? this.appointmentInfo.MEETING_LOCATION: '',
      Remarks: this.appointmentInfo.Remarks? this.appointmentInfo.Remarks: '',
      AdditionalDocs: additionDocs,
      Declaration: this.appointmentInfo.declarationList ? JSON.stringify(this.appointmentInfo.declarationList): ''
    }

    console.log('checkin data ->', JSON.stringify(params));

    this.apiProvider.VimsAppSecurityCheckIn(params).then(
      (val) => {
        var result = JSON.parse(val.toString());
        if(result  && result[0].Code == 10){

          this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.VISITOR_CHECKED_IN']);
          this.navCtrl.navigateRoot('security-dash-board-page');
          return;
        }
        this.apiProvider.showAlert('Server Error');
      },
      (err) => {

        if(err && err.message == "No Internet"){
          return;
        }
        try {
          var message = "Error in server";
          if(err && err.message && err.message.indexOf("Http failure response for") > -1){
            message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          } else {
            var result = JSON.parse(err);
            if(result  && result["Table"] != undefined){
              message = result["Table"][0].description? result["Table"][0].description : result["Table"][0].Description;
            }else if(result  && result["Table1"] != undefined){
              message = result["Table1"][0].Status? result["Table1"][0].Status : result["Table1"][0].Description;
            }
          }
        } catch (error) {

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
