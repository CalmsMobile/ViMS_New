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
  imageURL = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'Handler/PortalImageHandler.ashx?RefSlno=';
  hoursMinutes = new Date().toString().split(':');
  imageURLType = '&ScreenType=30&Refresh='+ new Date().getTime();
  newImage = "&tes='test'";
  datepickerFrmDate = '';
  datepickerToDate = '';
  VM = {
    "visitors":[],
    facility: [],
    fromDate: new Date(),
    toDate: new Date(),
    appointment: {}
  }
  passData:any = {};
  contactsarray:any = [];
  minDate: any = "";
  minDateTo: any = "";
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
    this.VM.toDate.setTime(this.VM.toDate.getTime());
    this.datepickerFrmDate = this.dateformat.transform(new Date(this.VM.fromDate) + '', 'yyyy-MM-dd');
    this.resetToDate();

    this.translate.get(['ALERT_TEXT.REMOVE_STAFF', 'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL']).subscribe(t => {
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

          this.VM.fromDate = this.VM.appointment[0].START_DATE;
          this.VM.toDate = this.VM.appointment[0].END_DATE;
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
          appointment: {}
        }
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
  }

  async removeVisitor(item){

    let alert = await this.alertCtrl.create({
      header: 'Confirmation',
      cssClass: '',
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
    this.newImage = this.newImage +"_"+ new Date().getTime();
    this.events.publishDataCompany({
      action: "page",
      title: "CreateFacilityPage",
      message: ''
    });
    this.loadVimsAppFacilityMasterList();

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

  openCalender(picker, action) {
    if (!this.edit) {
      if (action === 'START') {

      } else {

      }
      picker.open();
    }
  }


  changeCalendar(from){
    if(!this.edit && (!this.VM.facility || this.VM.facility.length == 0)){
      let showDate = new Date();
      if(from){
        showDate = new Date(this.datepickerFrmDate);
      }else{
        showDate = new Date(this.datepickerToDate);
      }
      console.log("OpenCalender:Start:"+ this.VM.fromDate);
      console.log("OpenCalender:End:"+ this.VM.toDate);
      if(from){
        this.VM.fromDate = new Date(this.datepickerFrmDate);
        this.resetToDate();
      }else{
        this.VM.toDate = new Date(this.datepickerToDate);
      }
    }
  }

  resetToDate() {
    this.minDateTo = this.dateformat.transform(this.datepickerFrmDate+"", "yyyy-MM-dd");
    this.datepickerToDate = this.dateformat.transform(this.datepickerFrmDate +"", "yyyy-MM-dd");
    this.VM.toDate = new Date(this.datepickerToDate);
  }

  proceedToNextStep(){
    this.VM.fromDate = this.dateformat.transform(this.datepickerFrmDate+"", "yyyy-MM-dd");
    this.VM.toDate = this.dateformat.transform(this.datepickerToDate+"", "yyyy-MM-dd");
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
        if(err && err.message == "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
          message = this.translation['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
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
