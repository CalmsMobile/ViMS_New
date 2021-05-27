import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { NavController, AlertController, ActionSheetController, IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-facility-booking',
  templateUrl: './facility-booking.page.html',
  styleUrls: ['./facility-booking.page.scss'],
})
export class FacilityBookingPage implements OnInit {

  @ViewChild('visitorsList') visitorsList: any;
  // @ViewChild(Navbar) navBar: Navbar;
  @ViewChild(IonContent) content: IonContent;
  translation:any = {};
  imageURL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  hoursMinutes = new Date().toString().split(':');
  imageURLType = '&RefType=HP&Refresh='+ new Date().getTime();
  newImage = "&tes='test'"
  VM = {
    "visitors":[],
    facility: [],
    fromDate: new Date(),
    toDate: new Date(),
    fromTime:"02:02",
    toTime:"02:02",
    fromTimeSession:"AM",
    toTimeSession:"AM",
    appointment: {}
  }
  passData:any = {};
  contactsarray:any = [];
  minDate: any = "";
  edit = false;
  FacilityCode: any = '';
  FACILITYMASTERLIST = [];
 constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    public events: EventsService,
    private dateformat : DateFormatPipe,
    private router: Router,
    private route: ActivatedRoute,
    private datePicker: DatePicker,
    private actionsheetCtrl: ActionSheetController,
    public apiProvider: RestProvider,
    private translate:TranslateService) {
      var today = new Date();
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
    // this.VM.fromDate.setTime(this.VM.toDate.getTime() + (1400 * 60 * 1000));
    this.VM.toDate.setTime(this.VM.toDate.getTime() + (AppSettings.APPOINTMENT_BufferTime * 60 * 1000));

    hours = this.VM.toDate.getHours();
    min = this.VM.toDate.getMinutes();
    minutes = ""+min;
    ampm = hours >= 12 ? 'PM' : 'AM';
    minutes = min < 10 ? '0'+minutes : minutes;
    var ToTime = hours + ':' + minutes;
    this.VM.toTime = ToTime;
    this.VM.toTimeSession = ampm;
    this.translate.get(['ALERT_TEXT.REMOVE_STAFF']).subscribe(t => {
      this.translation = t;
    });
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + this.passData);
        this.edit = this.passData.edit;
        if(this.edit){
          this.VM.appointment = this.passData.appointment;
          this.VM.facility = this.passData.facility;
          var sdate = this.VM.appointment[0].START_DATE.split(" ")[0];
          var stime = this.VM.appointment[0].START_DATE.split("T")[1];
          if(this.VM.facility && this.VM.facility[0] && this.VM.facility[0].EndDateTime){
            this.VM.appointment[0].END_DATE = this.VM.facility[0].EndDateTime;
          }

          // var edate = this.VM.appointment[0].END_DATE.split(" ")[0];
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

          if(this.VM.facility && this.VM.facility.length > 0){
            if(this.VM.facility[0].visitors && this.VM.facility[0].visitors.length > 0){
              for(let visitor in this.VM.facility[0].visitors){
                var item = this.VM.facility[0].visitors[visitor];
                var addVisitor0 = {
                  checked: true,
                  HOST_EMAIL: item.Email,
                  HOSTNAME: item.Name,
                  HOSTIC: item.MemberID,
                  SEQID: item.SEQID
                }
                visitorsLocal1.push(addVisitor0);
              }
            }
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
    });

    events.observeDataCompany().subscribe((data1: any) => {
      if (data1.action === 'addAppointmentSuccess') {
        this.VM = {
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
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FACILITY_VISITOR_DATA, "");
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
      } else if (data1.action === 'user:created') {
        const user = data1.title;
        const dataObj = data1.message;
        // user and time are the same arguments passed in `events.publish(user, time)`
        console.log('Welcome', user, 'at', dataObj);
        // this.params.hostImage = "assets/images/logo/2.png";
        // alert(this.params.hostImage);
        if(user == "ManageVisitor"){
          this.contactsarray = dataObj.data;
          if(this.passData.aData){
            this.VM = JSON.parse(dataObj.aData);
          }
          if(this.contactsarray){
            this.VM.visitors = this.contactsarray;
          }
        }
      }
  })

  }

  ionViewWillLeave(){

    if(this.VM.visitors && this.VM.visitors.length > 0 && !this.edit){
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.FACILITY_VISITOR_DATA, JSON.stringify(this.VM));
    }
  }


  openCalendar(from){
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
      mode: 'date',
      minDate : showDate,
      popoverArrowDirection :  "down" ,
      // androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
    }).then(
      date => {
       // alert(date)
        // var hours = date.getHours();
        // var min = date.getMinutes();
        // var minutes = ""+min;
        // var ampm = hours >= 12 ? 'PM' : 'AM';
        // hours = hours % 12;
        // hours = hours ? hours : 12;
        // minutes = min < 10 ? '0'+minutes : minutes;

        // var sdate = date.getDate() < 10 ? '0'+ date.getDate() : date.getDate();
        // var smonthh = (date.getMonth()+1) < 10 ? '0'+ (date.getMonth()+1) : (date.getMonth()+1);

        var strTime = '00:00';
        var ampm = "AM";
        // var selectedDate =sdate +':'+smonthh+':'+date.getFullYear()+" "+""+strTime+" "+ ampm;
        // var fTime = new Date(date).getTime();
        var ftDate = this.dateformat.transform(date+"", "yyyy-MM-ddTHH:mm:ss");
        if(from){
          this.VM.fromDate = ftDate;
          this.VM.fromTime = strTime;
          this.VM.fromTimeSession = ampm;
          //alert(this.VM.fromDate)

          var sTime = new Date(ftDate).getTime();
          //alert(this.VM.fromDate)
          if(sTime >= new Date(this.VM.toDate).getTime()){
            this.VM.toDate = new Date(new Date(ftDate).getTime());
            this.VM.toTime = strTime;
            this.VM.toTimeSession = ampm;
          }

        }else{
          this.VM.toDate = ftDate;
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


  async removeVisitor(item){

    let alert = await this.alertCtrl.create({
      header: 'Confirmation',
      cssClass: 'alert-warning',
      message: this.translation['ALERT_TEXT.REMOVE_STAFF'],
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
    console.log('ionViewDidEnter AddFacilityPage');
    var appntmntData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.FACILITY_VISITOR_DATA);
    if(appntmntData && !this.edit){
      this.VM.visitors = JSON.parse(appntmntData).visitors;
    }
    this.loadVimsAppFacilityMasterList();

  }


  ionViewWillEnter(){
    // this.events.publishDataCompany({
    //   action: "page",
    //   title: "home-view1",
    //   message: ''
    // });
    this.newImage = this.newImage +"_"+ new Date().getTime();
    this.events.publishDataCompany({
      action: "page",
      title: "CreateFacilityPage",
      message: ''
    });
    // this.content.scrollToTop();

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
    this.router.navigate(['manage-hosts'], navigationExtras);
  }

  proceedToNextStep(){
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          data: JSON.stringify(this.VM)
        }
      }
    };
    this.router.navigate(['facility-booking-page2'], navigationExtras);

  }

  onChangeFacility(event: any){

    const FacilityCode = event.FacilityCode ? event.FacilityCode: event.detail.value;
    var str = JSON.stringify(this.VM);
    var data = JSON.parse(str);
    console.log(""+ FacilityCode);
  const navigationExtras: NavigationExtras = {
    state: {
      passData: { "FacilityCode": FacilityCode,
      "START_DATE":data.fromDate,
      "END_DATE":data.toDate,
      "facility": FacilityCode,
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
      handler: () => {
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

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  ngOnInit() {
  }

}
