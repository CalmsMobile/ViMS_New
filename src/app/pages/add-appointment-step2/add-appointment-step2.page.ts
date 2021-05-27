import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController, AlertController, ToastController, ModalController, IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AddAppointmentAlertPopupComponent } from 'src/app/components/add-appointment-alert/add-appointment-alert-popup';
import { AddAppointmentModel } from 'src/app/model/addAppointmentModel';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-add-appointment-step2',
  templateUrl: './add-appointment-step2.page.html',
  styleUrls: ['./add-appointment-step2.page.scss'],
})
export class AddAppointmentStep2Page implements OnInit {

  @ViewChild (IonContent) content:IonContent;

  addAppointmentModel = new AddAppointmentModel();
  START_TIME = "PM";
  END_TIME = "PM";
  VISITOR_SIZE = 0;
  edit = false;
  onedit = false;
  disableButton = false;
  facilitySlots = [];
  FacilityCode = 0;
  PurposeCode = 0;
  hostSettings : any = {};
  GenderList = [
    {"name": "Male", "value": "1"},
    {"name": "Female", "value": "2"}
    ];

   MaritalList= [
      {"name": "Single", "value": "1"},
      {"name": "Married", "value": "2"}
      ];
  T_SVC:any;
  VM = {
    appointment:{},
    facility: [],
    AVAIL_ROOMS:[],
    AVAIL_REASONS:[],
    AVAIL_DEPART:[{"SEQID":1,"dept_id":"1","dept_desc":"Department A","dept_company_refcode":"D1","dept_Floor":"1"}, {"SEQID":3,"dept_id":"SOFTWARE","dept_desc":"SOFTWARE","dept_company_refcode":"1","dept_Floor":"NULL"}],
    AVAIL_FLOOR:[],
    AVAIL_CHECK_IN_TYPE:[{"id":"3","chkin_type":"All"},{"id":"2","chkin_type":"Self Check-in Kiosk"},{"id":"3","chkin_type":"Security Check-in"}],
    FACILITYMASTERLIST:[],
    FACILITYPURPOSELIST:[]

  }
  isWomen : any = false;
  appointment:FormGroup;
  visitorsArray :any = [];
  QRObj :any = {

  }
  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public events: EventsService,
    private router: Router,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    public apiProvider: RestProvider,
    private translate:TranslateService) {

      this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'ALERT_TEXT.SETTINGS_NOT_FOUND',
      'ALERT_TEXT.SELECT_PURPOSE',
      'ADD_APPOIN.ADD_APPOINTMENT_DONE_SUCCESS',
      'ALERT_TEXT.SLOT_OCCUPIED',
      'ALERT_TEXT.DUPLICATE_BOOKING',
      'ALERT_TEXT.SLOT_EXPIRED',
      'ALERT_TEXT.MEMBER_NOT_FOUND',
      'ALERT_TEXT.UPDATE_APPOINTMENT_SUCCESS']).subscribe(t => {
        this.T_SVC = t;
      });

      var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
      var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if(qrInfo && JSON.parse(qrInfo) && JSON.parse(qrInfo).MAppId){
        this.QRObj = JSON.parse(qrInfo);
      }
      if(settings && JSON.parse(settings)){
        try{
          if(this.QRObj && this.QRObj.MAppId){
            if(this.QRObj.MAppId == AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP){
              var sett = JSON.parse(settings).Table1;
              if(sett && sett.length > 0){
                this.hostSettings = sett[0];
                this.hostSettings.available = true;
                this.hostSettings.isFacility = true;
              }else{
                this.showToast(this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND']);
              }

            }else{
              sett = JSON.parse(settings).Table1;
              if(sett && sett.length > 0){
                this.hostSettings = sett[0];
                this.hostSettings.available = true;
                this.hostSettings.isFacility = false;
              }else{
                this.showToast(this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND']);
              }

            }

          }
          // this.hostSettings.NameRequired = false;
        }catch(e){

        }
      }

      this.appointment = new FormGroup({
        facility: new FormControl('', []),
        purpose: new FormControl('', (this.hostSettings && ((this.hostSettings.isFacility && this.hostSettings.PurposeEnabled && this.hostSettings.PurposeRequired) || (!this.hostSettings.isFacility && this.hostSettings.PurposeEnabled && this.hostSettings.PurposeRequired))) ? ([Validators.required]) : []),
        remarks: new FormControl('', (this.hostSettings && ((this.hostSettings.isFacility && this.hostSettings.RemarksEnabled && this.hostSettings.RemarksRequired) || (!this.hostSettings.isFacility && this.hostSettings.RemarksEnabled && this.hostSettings.RemarksRequired))) ? ([Validators.required]) : []),
        vehicle_no: new FormControl('', (this.hostSettings && ((this.hostSettings.isFacility && this.hostSettings.VehicleNumberEnabled && this.hostSettings.VehicleNumberRequired) || (!this.hostSettings.isFacility && this.hostSettings.VehicleNumberEnabled && this.hostSettings.VehicleNumberRequired))) ? ([Validators.required]) : []),
        floor: new FormControl('', (this.hostSettings && !this.hostSettings.isFacility &&this.hostSettings.FloorEnabled && this.hostSettings.FloorRequired) ? ([Validators.required]) : []),
        room: new FormControl('', (this.hostSettings && !this.hostSettings.isFacility && this.hostSettings.RoomEnabled && this.hostSettings.RoomRequired) ? ([Validators.required]) : []),
        gender: new FormControl('', [])
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
            this.addAppointmentModel.START_TIME = data.fromTime;
            this.addAppointmentModel.END_TIME = data.toTime;
            if(this.addAppointmentModel.START_TIME.split(":")[0] < 12){
              this.START_TIME = data.fromTime+" AM";
            }else{
              this.START_TIME = data.fromTime+" PM";
            }
            if(this.addAppointmentModel.END_TIME.split(":")[0] < 12){
              this.END_TIME = data.toTime + " AM";
            }else{
              this.END_TIME = data.toTime + " PM";
            }

            if(data.appointment&& data.appointment[0]){
              this.edit = true;
              this.addAppointmentModel.Message = data.appointment[0].Message;
              this.addAppointmentModel.Remarks = data.appointment[0].Remarks;
              this.addAppointmentModel.vehicle_no = data.appointment[0].PLATE_NUM;
              this.VM.appointment = data.appointment
              this.VM.facility = data.facility;
              if(data.facility && data.facility.length > 0){
                this.addAppointmentModel.REASON = data.facility[0].PurposeName;
                this.PurposeCode = data.facility[0].PurposeCode;

                this.onedit = true;
              }else{
                setTimeout(() => {
                  this.addAppointmentModel.REASON = data.appointment[0].REASON;
                }, 1000);
                // this.PurposeCode = data.appointment[0].PurposeCode;
              }
            }
            this.visitorsArray =  data.visitors;
            this.VISITOR_SIZE = this.visitorsArray.length;
          }
        }
      });

      if(this.hostSettings.isFacility){
        this.disableButton = true;
      }
      this.events.observeDataCompany().subscribe(async (data: any) => {
        if (data.action === 'facility:done') {
          this.facilitySlots = JSON.parse(data.title);
          this.disableButton = this.facilitySlots.length == 0;
          console.log(""+ data);
        }
      });
  }

  ionViewDidEnter() {

    if(this.QRObj.MAppId == AppSettings.LOGINTYPES.HOSTAPPT){
      this.loadMasterData();
    }else{
      this.loadVimsAppFacilityMasterList();
      this.loadVimsAppFACILITYPURPOSELIST();
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

  onChangeGender(gender){
    this.isWomen = (gender.name == 'Female');
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
              if(this.VM.FACILITYPURPOSELIST[i1].PurposeName == this.VM.facility[0].PurposeName){
                this.addAppointmentModel.PurposeCode = this.VM.FACILITYPURPOSELIST[i1].PurposeCode;
                break;
              }
            }
          }else{
            for(var i2 = 0 ; i2 < this.VM.FACILITYPURPOSELIST.length ; i2++){
              if(this.VM.FACILITYPURPOSELIST[i2].PurposeName == this.addAppointmentModel.REASON){
                this.PurposeCode = this.addAppointmentModel.PurposeCode = this.VM.FACILITYPURPOSELIST[i2].PurposeCode;
                this.onedit = true;
                // this.addAppointmentModel.PurposeName = this.VM.FACILITYPURPOSELIST[i2].PurposeName;
                break;
              }
            }
          }
        }
        var purposeList = [{
          "PurposeCode": 100,
          "PurposeName": "General Checkup"
        },
        {
          "PurposeCode": 101,
          "PurposeName": "Diabetes"
        },
        {
          "PurposeCode": 102,
          "PurposeName": "Eyesight"
        },
        {
          "PurposeCode": 103,
          "PurposeName": "Allergies"
        },
        {
          "PurposeCode": 104,
          "PurposeName": "For Blood Pressure"
        }
        ];
        // this.VM.FACILITYPURPOSELIST = purposeList;
      },
      (err) => {
      }
    );
  }

  onChangePurpose(event){
    const PurposeCode = event?event.detail.value: '';
    console.log(""+ PurposeCode);
    this.PurposeCode = PurposeCode;
    this.VM.FACILITYPURPOSELIST.forEach(element => {
      if (element.PurposeCode === PurposeCode) {
        this.addAppointmentModel.REASON = element.PurposeName;
      }
    });

  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  onChangeFacility(event: any){
    const FacilityCode = event?event.detail.value: '';
    console.log(""+ FacilityCode);
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

  loadVimsAppFacilityMasterList(){
    var params = { "RefSchoolSeqId": "",
     "RefBranchSeqId": "",
     "ParentPortalRegKey": AppSettings.API_DATABASE_NAME }
    this.apiProvider.VimsAppFacilityMasterList(params, true).then(
      (val) => {
        var result = JSON.parse(JSON.stringify(val));
        if(result){

          var showlist = [];

          if(this.VM.facility && this.VM.facility[0]){
            for(var i = 0 ; i < result.length ; i++){
              if(result[i].FacilityName == this.VM.facility[0].FacilityName){
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
            var doctors = [{"FacilityCode":101,
            "FacilityName": "Dr. Pravina Patel"
            },
            {"FacilityCode":102,
            "FacilityName": "Dr. Alok Bajpai"
            },
            {"FacilityCode":103,
            "FacilityName": "Dr. Sanjai Rastogi"
            },
            {"FacilityCode":104,
            "FacilityName": "Dr. Rakesh Chandra"
            },
            {"FacilityCode":105,
            "FacilityName": "Dr. K. K. Dokania"
            },
            {"FacilityCode":106,
            "FacilityName": "Dr. S. S. Singhal"
            }];
            // this.VM.FACILITYMASTERLIST = doctors;
          }
        }
      },
      (err) => {
      }
    );
  }

  loadMasterData(){
    var masterDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
    if(masterDetails){
      this.VM.AVAIL_ROOMS = JSON.parse(masterDetails).Table8;
      this.VM.AVAIL_FLOOR = JSON.parse(masterDetails).Table2;
      var newFloors = [];
      for (var i = 0; i <= this.VM.AVAIL_FLOOR.length - 1; i++) {
        var duplicate = false;
        for(var j = newFloors.length - 1; j >= 0; j--){
            if(this.VM.AVAIL_FLOOR[i].floor_id == newFloors[j].floor_id){
              duplicate = true;
              break;
            }
        }
        if(!duplicate){
          newFloors.push(this.VM.AVAIL_FLOOR[i]);
        }

      }
      //console.log(JSON.stringify(newFloors));
      this.VM.AVAIL_FLOOR = newFloors;

      this.VM.AVAIL_REASONS = JSON.parse(masterDetails).Table3;
      var neePurpose = [];
      for (var i1 = 0; i1 <= this.VM.AVAIL_REASONS.length - 1; i1++) {
        duplicate = false;
        for(var j1 = neePurpose.length - 1; j1 >= 0; j1--){
            if(this.VM.AVAIL_REASONS[i1].visitpurpose_id == neePurpose[j1].visitpurpose_id){
              duplicate = true;
              break;
            }
        }
        if(!duplicate){
          neePurpose.push(this.VM.AVAIL_REASONS[i1]);
        }

      }
      // console.log(JSON.stringify(neePurpose));
      this.VM.AVAIL_REASONS = neePurpose;

      setTimeout(() => {
        if(this.VM.appointment&& this.VM.appointment[0]){
          this.addAppointmentModel.Room = +this.VM.appointment[0].Room;
          this.addAppointmentModel.REASON = this.VM.appointment[0].REASON;
          this.addAppointmentModel.Floor = this.VM.appointment[0].Floor;
        }
      }, 100);
    }
  }

  proceedUpdate(){

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      this.addAppointmentModel.STAFF_IC = JSON.parse(hostData).HOSTIC;
      this.addAppointmentModel.Booked_By = "Host";
      this.addAppointmentModel.bookedby_id = JSON.parse(hostData).HOST_ID;

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
    var BookingID = "";
    if(this.VM.appointment && this.VM.appointment[0]){
      BookingID = this.VM.appointment[0].FacilityBookingID;
    }

    var DateSelect = "";
    if(this.hostSettings.isFacility && this.facilitySlots){
      for(var i =0 ; i < this.facilitySlots.length ; i++){
        var sTime = this.facilitySlots[i].StartTime;
        var eTime = this.facilitySlots[i].EndTime;
          if(DateSelect){
            DateSelect = DateSelect+sTime.split(".")[0] + "," + eTime.split(".")[0]+ "_";
          }else{
            DateSelect = sTime.split(".")[0] + "," + eTime.split(".")[0] + "_";
          }
      }
      // param.DateSelect = DateSelect;
    }
    if(this.visitorsArray){
      for(var i1 = 0; i1 < this.visitorsArray.length ; i1++){
        var item = this.visitorsArray[i1];
        delete item.visitor_RemoveImg;
        delete item.isChecked;
      }
    }
    var params = {
      "STAFF_IC": this.addAppointmentModel.STAFF_IC,
      "VISITOR_ARRAY": JSON.stringify(this.visitorsArray),
      "REASON":this.addAppointmentModel.REASON,
      "START_DATE": this.addAppointmentModel.START_DATE + " "+ this.addAppointmentModel.START_TIME,
      "END_DATE": this.addAppointmentModel.END_DATE+ " "+this.addAppointmentModel.END_TIME,
      "START_TIME": this.addAppointmentModel.START_TIME,
      "END_TIME": this.addAppointmentModel.END_TIME,
      "CC": this.addAppointmentModel.CC,
      "Message": this.addAppointmentModel.Message,
      "Floor": this.addAppointmentModel.Floor,
      "Room": this.addAppointmentModel.Room,
      "Remarks": this.addAppointmentModel.Remarks,
      "RemarksforSecurity":this.addAppointmentModel.RemarksforSecurity,
      "Booked_By": this.addAppointmentModel.Booked_By,
      "bookedby_id": this.addAppointmentModel.bookedby_id,
      "Location": this.addAppointmentModel.Location,
      "Category": this.addAppointmentModel.Category,
      "appointment_group_id": this.VM.appointment[0].appointment_group_id,
      "PLATE_NUM":this.addAppointmentModel.vehicle_no,
      "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
      "FacilityBooking": {
        "RefSchoolSeqId": "",
        "RefBranchSeqId": "",
        "StaffSeqId": this.addAppointmentModel.STAFF_IC,
        "HostSeqId": "",
        "BookingID": BookingID,
        "FacilityCode": this.FacilityCode,
        "PurposeCode": this.PurposeCode,
        "DateSelect": DateSelect,
        "Frequently": "10",
        "ParentPortalRegKey": AppSettings.API_DATABASE_NAME
      }
    };
    this.apiProvider.EditAppointment(params).then(
      async (val) => {
        var result = JSON.parse(val.toString());

        if(result.Table && result.Table[0].Code == 10){
          var showAlert = false;
          var messageArray = [];
          if(result.Table1){
            for(var i = 0 ; i < result.Table1.length ; i++){
              var item = result.Table1[i];
              if(!item.UploadStatus && item.UploadDesc){
                showAlert = true;
                messageArray[messageArray.length] = item;
              }
            }
          }

          if(showAlert){

            const presentModel = await this.modalCtrl.create({
              component: AddAppointmentAlertPopupComponent,
              componentProps: {
                data: messageArray
              },
              showBackdrop: true,
              mode: 'ios',
              cssClass: 'appointmentModel'
            });
            presentModel.onWillDismiss().then((data) => {
            });
            return await presentModel.present();
          }
          this.showAlert(this.T_SVC['ALERT_TEXT.UPDATE_APPOINTMENT_SUCCESS']);
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, "");
          this.navCtrl.navigateRoot('home-view');
          return;
      }
      let alert = await this.alertCtrl.create({
        header: 'Error !',
        message: '',
        cssClass: 'alert-danger',
        buttons: ['Okay']
      });
      alert.present();
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
            if(result && result["Table2"] && result["Table2"][0]){
              message = result["Table2"][0].description;
            } else if(result && result["Table1"] && result["Table1"][0]){
              message = result["Table1"][0].description;
            } else if(result.message){
              message = result.message;
            } else {
              message = " Unknown";
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

  async showAlert(msg){
    let alert = await this.alertCtrl.create({
      header: 'Notification',
      message: msg,
      cssClass: 'alert-danger',
      buttons: ['Okay']
    });
    alert.present();
  }

  async proceedToNextStep(){

    if(this.hostSettings.isFacility){

      if(this.hostSettings.PurposeEnabled && this.hostSettings.PurposeRequired && !this.PurposeCode){
        let toast = await this.toastCtrl.create({
          message: this.T_SVC['ALERT_TEXT.ALERT_TEXT.SELECT_PURPOSE'],
          duration: 3000,
          color: 'primary',
          cssClass: 'alert-danger',
          position: 'bottom'
        });
        toast.present();
        return;
      }else if((!this.hostSettings.PurposeEnabled || !this.hostSettings.PurposeRequired) && !this.PurposeCode){
        this.PurposeCode = 0;
      }

    }

    if(!this.addAppointmentModel.Message){
      this.addAppointmentModel.Message = "";
    }


    if(this.edit){
      this.proceedUpdate();
      return;
    }

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      this.addAppointmentModel.STAFF_IC = JSON.parse(hostData).HOSTIC;
      this.addAppointmentModel.Booked_By = "Host";
      this.addAppointmentModel.bookedby_id = JSON.parse(hostData).HOST_ID;

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

    if(!this.addAppointmentModel.vehicle_no){
      this.addAppointmentModel.vehicle_no = "";
    }

    var DateSelect = "";
    if(this.hostSettings.isFacility && this.facilitySlots){
      for(var i =0 ; i < this.facilitySlots.length ; i++){
        var sTime = this.facilitySlots[i].StartTime;
        var eTime = this.facilitySlots[i].EndTime;
          if(DateSelect){
            DateSelect = DateSelect+sTime.split(".")[0] + "," + eTime.split(".")[0]+ "_";
          }else{
            DateSelect = sTime.split(".")[0] + "," + eTime.split(".")[0] + "_";
          }
      }
      // param.DateSelect = DateSelect;
    }

    var endDate = this.addAppointmentModel.END_DATE+ " "+this.addAppointmentModel.END_TIME;
    var startDate = this.addAppointmentModel.START_DATE + " "+ this.addAppointmentModel.START_TIME;
    if(this.hostSettings.isFacility && this.facilitySlots){
      var startTime = startDate;
      var endTime = endDate;
      if(this.facilitySlots.length > 0){
        startTime = this.facilitySlots[0].StartTime;
        endTime = this.facilitySlots[this.facilitySlots.length - 1].EndTime;
      }
      startDate = startTime.replace("T", " ");
      endDate = endTime.replace("T", " ");

    }

    var params = {
      "STAFF_IC": this.addAppointmentModel.STAFF_IC,
      "SEQID": JSON.parse(hostData).SEQID,
      "VISITOR_ARRAY": JSON.stringify(this.visitorsArray),
      "REASON":this.addAppointmentModel.REASON,
      "START_DATE": startDate,
      "END_DATE": endDate,
      "START_TIME": this.addAppointmentModel.START_TIME,
      "END_TIME": this.addAppointmentModel.END_TIME,
      "CC": this.addAppointmentModel.CC,
      "Message": this.addAppointmentModel.Message,
      "Floor": this.addAppointmentModel.Floor,
      "Room": this.addAppointmentModel.Room,
      "Remarks": this.addAppointmentModel.Remarks,
      "RemarksforSecurity":this.addAppointmentModel.RemarksforSecurity,
      "Booked_By": this.addAppointmentModel.Booked_By,
      "bookedby_id": this.addAppointmentModel.bookedby_id,
      "Location": this.addAppointmentModel.Location,
      "Category": this.addAppointmentModel.Category,
      "PLATE_NUM":this.addAppointmentModel.vehicle_no,
      "FacilityBooking":{
        "RefSchoolSeqId": "",
        "RefBranchSeqId": "",
        "StaffSeqId": JSON.parse(hostData).HOSTIC,
        "HostSeqId": "",
        "BookingID": "",
        "FacilityCode": this.FacilityCode,
        "PurposeCode": this.PurposeCode,
        "DateSelect": DateSelect,
        "Frequently": "10",
        "ParentPortalRegKey": AppSettings.API_DATABASE_NAME
      }

};

    this.apiProvider.AddAppointment(params).then(
      async (val) => {
        var result = JSON.parse(val.toString());
        if(result.Table && result.Table[0].Code == 10){
          var showAlert = false;
          var messageArray = [];
          if(result.Table1){
            for(var i = 0 ; i < result.Table1.length ; i++){
              var item = result.Table1[i];
              if(item.UploadStatus && item.UploadDesc){
                showAlert = true;
                messageArray[messageArray.length] = item;
              }
            }
          }
          this.showAlert(this.T_SVC['ADD_APPOIN.ADD_APPOINTMENT_DONE_SUCCESS']);
          this.apiProvider.dismissLoading();
          this.events.publishDataCompany({
            action: 'addAppointmentSuccess1',
            title: showAlert,
            message: messageArray
          });
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, "");
          this.navCtrl.navigateRoot('home-view').then((data)=>{
            setTimeout(() => {
              this.events.publishDataCompany({
                action:'RefreshUpcoming',
                title: 'RefreshUpcoming',
                message: 0
              });
            }, 1000);
            this.apiProvider.dismissLoading();
          });

          return;
      }
      let toast = await this.toastCtrl.create({
        message: 'Server Error',
        duration: 3000,
        color: 'primary',
        cssClass: 'alert-danger',
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
            if(result && result["Table2"] && result["Table2"][0]){
              message = result["Table2"][0].description;
            }else if(result && result["Table1"] && result["Table1"][0]){
              message = result["Table1"][0].description;
            }else if(result && result.Table && result.Table[0]){
              var output = result.Table[0];
              if(output && output.Status == 0){
                let alert = await this.alertCtrl.create({
                  header: 'Failed !',
                  message: this.T_SVC['ALERT_TEXT.SLOT_OCCUPIED'],
                  cssClass: 'alert-danger',
                  buttons: ['Okay']
                });
                alert.present();
                return;
              }else if(output && output.Status == 2){
                let alert = await this.alertCtrl.create({
                  header: 'Failed !',
                  message: this.T_SVC['ALERT_TEXT.DUPLICATE_BOOKING'],
                  cssClass: 'alert-danger',
                  buttons: ['Okay']
                });
                alert.present();
                return;
              }else if(output && output.Status == 3){
                let alert = await this.alertCtrl.create({
                  header: 'Failed !',
                  cssClass: 'alert-danger',
                  message: this.T_SVC['ALERT_TEXT.SLOT_EXPIRED'],
                  buttons: ['Okay']
                });
                alert.present();
                return;
              } else if(output && output.Status == 4){
                let alert = await this.alertCtrl.create({
                  header: 'Error !',
                  message: this.T_SVC['ALERT_TEXT.MEMBER_NOT_FOUND'],
                  cssClass: 'alert-danger',
                  buttons: ['Okay']
                });
                alert.present();
                return;
              }

            } else if(result && result[0] && result[0].Code == 20){
              message = result[0].Description;
            } else if(result.message){
              message = result.message;
            } else{
              message = " Unknown";
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

  ionViewWillEnter(){
    // this.content.scrollToTop();
  }

  ngOnInit() {
  }

}
