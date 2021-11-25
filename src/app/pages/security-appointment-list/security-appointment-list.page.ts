import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, IonItemSliding } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { CommonUtil } from 'src/app/services/util/CommonUtil';

@Component({
  selector: 'app-security-appointment-list',
  templateUrl: './security-appointment-list.page.html',
  styleUrls: ['./security-appointment-list.page.scss'],
})
export class SecurityAppointmentListPage implements OnInit {
  T_SVC: any;
  expiryTime = '';
  appointmentsTable2 = [];
  appointmentsTable3 = [];
  appointments = [];
  appointmentsCone = [];
  isFetching = false;
  showAlert = false;
  isLoadingFinished = false;
  appSettings: any = {};
  visitorImagePath = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  imageURLType = '&RefType=VPB&Refresh='+ new Date().getTime();
  constructor(private router: Router,
    public apiProvider: RestProvider,
    private commonUtil: CommonUtil,
    private alertCtrl: AlertController,
    private dateformat: DateFormatPipe,
    private translate:TranslateService,) {
    this.translate.get([ 'ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS', 'ALERT_TEXT.CONFIRMATION',
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'SETTINGS.SELECT_LANGUAGE']).subscribe(t => {
        this.T_SVC = t;
    });
    const ackSeettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
    if (ackSeettings) {
      this.appSettings = JSON.parse(ackSeettings);
    }
    this.expiryTime = this.dateformat.transform(new Date() + "", "yyyy-MM-dd");
  }

  ngOnInit() {
    // this.getBranchAppointments(null, false);
  }

  ionViewDidEnter() {
    this.appointments = [];
    this.getBranchAppointments(null, false, false);
  }

  loadData(event) {
    var currentClass = this;
    setTimeout(() => {
      console.log('Done');
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if(!currentClass.isFetching){
        currentClass.isFetching = true;
        // setTimeout(()=>{
          currentClass.getBranchAppointments(null, true, true);
      //  },1000)
      }
      // }
    }, 500);
  }

  moveToDetailsPage(item) {
    const navigationExtras: NavigationExtras = {
      state: {
        passData: item,
        fromAppointment: true
      }
    };
    this.router.navigate(['visitor-information'], navigationExtras);
  }

  ondrag(event, slideDOM:IonItemSliding, item: any) {
    let percent = event.detail.ratio;
    if (percent > 0) {
      this.closeSlide(slideDOM);
      if(this.showAlert){
        return;
        }
        this.showAlert = true;
        const resultObj = this.commonUtil.checkQRCode(item.START_TIME, item.END_TIME, this.dateformat);
        if (!resultObj.isInValid && !resultObj.isExpired) {
          this.checkInOutVisitor(item);
        }

    }
    if (Math.abs(percent) > 1) {
      // console.log('overscroll');
    }
	  }

    closeSlide(slideDOM) {
      setTimeout(() => {
        slideDOM.close();
      }, 100);
    }

  async checkInOutVisitor(item) {
    let message1 = "";
    let inputsShow = [];
    if ((item.att_check_in === 0 && item.att_check_out === 0) || (item.att_check_in === 1 && item.att_check_out === 1)) {
      message1 = "Do you wish to check-in ";
      const endT = item.END_TIME.replace('T', ' ');
      const eDate = this.dateformat.transform(endT, "yyyy-MM-dd HH:mm");
      if (new Date().getTime() > new Date(eDate).getTime()) {
       return;
      }
    } else if (item.att_check_in === 1 && (!item.att_check_out || item.att_check_out === 0)) {
      message1 = "Do you wish to check-out ";
      if (item.overStayTime) {
        inputsShow = [
          {
            name: 'remarks',
            type: 'text',
            placeholder: 'Enter Check-out Remarks'
          }]
      }
    } else {
      this.showAlert = false;
      return;
    }
    let alert = this.alertCtrl.create({
      header: this.T_SVC['ALERT_TEXT.CONFIRMATION'],
      cssClass:"",
      inputs: inputsShow,
      message: message1+(item.visitor_name? item.visitor_name : " this visitor")+" now?",
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
            if ((item.att_check_in === 0 && item.att_check_out === 0) || (item.att_check_in === 1 && item.att_check_out === 1)) {
              const navigationExtras: NavigationExtras = {
                state: {
                  passData: {
                    PreAppointment : item
                  }
                }
              };
              this.router.navigate(['security-manual-check-in'], navigationExtras);
              return;
            }
            var params = {
              "att_id":item.att_id,
              "remarks": (result && result.remarks)? result.remarks: '',
              "CheckOutCounter":"admin"
            };
            // this.VM.host_search_id = "adam";
            this.apiProvider.VimsAppUpdateVisitorCheckOut(params).then(
              async (val) => {
                this.appointments = [];
                this.appointmentsCone = [];
                this.getBranchAppointments(null, false, true);

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
      this.showAlert = false;
    })

  }

  showCalender(picker) {
    picker.open();
  }


  changeCalendar($event){
    this.expiryTime = this.dateformat.transform($event.detail.value + "", "yyyy-MM-dd");
    console.log("OpenCalender:Start:"+ this.expiryTime);
    this.appointments = [];
    this.getBranchAppointments(null, false, false);
}

  getBranchAppointments(refresher, loadmore, hideLoading) {
    this.isLoadingFinished = false;
    const data = {
    "START_DATE": this.expiryTime,
    "LIMIT": 20,
    "START": this.appointments.length,
 };
    this.apiProvider.requestSecurityApi(data, '/api/SecurityApp/getBranchAppointments', hideLoading ? false: true).then(
      (val: any) => {
        this.isLoadingFinished = true;
        const response = JSON.parse(val);
        if (response.Table && response.Table.length > 0 && response.Table[0].Code === 10) {
          if(refresher){
            this.appointments = response.Table1;
            this.appointmentsTable2 = response.Table2;
            this.appointmentsTable3 = response.Table3;
            refresher.target.complete();
          } else {
            this.appointments = response.Table1.concat(this.appointments);
            this.appointmentsTable2 = response.Table2.concat(this.appointmentsTable2);
            this.appointmentsTable3 = response.Table3.concat(this.appointmentsTable3);
          }
        }

        this.appointments.forEach(element => {
          const list =  this.appointmentsTable2.filter((item) =>{
            return (item.visitorBookingSeqId ===  element.SEQ_ID);
          });
          element.no_of_time_utilized = 0;
          if(list && list.length > 0) {
            element.no_of_time_utilized = list[0].no_of_time_utilized;
          }

          const list1 =  this.appointmentsTable3.filter((item) =>{
            return (item.visitorBookingSeqId ===  element.SEQ_ID);
          });
          element.att_check_in = 0;
          element.att_check_out = 0;
          element.att_check_in_time = '';
          element.att_check_out_time = '';
          if(list1 && list1.length > 0) {
            element.att_check_in = list1[0].att_check_in;
            element.att_check_out = list1[0].att_check_out;
            element.att_check_in_time = list1[0].att_check_in_time;
            element.att_check_out_time = list1[0].att_check_out_time;
            element.att_id = list1[0].att_id;
          }
        });
        this.filterTechnologies("");
        this.isFetching = false;
      },
      async (err) => {
        this.isLoadingFinished = true;
        this.isFetching = false;
        if(err && err.message == "No Internet"){
          return;
        }
        try {
          var result = JSON.parse(err.toString());
          if(result.message){
            this.apiProvider.showAlert(result.message);
            return;
          }
        } catch (error) {

        }

        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
          var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          this.apiProvider.showAlert(message);
          return;
        }

        if(err && err.Table && err.Table[0].Code !== 10 && err.Table1 && err.Table1[0].Description){

          this.apiProvider.showAlert(err.Table1[0].Description);
          return;
          }
        this.apiProvider.showAlert(this.T_SVC['ACC_MAPPING.CANT_FIND_LICENSE']);
      }
    );
  }

  doRefresh(refresher) {
    this.appointments = [];
    this.appointmentsCone = [];
    this.getBranchAppointments(refresher, false, true);
  }

  filterTechnologies(event) {
    const searchtext = event? event.target.value: "";
		 let val : string 	= searchtext;
		 // DON'T filter the technologies IF the supplied input is an empty string
		 if (val){
      this.appointmentsCone =  this.appointments.filter((item) =>{
        return (item.VISITOR_NAME.toLowerCase().indexOf(val.toLowerCase()) > -1 || item.STAFF_NAME.toLowerCase().indexOf(val.toLowerCase()) > -1 || item.VISITOR_IC.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
     } else {
      this.appointmentsCone = this.appointments;
     }
  }

  onCancel(){
    this.appointmentsCone = this.appointments;
  }

  goBack() {
    this.router.navigateByUrl('security-dash-board-page');
    console.log('goBack ');
   }

}
