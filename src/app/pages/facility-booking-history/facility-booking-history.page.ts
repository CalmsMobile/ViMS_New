import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-facility-booking-history',
  templateUrl: './facility-booking-history.page.html',
  styleUrls: ['./facility-booking-history.page.scss'],
})
export class FacilityBookingHistoryPage implements OnInit {


	films: any;
	OffSet = 0;
	notificationCount = 0;
  showNotification = false;
	appointments:any = [];
	T_SVC:any;
	loadingFinished = true;
  alertShowing = false;
  isFacilityApp = false;
	constructor(public navCtrl: NavController,
		private  translate : TranslateService,
    private router: Router,
		private events : EventsService,
    private datePipe: DatePipe,
		private alertCtrl: AlertController, public apiProvider: RestProvider) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL' ,'ALERT_TEXT.EDIT_APPOINTMENT', 'ALERT_TEXT.DELETE_APPOINTMENT']).subscribe(t => {
        this.T_SVC = t;
    });
  }

  ionViewDidEnter() {
		console.log('ionViewDidEnter FacilityBookingHistoryPage');
    var MAppId = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).MAppId;
		if(MAppId == AppSettings.LOGINTYPES.FACILITY){
      this.isFacilityApp = true;
			this.events.publishDataCompany({
        action: "page",
        title: "home-view",
        message: ''
      });
		}
		this.OffSet = 0;
		this.getAppointmentHistory(null);
		var count = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
    if(count){
      this.notificationCount = parseInt(count);
    }
		var MAppId = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).MAppId;
		if(MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1){
			this.events.publishDataCompany({
        action: "page",
        title: "facility-booking-history",
        message: ''
      });
		}
    if (MAppId.indexOf(AppSettings.LOGINTYPES.NOTIFICATIONS) > -1) {
      this.showNotification = true;
    }
	}

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  openTooltip(event, message) {
    this.apiProvider.presentPopover(event, message);
  }

	ionViewWillLeave(){
		var MAppId = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).MAppId;
		if(MAppId == AppSettings.LOGINTYPES.FACILITY){
			this.events.publishDataCompany({
        action: "page",
        title: "home-view1",
        message: ''
      });
		}
  }

  editVisitors(slideDOM, action, item){

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

					var aList = JSON.parse(val.toString());

					if(refresher){
						this.appointments = aList.concat(this.appointments);
						refresher.target.complete();
					}else{
						this.appointments = aList;
					}

						this.OffSet = this.OffSet + aList.length;

						this.loadingFinished = true;

				},
				(err) => {
					this.loadingFinished = true;
					if(refresher){
						refresher.target.complete();
					}
					if(err && err.message == "No Internet"){
						return;
					}
					var message = "";
					if(err && err.message.indexOf("Http failure response for") > -1){
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
            fromPage: 'facility-booking-history'
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
              fromPage: 'facility-booking-history'
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
        if(err && err.message.indexOf("Http failure response for") > -1){
          message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
        } else if(err && JSON.parse(err) && JSON.parse(err).message){
          message =JSON.parse(err).message;
		}
		if(message){
          // message = " Unknown"
          let alert = this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass:'',
            buttons: ['Okay']
            });
            (await alert).present();
        }
			}
		);
	}

  }

  gotoNotification(){
    this.router.navigateByUrl("notifications");
  }

  createBooking(){
	this.router.navigateByUrl("facility-booking");

  }

  ngOnInit() {
  }

}
