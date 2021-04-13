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

	constructor(public navCtrl: NavController,
		 private events : EventsService,
     private router: Router,
		 private translate: TranslateService,
		 private alertCtrl: AlertController, public apiProvider: RestProvider) {
			this.translate.get([
				'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL']).subscribe(t => {
					this.T_SVC = t;
			});
			events.observeDataCompany().subscribe((data: any)=> {
          if (data.action === 'NotificationReceived') {
            console.log("Notification Received: " + data.title);
            this.showNotificationCount();
          }

			});


  }

  ionViewDidEnter() {
		console.log('ionViewDidEnter AppointmentHistoryPage');

	}

	ionViewWillEnter() {
		this.events.publishDataCompany({
      action: "page",
      title: "home-view",
      message: ''
    });
		this.showNotificationCount();
		console.log('ionViewWillEnter AppointmentHistoryPage');
		this.OffSet = 0;
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
			"Rows":"100"
		};
			// this.VM.host_search_id = "adam";
			this.apiProvider.syncAppointment(params, false, true).then(
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

  viewBooking(list){

		if(!list[0].appointment_group_id){
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


  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

  createBooking(){
    this.router.navigateByUrl('add-appointment');
  }

  ngOnInit() {
  }

}
