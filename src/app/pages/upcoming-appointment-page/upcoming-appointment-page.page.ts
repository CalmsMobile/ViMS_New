import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-upcoming-appointment-page',
  templateUrl: './upcoming-appointment-page.page.html',
  styleUrls: ['./upcoming-appointment-page.page.scss'],
})
export class UpcomingAppointmentPagePage implements OnInit {

  OffSet = 0;
  futureAppointments = [];
  todayAppointments = [];
  tomorrowAppointments = [];
  appointments = [];
  notificationCount = 0;
  T_SVC:any;
  loadingFinished = false;
  alertShowing = false;
  isAdmin = true;
  QRObj: any = {};
  HOSTWTTAMS = AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS;
  TAMS = AppSettings.LOGINTYPES.TAMS;
  constructor(public navCtrl: NavController,
    private events : EventsService,
    private router: Router,
    private translate : TranslateService,
    private datePipe: DatePipe,
    private alertCtrl: AlertController, public apiProvider: RestProvider) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'ALERT_TEXT.EDIT_APPOINTMENT', 'ALERT_TEXT.DELETE_APPOINTMENT']).subscribe(t => {
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

  getAppointmentStatus(appointments1) {
    let result = '';
    let appointment = appointments1.find(item => item.Approval_Status === 'Approved');
    if (appointment) {
      result = 'Approved';
    } else {
      appointment = appointments1.find(item => item.Approval_Status === 'Pending');
      if (appointment) {
        result = 'Pending';
      } else {
        appointment = appointments1.find(item => (item.Approval_Status === 'Canceled' || item.Approval_Status === 'Cancelled'));
        if (appointment) {
          result = 'Canceled';
        }
      }
    }


    return result;
  }

  openTooltip(event, message) {
    this.apiProvider.presentPopover(event, message);
  }
  ionViewDidEnter() {
    console.log('ionViewDidEnter UpcomingAppointmentPage');
    this.events.publishDataCompany({
      action: "page",
      title:   "home-view",
      message: ''
    });
    this.showNotificationCount();
    this.OffSet = 0;
    // this.menu.enable(true,"myLeftMenu");
    this.getAppointmentHistory(null);
  }

  ionViewWillLeave(){
    this.events.publishDataCompany({
      action: "page",
      title: "home-view1",
      message: ''
    });
  }

  showNotificationCount(){
    var count = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
    if(count){
      this.notificationCount = parseInt(count);
    }
  }

  getDayofDate(dateString){
		let dateObject = new Date(dateString);
		let weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
		return weekdays[dateObject.getDay()];
  }

  gotoAdminPage(){
    this.router.navigateByUrl('admin-home');
  }

  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

  goBack() {

    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      const QRObj = JSON.parse(qrData);
      if (QRObj.MAppId === AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS || QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
        this.router.navigateByUrl('home-tams');
      }
    }
    console.log('goBack ');
   }

  checkIsToday(fromDate, toDate, dateCondition){
    if(fromDate && toDate){
      let fromdateObject = new Date(fromDate.split("T")[0]).getTime();
      let todateObject = new Date(toDate.split("T")[0]).getTime();
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
        if(cDatee.getDate() < 10){
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
        if(cDatee.getDate() < 10){
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


	doRefresh(refresher) {
    // this.OffSet = this.OffSet + 20;
    this.getAppointmentHistory(refresher);
    //setTimeout(()=>{refresher.target.complete();},2000)
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

  async showAlertForSlide(action, item) {
    if (this.alertShowing) {
      return;
    }

    console.log((action === 'edit')? 'left side ': 'right side' +  ' >>> '  + action);
    this.alertShowing = true;
    let msg = this.T_SVC['ALERT_TEXT.EDIT_APPOINTMENT'];
    if (action === 'delete') {
      msg = this.T_SVC['ALERT_TEXT.DELETE_APPOINTMENT'];
    }
    let alert = await this.alertCtrl.create({
      header: 'Confirmation',
      message: msg,
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
          text: 'Proceed',
          handler: () => {
          console.log(action +' clicked');
          // this.VM.visitors.splice(index, 1);

          }
        }
      ]
    });
    alert.present();
    alert.onWillDismiss().then(() => {
      this.alertShowing = false;
    })
  }

	getAppointmentHistory(refresher){

		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (this.QRObj.MAppId === AppSettings.LOGINTYPES.FACILITY){
      return;
    }
    if(hostData){
      this.loadingFinished = false;
      var hostId = JSON.parse(hostData).HOST_ID;
			var params = {"hostID":hostId,
			"lastSyncDate":"",
			"OffSet": ""+ this.OffSet,
			"Rows":"20000"
		};
			// this.VM.host_search_id = "adam";
			this.apiProvider.syncAppointment(params, true, false).then(
				(val) => {
          this.loadingFinished = true;
					var aList = JSON.parse(val.toString());
					if(refresher){
            // this.appointments = aList.concat(this.appointments);
            this.appointments = aList;
						refresher.target.complete();
					}else{
						this.appointments = aList;
					}
          this.todayAppointments = [];
          this.tomorrowAppointments = [];
          this.futureAppointments = [];
          this.OffSet = this.OffSet + aList.length;
          for(let items in this.appointments){
            var cObj = this.appointments[items];
            if(this.checkIsToday(cObj.START_DATE, cObj.END_DATE, "Today")){
              this.todayAppointments.push(cObj);
            }else if(this.checkIsToday(cObj.START_DATE, cObj.END_DATE, "Tomorrow")){
              this.tomorrowAppointments.push(cObj);
            }else if(this.checkIsToday(cObj.START_DATE, cObj.END_DATE, "Future")){
              this.futureAppointments.push(cObj);
            }

          }
				},
				async (err) => {
          this.loadingFinished = true;
          if(refresher ){
            refresher.target.complete();
          }
          if(err && err.message == "No Internet"){
            return;
          }
          this.appointments = [];
          var message = "";
        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
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

  viewBooking(list){
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
    if(hostData ){
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
        if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
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
	createBooking(){
    this.router.navigateByUrl('add-appointment');
  }

  takeActionForScan(page){
    if(page.component == "add-appointment"){
      this.router.navigateByUrl(page.component);
    }else{
      this.router.navigateByUrl(page.component);
    }
  }

  ngOnInit() {
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      this.QRObj = JSON.parse(qrData);
      if (this.QRObj.MAppId === AppSettings.LOGINTYPES.FACILITY){
        this.isAdmin = false;
      }
    }
  }

}
