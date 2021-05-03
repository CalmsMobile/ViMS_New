import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, ActionSheetController, ToastController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CustomPipe } from 'src/app/pipes/custom/custom';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-manage-appointment',
  templateUrl: './manage-appointment.page.html',
  styleUrls: ['./manage-appointment.page.scss'],
})
export class ManageAppointmentPage implements OnInit {

  selectedDay = new Date()
  selectedObject
  eventSource =[];

  viewTitle;
  isToday: boolean;
  appointments = [];
  aList = [];

  calendarModes = [
    { key: 'month', value: 'Month' },
    { key: 'week', value: 'Week' },
    { key: 'day', value: 'Day' },
  ]
  calendar = {
    mode: this.calendarModes[0].key,
    currentDate: new Date()
  }; // these are the variable used by the calendar.
  QRObj : any;
  T_SVC:any;
  notificationCount = 0;
  isAdmin = true;
  alertShowing = false;
  constructor(public navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private apiProvider: RestProvider,
    private groupBy : CustomPipe,
    private router: Router,
    private events : EventsService,
    private toastCtrl : ToastController,
    private translate : TranslateService,
    private alertCtrl : AlertController) {

      this.translate.get([
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'ALERT_TEXT.EDIT_APPOINTMENT', 'ALERT_TEXT.DELETE_APPOINTMENT']).subscribe(t => {
          this.T_SVC = t;
      });

        try{
          var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
          if(qrInfo && JSON.parse(qrInfo) && JSON.parse(qrInfo).MAppId){
            this.QRObj = JSON.parse(qrInfo);
          }
        }catch(e){

        }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter ManageAppointmentPage');
  }

  ionViewWillLeave(){


  }

  showNotificationCount(){
    var count = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
    if(count){
      this.notificationCount = parseInt(count);
    }
  }

  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

  gotoAdminPage(){
    this.router.navigateByUrl('admin-home');
	}

  ionViewWillEnter(){
    this.events.publishDataCompany({
      action: "page",
      title: "home-view",
      message: ''
    });
    this.showNotificationCount();
    if(this.QRObj){
      if(this.QRObj.MAppId == AppSettings.LOGINTYPES.FACILITY){
        this.getAppointmentFacilityHistory();
      }else{
        this.getAppointmentHistory();
      }

    }

  }

  getDayofDate(dateString){
		let dateObject = new Date(dateString);
		let weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
		return weekdays[dateObject.getDay()];
  }

  getAppointmentFacilityHistory(){

		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var hostId = JSON.parse(hostData).HOSTIC;
			var params = {
      "StaffSeqId": hostId,
      "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
			"OffSet": "0",
			"Rows":"2000"
		};
      // this.VM.host_search_id = "adam";
      var showLoading = false;
      var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
      if(qrInfo && JSON.parse(qrInfo) && JSON.parse(qrInfo).MAppId == AppSettings.LOGINTYPES.FACILITY){
        showLoading = true;
      }
			this.apiProvider.VimsAppGetHostFacilityBookingList(params, showLoading).then(
				(val) => {
					var aList = JSON.parse(val.toString());
          for(var i = 0 ; i < aList.length ; i++){
            var item = {
              "STAFF_NAME": aList[i].FacilityName,
              "VISITOR_NAME": aList[i].FacilityName,
              "REASON": aList[i].PurposeName,
              "START_DATE": aList[i].StartDateTime,
              "END_DATE": aList[i].StartDateTime,
              "START_TIME": aList[i].StartDateTime,
              "END_TIME": aList[i].StartDateTime,
              "Approval_Status": "Approved",
              "Remarks": aList[i].Remarks,
              "Booked_By": "Host",
              "FacilityBookingID": aList[i].BookingID,
              "appointment_group_id": aList[i].BookingID,
              "isFacilityAlone": true
            }
            this.aList[this.aList.length] = item;
          }
          this.appointments = this.groupBy.transform(this.aList, 'appointment_group_id');
          this.loadEvents();
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
              cssClass: 'alert-danger',
              message: message,
              buttons: ['Okay']
            });
							alert.present();
					}
				}
			  );
		  }
	  }

  getAppointmentHistory(){
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var hostId = JSON.parse(hostData).HOST_ID;
			var params = {"hostID":hostId,
			"lastSyncDate":"",
			"OffSet": ""+ 0,
			"Rows":"2000"
		};
			// this.VM.host_search_id = "adam";
			this.apiProvider.syncAppointment(params, false, true ).then(
				(val) => {
					this.aList = JSON.parse(val.toString());

          this.appointments = this.groupBy.transform(this.aList, 'appointment_group_id');
          this.loadEvents();
          if(this.QRObj.MAppId != AppSettings.LOGINTYPES.HOSTAPPT){
            this.getAppointmentFacilityHistory();
          }

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
              cssClass: 'alert-danger',
              buttons: ['Okay']
            });
              alert.present();
          }
				}
			);
		}
  }
  loadEvents() {
    //this.eventSource = this.createRandomEvents();
    this.eventSource = [];
    for(var i = 0 ; i < this.appointments.length ; i++){
      var item = this.appointments[i];
      var event = {
        "startTime": new Date(item.value[0].START_DATE),
        "endTime": new Date(item.value[0].END_DATE),
        "value": item
      }
      this.eventSource[this.eventSource.length] = event;
    }
    console.log("appointments: "+ JSON.stringify(this.eventSource));
    this.today();
  }
  onViewTitleChanged(title) {
    this.viewTitle = title;
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


  viewBooking(list){
    if(list[0].isFacilityAlone){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            appointment: list
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
        "appointment_group_id": list[0].appointment_group_id
      };
      // this.VM.host_search_id = "adam";
      this.apiProvider.GetAppointmentByGroupId(params).then(
        (val) => {
          var aList = JSON.parse(val.toString());
          const navigationExtras: NavigationExtras = {
            state: {
              passData: {
                appointment: aList
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
              cssClass: 'alert-danger',
              buttons: ['Okay']
            });
              alert.present();
          }
        }
      );
    }

     }

  onEventSelected(event) {
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
  }
  changeMode(mode) {
    this.calendar.mode = mode;
  }
  today() {
    this.calendar.currentDate = new Date();
  }
  onTimeSelected(ev) {
    console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
      (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
    this.selectedObject = ev
    // this.openActionSheet(ev)
  }
  onCurrentDateChanged(event: Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();

    this.selectedDay = event

  }

  onRangeChanged(ev) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }
  markDisabled = (date: Date) => {
    var current = new Date();
    current.setHours(0, 0, 0);
    // return (date < current);
    return false;
  };

  async openActionSheet(event) {
    console.log('opening');
    let actionsheet = await this.actionSheetCtrl.create({
      header: "Choose Option",
      cssClass: 'alert-warning',
      buttons: [
        {
          text: 'Block Date',
          handler: () => {
            console.log("Block Date Clicked: ", event);
            let d = event.selectedTime;
            //d.setHours(0, 0, 0);
            setTimeout(() => {
              this.blockDayEvent(d);
            }, 2);
          }
        },
        {
          text: 'Meet Up With',
          handler: function () {
            console.log("Meet Up With Clicked");
          }
        }
      ]
    }); actionsheet.present();
  }

  blockDayEvent(date) {
    let startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    let endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    let events = this.eventSource;
    events.push({
      title: 'All Day ',
      startTime: startTime,
      endTime: endTime,
      allDay: true
    });
    this.eventSource = [];
    setTimeout(() => {
      this.eventSource = events;
    });
  }

  addEvent() {
    // let modal = this.modalCtrl.create({
    //   component: AddEventModalComponent,
    //   componentProps:{ selectedDay: this.selectedDay }
    // });
    // modal.present();
    // modal.onDidDismiss(data => {
    //   if (data) {
    //     let eventData = data;

    //     eventData.startTime = new Date(data.startTime);
    //     eventData.endTime = new Date(data.endTime);

    //     let events = this.eventSource;
    //     events.push(eventData);
    //     this.eventSource = [];
    //     setTimeout(() => {
    //       this.eventSource = events;
    //     });
    //   }
    // });
  }

  onOptionSelected($event: any) {
    console.log($event)
    //this.calendar.mode = $event
  }

  showLoading(currentClass){
    if(!currentClass.loading){
      currentClass.loading = currentClass.loadingCtrl.create({
        content: 'Please wait...',
        dismissOnPageChange: true,
        showBackdrop: true,
        enableBackdropDismiss: true
      });
      currentClass.loading.present();
    }

  }

  syncFromGoogleCalender(){
      var success = function(result) {
        console.log(result);
        // alert(result);
      }
      var failure = function(result) {
        console.log(result);
        // alert(result);
      }
  }

  //   calendarEvent:any = {};
  //   attendees = [{
  //      email:""
  //   }];
  //   validation:any = {};
  //   CLIENT_ID = '1079514185304-9p7e0s3qk2mj5rvbh4bktp3sak7ekh6l.apps.googleusercontent.com'; // Client ID of your google console project
  //   SCOPES = ["https://www.googleapis.com/auth/calendar"];
  //   APIKEY = "AIzaSyCYqTkXob9r2ee3tzLG8_JYjEGcerZNPtE"; // API key of your google console project
  //   REDIRECTURL = "http://localhost/callback";
  //   sendInvite() {
  //       if(!this.validate()) {
  //         alert("Please fill all fields for sending invite.");
  //         return;
  //       }
  //       this.validation.failure = false;
  //       var startDateTimeISO = this.buildISODate(this.calendarEvent.startDate, this.calendarEvent.startTime);
  //       var enddateTimeISO = this.buildISODate(this.calendarEvent.endDate, this.calendarEvent.endTime);
  //       this.popLastAttendeeIfEmpty(this.attendees);
  //       const browserRef: InAppBrowserObject = this.iab.create('https://accounts.google.com/o/oauth2/auth?client_id=' + this.CLIENT_ID + '&redirect_uri=' + this.REDIRECTURL + '&scope=https://www.googleapis.com/auth/calendar&approval_prompt=force&response_type=token', '_blank', 'location=no');

  //       browserRef.on('loadstart').subscribe((event: InAppBrowserEvent) => {
  //         if ((event["url"]).indexOf("http://localhost/callback") === 0) {
  //           var url = event["url"];
  //           var token = url.split('access_token=')[1].split('&token_type')[0];
  //           browserRef.on('exit').subscribe((event: InAppBrowserEvent) => {

  //           });
  //           //SENDING THE INVITE USING THE GOOGLE CALENDAR API
  //           gapi.client.setApiKey(this.APIKEY);
  //           var request = gapi.client.request({
  //             'path': '/calendar/v3/calendars/primary/events?alt=json',
  //             'method': 'POST',
  //             'headers': {
  //               'Authorization': 'Bearer ' + token
  //             },
  //             'body': JSON.stringify({
  //               "summary": this.calendarEvent.name,
  //               "location": this.calendarEvent.location,
  //               "description": this.calendarEvent.description,
  //               "start": {
  //                 "dateTime": startDateTimeISO,
  //                 "timeZone": "Asia/Kolkata" // TODO : Parameterize this
  //               },
  //               "end": {
  //                 "dateTime": enddateTimeISO,
  //                 "timeZone": "Asia/Kolkata" // TODO : Parameterize this
  //               },
  //               "recurrence": [
  //                 "RRULE:FREQ=DAILY;COUNT=1" //// TODO : Parameterize this, Frequency of the event
  //               ],
  //               "attendees": this.attendees,
  //               "reminders": {
  //                 "useDefault": false,
  //                 "overrides": [
  //                   {
  //                     "method": "email",
  //                     "minutes": 1440   		// TODO : Parameterize this, No. of minutes before you want google services to send an email reminder
  //                   },
  //                   {
  //                     "method": "popup",
  //                     "minutes": 10 				// TODO : Parameterize this, No. of minutes before you want google services to send an popup reminder
  //                   }
  //                 ]
  //               }
  //             }),
  //             'callback': function (jsonR, rawR) {
  //               if(jsonR.id){
  //                 alert("Invitation sent successfully");
  //               } else {
  //                 alert("Failed to sent invite.");
  //               }
  //               console.log(jsonR); // Everything related to invite once created, use this for further enhancements
  //             }
  //           });
  //         }
  //      });

  //      browserRef .on('loadstop').subscribe((event) => {
  //       // write what behavior you want on closing browser
  //       // browserRef.close();
  //     });
  //     browserRef.show();
  //   }
  //   buildISODate(date, time){
  //       var dateArray = date && date.split('-');
  //       var timeArray = time && time.split(':');
  //       var normalDate = new Date(parseInt(dateArray[0]), parseInt(dateArray[1])-1, parseInt(dateArray[2]), parseInt(timeArray[0]), parseInt(timeArray[1]), 0, 0);
  //       return normalDate.toISOString();
  //   }
  //   popLastAttendeeIfEmpty(itemsList){
  //       if(!!itemsList.length){
  //         return itemsList[0]["email"] == "" ? itemsList.shift(itemsList[0]) : itemsList;
  //       }
  //       return [];
  //   }
  //   addAttendees(){
  //       if(this.attendees[this.attendees.length - 1].email == '') return;
  //       var newAttendee = {email:""};
  //       this.attendees.unshift(newAttendee);
  //   }
  //   removeAttendees(itemIndex){
  //       this.attendees.splice(itemIndex, 1);
  //   }
  //   validate() {
  //     this.calendarEvent.name = "MyFestEvent";
  //     this.calendarEvent.location = "MyFestEvent";
  //     this.calendarEvent.description = "MyFestEvent";
  //     this.calendarEvent.startDate = "13-11-2019";
  //     this.calendarEvent.startTime = "03:00 pm";
  //     this.calendarEvent.endDate = "13-11-2019";
  //     this.calendarEvent.endTime = "05:00 pm";
  //     this.attendees = [{
  //       "email": "vijaytrova@gmail.com"
  //     }];
  //       return this.isStringValid(this.calendarEvent.name) &&
  //       this.isStringValid(this.calendarEvent.location) &&
  //       this.isStringValid(this.calendarEvent.description) &&
  //       this.isStringValid(this.calendarEvent.startDate) &&
  //       this.isStringValid(this.calendarEvent.startTime) &&
  //       this.isStringValid(this.calendarEvent.endDate) &&
  //       this.isStringValid(this.calendarEvent.endTime) &&
  //       this.areAttendeesValid(this.attendees);
  //   }
  //   isStringValid(str){
  //     if (typeof str != 'undefined' && str) {
  //         return true;
  //     };
  //     return false;
  //   }
  //   areAttendeesValid(attendees){
  //     if(attendees.length == 1 && !this.isStringValid(attendees[0]["email"])){
  //         return false;
  //     }
  //     return true;
  //   }
  ngOnInit() {
  }

}
