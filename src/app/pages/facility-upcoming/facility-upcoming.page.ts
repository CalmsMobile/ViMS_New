import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-facility-upcoming',
  templateUrl: './facility-upcoming.page.html',
  styleUrls: ['./facility-upcoming.page.scss'],
})
export class FacilityUpcomingPage implements OnInit {

  films: any;
  OffSet = 0;
  showNotification = false;
  notificationCount = 0;
  appointments:any = [];
  futureAppointments = [];
  todayAppointments = [];
  tomorrowAppointments = [];
  T_SVC:any;
  loadingFinished = false;
  constructor(public navCtrl: NavController,
    private router: Router,
    private  translate : TranslateService,
    private datePipe: DatePipe,
    private events: EventsService,
    private alertCtrl: AlertController, public apiProvider: RestProvider) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL']).subscribe(t => {
        this.T_SVC = t;
    });
    events.observeDataCompany().subscribe((data1:any) => {
      if (data1.action === "NotificationReceived") {
        console.log("Notification Received: " + data1.title);
        this.showNotificationCount();
      } else if (data1.action === 'refreshApproveList' || data1.action === 'delete' || data1.action === 'RefreshUpcoming') {
        this.OffSet = 0;
        this.appointments = [];
        this.getAppointmentHistory(null);
      }
    });
  }

  showNotificationCount(){
    var count = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
    if(count){
      this.notificationCount = parseInt(count);
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter FacilityBookingUpcomingPage');
    this.OffSet = 0;
    this.getAppointmentHistory(null);
    this.showNotificationCount();

    this.events.publishDataCompany({
      action: "page",
      title: "home-view",
      message: ''
    });

  }

  getDayofDate(dateString){
    let dateObject = new Date(dateString);
    let weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return weekdays[dateObject.getDay()];
  }

  doRefresh(refresher) {
    // this.OffSet = this.OffSet + 20;

    this.OffSet = 0;
    this.getAppointmentHistory(refresher);
    //setTimeout(()=>{refresher.target.complete();},2000)
  }

  getAppointmentHistory(refresher){
    this.loadingFinished = false;

    // var qrJsonString1 = "{\"aptid\":\"24\",\"aptgid\":\"\",\"cid\":\"\"}";
    // var key = CryptoJS.enc.Utf8.parse('qweqweqweqweqweq');
    // var iv = CryptoJS.enc.Utf8.parse('qweqweqweqweqweq');

    // var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(qrJsonString1), key,
    // {
    //     keySize: 128,
    //     iv: iv,
    //     mode: CryptoJS.mode.CBC,
    //     padding: CryptoJS.pad.Pkcs7
    // });
    // console.log("encrypted :" + encrypted);

    if(!refresher){
      this.OffSet = 0;
    }

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var hostId = JSON.parse(hostData).HOSTIC;
      var params = {
      "StaffSeqId": hostId,
      "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
      "OffSet": ""+ this.OffSet,
      "Rows":"20000"
    };
      // this.VM.host_search_id = "adam";
      this.apiProvider.VimsAppGetHostFacilityBookingList(params, true).then(
        (val) => {
          this.loadingFinished = true;
          var aList = JSON.parse(val.toString());

          if(refresher){
            this.appointments = aList.concat(this.appointments);
            refresher.target.complete();
          }else{
            this.appointments = aList;
          }

          this.OffSet = this.OffSet + aList.length;

          this.todayAppointments = [];
          this.tomorrowAppointments = [];
          this.futureAppointments = [];

          for(let items in this.appointments){
            var cObj = this.appointments[items];
            if(this.checkIsToday(cObj.StartDateTime, "Today")){
              this.todayAppointments.push(cObj);
            }else if(this.checkIsToday(cObj.StartDateTime, "Tomorrow")){
              this.tomorrowAppointments.push(cObj);
            }else if(this.checkIsToday(cObj.StartDateTime, "Future")){
              this.futureAppointments.push(cObj);
            }

          }

        },
        (err) => {
          this.loadingFinished = true
          if(refresher){
            refresher.target.complete();
          }
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

    openTooltip(event, message) {
      this.apiProvider.presentPopover(event, message);
    }

    logDrag(event, item, slideDOM) {
      let percent = event.detail.ratio;
      if (percent > 0) {
        this.closeSlide(slideDOM);
        // this.showAlertForSlide('delete', item);
      } else {
        this.closeSlide(slideDOM);
        // this.showAlertForSlide('edit', item);

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

    editVisitors(slideDOM, action, item){

    }

    checkIsToday(fromDate, dateCondition){
      if(fromDate){
        let fromdateObject = new Date(fromDate.split("T")[0]).getTime();
        let cDatee = new Date();

        if(dateCondition == "Today"){
          var month = ""+ (cDatee.getMonth()+1);
          if(cDatee.getMonth()+1 < 10){
            month = "0"+ (cDatee.getMonth()+1);
          }
          var date = ""+ cDatee.getDate();
          if(cDatee.getDate() < 10){
            date = "0"+ cDatee.getDate();
          }
          let todayObject = new Date(cDatee.getFullYear()+"-"+month+"-"+ date).getTime();
          if(todayObject == fromdateObject){
            return true;
          }else{
            return false;
          }
        }else if(dateCondition == "Tomorrow"){
          cDatee.setDate(cDatee.getDate() + 1);
          month = ""+ (cDatee.getMonth()+1);
          if(cDatee.getMonth()+1 < 10){
            month = "0"+ (cDatee.getMonth()+1);
          }
          date = ""+ cDatee.getDate();
          if(cDatee.getDate()+1 < 10){
            date = "0"+ cDatee.getDate();
          }
          let todayObject = new Date(cDatee.getFullYear()+"-"+month+"-"+ date).getTime();
          if(todayObject == fromdateObject){
            return true;
          }else{
            return false;
          }
        }else if(dateCondition == "Future"){
          cDatee.setDate(cDatee.getDate() + 2);
          month = ""+ (cDatee.getMonth()+1);
          if(cDatee.getMonth()+1 < 10){
            month = "0"+ (cDatee.getMonth()+1);
          }
          date = ""+ cDatee.getDate();
          if(cDatee.getDate()+1 < 10){
            date = "0"+ cDatee.getDate();
          }
          let todayObject = new Date(cDatee.getFullYear()+"-"+month+"-"+ date).getTime();
          if(todayObject <= fromdateObject){
            return true;
          }else{
            return false;
          }
        }

      }else{
        return false;
      }

    }

  viewBooking(list){
    var item = {
      "STAFF_NAME": list[0].FacilityName,
      "VISITOR_NAME": list[0].FacilityName,
      "REASON": list[0].PurposeName,
      "START_DATE": list[0].StartDateTime,
      "END_DATE": list[0].StartDateTime,
      "START_TIME": list[0].StartDateTime,
      "END_TIME": list[0].StartDateTime,
      "Approval_Status": "Approved",
      "Remarks": list[0].Remarks,
      "Booked_By": "Host",
      "FacilityBookingID": list[0].BookingID,
      "appointment_group_id": list[0].BookingID,
      "isFacilityAlone": true
    }
    list = [item];
    if(list[0].isFacilityAlone){

      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            appointment: list,
            fromPage: 'home-view'
          }
        }
      };
      this.router.navigate(['appointment-details'], navigationExtras);
      return;
    }
  var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var HOSTIC = JSON.parse(hostData).HOSTIC;
      var params = {
      "STAFF_IC":HOSTIC,
      "appointment_group_id": list[0].appointment_group_id,
      "CurrentDate": this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };
    // this.VM.host_search_id = "adam";
    this.apiProvider.GetAppointmentByGroupId(params).then(
      (val) => {
        var aList = JSON.parse(val.toString());
        const navigationExtras: NavigationExtras = {
          state: {
            passData: {
              appointment: aList,
              fromPage: 'home-view'
            }
          }
        };
        this.router.navigate(['appointment-details'], navigationExtras);
      },
      async (err) => {

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
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
        }
      }
    );
  }

   }


  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

  createBooking(){
  this.router.navigateByUrl("facility-booking");
  }

  ngOnInit() {
    const MAppId = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).MAppId;
    if (MAppId.indexOf(AppSettings.LOGINTYPES.NOTIFICATIONS) > -1) {
      this.showNotification = true;
    }
  }

}
