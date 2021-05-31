import { Component, OnInit } from '@angular/core';
import {ModalController,AlertController} from '@ionic/angular';
import { RestProvider } from 'src/app/providers/rest/rest';
import { QuestionDocPopupComponent } from 'src/app/components/question-doc-popup/question-doc-popup.component';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AppSettings } from 'src/app/services/app-settings';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { CommonUtil } from 'src/app/services/util/CommonUtil';

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
  preAppointmentInfo: any;
  appSettings:any = {};
  visitorImagePath = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  imageURLType = '&RefType=VPB&Refresh='+ new Date().getTime();
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
    if (!this.fromAppointment && (!this.appointmentInfo.visitorBookingSeqId || this.appointmentInfo.visitorBookingSeqId === 0)) {
      this.getAddVisitorSettings();
      return;
    }
    var data = this.appointmentInfo.HexCode;//"C4B9F365";
    var params = {"hexcode":""+ data};
    this.apiProvider.VimsAppGetAppointmentByHexCode(params).then(
      async (val) => {
        var visitorDetail = val+"";
        var vOb1 = JSON.parse(visitorDetail);
        if(vOb1 && vOb1.Table1 && vOb1.Table1.length > 0) {
          var vOb = vOb1.Table1[0];
          var startDate = vOb.START_TIME.split("T")[0];
          var fDate = this.dateformat.transform(startDate+"", "yyyy-MM-dd");
          var fTime = new Date(fDate).getTime();
          var endDate = vOb.END_TIME.split("T")[0];
          var eDate = this.dateformat.transform(endDate+"", "yyyy-MM-dd");
          var eTime = new Date(eDate).getTime();
          var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-dd");
          var cTime = new Date(cDate).getTime();
          if((fDate == cDate) || (fTime <= cTime && cTime <= eTime)){
            this.validQRCode = this.fromAppointment? true: false;
          } else {
            this.validQRCode = false;
          }
          this.appointmentInfo = vOb;
          if (this.appointmentInfo.SettingDetail) {
            this.QuestionnaireEnabled = JSON.parse(this.appointmentInfo.SettingDetail).QuestionnaireEnabled;
            this.MaterialDeclareEnabled = JSON.parse(this.appointmentInfo.SettingDetail).MaterialDeclareEnabled
            this.AttachmentUploadEnabled = JSON.parse(this.appointmentInfo.SettingDetail).AttachmentUploadEnabled
          }
          this.getNamesFromCode();
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

        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
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

  getNamesFromCode() {
    this.appointmentInfo.VisitorCompany = this.commonUtil.getCompany(this.appointmentInfo.visitor_comp_code? this.appointmentInfo.visitor_comp_code: (this.appointmentInfo.VISITOR_COMPANY? this.appointmentInfo.VISITOR_COMPANY: this.appointmentInfo.VisitorCompany), false);
    this.appointmentInfo.REASON_NAME = this.commonUtil.getPurposeCode(this.appointmentInfo.REASON, false);
    this.appointmentInfo.VISITOR_GENDER_NAME = this.commonUtil.getGender(this.appointmentInfo.VISITOR_GENDER? this.appointmentInfo.VISITOR_GENDER : this.appointmentInfo.visitor_gender, false);
    this.appointmentInfo.visitor_ctg_desc = this.commonUtil.getCategory(this.appointmentInfo.VisitorCategory? this.appointmentInfo.VisitorCategory: this.appointmentInfo.att_visitor_ctg_id, false);
    this.appointmentInfo.FloorName = this.commonUtil.getFloor(this.appointmentInfo.Floor?this.appointmentInfo.Floor: this.appointmentInfo.att_floor_no, false);
    this.appointmentInfo.RoomName = this.commonUtil.getRoomName(this.appointmentInfo.Room?this.appointmentInfo.Room: this.appointmentInfo.MEETING_LOCATION, false);
    this.appointmentInfo.VISITOR_COUNTRY_NAME = this.commonUtil.getCountry(this.appointmentInfo.visitor_country?this.appointmentInfo.visitor_country: (this.appointmentInfo.Country ? this.appointmentInfo.Country: this.appointmentInfo.VISITOR_COUNTRY), false);
  }

  getAddVisitorSettings() {
    if (this.appointmentInfo.att_check_in === 1 && this.appointmentInfo.att_check_out === 1) {
      this.validQRCode = false;
    } else {
      this.validQRCode = true;
    }
    const ctgId = this.commonUtil.getCategory(this.appointmentInfo.VisitorCategory? this.appointmentInfo.VisitorCategory: this.appointmentInfo.att_visitor_ctg_id, true);
    var params = {"RefVisitorCateg": ctgId};
    this.apiProvider.requestSecurityApi(params, '/api/kiosk/getAddVisitorSettings', false).then(
      async (val: any) => {
        if (JSON.parse(val).Table[0].Code == 10) {
          if (val && JSON.parse(val).Table[0].Code == 10) {
            const settingObj = JSON.parse(JSON.parse(val).Table1[0].SettingDetail);
            this.QuestionnaireEnabled = settingObj.QuestionnaireEnabled;
            this.MaterialDeclareEnabled = settingObj.MaterialDeclareEnabled
            this.AttachmentUploadEnabled = settingObj.AttachmentUploadEnabled

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
          this.apiProvider.showAlert(message);
            return;
        }

        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
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
        this.fromAppointment = this.router.getCurrentNavigation().extras.state.fromAppointment
        this.getNamesFromCode();
        console.log('passData : ' + JSON.stringify(this.appointmentInfo));
        this.getAppointmentByQR();
      }
    });
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
  let message1 = "";
    if (this.appointmentInfo.att_check_in == null || (this.appointmentInfo.att_check_in === 0 && this.appointmentInfo.att_check_out === 0) || (this.appointmentInfo.att_check_in === 1 && this.appointmentInfo.att_check_out === 1)) {
      message1 = "Do you wish to check-in ";
    } else if (this.appointmentInfo.att_check_in === 1 && (!this.appointmentInfo.att_check_out || this.appointmentInfo.att_check_out === 0)) {
      message1 = "Do you wish to check-out ";
    } else {
      return;
    }
    let alert = this.alertCtrl.create({
      header: this.T_SVC['ALERT_TEXT.CONFIRMATION'],
      cssClass:"alert-danger",
      message: message1+(this.appointmentInfo.VISITOR_NAME? this.appointmentInfo.VISITOR_NAME : " this visitor")+" now?",
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
          handler: () => {
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
            var params = {
              "att_id":this.appointmentInfo.att_id,
              "CheckOutCounter":"admin"
            };
            // this.VM.host_search_id = "adam";
            this.apiProvider.VimsAppUpdateVisitorCheckOut(params).then(
              async (val) => {
                this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS']);
              },
              async (err) => {
                if(err && err.message == "No Internet"){
                  return;
                }
                var message = "";
                if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
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
  this.apiProvider.requestApi(params, api, true, '').then(
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
}
