import { Content } from '@angular/compiler/src/render3/r3_ast';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { NavController, NavParams, AlertController, ToastController, ModalController, ActionSheetController, IonItemSliding } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AddAppointmentAlertPopupComponent } from 'src/app/components/add-appointment-alert/add-appointment-alert-popup';
import { AddAppointmentModel } from 'src/app/model/addAppointmentModel';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.page.html',
  styleUrls: ['./add-appointment.page.scss'],
})
export class AddAppointmentPage implements OnInit {

  @ViewChild('visitorsList') visitorsList: any;
  // @ViewChild(Navbar) navBar: Navbar;
  @ViewChild(Content) content: Content;
  imageURL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  hoursMinutes = new Date().toString().split(':');
  imageURLType = '&RefType=VP&Refresh='+ new Date().getTime();
  imageURLTypeHOST = '&RefType=HP&Refresh='+ new Date().getTime();
  imageURLTypeVPB = '&RefType=VPB&Refresh='+ new Date().getTime();
  newImage = "&tes='test'";
  addAppointmentModel = new AddAppointmentModel();
  T_SVC:any;
  VM = {
    "visitors":[],
    facility : [],
    fromDate: new Date(),
    toDate: new Date(),
    fromTime:"02:02",
    toTime:"02:02",
    fromTimeSession:"AM",
    toTimeSession:"AM",
    appointment: {}
  }
  FACILITYMASTERLIST = [];
  contactsarray:any = [];
  hostSettings : any = {};
  minDate: any = "";
  edit = false;
  hostData : any = {};
  QRObj : any = {};
  showFacility = true;
  passData: any ={};
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController,
    public events: EventsService,
    private toastCtrl:ToastController,
    private datePicker: DatePicker,
    private router: Router,
    private route: ActivatedRoute,
    private modalCtrl : ModalController,
    public apiProvider: RestProvider,
    private dateformat : DateFormatPipe,
    private actionsheetCtrl: ActionSheetController,
    private translate:TranslateService) {
      this.translate.get([
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
        'ADD_APPOIN.ADD_APPOINTMENT_DONE_SUCCESS',
        'ALERT_TEXT.UPDATE_APPOINTMENT_SUCCESS',
        'ALERT_TEXT.SLOT_OCCUPIED',
        'ALERT_TEXT.DUPLICATE_BOOKING',
        'ALERT_TEXT.SLOT_EXPIRED',
        'ALERT_TEXT.MEMBER_NOT_FOUND',
        'ALERT_TEXT.REMOVE_VISITOR',
        'ALERT_TEXT.SETTINGS_NOT_FOUND']).subscribe(t => {
          this.T_SVC = t;
      });



      var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      this.QRObj = JSON.parse(qrInfo);
      var today = new Date();
      var hostDetails = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      if(hostDetails){
        this.hostData = JSON.parse(hostDetails);
      }


      if(this.QRObj && this.QRObj.MAppId == AppSettings.LOGINTYPES.HOSTAPPT){
        this.showFacility = false;
      }

      var hours = today.getHours();
      var min = today.getMinutes();
      var minutes = ""+min;
      var ampm = hours >= 12 ? 'PM' : 'AM';
      minutes = min < 10 ? '0'+minutes : minutes;

      var strTime = hours + ':' + minutes;
      this.VM.fromTime = strTime;
      this.VM.fromTimeSession = ampm;

      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var ddd = ""+dd;
      var mmm = ""+mm;
      var yyyy = today.getFullYear();
      if(dd<10){
        ddd='0'+dd;
      }
      if(mm<10){
        mmm='0'+mm;
      }
    this.minDate = yyyy+'-'+mmm+"-" + ddd;

    this.VM.fromDate = new Date();
    this.VM.toDate = new Date();
    this.VM.toDate.setTime(this.VM.toDate.getTime() + (AppSettings.APPOINTMENT_BufferTime * 60 * 1000));

    hours = this.VM.toDate.getHours();
    min = this.VM.toDate.getMinutes();
    minutes = ""+min;
    ampm = hours >= 12 ? 'PM' : 'AM';
    minutes = min < 10 ? '0'+minutes : minutes;
    var ToTime = hours + ':' + minutes;
    this.VM.toTime = ToTime;
    this.VM.toTimeSession = ampm;


      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + this.passData);
          this.edit = this.passData.edit;
      if(this.edit){
        this.VM.appointment = this.passData.appointment;
        this.VM.facility = this.passData.facility;
        var sdate = this.VM.appointment[0].START_DATE.split(" ")[0];
        var stime = this.VM.appointment[0].START_DATE.split("T")[1]

        var edate = this.VM.appointment[0].END_DATE.split(" ")[0];
        var etime = this.VM.appointment[0].END_DATE.split("T")[1]
        this.VM.fromDate = this.VM.appointment[0].START_DATE;
        this.VM.fromTime = stime.split(":")[0]+":"+stime.split(":")[1];
        this.VM.toDate = this.VM.appointment[0].END_DATE;
        this.VM.toTime =  etime.split(":")[0]+":"+etime.split(":")[1];

        if(stime.split(":")[0] > 11){
          this.VM.fromTimeSession = "PM";
        }

        if(etime.split(":")[0] > 11){
          this.VM.toTimeSession = "PM";
        }
        var visitorsLocal1 = [];
          for(let visitor in this.VM.appointment){
            var item = this.VM.appointment[visitor];
            var addVisitor = {
              checked: true,
              visitor_id: item.VISITOR_IC,
              VISITOR_IC: item.VISITOR_IC,
              VisitorDesignation:"",
              VisitorCategory: item.VisitorCategory,
              VISITOR_COMPANY_ID: item.VISITOR_COMPANY_ID,
              VISITOR_COMPANY: item.VISITOR_COMPANY,
              VISITOR_GENDER: item.VISITOR_GENDER,
              PLATE_NUM: item.PLATE_NUM,
              TELEPHONE_NO: item.TELEPHONE_NO,
              EMAIL: item.EMAIL,
              VISITOR_NAME: item.VISITOR_NAME ? item.VISITOR_NAME : "",
              SEQ_ID: "",
              VisitorBookingSeqId : item.VisitorBookingSeqId,
              VISITOR_IMG: item.VISITOR_IMG ? item.VISITOR_IMG : "",
              ImageChanged : item.ImageChanged,

            }
            visitorsLocal1.push(addVisitor);
          }


        this.VM.visitors = visitorsLocal1;

      }else{
        this.contactsarray = this.passData.data;
        if(this.passData.aData){
          this.VM = JSON.parse(this.passData.aData);
        }
        if(this.contactsarray){
          this.VM.visitors = this.contactsarray;
        }
      }
    }
    events.observeDataCompany().subscribe(async (data1: any) => {

      switch (data1.action) {
        case 'AddVisitorNew':
          const data = data1.title;
          const aData = data1.message;
          this.contactsarray = data;
          if(aData){
            this.VM = JSON.parse(aData);
          }
          if(this.contactsarray){
            this.VM.visitors = this.contactsarray;
          }
          break;
        case 'addAppointmentSuccess1':
          const showAlert = data1.title;
          const data2 = data1.message;
          this.VM = {
            "visitors":[],
            facility: [],
            fromDate: new Date(),
            toDate: new Date(),
            fromTime:"02:02",
            toTime:"02:02",
            fromTimeSession:"AM",
            toTimeSession:"AM",
            appointment: {},
          }
          var today = new Date();

          var hours = today.getHours();
          var min = today.getMinutes();
          var minutes = ""+min;
          var ampm = hours >= 12 ? 'PM' : 'AM';
          // hours = hours % 12;
          // hours = hours ? hours : 12;
          minutes = min < 10 ? '0'+minutes : minutes;

          var strTime = hours + ':' + minutes;
          this.VM.fromTime = strTime;
          this.VM.toTime = strTime;
          this.VM.fromTimeSession = ampm;
          this.VM.toTimeSession = ampm;

          if(showAlert){

            const presentModel = await this.modalCtrl.create({
              component: AddAppointmentAlertPopupComponent,
              componentProps: {
                data: data2
              },
              showBackdrop: true,
              mode: 'ios',
              cssClass: 'appointmentModel'
            });
            presentModel.onWillDismiss().then((data) => {
            });
            return await presentModel.present();
          }

          break;
          case 'user:created':
            const user = data1.title;
            const dataObj = data1.message;
            if(user == "ManageVisitor"){
              this.contactsarray = dataObj.data;
              if(this.passData.aData){
                this.VM = JSON.parse(dataObj.aData);
              }
              if(this.contactsarray){
                this.VM.visitors = this.contactsarray;
              }
            }else if(user == "editVisitorNotChangeMaster"){
              var visitor = dataObj;
              for(var i = 0; i<this.VM.visitors.length ; i++){
                var visitorCats = this.VM.visitors[i];
                // for(let visitors in visitorCats){
                  // var visitor1 = visitorCats[visitors];
                  if(visitorCats.EMAIL == visitor.EMAIL || visitorCats.VISITOR_NAME == visitor.VISITOR_NAME || (visitorCats.SEQ_ID && visitorCats.SEQ_ID == visitor.SEQ_ID)){
                    //alert("Changed");
                    visitorCats.VISITOR_IC =visitor.VISITOR_IC,
                    visitorCats.VISITOR_NAME=visitor.VISITOR_NAME,
                    visitorCats.VISITOR_COMPANY=visitor.VISITOR_COMPANY,
                    visitorCats.VISITOR_COMPANY_ID=visitor.VISITOR_COMPANY_ID,
                    visitorCats.EMAIL=visitor.EMAIL,
                    visitorCats.TELEPHONE_NO=visitor.TELEPHONE_NO,
                    visitorCats.VISITOR_GENDER=visitor.VISITOR_GENDER,
                    visitorCats.VisitorDesignation= "",
                    visitorCats.VisitorCategory=visitor.VisitorCategory,
                    visitorCats.VisitorCategory_ID=visitor.VisitorCategory_ID,
                    visitorCats.VISITOR_IMG=visitor.VISITOR_IMG,
                    visitorCats.PLATE_NUM=visitor.PLATE_NUM,
                    visitorCats.checked = true,
                    visitorCats.visitor_RemoveImg =visitor.visitor_RemoveImg,
                    visitorCats.ImageChanged = visitor.ImageChanged,
                    this.newImage = this.newImage +"_"+ new Date().getTime();
                    break;
                  }
                // }
              }
            }
            break;
        default:
          break;
      }
    })
  });
  }

  ionViewWillLeave(){

    if(this.VM.visitors && this.VM.visitors.length > 0 && !this.edit){
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, JSON.stringify(this.VM));
    }else{
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, "");
    }
    // this.events.unsubscribe("addAppointmentSuccess1");
    // this.events.unsubscribe("AddVisitorNew");
    // this.events.unsubscribe("user:created");
  }

  openCalendar(from){
    if(!this.edit || (!this.VM.facility || this.VM.facility.length == 0) || !this.showFacility){
      var showDate = new Date();
      if(from){
        showDate = new Date(this.VM.fromDate);
      }else{
        showDate = new Date(this.VM.toDate);
      }
      console.log("OpenCalender:Start:"+ this.VM.fromDate);
      console.log("OpenCalender:End:"+ this.VM.toDate);
      console.log("OpenCalender:"+ showDate);
      this.datePicker.show({
        date: showDate,
        mode: 'datetime',
        minDate : showDate,
        popoverArrowDirection :  "down" ,
        // androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
        androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
      }).then(
        date => {
         // alert(date)
          var hours = date.getHours();
          var min = date.getMinutes();
          var minutes = ""+min;
          var ampm = hours >= 12 ? 'PM' : 'AM';
          // hours = hours % 12;
          // hours = hours ? hours : 12;
          minutes = min < 10 ? '0'+minutes : minutes;

          // var sdate = date.getDate() < 10 ? '0'+ date.getDate() : date.getDate();
          // var smonthh = (date.getMonth()+1) < 10 ? '0'+ (date.getMonth()+1) : (date.getMonth()+1);

          var strTime = hours + ':' + minutes;
          // var selectedDate =sdate +':'+smonthh+':'+date.getFullYear()+" "+""+strTime+" "+ ampm;
          var ftDate = this.dateformat.transform(date+"", "yyyy-MM-ddTHH:mm:ss");
          if(from){
            this.VM.fromDate = new Date(date.getTime());
            this.VM.fromTime = strTime;
            this.VM.fromTimeSession = ampm;

            var sTime = new Date(ftDate).getTime() + (AppSettings.APPOINTMENT_BufferTime * 60 * 1000);
            //alert(this.VM.fromDate)
            if(sTime >= new Date(this.VM.toDate).getTime()){
              this.VM.toDate = new Date(new Date(ftDate).getTime()+ (AppSettings.APPOINTMENT_BufferTime * 60 * 1000));

              hours = this.VM.toDate.getHours();
              min = this.VM.toDate.getMinutes();
              minutes = ""+min;
              ampm = hours >= 12 ? 'PM' : 'AM';
              minutes = min < 10 ? '0'+minutes : minutes;
              strTime = hours + ':' + minutes;

              this.VM.toTime = strTime;
              this.VM.toTimeSession = ampm;
            }


          }else{
            this.VM.toDate = new Date(date.getTime());
            this.VM.toTime = strTime;
            this.VM.toTimeSession = ampm;
            //alert(this.VM.toDate)
          }

          // alert(strTime)
          // alert(ampm)

        },
        err => console.log('Error occurred while getting date: ', err)
      );
    }

  }


  async removeVisitor(item){

    let alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: this.T_SVC['ALERT_TEXT.REMOVE_VISITOR'],
      cssClass: 'alert-warning',
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
            let index = this.VM.visitors.indexOf(item);
            if (index > -1) {
              this.VM.visitors.splice(index, 1);
            }
          }
        }
      ]
    });
    alert.present();
  }



  ionViewDidEnter() {
    this.newImage = this.newImage +"_"+ new Date().getTime();
    console.log('ionViewDidEnter AddAppointmentPage');
    this.events.publishDataCompany({
      action : "page",
      title: "AddAppointmentPage",
      message: ''
    });
    var appntmntData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA);
    if(appntmntData && !this.edit && (!this.VM.visitors || this.VM.visitors.length == 0)){
      this.VM.visitors =  JSON.parse(appntmntData).visitors;
    }
    if(this.showFacility){
      this.loadVimsAppFacilityMasterList();
    }

  }

  editVisitors(slideDOM:IonItemSliding, type, visitor: any){
    slideDOM.close();
    if(type == 'edit'){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            changeMaster: visitor.SEQ_ID ? true : false,
            fromAppointmentPage : true,
            visitor:visitor
          }
        }
      };
      this.router.navigate(['add-visitors'], navigationExtras);
    }
  }

  ionViewWillEnter(){
    if(this.content){
      // this.content.scrollToTop();
    }

  }

  changeEvent(pickerName){
    console.log(pickerName + " --- " + (this.VM[pickerName]));
    if(pickerName == "fromTime"){
      if(this.VM[pickerName].replace(":",".") < 12){
        this.VM.fromTimeSession = "AM";
      }else{
        this.VM.fromTimeSession = "PM";
      }
    }else if(pickerName == "toTime"){
      if(this.VM[pickerName].replace(":",".") < 12){
        this.VM.toTimeSession = "AM";
      }else{
        this.VM.toTimeSession = "PM";
      }
    }else if(pickerName == "fromDate"){
      if(this.VM[pickerName].split("T")[1].split(":")[0]<12){
        this.VM.fromTimeSession = "AM";
      }else{
        this.VM.fromTimeSession = "PM";
      }
      this.VM.fromTime = this.VM[pickerName].split("T")[1].split(":")[0] +":"+this.VM[pickerName].split("T")[1].split(":")[1];
    }else if(pickerName == "toDate"){
      if(this.VM[pickerName].split("T")[1].split(":")[0]<12){
        this.VM.toTimeSession = "AM";
      }else{
        this.VM.toTimeSession = "PM";
      }
      this.VM.toTime = this.VM[pickerName].split("T")[1].split(":")[0] +":"+this.VM[pickerName].split("T")[1].split(":")[1];
    }
  }
  goToAddManageVisitors(){
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          data: this.VM.visitors,
          aData: JSON.stringify(this.VM)
        }
      }
    };
    this.router.navigate(['manage-visitors'], navigationExtras);
  }

  async proceedToNextStep(){

    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);

    if(settings && JSON.parse(settings)){
      try{

        if(this.QRObj.MAppId == AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP){
          var sett = JSON.parse(settings).Table3;
          if(sett && sett.length > 0){
            this.hostSettings = sett[0];
            this.hostSettings.isFacility = true;
          }else{
            let toast = await this.toastCtrl.create({
              message: this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND'],
              duration: 3000,
              position: 'bottom'
            });
            toast.present();
          }

        }else{
          sett = JSON.parse(settings).Table2;
          if(sett && sett.length > 0){
            this.hostSettings = sett[0];
            this.hostSettings.isFacility = false;
          }else{
            let toast = await this.toastCtrl.create({
              message: this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND'],
              duration: 3000,
              position: 'bottom'
            });
            toast.present();
          }

        }

      }catch(e){

      }
    }

    var type = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).MAppId;
    var allow = true;

    if(type == AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP){
      if(settings){
        allow = true;
      }else{
        allow = false;
      }
    }else if(type == AppSettings.LOGINTYPES.FACILITY){
      allow = true;
    }else if(this.hostSettings && !this.hostSettings.PurposeEnabled && !this.hostSettings.FloorEnabled && !this.hostSettings.VehicleNumberEnabled && !this.hostSettings.RemarksEnabled && !this.hostSettings.RoomEnabled){
      allow = false;
    }

    for(var i = 0 ; i < this.VM.visitors.length ; i++){
      var vObj = this.VM.visitors[i];
      vObj.VISITOR_COMPANY = vObj.VISITOR_COMPANY_ID
    }

    if(allow){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            data: JSON.stringify(this.VM)
          }
        }
      };
      this.router.navigate(['manage-visitors'], navigationExtras);
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
    var START_DATE = this.dateformat.transform(this.VM.fromDate+"", "yyyy-MM-ddTHH:mm:ss");
    if(START_DATE.split("T").length>0){
      this.addAppointmentModel.START_DATE = START_DATE.split("T")[0];
      this.addAppointmentModel.START_TIME = START_DATE.split("T")[1];
    }

    var END_DATE = this.dateformat.transform(this.VM.fromDate+"", "yyyy-MM-ddTHH:mm:ss");
    if(END_DATE.split("T").length>0){
      this.addAppointmentModel.END_DATE = END_DATE.split("T")[0];
      this.addAppointmentModel.END_TIME = END_DATE.split("T")[1];
    }

    if(!this.addAppointmentModel.vehicle_no){
      this.addAppointmentModel.vehicle_no = "";
    }

    if(!this.addAppointmentModel.vehicle_no){
      this.addAppointmentModel.vehicle_no = "";
    }

    var DateSelect = "";

    var endDate = this.addAppointmentModel.END_DATE+ " "+this.addAppointmentModel.END_TIME;
    var startDate = this.addAppointmentModel.START_DATE + " "+ this.addAppointmentModel.START_TIME;

    var params = {
      "STAFF_IC": this.addAppointmentModel.STAFF_IC,
      "SEQID": JSON.parse(hostData).SEQID,
      "VISITOR_ARRAY": JSON.stringify(this.VM.visitors),//this.addAppointmentModel.VISITOR_ARRAY,
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
        "FacilityCode": "",
        "PurposeCode": "",
        "DateSelect": DateSelect,
        "Frequently": "10",
        "ParentPortalRegKey": AppSettings.API_DATABASE_NAME
      }

};

  if(this.edit){

    if(!this.VM.appointment || !this.VM.appointment[0]){
      this.addAppointmentModel.vehicle_no = "";
    }else if(!this.VM.appointment[0].vehicle_no){
      // this.VM.appointment = [];
      this.VM.appointment[0].vehicle_no = "";
      this.addAppointmentModel.vehicle_no = "";
    }

      var BookingID = "";
      if(this.VM.appointment && this.VM.appointment[0]){
        BookingID = this.VM.appointment[0].FacilityBookingID;
      }
      var params1 = {
        "STAFF_IC": this.addAppointmentModel.STAFF_IC,
        "VISITOR_ARRAY": JSON.stringify(this.VM.visitors),//this.addAppointmentModel.VISITOR_ARRAY,
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
        "PLATE_NUM":this.VM.appointment[0].vehicle_no,
        "FacilityBooking": {
          "RefSchoolSeqId": "",
          "RefBranchSeqId": "",
          "StaffSeqId": this.addAppointmentModel.STAFF_IC,
          "HostSeqId": "",
          "BookingID": BookingID,
          "FacilityCode": this.addAppointmentModel.FacilityCode,
          "PurposeCode": this.addAppointmentModel.PurposeCode,
          "DateSelect": DateSelect,
          "Frequently": "10",
          "ParentPortalRegKey": AppSettings.API_DATABASE_NAME
        }
      };
      this.apiProvider.EditAppointment(params1).then(
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


            let toast = await this.toastCtrl.create({
              message: this.T_SVC['ADD_APPOIN.ADD_APPOINTMENT_DONE_SUCCESS'],
              duration: 3000,
              position: 'bottom'
            });
            toast.present();
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, "");
            this.navCtrl.pop();

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
  }else{
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


          let toast = await this.toastCtrl.create({
            message: this.T_SVC['ALERT_TEXT.UPDATE_APPOINTMENT_SUCCESS'],
            duration: 3000,
            cssClass: 'alert-danger',
            position: 'bottom'
          });
          toast.present();
          this.events.publishDataCompany({
            action : 'addAppointmentSuccess1',
            title: showAlert,
            message: messageArray
          });
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, "");
          this.navCtrl.navigateRoot('Home').then((data)=>{
            var page = {
              component :"FacilityBookingHistoryPage"
            }
            this.events.publishDataCompany({action : 'ChangeTab',
            title: page,
            message:0
          });

          });

          return;
      }
      let toast = await this.toastCtrl.create({
        message: 'Server Error',
        duration: 3000,
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

            }else if(result && result[0] && result[0].Code == 20){
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
  }

  onChangeFacility(facilityItem){
    var str = JSON.stringify(this.VM);
    var data = JSON.parse(str);
    console.log(""+ facilityItem);
    const navigationExtras: NavigationExtras = {
      state: {
        passData: { "FacilityCode": facilityItem.FacilityCode,
        "START_DATE":data.fromDate,
        "END_DATE":data.toDate,
        "facility": facilityItem.FacilityCode,
        "edit":this.edit,
        "availability": true
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
         this.FACILITYMASTERLIST = result;
        }
      },
      (err) => {

      }
    );
  }

  async checkFacilityAvailability(){
    var btns = [];
    for(let item of this.FACILITYMASTERLIST){
      var btn = {
          text: item.FacilityName,
          handler: (data) => {
            console.log('setting icon ' + item.FacilityName);
            this.onChangeFacility(item);
          }
      }
      btns[btns.length] = btn;
    }
    btn = {
      text: "Cancel",
      handler: (data) => {
        console.log('Cancel');
      }
    }
    btns[btns.length] = btn;

    let actionSheet = await this.actionsheetCtrl.create({
      header: 'Select Facility',
      cssClass: 'page-facility-booking',
      backdropDismiss: true,
      buttons: btns
    });
    actionSheet.present();
  }

  ngOnInit() {
  }

}
