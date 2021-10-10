import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { NavController, AlertController, ToastController, ModalController, ActionSheetController, IonItemSliding, IonContent } from '@ionic/angular';
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
export class AddAppointmentPage implements OnInit, OnDestroy {

  @ViewChild('visitorsList') visitorsList: any;
  // @ViewChild(Navbar) navBar: Navbar;
  @ViewChild(IonContent) content: IonContent;
  imageURL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  hostimageURL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'Handler/PortalImageHandler.ashx?RefSlno=';
  hoursMinutes = new Date().toString().split(':');
  imageURLType = '&RefType=VP&Refresh='+ new Date().getTime();
  imageURLTypeHOST = '&ScreenType=30&Refresh='+ new Date().getTime();
  imageURLTypeVPB = '&RefType=VP&Refresh='+ new Date().getTime();
  newImage = "&tes='test'";
  addAppointmentModel = new AddAppointmentModel();
  T_SVC:any;
  datepickerFrmDate = '';
  datepickerToDate = '';
  VM = {
    "visitors":[],
    facility : [],
    fromDate: new Date(),
    toDate: new Date(),
    fromTime:"02:02",
    toTime:"02:02",
    fromTimeSession:"AM",
    toTimeSession:"AM",
    appointment: [],
    addVisitorSettings: '',
    visitor_ctg: {
      visitor_ctg_id: '',
      visitor_ctg_desc: ''
    }
  }
  FACILITYMASTERLIST = [];
  contactsarray:any = [];
  VISITOR_CATEGORY:any = [];
  hostSettings : any = {};
  minDate: any = "";
  minDateTo: any = "";
  edit = false;
  hostData : any = {};
  QRObj : any = {};
  showFacility = false;
  passData: any ={};
  constructor(public navCtrl: NavController,
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


    if(this.QRObj && (this.QRObj.MAppId === AppSettings.LOGINTYPES.FACILITY || this.QRObj.MAppId === AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP)){
      this.showFacility = true;
    }

    let min = today.getMinutes();
    if (min >= 45) {
      today.setHours(today.getHours()+1);
      today.setMinutes(0);
    } else if (min >= 30) {
      today.setMinutes(45);
    } else if (min >= 15) {
      today.setMinutes(30);
    } else if (min >= 0) {
      today.setMinutes(15);
    }
    min = today.getMinutes();
    var hours = today.getHours();

    var minutes = ""+min;
    var ampm = hours >= 12 ? 'PM' : 'AM';
    minutes = min < 10 ? '0'+minutes : minutes;

    var strTime = hours + ':' + minutes;
    this.VM.fromTime = strTime;
    this.VM.fromTimeSession = ampm;

    this.minDate = this.dateformat.transform(today+"", "yyyy-MM-ddTHH:mm:ss");

    this.VM.fromDate = today;
    this.datepickerFrmDate = this.dateformat.transform(new Date(this.VM.fromDate) + '', 'yyyy-MM-ddTHH:mm');


    this.resetToDate();


  this.route.queryParams.subscribe(params => {
    if (this.router.getCurrentNavigation().extras.state) {
      this.passData = this.router.getCurrentNavigation().extras.state.passData;
      console.log('passData : ' + this.passData);
      this.edit = this.passData.edit;
      if(this.edit){
        this.VM.appointment = this.passData.appointment;
        this.VM.facility = this.passData.facility;
        var stime = this.VM.appointment[0].START_DATE.split("T")[1]
        var etime = this.VM.appointment[0].END_DATE.split("T")[1]
        this.VM.fromDate = this.VM.appointment[0].START_DATE;
        this.VM.fromTime = stime.split(":")[0]+":"+stime.split(":")[1];
        this.VM.toDate = this.VM.appointment[0].END_DATE;
        this.VM.toTime =  etime.split(":")[0]+":"+etime.split(":")[1];
        this.datepickerFrmDate = this.dateformat.transform(new Date(this.VM.fromDate) + '', 'yyyy-MM-ddTHH:mm');
        this.datepickerToDate = this.dateformat.transform(new Date(this.VM.toDate) +"", "yyyy-MM-ddTHH:mm");
        // this.VM.visitor_ctg = VisitorCategory;
        this.addAppointmentModel.visitor_ctg_id = this.VM.appointment[0].VisitorCategory;
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
              VISITOR_COMPANY: item.VISITOR_COMPANY_ID,
              VISITOR_COMPANY_NAME: item.VISITOR_COMPANY,
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
        setTimeout(() => {
          this.onChangeCategory(this.addAppointmentModel.visitor_ctg_id, false);
        }, 1000);
        this.GetAppointmentDetailByGroup();
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

          this.contactsarray = [];
          if (data) {
            data.forEach(element => {
              const visi = this.contactsarray.find(item => (item.EMAIL === element.EMAIL && item.visitor_id === element.visitor_id));
              if (!visi) {
                this.contactsarray.push(element);
              }

            });
          }
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
            appointment: [],
            addVisitorSettings: '',
            visitor_ctg: {
              visitor_ctg_id: '',
              visitor_ctg_desc: ''
            }
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
              this.contactsarray = [];
              if (dataObj.data) {
                dataObj.data.forEach(element => {
                  const visi = this.contactsarray.find(item => (item.EMAIL === element.EMAIL && item.visitor_id === element.visitor_id));
                  if (!visi) {
                    this.contactsarray.push(element);
                  }

                });
              }
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
                    visitorCats.VISITOR_IC =visitor.VISITOR_IC;
                    visitorCats.VISITOR_NAME=visitor.VISITOR_NAME;
                    visitorCats.VISITOR_COMPANY=visitor.VISITOR_COMPANY;
                    visitorCats.VISITOR_COMPANY_ID=visitor.VISITOR_COMPANY_ID;
                    visitorCats.EMAIL=visitor.EMAIL;
                    visitorCats.TELEPHONE_NO=visitor.TELEPHONE_NO;
                    visitorCats.VISITOR_GENDER=visitor.VISITOR_GENDER;
                    visitorCats.VisitorDesignation= "";
                    visitorCats.VisitorCategory=visitor.VisitorCategory;
                    visitorCats.VisitorCategory_ID=visitor.VisitorCategory_ID;
                    visitorCats.VISITOR_IMG=visitor.VISITOR_IMG;
                    visitorCats.PLATE_NUM=visitor.PLATE_NUM;
                    visitorCats.isChecked = true;
                    visitorCats.visitor_RemoveImg =visitor.visitor_RemoveImg;
                    visitorCats.ImageChanged = visitor.ImageChanged;
                    visitorCats.Address=visitor.Address;
                    visitorCats.Country=visitor.Country;
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
  ngOnDestroy(): void {
    this.events.clearObserve();
  }

  ionViewWillLeave(){

  }

  GetAppointmentDetailByGroup() {
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var HOSTIC = JSON.parse(hostData).HOSTIC;
			var params = {
			"STAFF_IC":HOSTIC,
			"appointment_group_id": this.VM.appointment[0].appointment_group_id,
		  };
      this.apiProvider.requestApi(params, '/api/vims/GetAppointmentDetailByGroupId', true, 'WEB', '').then(
        async (val) => {
          var result = JSON.parse(val.toString());
          if(result["Table1"] != undefined && result["Table1"].length > 0){
            result.Table1.forEach(element => {
              let appointment = this.VM.visitors.find(item => item.VisitorBookingSeqId === element.SEQ_ID);
              if (appointment) {
                appointment.IsAckVerified = element.IsAckVerified;
              }

            });
          }

        },
        async (err) => {
          if(err && err.message == "No Internet"){
            return;
          }

            if(err && err.message){
              var error = err.message;
              this.apiProvider.showAlert('Error! ' + error);
              return;
            }

          var result = JSON.parse(err.toString());
          if(result && result["Table1"] != undefined){
            this.apiProvider.showAlert('Error! ' + result["Table1"][0].Status);
          }else if(result.message){
            this.apiProvider.showAlert(result.message);
          }else{
            this.apiProvider.showAlert('Error!');
          }

        }
      );
    }
  }


  async presentActionSheet() {
    const actionSheet = await this.actionsheetCtrl.create({
      header: 'Albums',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          console.log('Delete clicked');
        }
      }, {
        text: 'Share',
        icon: 'share',
        handler: () => {
          console.log('Share clicked');
        }
      }, {
        text: 'Play (open modal)',
        icon: 'caret-forward-circle',
        handler: () => {
          console.log('Play clicked');
        }
      }, {
        text: 'Favorite',
        icon: 'heart',
        handler: () => {
          console.log('Favorite clicked');
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }


  openCalender(picker, action) {
    if (!this.edit) {
      if (action === 'START') {

      } else {

      }
      picker.open();
    }
  }


  changeCalendar(from){
    if(!this.edit && (!this.VM.facility || this.VM.facility.length == 0 || !this.showFacility)){
      let showDate = new Date();
      if(from){
        showDate = new Date(this.datepickerFrmDate);
      }else{
        showDate = new Date(this.datepickerToDate);
      }
      console.log("OpenCalender:Start:"+ this.VM.fromDate);
      console.log("OpenCalender:End:"+ this.VM.toDate);

      var hours = showDate.getHours();
      var min = showDate.getMinutes();
      var minutes = ""+min;
      var ampm = hours >= 12 ? 'PM' : 'AM';
      minutes = min < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes;
      if(from){
        this.VM.fromDate = new Date(showDate.getTime());
        this.VM.fromTime = strTime;
        this.VM.fromTimeSession = ampm;
        this.resetToDate();
      }else{
        this.VM.toDate = new Date(showDate.getTime());
        this.VM.toTime = strTime;
        this.VM.toTimeSession = ampm;
      }
    }
  }

  resetToDate() {
    const fromDate = new Date(this.VM.fromDate.getTime());
    fromDate.setHours(fromDate.getHours() + 1);
    this.minDateTo = this.dateformat.transform(fromDate+"", "yyyy-MM-ddTHH:mm:ss");
    const newToDate = new Date(this.VM.fromDate.getTime());
    newToDate.setHours(23);
    newToDate.setMinutes(59);
    this.datepickerToDate = this.dateformat.transform(newToDate +"", "yyyy-MM-ddTHH:mm");
    this.VM.toDate = new Date(newToDate.getTime());
    let hours = this.VM.toDate.getHours();
    let min = this.VM.toDate.getMinutes();
    let minutes = ""+min;
    let ampm = hours >= 12 ? 'PM' : 'AM';
    minutes = min < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + minutes;
    this.VM.toTime = strTime;
    this.VM.toTimeSession = ampm;
  }


  async removeVisitor(item){

    let alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: this.T_SVC['ALERT_TEXT.REMOVE_VISITOR'],
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
      title: "add-appointment",
      message: ''
    });
    // var appntmntData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA);
    // if(appntmntData && !this.edit && (!this.VM.visitors || this.VM.visitors.length == 0)){
    //   this.VM.visitors =  JSON.parse(appntmntData).visitors;
    //   this.VM.addVisitorSettings = JSON.parse(appntmntData).addVisitorSettings;
    //   this.VM.visitor_ctg = JSON.parse(appntmntData).visitor_ctg;
    //   this.addAppointmentModel.visitor_ctg_id = this.VM.visitor_ctg.visitor_ctg_id;
    // }
    if(this.showFacility){
      this.loadVimsAppFacilityMasterList();
    }

  }

  editVisitors(slideDOM:IonItemSliding, type, visitor: any){
    slideDOM.close();
    if(type == 'edit'){
      visitor.VisitorCategory = this.addAppointmentModel.visitor_ctg_id;
      this.VISITOR_CATEGORY.forEach(element => {
        if (element.visitor_ctg_id === this.addAppointmentModel.visitor_ctg_id) {
          this.VM.visitor_ctg.visitor_ctg_desc = element.visitor_ctg_desc;
          visitor.visitor_ctg_desc = element.visitor_ctg_desc;
          return;
        }
      });
      visitor.VisitorCategory_ID = this.addAppointmentModel.visitor_ctg_id;
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            changeMaster: visitor.SEQ_ID ? true : false,
            fromAppointmentPage : true,
            visitor:visitor,
            addVisitorSettings: this.VM.addVisitorSettings
          }
        }
      };
      this.router.navigate(['add-visitors'], navigationExtras);
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

  proceedToNextStep(){
    var type = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).MAppId;
    var allow = true;

    if(type == AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP){
      if(this.hostSettings && this.hostSettings.available){
        allow = true;
      }else{
        allow = false;
      }
    } else if(type == AppSettings.LOGINTYPES.FACILITY){
      allow = true;
    }else if(this.hostSettings && !this.hostSettings.PurposeEnabled && !this.hostSettings.FloorEnabled && !this.hostSettings.VehicleNumberEnabled && !this.hostSettings.RemarksEnabled && !this.hostSettings.RoomEnabled){
      allow = false;
    }

    for(var i = 0 ; i < this.VM.visitors.length ; i++){
      var vObj = this.VM.visitors[i];
      if (!vObj.VISITOR_COMPANY_NAME) {
        vObj.VISITOR_COMPANY_NAME = vObj.VISITOR_COMPANY;
      }
      if(vObj.VISITOR_COMPANY_ID) {
        vObj.VISITOR_COMPANY = vObj.VISITOR_COMPANY_ID;
      }
      if (vObj.VisitorCategory_ID) {
        vObj.VisitorCategory = vObj.VisitorCategory_ID;
      }

    }

    if(allow){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            data: JSON.stringify(this.VM)
          }
        }
      };
      this.router.navigate(['add-appointment-step2'], navigationExtras);
      return;
    }
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      this.addAppointmentModel.STAFF_IC = JSON.parse(hostData).HOSTIC;
      this.addAppointmentModel.Booked_By = "Host";
      this.addAppointmentModel.bookedby_id = JSON.parse(hostData).HOSTIC ? JSON.parse(hostData).HOSTIC: JSON.parse(hostData).HOST_ID;

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

    var END_DATE = this.dateformat.transform(this.VM.toDate+"", "yyyy-MM-ddTHH:mm:ss");
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
            this.showAlert(this.T_SVC['ALERT_TEXT.UPDATE_APPOINTMENT_SUCCESS']);
            this.apiProvider.dismissLoading();
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, "");
            this.navCtrl.navigateRoot('');
            return;
        }
        let alert = await this.alertCtrl.create({
          header: 'Error !',
          message: '',
          cssClass: '',
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
            cssClass: '',
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
          this.apiProvider.showAlert(this.T_SVC['ADD_APPOIN.ADD_APPOINTMENT_DONE_SUCCESS']);
          this.apiProvider.dismissLoading();
          this.events.publishDataCompany({
            action: 'addAppointmentSuccess1',
            title: showAlert,
            message: messageArray
          });
          window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPOINTMENT_VISITOR_DATA, "");
          this.navCtrl.navigateRoot('').then((data)=>{
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
        cssClass: '',
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
                  cssClass: '',
                  buttons: ['Okay']
                });
                alert.present();
                return;
              }else if(output && output.Status == 2){
                let alert = await this.alertCtrl.create({
                  header: 'Failed !',
                  message: this.T_SVC['ALERT_TEXT.DUPLICATE_BOOKING'],
                  cssClass: '',
                  buttons: ['Okay']
                });
                alert.present();
                return;
              }else if(output && output.Status == 3){
                let alert = await this.alertCtrl.create({
                  header: 'Failed !',
                  cssClass: '',
                  message: this.T_SVC['ALERT_TEXT.SLOT_EXPIRED'],
                  buttons: ['Okay']
                });
                alert.present();
                return;
              } else if(output && output.Status == 4){
                let alert = await this.alertCtrl.create({
                  header: 'Error !',
                  message: this.T_SVC['ALERT_TEXT.MEMBER_NOT_FOUND'],
                  cssClass: '',
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
          cssClass: '',
          buttons: ['Okay']
        });
        alert.present();
      }
    );
  }
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

  goBack() {
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      const QRObj = JSON.parse(qrData);
      if (QRObj.MAppId === AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS || QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
        this.router.navigateByUrl('home-tams');
      } else {
        this.router.navigateByUrl('home-view');
      }
    } else {
      this.navCtrl.pop();
    }
    console.log('goBack ');
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

  _prepareForNewVisitor(){
    this._getVisitorCategory();
  }

  onChangeCategory(event : any, allowCheck){
    const visitor_ctg_id = allowCheck ? event.detail.value: event;
    if (this.VM.visitors) {
      this.VM.visitors.forEach(element => {
        element.VisitorCategory = visitor_ctg_id;
      });
    }

    this.VM.visitor_ctg.visitor_ctg_id = visitor_ctg_id;
    this.VISITOR_CATEGORY.forEach(element => {
      if (element.visitor_ctg_id === visitor_ctg_id) {
        this.VM.visitor_ctg.visitor_ctg_desc = element.visitor_ctg_desc;
      }
    });

    this.addAppointmentModel.visitor_ctg_id = visitor_ctg_id;
    this.addAppointmentModel.Category = this.VM.visitor_ctg.visitor_ctg_desc;
    console.log(visitor_ctg_id + "///"  + this.addAppointmentModel.Category);

    this.apiProvider.GetAddVisitorSettings({"RefVisitorCateg": visitor_ctg_id}).then(
      (val) => {
        var result = JSON.parse(JSON.stringify(val));
        if(result){
          if (result.Table.length > 0) {
            if (result.Table[0].Code === 10) {
              this.VM.addVisitorSettings = result.Table1[0].HostSettingDetail;
            } else {
              this.showToast(result.Table[0].Description);
              this.VM.addVisitorSettings = "";
            }
          }

        }
      },
      (err) => {
        this.VM.addVisitorSettings = "";
      }
    );
  }
  _getVisitorCategory(){

    var masterDetails = this.getCategory(AppSettings.LOCAL_STORAGE.MASTER_DETAILS);
    if(masterDetails){
      this.VISITOR_CATEGORY = JSON.parse(masterDetails).Table4;

      if(this.addAppointmentModel.visitor_ctg_id){
        for(var i1 = 0 ; i1 < this.VISITOR_CATEGORY.length ; i1++){
          if(this.VISITOR_CATEGORY[i1].visitor_ctg_desc == this.addAppointmentModel.visitor_ctg_id){
            this.addAppointmentModel.visitor_ctg_id = this.VISITOR_CATEGORY[i1].visitor_ctg_id;
            this.addAppointmentModel.Category = this.VISITOR_CATEGORY[i1].visitor_ctg_desc;
            break;
          }
        }
      }
    }else{
      this.apiProvider.GetMasterDetails().then(
        (val: any) => {
          var result = val;
          if(result){
            //this.storage.set(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(result));
            window.localStorage.setItem(AppSettings.LOCAL_STORAGE.MASTER_DETAILS,JSON.stringify(val));
            this.VISITOR_CATEGORY = result.Table4;
          }
        },
        (err) => {
        }
      );
    }
  }

  public getCategory(settingName){
    //return this.storage.get(settingName);
    return window.localStorage.getItem(settingName);
  }

  ngOnInit() {
    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);

    if(settings && JSON.parse(settings)){
      try{

        if(this.QRObj.MAppId === AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP){
          var sett = JSON.parse(settings).Table1;
          if(sett && sett.length > 0){
            this.hostSettings = sett[0];
            this.hostSettings.available = true;
            this.hostSettings.isFacility = true;
          } else{
            this.showToast(this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND']);
          }

        } else {
          sett = JSON.parse(settings).Table1;
          if(sett && sett.length > 0){
            this.hostSettings = sett[0];
            this.hostSettings.available = true;
            this.hostSettings.isFacility = false;
          }else{
            this.showToast(this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND']);
          }

        }

      }catch(e){

      }
    }
    this._prepareForNewVisitor();
  }

  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: 'primary',
      position: 'bottom'
    });
    toast.present();
  }

}
