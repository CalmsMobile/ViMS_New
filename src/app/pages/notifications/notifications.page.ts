import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite/ngx';
import { NavController, AlertController, ToastController, Platform, IonItemSliding, IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FCM } from 'plugins/cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  @ViewChild(IonContent)	content:IonContent;
  recentLoadedList = [];
  VM = {
    "act_segment":"all",
		"notificationList":[],
		"searchGeneralNotificationList":[],
		"searchInNotificationList":[]
  }
  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage":"assets/images/profile_bg.jpg"
	};

	OffSet = 0;
	queryText = "";
	selectedTap = 'general';
	db : SQLiteObject = null;
	isFetching = false;
  lastRecievedMessage = '';
	T_SVC:any;
	imageURLType = '01&RefType=VP&Refresh='+ new Date().getTime();
	loadingFinished = false;
	showDelete = false;
  qrCodeInfo: any = {};
  isSecurityApp = false;
  hostObj: any = {

  };
  showProfileHeader = false;
  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl:ToastController,
		public apiProvider: RestProvider,
		private events : EventsService,
    private router: Router,
    private route: ActivatedRoute,
		private sqlite: SQLite,
    private ngzone: NgZone,
    private fcm: FCM,
		private platform : Platform,
		private localNotifications : LocalNotifications,
    private translate:TranslateService) {
		this.translate.get([
			'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
			'ALERT_TEXT.DELETE_SUCCESS',
		'ALERT_TEXT.DELETE_NOTIFIACTION']).subscribe(t => {
				this.T_SVC = t;
		});
    const qrinfo = localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrinfo) {
      this.qrCodeInfo = JSON.parse(qrinfo);
      this.isSecurityApp = (this.qrCodeInfo.MAppId === AppSettings.LOGINTYPES.SECURITYAPP);
      this.showProfileHeader = this.qrCodeInfo.MAppId === AppSettings.LOGINTYPES.NOTIFICATIONS;
    }
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        var type= passData.type;
        //alert("type : "+type);
        if(type && type == "Visitor"){
          this.selectedTap = 'in';
        }
      }
    });

		if(!this.platform.is('cordova')) {
			this.getAppointmentHistory(null, false);
		}else{
			this.sqlite.create({name: AppSettings.LOCAL_DB,location: 'default'}).then((db: SQLiteObject) => {
				this.db = db;
				var createTable = "CREATE TABLE IF NOT EXISTS "+AppSettings.DATABASE.TABLE.Notification+"("
				+AppSettings.DATABASE.NOTIFICATION.PNHistory+" TEXT,"
				+AppSettings.DATABASE.NOTIFICATION.RefPushSeqId+" TEXT,"
				+AppSettings.DATABASE.NOTIFICATION.RefUserSeqId+" TEXT,"
				+AppSettings.DATABASE.NOTIFICATION.IsRead+" BOOLEAN,"
				+AppSettings.DATABASE.NOTIFICATION.PushSeqId+" TEXT,"
				+AppSettings.DATABASE.NOTIFICATION.HtmlContent+" TEXT,"
				+AppSettings.DATABASE.NOTIFICATION.NotificationType+" INT,"
				+AppSettings.DATABASE.NOTIFICATION.CreatedOn+" DATETIME)";
				console.log("createTable:"+ createTable);
				db.executeSql(createTable, [])
				.then(res => {
					console.log('Executed SQL');
          this.getAppointmentHistory(null, false);
					// var sQuery1 = "SELECT * FROM "+AppSettings.DATABASE.TABLE.Notification;
					// db.executeSql(sQuery1, []).then((data) => {
					// 	this.VM.notificationList = [];
					// 		if(data.rows.length > 0) {
					// 			for(var i = 0; i < data.rows.length; i++) {
					// 				this.VM.notificationList.push(data.rows.item(i));
					// 			}

					// 			this.VM.notificationList.sort((a, b) => (
					// 				a.CreatedOn <= b.CreatedOn ? -1 : 1
					// 			)
					// 			);

					// 			this.VM.notificationList.reverse();
					// 			this.OffSet = this.OffSet + this.VM.notificationList.length;
					// 			this.showNotification(this.selectedTap);
					// 			setTimeout(() => {
					// 				this.doRefresh(null);
					// 			}, 2000)

					// 		}else{
					// 			this.getAppointmentHistory(null, false);
					// 		}

					// }, (e) => {
					// 		console.log("Errot: " + JSON.stringify(e));
					// });
				}).catch(e => {
					console.log(e);
				});

			});
			this.localNotifications.cancelAll().then(() => {
				// alert("Scheduling notification");

			});
      this.subscribeToPushNotifications();
		}

	}

  subscribeToPushNotifications() {
    this.fcm.onNotification().subscribe((response) => {
      this.onMessageReceived(response);
    });

  }

  onMessageReceived(response) {
    console.log(JSON.stringify(response));
      var typeOfNotification = "Visitor"
      if (response.push_type != undefined && response.push_type === "10") {
        typeOfNotification = "General"
      }
      var count = 0;
      var notificationCount = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
      if(notificationCount){
        count = parseInt(notificationCount);
      }
      window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT, ""+(count+1));

      if(response.tap || response.wasTapped){
      } else {
        this.processNotification(this, response.body);
      }
  }

  processNotification(cClass, message) {
    console.log("lastRecievedMessage: " + cClass.lastRecievedMessage);
      console.log("Notification Received: " + message);
      if (!cClass.isFetching && cClass.lastRecievedMessage !== message) {
        cClass.lastRecievedMessage = message;
        cClass.isFetching = true;
        cClass.OffSet = 0;
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT, "0");
        cClass.getAppointmentHistory(null, false);
      }
  }
	onPageScroll(event) {
		console.log(event.target.scrollTop);
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
          currentClass.getAppointmentHistory(null, true);
      //  },1000)
      }
      // }
    }, 500);
  }


  gotoSettings(){
    this.router.navigateByUrl('settings-view-page');
  }

	showNotification(type){
    this.VM.searchGeneralNotificationList = [];
    for(var i = 0 ; i < this.VM.notificationList.length ; i++){
        this.VM.searchGeneralNotificationList.push(this.VM.notificationList[i]);
    }
		// if(type == 'general'){
		// 	this.VM.searchGeneralNotificationList = [];
		// 	for(var i = 0 ; i < this.VM.notificationList.length ; i++){
		// 		// if(this.VM.notificationList[i].NotificationType == '10'){
		// 			this.VM.searchGeneralNotificationList.push(this.VM.notificationList[i]);
		// 		// }
		// 	}
		// 	//alert("size:" + this.VM.searchGeneralNotificationList.length);
		// }else{
		// 	this.VM.searchInNotificationList = [];
		// 	for(i = 0 ; i < this.VM.notificationList.length ; i++){
		// 		if(this.VM.notificationList[i].NotificationType == '20'){
		// 			this.VM.searchInNotificationList.push(this.VM.notificationList[i]);
		// 		}
		// 	}
		// 	//alert("size:" + this.VM.searchInNotificationList.length);
		// }
		//alert("selectedTap:" + this.selectedTap);
		//alert("type:" + type);
	}

  ionViewDidEnter() {
    this.events.publishDataCompany({
      action: "page",
      title: "notifications",
      message: ''
    });
		window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT, "0");
	}

	filterTechnologies(event) : void
	{
    const searchtext = event ? event.target.value: '';
		 let val : string 	= searchtext;
     this.queryText = val;
		 // DON'T filter the technologies IF the supplied input is an empty string
		 if (val && val.trim() !== '')
		 {
			 var lList= this.VM.notificationList;
       this.VM.searchGeneralNotificationList = lList;
				this.VM.searchGeneralNotificationList =  this.VM.searchGeneralNotificationList.filter((item) =>
				{
					return item.HtmlContent.toLowerCase().indexOf(val.toLowerCase()) > -1;
				})
			//  if(this.selectedTap == 'general'){
			// 	this.VM.searchGeneralNotificationList = lList;
			// 	this.VM.searchGeneralNotificationList =  this.VM.searchGeneralNotificationList.filter((item) =>
			// 	{
			// 		return item.NotificationType == '10' && item.HtmlContent.toLowerCase().indexOf(val.toLowerCase()) > -1;
			// 	})
			//  }else{
			// 	this.VM.searchInNotificationList = lList;
			// 	this.VM.searchInNotificationList =  this.VM.searchInNotificationList.filter((item) =>
			// 	{
			// 		return item.NotificationType == '20' && item.HtmlContent.toLowerCase().indexOf(val.toLowerCase()) > -1;
			// 	})
			//  }

		 }else{
			lList= this.VM.notificationList;
      this.VM.searchGeneralNotificationList = lList;
			// if(this.selectedTap == 'general'){
			// 	this.VM.searchGeneralNotificationList = lList;
      //   this.VM.searchGeneralNotificationList =  this.VM.searchGeneralNotificationList.filter((item) =>
			// 	{
			// 		return item.NotificationType == '10';
			// 	})
			// }else{
			// 	this.VM.searchInNotificationList = lList;
      //   this.VM.searchInNotificationList =  this.VM.searchInNotificationList.filter((item) =>
			// 	{
			// 		return item.NotificationType == '20';
			// 	})
			// }


		 }
	}

	doRefresh(refresher) {
		this.OffSet = 0;
    this.getAppointmentHistory(refresher, false);
  }

  getAppointmentHistory(refresher, add){
    let hostID = '';
    this.isFetching = true;
    if (this.isSecurityApp) {
      var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
      if(hostData){
        hostID = JSON.parse(hostData).userID;
      }
    } else {
      var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      if(hostData){
        hostID = JSON.parse(hostData).HOSTIC;
      }
    }
    if(hostID) {
      this.loadingFinished = false
      var params = {
      "HostIC":hostID,
      "lastSyncDate":"",
      "OffSet": ""+ this.OffSet,
      "Rows":"20000"
      };
      // this.VM.host_search_id = "adam";
      this.apiProvider.getHostNotification(params, this.isSecurityApp? 'WEB': '').then(
        (val) => {
          try {
            if(refresher){
              refresher.target.complete();
            }
            this.isFetching = false;
            var aList = JSON.parse(val.toString());
            // aList = aList.reverse();
            if(!this.platform.is('cordova')) {
              if(add){
                this.VM.notificationList = aList.concat(this.VM.notificationList);
              }else{
                this.VM.notificationList = aList;
              }
              this.VM.notificationList.sort((a, b) => (
                a.CreatedOn <= b.CreatedOn ? -1 : 1
              ));

              this.VM.notificationList.reverse();
              this.OffSet = this.OffSet + aList.length;
              this.showNotification(this.selectedTap);
              this.loadingFinished = true;
            } else {
              this.VM.notificationList = [];
              var currentClass = this;
              var show = false;
              if(!aList || aList.length == 0){
                show = true;
                this.loadingFinished = true;
              }
              if(this.OffSet == 0){
                this.db.executeSql('DELETE FROM ' + AppSettings.DATABASE.TABLE.Notification, [])
                .then(res => {
                  console.log("DELETE FROM:" + res);
                  this.goAsyncFunction(currentClass, aList);
                }).catch(e => console.log(e));

              }else{
                if(show){
                  currentClass.getDataFromLocalDatabase(currentClass);
                }else{
                  this.goAsyncFunction(currentClass, aList);
                }
              }
            }
            this.apiProvider.dismissLoading();
          } catch (error) {

          }
        },
        (err) => {
          if(refresher){
            refresher.target.complete();
          }
          this.isFetching = false;
          if(err && err.message == "No Internet"){
            return;
          }
          this.getDataFromLocalDatabase(this);
          this.loadingFinished = true;
          this.apiProvider.dismissLoading();
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

  goBack() {

    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      const QRObj = JSON.parse(qrData);
      if (QRObj.MAppId.split(",").length === 2 && QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.QR_ACCESS) > -1 && QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.NOTIFICATIONS) > -1) {
        this.router.navigateByUrl('qraccess');
      } else if (QRObj.MAppId.split(",").length > 1 || QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1) {
        this.router.navigateByUrl('home-tams');
      } else {
        if (QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
          this.router.navigateByUrl('tamshome');
        } else if (QRObj.MAppId === AppSettings.LOGINTYPES.QR_ACCESS) {
          this.router.navigateByUrl('qraccess');
        } else if (QRObj.MAppId === AppSettings.LOGINTYPES.NOTIFICATIONS) {
          this.router.navigateByUrl('notifications');
        } else if (this.isSecurityApp) {
          this.router.navigateByUrl('security-dash-board-page');
        } else {
          this.router.navigateByUrl('home-view');
      }
      }
    } else {
      this.navCtrl.pop();
    }
    console.log('goBack ');
   }

	goAsyncFunction(currentClass, aList){
		try{
			this.insertNotification(currentClass, aList);
		}catch(e){

		}
	}

	insertNotification(currentClass, aList){

		let insertQuery = "INSERT INTO "+AppSettings.DATABASE.TABLE.Notification+" VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
		let i: number = 0;
		for (let product of aList) {
			var saveData = [
			product.PNHistory,
			product.RefPushSeqId,
			product.RefUserSeqId,
			product.IsRead,
			product.PushSeqId,
			product.HtmlContent,
			product.NotificationType,
			product.CreatedOn
			];
			this.db.executeSql(insertQuery, saveData).then(res => {
				i++;
				if (i == aList.length) {
					currentClass.getDataFromLocalDatabase(currentClass);
					return res;
				}
			}, err => {
				console.log("Error in saving Notification");
				// this.presentToast('sqdb_insertProduct fail: ' + err);
				return err;
			});
		}
	}

	getDataFromLocalDatabase(currentClass){
		var sQuery1 = "SELECT * FROM "+AppSettings.DATABASE.TABLE.Notification;
		currentClass.db.executeSql(sQuery1, []).then((data) => {
			currentClass.VM.notificationList = [];
				if(data.rows.length > 0) {
					for(var i = 0; i < data.rows.length; i++) {
						currentClass.VM.notificationList.push(data.rows.item(i));
					}
				}else{

				}
				currentClass.VM.notificationList.sort((a, b) => (
					a.CreatedOn <= b.CreatedOn ? -1 : 1
				)
				);

				currentClass.VM.notificationList.reverse();
				currentClass.OffSet = currentClass.OffSet + currentClass.VM.notificationList.length;
				currentClass.showNotification(currentClass.selectedTap);
        currentClass.loadingFinished = true;
        this.apiProvider.dismissLoading();
		}, (e) => {
				console.log("Errot: " + JSON.stringify(e));
		});
	}

	ondrag(event, slideDOM:IonItemSliding, notification: any) {
    let percent = event.detail.ratio;
    if (percent > 0) {
      this.closeSlide(slideDOM);
      // this.showAlertForSlide('delete', item);
      if(this.showDelete){
        return;
        }
        this.showDelete = true;
        this.deleteNotification(notification);
    } else {
      // this.closeSlide(slideDOM);
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

	async deleteNotification(notification: any){
	  let alert = this.alertCtrl.create({
      header: 'Delete Notification',
      cssClass:'',
      message: this.T_SVC['ALERT_TEXT.DELETE_NOTIFIACTION'],
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
					var params = {
						"PushNotificationId": notification.PNHistory
					}

					this.apiProvider.DeleteNotification(params).then(
						async (val) => {
							if(this.platform.is('cordova')) {
								this.db.executeSql('DELETE FROM ' + AppSettings.DATABASE.TABLE.Notification + " where " + AppSettings.DATABASE.NOTIFICATION.PNHistory + "='"+ notification.PNHistory+ "'", [])
								.then(res => {
									console.log("DELETE FROM:" + res);

								}).catch(e => console.log(e));
							}
							let index = this.VM.notificationList.indexOf(notification);
							if(index > -1){
								this.VM.notificationList.splice(index, 1);
							}
							index = this.VM.searchInNotificationList.indexOf(notification);
							if(index > -1){
								this.VM.searchInNotificationList.splice(index, 1);
							}
							index = this.VM.searchGeneralNotificationList.indexOf(notification);
							if(index > -1){
								this.VM.searchGeneralNotificationList.splice(index, 1);
							}

							let toast = this.toastCtrl.create({
								message: this.T_SVC['ALERT_TEXT.DELETE_SUCCESS'],
								duration: 3000,
                color: 'primary'
							});
							(await toast).present();
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
									cssClass:'',
									message: message,
									buttons: ['Okay']
									});
									(await alert).present();
							}
						}
					);
					},
				}]
				});
				(await alert).present();
        (await alert).onDidDismiss().then(()=> {
          this.showDelete = false;
        })
  }

	viewNotification(notification1){
		notification1.IsRead = true;
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          notification: notification1
        }
      }
    };
    this.router.navigate(['notiification-view'], navigationExtras);
	}

	ionViewWillLeave(){
    	this.events.publishDataCompany({
        action: "page",
        title: "home-view",
        message: ''
      });
  	}

  ngOnInit() {
    const hostData = localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (hostData) {
      var tempImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/PortalImageHandler.ashx?RefSlno='
      + JSON.parse(hostData).SEQID + "&ScreenType=30&Refresh=" + new Date().getTime();
      this.hostObj.hostImage = tempImage;
      this.hostObj.HOSTNAME = JSON.parse(hostData).HOSTNAME;
      this.hostObj.HOST_EMAIL = JSON.parse(hostData).HOST_EMAIL;
    }
  }

}
