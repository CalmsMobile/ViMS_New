import { Component, OnInit } from '@angular/core';
import {ModalController,AlertController} from '@ionic/angular';
import { RestProvider } from 'src/app/providers/rest/rest';
import { QuestionDocPopupComponent } from 'src/app/components/question-doc-popup/question-doc-popup.component';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AppSettings } from 'src/app/services/app-settings';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { CommonUtil } from 'src/app/services/util/CommonUtil';
import { DocumentModalComponent } from 'src/app/components/document-modal/document-modal.component';

@Component({
  selector: 'app-visitor-information',
  templateUrl: './visitor-information.page.html',
  styleUrls: ['./visitor-information.page.scss'],
})
export class VisitorInformationPage implements OnInit {

  T_SVC:any;
  autoApproval: any = false;
  showOption = false;
  isPastAppointment = false;
  appointmentInfo: any;
  fromAppointment = false;
  fromAppointmentWalkin = false;
  preAppointmentInfo: any;
  appSettings:any = {};
  visitorImagePath = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  imageURLType = '&RefType=VPB&Refresh='+ new Date().getTime();
  imageURLTypeCHECKIN= '&RefType=VP&Refresh='+ new Date().getTime();
  validQRCode = false;
  QuestionnaireEnabled = false;
  MaterialDeclareEnabled = false;
  AttachmentUploadEnabled = false;
  constructor(public apiProvider: RestProvider,
    public modalCtrl: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private commonUtil: CommonUtil,
    private translate:TranslateService,
    private dateformat : DateFormatPipe,
    private alertCtrl: AlertController) {
      const ackSeettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
      if (ackSeettings) {
        this.appSettings = JSON.parse(ackSeettings);
      }
      this.translate.get([ 'ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS', 'ALERT_TEXT.CONFIRMATION',
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'SETTINGS.SELECT_LANGUAGE']).subscribe(t => {
        this.T_SVC = t;
    });
  }

  getAppointmentByQR() {

    if (!this.appointmentInfo.HexCode) {
      this.appointmentInfo.HexCode = this.appointmentInfo.att_hex_no;
    }
    if (!this.appointmentInfo.HexCode) {
      this.appointmentInfo.HexCode = this.appointmentInfo.Hexcode;
    }
    if (this.appointmentInfo.att_check_in === 1 && this.appointmentInfo.att_check_out === 1) {
      this.validQRCode = false;
    } else {
      this.validQRCode = true;
    }
    if (this.fromAppointment || this.appointmentInfo.visitorBookingSeqId) {
      this.getAddVisitorSettings();
      // return;
    }
    this.getAdditionalDocs();
    if (!this.appointmentInfo.HexCode) {
      return;
    }


    var hexData = this.appointmentInfo.HexCode;//"C4B9F365";
    var params = {"hexcode":""+ hexData};
    this.apiProvider.VimsAppGetAppointmentByHexCode(params, false).then(
      (val) => {
        var visitorDetail = val+"";
        var vOb1 = JSON.parse(visitorDetail);
        if(vOb1 && vOb1.Table1 && vOb1.Table1.length > 0) {
          var vOb = vOb1.Table1[0];
          var startDate = vOb.START_TIME.split("T")[0];
          startDate = startDate.replace('-', '/');
          startDate = startDate.replace('-', '/');
          var fDate = this.dateformat.transform(startDate+"", "yyyy/MM/dd");
          var fTime = new Date(fDate).getTime();
          var endDate = vOb.END_TIME.split("T")[0];
          endDate = endDate.replace('-', '/');
          endDate = endDate.replace('-', '/');
          var eDate = this.dateformat.transform(endDate+"", "yyyy/MM/dd");
          var eTime = new Date(eDate).getTime();
          var cDate = this.dateformat.transform(new Date()+"", "yyyy/MM/dd");
          var cTime = new Date(cDate).getTime();
          if((fDate == cDate) || (fTime <= cTime && cTime <= eTime)){
            this.validQRCode = this.fromAppointment? true: false;
          } else {
            this.validQRCode = false;
          }
          const att_check_in_time = this.appointmentInfo.att_check_in_time;
          let att_check_out_time = this.appointmentInfo.att_check_out_time;
          if (!att_check_out_time){
            att_check_out_time = vOb.att_check_out_time;
            this.appointmentInfo.att_check_out_time = att_check_out_time;
          }
          if (att_check_in_time && !att_check_out_time) {
            this.validQRCode = true;
          }
          if ((!att_check_in_time && !att_check_out_time) || (att_check_in_time && att_check_out_time)) {
            let endT = vOb.END_TIME.replace('T', ' ');
            endT = endT.replace('-', '/');
            endT = endT.replace('-', '/');
            const eDate = this.dateformat.transform(endT, "yyyy/MM/dd");
            const crnDate = this.dateformat.transform(new Date()+'', "yyyy/MM/dd");
            if (new Date(crnDate).getTime() > new Date(eDate).getTime()) {
              this.validQRCode = false;
            } else {
              this.validQRCode = true;
            }
          }
          const PLATE_NUM = this.appointmentInfo.att_car_no ? this.appointmentInfo.att_car_no: this.appointmentInfo.PLATE_NUM;
          const att_remark = this.appointmentInfo.att_remark ? this.appointmentInfo.att_remark: this.appointmentInfo.Remarks;
          const WorkPermitExpiry = this.appointmentInfo.WorkPermitExpiry;
          const visitor_name = this.appointmentInfo.visitor_name;
          const visitor_gender = this.appointmentInfo.visitor_gender;
          const visitor_country = this.appointmentInfo.visitor_country;
          const visitor_email = this.appointmentInfo.visitor_email;
          const visitor_tel_no = this.appointmentInfo.visitor_tel_no;
          const visitor_address_1 = this.appointmentInfo.visitor_address_1;
          const att_visitor_company_id =  this.appointmentInfo.att_visitor_company_id;
          const VisitorCompany = this.appointmentInfo.VisitorCompany;
          const purpose = this.appointmentInfo.att_reason;
          const MEETING_LOCATION = this.appointmentInfo.MEETING_LOCATION;
          const vseqid = this.appointmentInfo.vseqid;
          const visitorIDImage = this.appointmentInfo.visitorIDImage;
          const visitor_photo = this.appointmentInfo.visitor_photo;
          const additionalDocList = this.appointmentInfo.additionalDocList;

          this.appointmentInfo = vOb;
          this.appointmentInfo.visitor_photo = visitor_photo;
          this.appointmentInfo.visitorIDImage = visitorIDImage;
          this.appointmentInfo.additionalDocList = additionalDocList;

          this.appointmentInfo.vseqid = vseqid;
          if (purpose){
            this.appointmentInfo.REASON = purpose;
          }
          if (MEETING_LOCATION){
            this.appointmentInfo.MEETING_LOCATION = MEETING_LOCATION;
            this.appointmentInfo.Room = MEETING_LOCATION;
          }
          if (visitor_name){
            this.appointmentInfo.VISITOR_NAME = visitor_name;
          }
          if (visitor_gender != null && visitor_gender !== ''){
            this.appointmentInfo.VISITOR_GENDER = visitor_gender;
          }
          if (visitor_country){
            this.appointmentInfo.visitor_country = visitor_country;
          }
          if (visitor_email){
            this.appointmentInfo.visitor_email = visitor_email;
          }
          if (visitor_tel_no){
            this.appointmentInfo.TELEPHONE_NO = visitor_tel_no;
          }
          if (visitor_address_1){
            this.appointmentInfo.visitor_address_1 = visitor_address_1;
          }
          if (att_visitor_company_id){
            this.appointmentInfo.visitor_comp_code = att_visitor_company_id;
          }
          if (VisitorCompany){
            this.appointmentInfo.VisitorCompany = VisitorCompany;
          }

          this.appointmentInfo.att_check_in_time = att_check_in_time;
          this.appointmentInfo.att_check_out_time = att_check_out_time;
          this.appointmentInfo.Address = this.appointmentInfo.VISITOR_ADDRESS;
          this.appointmentInfo.WorkPermitExpiry = WorkPermitExpiry;
          this.appointmentInfo.PLATE_NUM = PLATE_NUM? PLATE_NUM: this.appointmentInfo.PLATE_NUM;
          this.appointmentInfo.Remarks = att_remark?att_remark: this.appointmentInfo.Remarks;
          this.appointmentInfo.Hexcode = hexData;
          this.appointmentInfo.visitorImage = vOb.VISITOR_IMG;
          this.fromAppointmentWalkin = true;
          if (this.appointmentInfo.SettingDetail) {
            this.QuestionnaireEnabled = JSON.parse(this.appointmentInfo.SettingDetail).QuestionnaireEnabled;
            this.MaterialDeclareEnabled = JSON.parse(this.appointmentInfo.SettingDetail).MaterialDeclareEnabled
            this.AttachmentUploadEnabled = JSON.parse(this.appointmentInfo.SettingDetail).AttachmentUploadEnabled
          }
          this.getNamesFromCode();
          this.getOverstayTime();
          this.getAdditionalDocs();
        }
      },
      (err) => {
        console.log("error : "+JSON.stringify(err));
        if(err && err.message == "No Internet"){
          return;
        }

        if(err.Table1 && err.Table1.length == 0){
          var message  = this.T_SVC['ALERT_TEXT.INVALID_QR'];
          this.apiProvider.showAlert(message);
            return;
        }

        try {
          if(err && err.message && err.message.indexOf("Http failure response for") > -1){
            message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
            this.apiProvider.showAlert(message);
            return;
          }
          if (err.message){
            if(err.message.indexOf("This QR code is not authorised to check-in at this branch") === -1){
              this.apiProvider.showAlert(err.message);
            }

            return;
          }
        } catch (error) {

        }
        message = this.T_SVC['ACC_MAPPING.INVALID_QR'];

        if(err && JSON.parse(err) && JSON.parse(err).Table && JSON.parse(err).Table[0].description){
          message = JSON.parse(err).Table[0].description;
        }
        message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        this.apiProvider.showAlert(message);
      }
    );
  }

  getAdditionalDocs() {
    if (!this.appointmentInfo.att_id || !this.appointmentInfo.att_visitor_id) {
      return;
    }
    var params = {"att_id":""+ this.appointmentInfo.att_id,
    "visitor_id":""+ this.appointmentInfo.att_visitor_id,
  };
    this.apiProvider.requestSecurityApi(params, '/api/SecurityApp/VimsAppGetCheckinDocs', false).then(
      (val) => {
        var visitorDetail = val+"";
        var vOb1 = JSON.parse(visitorDetail);
        if (vOb1.Table && vOb1.Table[0].Code === 10) {
          if (vOb1.Table1 && vOb1.Table1.length > 0) {
            this.appointmentInfo.visitor_photo = vOb1.Table1[0].visitor_photo;
          }
          if (vOb1.Table2 && vOb1.Table2.length > 0) {
            this.appointmentInfo.visitorIDImage = vOb1.Table2[0].visitor_scanimage;
          }
          this.appointmentInfo.additionalDocList = [];
          if (vOb1.Table3 && vOb1.Table3.length > 0) {

            if (vOb1.Table3[0].IN_IMAGE1) {
              this.appointmentInfo.additionalDocList.push(vOb1.Table3[0].IN_IMAGE1);
            }
            if (vOb1.Table3[0].IN_IMAGE2) {
              this.appointmentInfo.additionalDocList.push(vOb1.Table3[0].IN_IMAGE2);
            }
            if (vOb1.Table3[0].IN_IMAGE3) {
              this.appointmentInfo.additionalDocList.push(vOb1.Table3[0].IN_IMAGE3);
            }
            if (vOb1.Table3[0].IN_IMAGE4) {
              this.appointmentInfo.additionalDocList.push(vOb1.Table3[0].IN_IMAGE4);
            }
            if (vOb1.Table3[0].IN_IMAGE5) {
              this.appointmentInfo.additionalDocList.push(vOb1.Table3[0].IN_IMAGE5);
            }
            if (vOb1.Table3[0].IN_IMAGE6) {
              this.appointmentInfo.additionalDocList.push(vOb1.Table3[0].IN_IMAGE6);
            }

          }
        }

      },
      (err) => {
        console.log("error : "+JSON.stringify(err));
        if(err && err.message == "No Internet"){
          return;
        }

        if(err.Table1 && err.Table1.length == 0){
          var message  = this.T_SVC['ALERT_TEXT.INVALID_QR'];
          this.apiProvider.showAlert(message);
            return;
        }

        if(err && err.message && err.message.indexOf("Http failure response for") > -1){
          message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          this.apiProvider.showAlert(message);
          return;
        }
        message = this.T_SVC['ACC_MAPPING.INVALID_QR'];

        if(err && JSON.parse(err) && JSON.parse(err).Table && JSON.parse(err).Table[0].description){
          message = JSON.parse(err).Table[0].description;
        }
        if (!message){
          message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        }
        this.apiProvider.showAlert(message);
      }
    );
  }

  getSecurityMasterdetails(){
    this.apiProvider.GetSecurityMasterDetails().then(
      (result: any) => {
        if(result){
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
          const comapnyCode = this.appointmentInfo.visitor_comp_code? this.appointmentInfo.visitor_comp_code: (this.appointmentInfo.VISITOR_COMPANY? this.appointmentInfo.VISITOR_COMPANY: this.appointmentInfo.VisitorCompany);
          const companyExist = this.commonUtil.companyExist(comapnyCode, false);
          if (companyExist){
            this.appointmentInfo.VisitorCompany = this.commonUtil.getCompany(comapnyCode, false);
          }
        }
      },
      (err) => {

      }
    );
  }

  getNamesFromCode() {
    const comapnyCode = this.appointmentInfo.visitor_comp_code? this.appointmentInfo.visitor_comp_code: (this.appointmentInfo.VISITOR_COMPANY? this.appointmentInfo.VISITOR_COMPANY: this.appointmentInfo.VisitorCompany);
    const companyExist = this.commonUtil.companyExist(comapnyCode, false);
    if (companyExist){
      this.appointmentInfo.VisitorCompany = this.commonUtil.getCompany(comapnyCode, false);
    } else {
      this.getSecurityMasterdetails();
    }
    this.appointmentInfo.REASON_NAME = this.commonUtil.getPurposeCode(this.appointmentInfo.REASON, false);
    this.appointmentInfo.VISITOR_GENDER_NAME = this.commonUtil.getGender(this.appointmentInfo.VISITOR_GENDER? this.appointmentInfo.VISITOR_GENDER : this.appointmentInfo.visitor_gender, false);
    this.appointmentInfo.visitor_gender = this.appointmentInfo.VISITOR_GENDER_NAME;
    this.appointmentInfo.visitor_ctg_desc = this.commonUtil.getCategory(this.appointmentInfo.VisitorCategory? this.appointmentInfo.VisitorCategory: this.appointmentInfo.att_visitor_ctg_id, false);
    this.appointmentInfo.FloorName = this.commonUtil.getFloor(this.appointmentInfo.Floor?this.appointmentInfo.Floor: this.appointmentInfo.att_floor_no, false);
    this.appointmentInfo.RoomName = this.commonUtil.getRoomName(this.appointmentInfo.Room?this.appointmentInfo.Room: this.appointmentInfo.MEETING_LOCATION, false);
    this.appointmentInfo.VISITOR_COUNTRY_NAME = this.commonUtil.getCountry(this.appointmentInfo.visitor_country?this.appointmentInfo.visitor_country: (this.appointmentInfo.Country ? this.appointmentInfo.Country: this.appointmentInfo.VISITOR_COUNTRY), false);
  }

  getAddVisitorSettings() {
    const ctgId = this.commonUtil.getCategory(this.appointmentInfo.VisitorCategory? this.appointmentInfo.VisitorCategory: this.appointmentInfo.att_visitor_ctg_id, true);
    var params = {"RefVisitorCateg": ctgId};
    this.apiProvider.requestSecurityApi(params, '/api/kiosk/getAddVisitorSettings', false).then(
      (val: any) => {
        if (JSON.parse(val).Table[0].Code == 10) {
          if (val && JSON.parse(val).Table[0].Code == 10 && JSON.parse(val).Table1[0]) {
            const settingObj = JSON.parse(JSON.parse(val).Table1[0].SettingDetail);
            this.QuestionnaireEnabled = settingObj.QuestionnaireEnabled;
            this.MaterialDeclareEnabled = settingObj.MaterialDeclareEnabled
            this.AttachmentUploadEnabled = settingObj.AttachmentUploadEnabled

          }

        }
      },
      (err) => {
        console.log("error : "+JSON.stringify(err));
        if(err && err.message == "No Internet"){
          return;
        }

        if(err.Table1 && err.Table1.length == 0){
          var message  = this.T_SVC['ALERT_TEXT.INVALID_QR'];
          this.apiProvider.showAlert(message);
            return;
        }

        if(err && err.message && err.message.indexOf("Http failure response for") > -1){
          message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          this.apiProvider.showAlert(message);
          return;
        }
        message = this.T_SVC['ACC_MAPPING.INVALID_QR'];

        if(err && JSON.parse(err) && JSON.parse(err).Table && JSON.parse(err).Table[0].description){
          message = JSON.parse(err).Table[0].description;
        }
        message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        this.apiProvider.showAlert(message);
      }
    );
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.appointmentInfo = this.router.getCurrentNavigation().extras.state.passData;
        this.fromAppointment = this.router.getCurrentNavigation().extras.state.fromAppointment;
        const showCheckoutAlert = this.router.getCurrentNavigation().extras.state.showCheckoutAlert;
        if (!this.fromAppointment && !this.appointmentInfo.SEQ_ID) {
          this.appointmentInfo.SEQ_ID = this.appointmentInfo.att_visitor_id;
        }
        this.getNamesFromCode();
        console.log('passData : ' + JSON.stringify(this.appointmentInfo));
        this.getAppointmentByQR();
        this.getOverstayTime();
          if (showCheckoutAlert) {
            this.checkInOutProcess();
          }
      }
    });
  }

  getOverstayTime() {

    if (this.fromAppointment) {
      if (!this.appointmentInfo.WorkPermitExpiry || this.appointmentInfo.WorkPermitExpiry.indexOf("1900") >= 0) {
        this.appointmentInfo.WorkPermitExpiry = this.appointmentInfo.END_TIME;
      }
    }

    if (this.appointmentInfo.WorkPermitExpiry && this.appointmentInfo.att_check_in_time) {
      const expireTime =  this.dateformat.transform(this.appointmentInfo.WorkPermitExpiry, 'yyyy-MM-dd HH:mm:ss');
      let currentDate;
      if (this.appointmentInfo.att_check_out_time) {
        currentDate =  this.dateformat.transform(this.appointmentInfo.att_check_out_time, 'yyyy-MM-dd HH:mm:ss');
      } else {
        currentDate =  this.dateformat.transform(new Date() + '', 'yyyy-MM-dd HH:mm:ss');
      }
      this.appointmentInfo.isExpired = (new Date(currentDate).getTime() > new Date(expireTime).getTime());

      if (this.appointmentInfo.isExpired) {
        let difference = new Date(currentDate).getTime() - new Date(expireTime).getTime();
        const dDays = this.apiProvider.twoDecimals(parseInt('' +difference/(24*60*60*1000)));
        const dHours = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*60*1000)) % 24)) ;
        const dMin = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*1000)) % 60));
        this.appointmentInfo.overStayTime = dDays +' day, '+dHours+' hour, '+dMin+' min';
      }

    }


  }

  goBack() {
    if (this.fromAppointment) {
      this.router.navigateByUrl('security-appointment-list');
    } else {
      this.router.navigateByUrl('security-check-out-page');
    }

    console.log('goBack ');
  }

  async checkInOutProcess() {
    let inputsShow = [];
  let message1 = "";
    if (this.appointmentInfo.att_check_in == null || (this.appointmentInfo.att_check_in === 0 && this.appointmentInfo.att_check_out === 0) || (this.appointmentInfo.att_check_in === 1 && this.appointmentInfo.att_check_out === 1)) {
      message1 = "Do you wish to check-in " + (this.appointmentInfo.VISITOR_NAME? this.appointmentInfo.VISITOR_NAME : " this visitor")+" now?";
    } else if (this.appointmentInfo.att_check_in === 1 && (!this.appointmentInfo.att_check_out || this.appointmentInfo.att_check_out === 0)) {
      message1 = "Visitor("+(this.appointmentInfo.VISITOR_NAME? this.appointmentInfo.VISITOR_NAME : " this visitor")+") already checked-in for this appointment. Do you like to check-out?";
      if (this.appointmentInfo.overStayTime) {
        inputsShow = [
          {
            name: 'remarks',
            type: 'text',
            placeholder: 'Enter Check-out Remarks'
          }];
      }
    } else {
      return;
    }
    let alert = this.alertCtrl.create({
      header: this.T_SVC['ALERT_TEXT.CONFIRMATION'],
      cssClass:"",
      inputs: inputsShow,
      message: message1,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ok',
          handler: (result) => {
            console.log('Ok clicked');
            if (this.appointmentInfo.att_check_in == null || (this.appointmentInfo.att_check_in === 0 && this.appointmentInfo.att_check_out === 0) || this.appointmentInfo.att_check_in === 1 && this.appointmentInfo.att_check_out === 1) {
              const navigationExtras: NavigationExtras = {
                state: {
                  passData: {
                    PreAppointment : this.appointmentInfo
                  }
                }
              };
              this.router.navigate(['security-manual-check-in'], navigationExtras);
              return;
            }
            let CheckOutCounter = 'Security';
            var secuData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
            if(secuData){
              CheckOutCounter = JSON.parse(secuData).Name ? JSON.parse(secuData).Name.substring(0, 25): 'Security';
            }
            var params = {
              "att_id":this.appointmentInfo.att_id,
              "remarks": (result && result.remarks)? result.remarks: '',
              "CheckOutCounter": CheckOutCounter
            };
            // this.VM.host_search_id = "adam";
            this.apiProvider.VimsAppUpdateVisitorCheckOut(params).then(
              (val) => {
                this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS']);
                this.goBack();
              },
              (err) => {
                if(err && err.message == "No Internet"){
                  return;
                }
                var message = "";
                if(err && err.message && err.message.indexOf("Http failure response for") > -1){
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
        }
      ]
    });
    (await alert).present();
    (await alert).onDidDismiss().then(() => {
    });

  }

  viewImage(base64) {
    this.apiProvider.viewImage(base64);
  }

  async documentModal(){
    const modal = await this.modalCtrl.create({
      component: DocumentModalComponent,
      componentProps: {
        data: this.appointmentInfo.additionalDocList,
        type: 'VIEW_ONLY'
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

  async openCustomDialog(action) {
    let api = '/api/Vims/GetVisitorQuestionariesByAppointmentId';
    if (action === 'doc') {
      api = '/api/Vims/GetVisitorDocsBySeqId';
    } else if (action === 'declaration'){
      api = '/api/vims/GetVisitorItemChecklistBySeqId';
    }

    var params = {
      "SEQ_ID": this.appointmentInfo.SEQ_ID,
      "STAFF_IC": this.appointmentInfo.STAFF_IC
  };
  // this.VM.host_search_id = "adam";
  this.apiProvider.requestApi(params, api, true, '', '').then(
    async (val) => {
      var result = JSON.parse(val.toString());
      if (result.Table && result.Table.length > 0) {
        const presentModel = await this.modalCtrl.create({
          component: QuestionDocPopupComponent,
          componentProps: {
            data: {
              seqId: this.appointmentInfo.SEQ_ID,
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
    (err) => {

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
        this.apiProvider.showAlert(message);
      }
    }
  );
  }
}
