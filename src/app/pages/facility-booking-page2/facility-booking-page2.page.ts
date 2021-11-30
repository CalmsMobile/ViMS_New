import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController, AlertController, ToastController, IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AddAppointmentModel } from 'src/app/model/addAppointmentModel';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-facility-booking-page2',
  templateUrl: './facility-booking-page2.page.html',
  styleUrls: ['./facility-booking-page2.page.scss'],
})
export class FacilityBookingPage2Page implements OnInit {

  @ViewChild(IonContent) content:IonContent;
  facilitySlots = [];
  addAppointmentModel = new AddAppointmentModel();
  VISITOR_SIZE = 0;
  edit = false;
  onedit = false;
  FacilityCode = 0;
  PurposeCode :any = 0;
  disableButton = false;
  hostSettings : any = {};
  VM = {
    appointment:{},
    facility : [],
    // AVAIL_ROOMS:[],
    // AVAIL_REASONS:[],
    AVAIL_DEPART:[{"SEQID":1,"dept_id":"1","dept_desc":"Department A","dept_company_refcode":"D1","dept_Floor":"1"}, {"SEQID":3,"dept_id":"SOFTWARE","dept_desc":"SOFTWARE","dept_company_refcode":"1","dept_Floor":"NULL"}],
    AVAIL_FLOOR:[],
    AVAIL_CHECK_IN_TYPE:[{"id":"3","chkin_type":"All"},{"id":"2","chkin_type":"Self Check-in Kiosk"},{"id":"3","chkin_type":"Security Check-in"}],
    FACILITYMASTERLIST:[],
    FACILITYPURPOSELIST:[]

  }
  facilityBooking:FormGroup;
  T_SVC:any;
  QRObj :any = {

  }
  // fromDate: new Date(),
  //   toDate: new Date(),
  //   fromTime:"02:02",
  //   toTime:"02:02"
  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private dateformat : DateFormatPipe,
    public events: EventsService,
    private router: Router,
    private route: ActivatedRoute,
    public apiProvider: RestProvider,
    private translate:TranslateService) {
      this.translate.get([
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
        'ALERT_TEXT.SLOT_OCCUPIED',
        'ALERT_TEXT.DUPLICATE_BOOKING',
        'ALERT_TEXT.SLOT_EXPIRED',
        'ALERT_TEXT.FACILITY_UPDATE_SUCCESS',
        'ALERT_TEXT.USER_NOT_FOUND',
        'ALERT_TEXT.MEMBER_NOT_FOUND',
        'ALERT_TEXT.FACILITY_SESSION_EXPIRED',
        'FACILITY_BOOKING.ADD_APPOINTMENT_DONE_SUCCESS',
        'ALERT_TEXT.SELECT_PURPOSE',
        'ALERT_TEXT.SETTINGS_NOT_FOUND']).subscribe(t => {
          this.T_SVC = t;
      });
      var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if(qrInfo && JSON.parse(qrInfo) && JSON.parse(qrInfo).MAppId){
        this.QRObj = JSON.parse(qrInfo);
      }
      var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
      if(settings && JSON.parse(settings)){
        try{
          if(this.QRObj && this.QRObj.MAppId){
            if(this.QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1){
              if(JSON.parse(settings).Table2 && JSON.parse(settings).Table2.length > 0){
                this.hostSettings = JSON.parse(settings).Table2[0];
              }else if(JSON.parse(settings).Table1 && JSON.parse(settings).Table1.length > 0){
                this.hostSettings = JSON.parse(settings).Table1[0];
              }else{
                this.showToast(this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND']);
              }
            }else{
              var sett = JSON.parse(settings);
              if(sett.Table2 && sett.Table2.length > 0){
                this.hostSettings = sett.Table2[0];
              }else if(sett.Table1 && sett.Table1.length > 0){
                this.hostSettings = sett.Table1[0];
              } else{
                this.showToast(this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND']);
              }

            }
          }
            this.hostSettings.isFacility = true;
          // this.hostSettings.NameRequired = false;
        }catch(e){

        }
      }else{
        try{
          if(qrInfo && JSON.parse(qrInfo) && JSON.parse(qrInfo).MAppId){
            this.QRObj = JSON.parse(qrInfo);
            this.GetHostAppSettings();
          }
          // this.hostSettings.NameRequired = false;
        }catch(e){

        }

      }

      this.facilityBooking = new FormGroup({
        facility: new FormControl('', [Validators.required]),
        purpose: new FormControl('', (this.hostSettings && this.hostSettings.PurposeEnabled && this.hostSettings.PurposeRequired) ? ([Validators.required]) : []),
        remarks: new FormControl('', (this.hostSettings && this.hostSettings.RemarksEnabled && this.hostSettings.RemarksRequired) ? ([Validators.required]) : [])
        //country: new FormControl('', [Validators.pattern('[a-zA-Z0-9 ]*')]),
        //city: new FormControl('', [Validators.pattern('[a-zA-Z0-9 ]*')]),
      });

      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          const passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + passData);
          if(passData.data != undefined && passData.data){
            var data = JSON.parse(passData.data);
            this.addAppointmentModel.START_DATE = data.fromDate;
            this.addAppointmentModel.END_DATE = data.toDate;

            if(data.appointment&& data.appointment[0]){
              this.edit = true;

              this.addAppointmentModel.Message = data.appointment[0].Message;
              this.addAppointmentModel.Remarks = data.appointment[0].Remarks;
              this.addAppointmentModel.vehicle_no = data.appointment[0].PLATE_NUM;

              this.VM.appointment = data.appointment
              this.VM.facility = data.facility;
              if(data.facility && data.facility.length > 0){
                this.PurposeCode = data.facility[0].PurposeCode;
                this.addAppointmentModel.Remarks = data.facility[0].Remarks;
                this.onedit = true;
              }
            }

            if(data.visitors.length == 0){
              this.VISITOR_SIZE = 0;
            }else{
              for(let items in data.visitors){
                if(items == "0"){
                  this.addAppointmentModel.VISITOR_ARRAY = ""+data.visitors[items].HOSTIC;
                } else{
                  this.addAppointmentModel.VISITOR_ARRAY = this.addAppointmentModel.VISITOR_ARRAY +","+data.visitors[items].HOSTIC;
                }
              }
              this.VISITOR_SIZE = this.addAppointmentModel.VISITOR_ARRAY.split(",").length;
            }

          }
        }
      });

      this.events.observeDataCompany().subscribe((data1:any) => {
          if (data1.action === 'facility:done') {
            console.log(""+ data1.title);
            this.facilitySlots = JSON.parse(data1.title);
            this.disableButton = this.facilitySlots.length == 0;
          }

      });
      if(this.hostSettings.isFacility){
        this.disableButton = true;
      }
  }

  async showToast(message1) {
    let toast = await this.toastCtrl.create({
      message: message1,
      duration: 3000,
      color: 'primary',
      position: 'bottom'
    });
    toast.present();
  }

  ionViewDidEnter() {
    if(this.QRObj.MAppId == AppSettings.LOGINTYPES.HOSTAPPT){
      this.loadMasterData();
    }else{
      this.loadVimsAppFacilityMasterList();
    }
  }

  GetHostAppSettings(){
    var params  = {
       "MAppId": AppSettings.LOGINTYPES.FACILITY,
       "HostIc":""
     }
     var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
     params.HostIc = JSON.parse(hostData).HOSTIC;
     this.apiProvider.GetHostAppSettings(params, false).then(
       (val) => {
         try{
           var result = JSON.parse(JSON.stringify(val));
           if(result){
            console.log(JSON.stringify(val));
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS,JSON.stringify(val));
            this.hostSettings = result.Table2[0];
            this.hostSettings.isFacility = true;
          }
         }catch(e){

         }

       },
       (err) => {
       }
     );
 }

  loadVimsAppFACILITYPURPOSELIST(){
    var params = { "RefSchoolSeqId": "",
     "RefBranchSeqId": "",
     "ParentPortalRegKey": AppSettings.API_DATABASE_NAME }
    this.apiProvider.VimsAppFacilityPurposeList(params).then(
      (val) => {
        var result = JSON.parse(JSON.stringify(val));
        if(result){
          this.VM.FACILITYPURPOSELIST = result;

          if(this.VM.facility && this.VM.facility[0]){
            for(var i1 = 0 ; i1 < this.VM.FACILITYPURPOSELIST.length ; i1++){
              if(this.VM.FACILITYPURPOSELIST[i1].PurposeCode == this.VM.facility[0].PurposeCode){
                this.addAppointmentModel.PurposeCode = this.VM.FACILITYPURPOSELIST[i1].PurposeCode;
                break;
              }
            }
          }
        }
      },
      (err) => {
        var message = "";
        if(err && err.message == "Http failure response for"){
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

  onChangePurpose(event){
    const PurposeCode = event.detail.value;
    console.log(""+ PurposeCode);
    this.PurposeCode = PurposeCode;

  }

  onChangeFacility(event){

    if (!this.edit) {
      const FacilityCode = event.detail.value;
      console.log(""+ FacilityCode);
      this.VM.FACILITYMASTERLIST.forEach(element => {
        if (element.FacilityCode === FacilityCode) {

        }
      });
      this.FacilityCode = FacilityCode;
      const navigationExtras: NavigationExtras = {
        state: {
          passData: { "FacilityCode": FacilityCode,
          "START_DATE":this.addAppointmentModel.START_DATE,
          "END_DATE":this.addAppointmentModel.END_DATE,
          "facility": this.VM.facility,
          "edit":this.edit
        }
        }
      };
      this.router.navigate(['facility-time-slot'], navigationExtras);
    }
  }

  loadVimsAppFacilityMasterList(){
    var params = { "RefSchoolSeqId": "",
     "RefBranchSeqId": "",
     "ParentPortalRegKey": AppSettings.API_DATABASE_NAME }
    this.apiProvider.VimsAppFacilityMasterList(params, true).then(
      (val) => {
        this.loadVimsAppFACILITYPURPOSELIST();
        var result = JSON.parse(JSON.stringify(val));
        if(result){

          var showlist = [];

          if(this.VM.facility && this.VM.facility[0]){
            for(var i = 0 ; i < result.length ; i++){
              if(result[i].FacilityCode == this.VM.facility[0].FacilityCode){
                this.addAppointmentModel.FacilityCode = result[i].FacilityCode;
                showlist[0] = result[i];
                break;
              }
            }
          }else{
            showlist = result;
          }
          if(this.edit){
            this.VM.FACILITYMASTERLIST = showlist;
          }else{
            this.VM.FACILITYMASTERLIST = result;
          }

         }
      },
      (err) => {
        this.loadVimsAppFACILITYPURPOSELIST();
      }
    );
  }

  loadMasterData(){
    var masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
    if(masterDetails){
      // this.VM.AVAIL_ROOMS = JSON.parse(masterDetails).Table1;
      this.VM.AVAIL_FLOOR = JSON.parse(masterDetails).Table2;
      // this.VM.AVAIL_REASONS = JSON.parse(masterDetails).Table3;

      if(this.VM.appointment&& this.VM.appointment[0]){
        this.addAppointmentModel.Room = this.VM.appointment[0].Room;
        this.addAppointmentModel.REASON = this.VM.appointment[0].REASON;
        this.addAppointmentModel.Floor = this.VM.appointment[0].Floor;
      }
    }else{
      this.apiProvider.GetMasterDetails().then(
        (val: any) => {
          var result = val;
          if(result){
            // this.VM.AVAIL_ROOMS = result.Table1;
            this.VM.AVAIL_FLOOR = result.Table2;
            // this.VM.AVAIL_REASONS = result.Table3;
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));


            if(this.VM.appointment && this.VM.appointment[0]){
              this.addAppointmentModel.Room = this.VM.appointment[0].Room;
              this.addAppointmentModel.REASON = this.VM.appointment[0].REASON;
              this.addAppointmentModel.Floor = this.VM.appointment[0].Floor;
            }
          }
        },
        (err) => {
        }
      );
    }
  }

  proceedUpdate(){



    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      this.addAppointmentModel.STAFF_IC = JSON.parse(hostData).HOSTIC;
      this.addAppointmentModel.Booked_By = "Host";
      this.addAppointmentModel.bookedby_id = JSON.parse(hostData).HOSTIC?JSON.parse(hostData).HOSTIC:JSON.parse(hostData).HOST_ID;

      this.addAppointmentModel.CC = "";
      this.addAppointmentModel.RemarksforSecurity = "";
      this.addAppointmentModel.Location = "";
      this.addAppointmentModel.Category = "";
    }

    if(this.addAppointmentModel.START_DATE.split("T").length>0){
      this.addAppointmentModel.START_DATE = this.addAppointmentModel.START_DATE.split("T")[0];
    }
    if(this.addAppointmentModel.END_DATE.split("T").length>0){
      this.addAppointmentModel.END_DATE = this.addAppointmentModel.END_DATE.split("T")[0];
    }
    if(!this.VM.appointment[0].vehicle_no){
      this.VM.appointment[0].vehicle_no  = "";
    }

    var strLength = this.addAppointmentModel.VISITOR_ARRAY.length;
    var HostSeqId = this.addAppointmentModel.VISITOR_ARRAY;
    for(var j = 0;j < strLength; j++) {
      HostSeqId = HostSeqId.replace(",", "_");
    }
    if(!strLength || strLength == 0){
      HostSeqId = "";
    }
    var param = {
      "RefSchoolSeqId": "",
      "RefBranchSeqId": "",
      "BookingID": this.VM.appointment[0].appointment_group_id,
      "StaffList": HostSeqId,
      "Remarks": this.addAppointmentModel.Remarks,
      "CreatedBy":"",
      "LoginRegKey":"",
      "ParentPortalRegKey": AppSettings.API_DATABASE_NAME
    };
    if(hostData){
        param.CreatedBy = JSON.parse(hostData).HOSTIC;
    }

    this.apiProvider.VimsAppUpdateFacilityBookings(param).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result){

          var Status = result[0].Status;

          switch(Status){
            case "1":
            let toast = await this.toastCtrl.create({
              message: this.T_SVC['ALERT_TEXT.FACILITY_UPDATE_SUCCESS'],
              duration: 3000,
              color: 'primary',
              position: 'bottom'
            });
            toast.present();
            this.navCtrl.pop().then((data)=>{
              this.navCtrl.pop();
            });
            break
            case "0":
              let alert = this.alertCtrl.create({
                header: 'Error !',
                message: this.T_SVC['ALERT_TEXT.USER_NOT_FOUND'],
                cssClass:'',
                buttons: ['Okay']
              });
              (await alert).present();
            break;
            case "2":
              alert = this.alertCtrl.create({
                header: 'Error !',
                message:  this.T_SVC['ALERT_TEXT.FACILITY_SESSION_EXPIRED'],
                cssClass:'',
                buttons: ['Okay']
              });
              (await alert).present();
            break;
            case "3":
              alert = this.alertCtrl.create({
                header: 'Error !',
                message: this.T_SVC['ALERT_TEXT.MEMBER_NOT_FOUND'],
                cssClass:'',
                buttons: ['Okay']
              });
              (await alert).present();
            break;
          }



         return;
      }

      let alert = await this.alertCtrl.create({
        header: 'Error !',
        message: '',
        cssClass: '',
        buttons: ['Okay']
      });
      alert.present();
      // let toast = this.toastCtrl.create({
      //   message: 'Server Error',
      //   duration: 3000,
      //   position: 'bottom'
      // });
      // toast.present();
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
            if(result && result["Table2"] && result["Table2"][0]){
              message = result["Table2"][0].description;
            } else if(result && result["Table1"] && result["Table1"][0]){
              message = result["Table1"][0].description;
            } else if(result.message){
              message = result.message;
            } else{
              message = " Unknown";
            }
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

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  proceedToNextStep(){

    if(this.hostSettings.PurposeEnabled && this.hostSettings.PurposeRequired && !this.PurposeCode){
      this.showToast(this.T_SVC['ALERT_TEXT.SELECT_PURPOSE']);
      return;
    }else if((!this.hostSettings.PurposeEnabled || !this.hostSettings.PurposeRequired) && !this.PurposeCode){
      this.PurposeCode = 0;
    }

    if(this.edit){
      this.proceedUpdate();
      return;
    }




    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);

    if(this.addAppointmentModel.START_DATE.split("T").length>0){
      this.addAppointmentModel.START_DATE = this.addAppointmentModel.START_DATE.split("T")[0];
    }
    if(this.addAppointmentModel.END_DATE.split("T").length>0){
      this.addAppointmentModel.END_DATE = this.addAppointmentModel.END_DATE.split("T")[0];
    }

    if(!this.addAppointmentModel.vehicle_no){
      this.addAppointmentModel.vehicle_no = "";
    }

    var strLength = this.addAppointmentModel.VISITOR_ARRAY.length;
    var HostSeqId = this.addAppointmentModel.VISITOR_ARRAY;
    for(var j = 0;j < strLength; j++) {
      HostSeqId = HostSeqId.replace(",", "_");
    }
    if(!strLength || strLength == 0){
      HostSeqId = "";
    }

       //  "DateSelect": "2019-01-24T12:55:00,2019-01-24T13:05:00_2019-01-24T13:05:00,2019-01-24T13:15:00_",
       var DateSelect = "";
       if(this.facilitySlots){
         for(var i =0 ; i < this.facilitySlots.length ; i++){
           var sTime = this.facilitySlots[i].StartTime;
           var eTime = this.facilitySlots[i].EndTime;
             if(DateSelect){
               DateSelect = DateSelect+ sTime.split(".")[0] + "," + eTime.split(".")[0] +"_";
             }else{
               DateSelect = sTime.split(".")[0] + "," + eTime.split(".")[0] +"_";
             }
         }
        //  param.DateSelect = DateSelect;
       }

  var param = {
      "RefSchoolSeqId": "",
      "RefBranchSeqId": "",
      "HostSeqId": HostSeqId,
      "StaffSeqId": "",
      "BookingID": "",
      "FacilityCode": this.FacilityCode,
      "PurposeCode": this.PurposeCode,
      "Remarks": this.addAppointmentModel.Remarks,
      "StartDate": this.dateformat.transform(this.addAppointmentModel.START_DATE+"", "yyyy-MM-dd"),
      "EndDate": this.dateformat.transform(this.addAppointmentModel.END_DATE+"", "yyyy-MM-dd"),
      "DateSelect": DateSelect,
      "Frequently": "10",
      "IsVimsAppointment":"0",
      "ParentPortalRegKey": AppSettings.API_DATABASE_NAME
    };
    if(hostData){
        param.StaffSeqId = JSON.parse(hostData).HOSTIC;
    }


    this.apiProvider.VimsAppFacilityBookingSave(param).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result && result.Status == 0){
          let alert = await this.alertCtrl.create({
            header: 'Failed !',
            cssClass: '',
            message: this.T_SVC['ALERT_TEXT.SLOT_OCCUPIED'],
            buttons: ['Okay']
          });
          alert.present();
          return;
      }else if(result && result.Status == 1){
        this.showAlert(this.T_SVC['FACILITY_BOOKING.ADD_APPOINTMENT_DONE_SUCCESS']);
        this.events.publishDataCompany({
          action: 'addAppointmentSuccess',
          title: '',
          message: ''
        });
        this.navCtrl.navigateRoot('').then((data)=> {
          if(this.QRObj && this.QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1){
            this.router.navigateByUrl("facility-booking-history");
          }else{
            var page = {
              component : "home-view"
            }
            this.events.publishDataCompany({
              action: 'ChangeTab',
              title:  page,
              message: 0
            });
          }
        });
        // this.events.publish('addAppointmentSuccess');

        return;
      }else if(result && result.Status == 2){
        let alert = await this.alertCtrl.create({
          header: 'Failed !',
          cssClass: '',
          message: this.T_SVC['ALERT_TEXT.DUPLICATE_BOOKING'],
          buttons: ['Okay']
        });
        alert.present();
        return;
      }else if(result && result.Status == 3){
        let alert = await this.alertCtrl.create({
          header: 'Failed !',
          cssClass: '',
          message: this.T_SVC['ALERT_TEXT.SLOT_EXPIRED'],
          buttons: ['Okay']
        });
        alert.present();
        return;
      }else if(result && result.Status == 4){
        let alert = await this.alertCtrl.create({
          header: 'Error !',
          message: this.T_SVC['ALERT_TEXT.MEMBER_NOT_FOUND'],
          cssClass: '',
          buttons: ['Okay']
        });
        alert.present();
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
            if(result && result["Table2"] && result["Table2"][0]){
              message = result["Table2"][0].description;
            }else if(result && result["Table1"] && result["Table1"][0]){
              message = result["Table1"][0].description;
            } else if(result.message){
              message = result.message;
            } else{
              message = " Unknown";
            }
        }
        let alert = await this.alertCtrl.create({
          header: 'Error !',
          cssClass: '',
          message: message,
          buttons: ['Okay']
        });
        alert.present();
      }
    );
  }

  async showAlert(msg){
    let alert = await this.alertCtrl.create({
      header: 'Notification',
      message: msg,
      cssClass: '',
      buttons: ['Okay']
    });
    alert.present();
  }

  ngOnInit() {
  }

}
