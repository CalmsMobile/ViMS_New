import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-appointment-history',
  templateUrl: './appointment-history.page.html',
  styleUrls: ['./appointment-history.page.scss'],
})
export class AppointmentHistoryPage implements OnInit {


	films: any;
	OffSet = 0;
	notificationCount = 0;
	appointments:any = [];
	T_SVC:any;
	loadingFinished = true;
	isAdmin = true;
  alertShowing = false;
  QRObj: any = {};
  HOSTWTTAMS = AppSettings.LOGINTYPES.HOSTAPPTWITHTAMS;
  TAMS = AppSettings.LOGINTYPES.TAMS;
	constructor(public navCtrl: NavController,
		 private events : EventsService,
     private router: Router,
     private datePipe: DatePipe,
		 private translate: TranslateService,
		 private alertCtrl: AlertController, public apiProvider: RestProvider) {
			this.translate.get([
				'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'ALERT_TEXT.EDIT_APPOINTMENT', 'ALERT_TEXT.DELETE_APPOINTMENT']).subscribe(t => {
					this.T_SVC = t;
			});
			events.observeDataCompany().subscribe((data: any)=> {
          if (data.action === 'NotificationReceived') {
            console.log("Notification Received: " + data.title);
            this.showNotificationCount();
          } else  if (data.action === 'delete') {
            this.OffSet = 0;
            this.getAppointmentHistory(null);
          }

			});


  }

  ionViewDidEnter() {
		console.log('ionViewDidEnter AppointmentHistoryPage');
    this.events.publishDataCompany({
      action: "page",
      title: "home-view",
      message: ''
    });
		this.showNotificationCount();
		this.OffSet = 0;
		this.getAppointmentHistory(null);
	}

  openTooltip(event, message) {
    this.apiProvider.presentPopover(event, message);
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

	gotoAdminPage(){
		this.router.navigateByUrl("admin-home");
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
		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var hostId = JSON.parse(hostData).HOST_ID;
			var params = {"hostID":hostId,
			"lastSyncDate":"",
			"OffSet": ""+ this.OffSet,
			"Rows":"20000"
		};
			// this.VM.host_search_id = "adam";
			this.apiProvider.syncAppointment(params, false, true).then(
				(val) => {
					this.loadingFinished = true;
					var aList = JSON.parse(val.toString());

					if(refresher){
						this.appointments = aList;
						refresher.target.complete();
					}else if (this.OffSet === 0){
            this.appointments = aList;
          }else {
            this.appointments = aList.concat(this.appointments);
					}

						this.OffSet = this.OffSet + aList.length;



				},
				async (err) => {
					this.loadingFinished = true;
					if(refresher){
						refresher.target.complete();
					}
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
              cssClass: '',
              message: message,
              buttons: ['Okay']
            });
							alert.present();
					}
				}
			);
		}
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

  viewBooking(list){

		if(!list[0].appointment_group_id){
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


  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

  createBooking(){
    this.router.navigateByUrl('add-appointment');
  }

  ngOnInit() {
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      this.QRObj = JSON.parse(qrData);
    }
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

}
