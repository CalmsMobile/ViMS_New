import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeScannerOptions, BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NavController, AlertController, Platform, IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-security-check-out-page',
  templateUrl: './security-check-out-page.page.html',
  styleUrls: ['./security-check-out-page.page.scss'],
})
export class SecurityCheckOutPagePage implements OnInit {

  @ViewChild(IonContent)	content:IonContent;

  OffSet = 0;
  isFetching = false;
  appointments = [];
  appointmentsClone = [];
  T_SVC:any;
  Type : any = 0;
  title = "Visitor Check-Out";
  options :BarcodeScannerOptions;
  constructor(public navCtrl: NavController,
    private translate: TranslateService,
     private alertCtrl: AlertController,
     public apiProvider: RestProvider,
     private barcodeScanner: BarcodeScanner,
     private platform: Platform,
     private router: Router,
     private route: ActivatedRoute) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'ACC_MAPPING.INVALID_QR', 'COMMON.OK',
      'ALERT_TEXT.CHECKOUT_MESSAGE1', 'ALERT_TEXT.CONFIRMATION',
      'ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS']).subscribe(t => {
        this.T_SVC = t;
    });
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        var type = passData.Type;
        if(type){
          this.Type = type;
          switch(type){
            case '10':
              this.title = "Today Check-In"
            break
            case '20':
              this.title = "Today Check-Out"
            break;
            case '30':
              this.title = "Currently Check-In"
            break;
            case '40':
              this.title = "Today Overstay"
            break;
            case '50':
              this.title = "Quick Pass Check-Out"
            break;
          }
        }
      }
    });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter SecurityCheckOutPage');
  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
   }

  ionViewWillEnter() {
		console.log('ionViewWillEnter SecurityCheckOutPage');
    this.OffSet = 0;
    switch(this.Type){
      case "10":
      case "20":
      case "30":
      case "40":
        this.VimsAppGetStatesList(this.Type, null, true);
      break
      case "50":
        this.GetQuickPassVisitorList(null, true);
      break;
      default:
        this.VimsAppGetCheckInVisitorList(null, true);
      break;
    }



  }

  getDayofDate(dateString){
		let dateObject = new Date(dateString);
		let weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
		return weekdays[dateObject.getDay()];
	}

	doRefresh(refresher) {
    // this.OffSet = this.OffSet + 20;
    this.OffSet = 0;
    this.appointments = [];
    this.appointmentsClone = [];
    switch(this.Type){
      case "10":
      case "20":
      case "30":
      case "40":
        this.VimsAppGetStatesList(this.Type, refresher, true);
      break;
      case "50":
        this.GetQuickPassVisitorList(refresher, true);
      break;
      default:
        this.VimsAppGetCheckInVisitorList(refresher, true);
    }

    //setTimeout(()=>{refresher.target.complete();},2000)
  }

  loadData(event) {
    var currentClass = this;
    setTimeout(() => {
      console.log('Done');
      event.target.complete();
      if(!currentClass.isFetching){
        currentClass.isFetching = true;
        // setTimeout(()=>{
            switch(currentClass.Type){
            case "10":
            case "20":
            case "30":
            case "40":
              currentClass.VimsAppGetStatesList(currentClass.Type, null, true);
            break;
            case "50":
              currentClass.GetQuickPassVisitorList(null, true);
            break;
            case "60":
              currentClass.VimsAppGetCheckInVisitorList(null, true);
            break;
          }
      //  },1000)
      }
    }, 500);
  }

  ngAfterViewInit() {
	}

  getVisitorsBySearch(queryText){
    if(queryText){
      var showList = [];
      for(var i= 0 ; i < this.appointments.length ; i++){
        var item = this.appointments[i];
        if(item.visitor_name.toLowerCase().search(queryText.toLowerCase()) >= 0){
          showList[showList.length] = item;
        }
      }
      this.appointmentsClone = showList;
    }else{
      this.appointmentsClone = this.appointments;
    }

  }

  onCancel(){
    this.appointmentsClone = this.appointments;
  }

  GetQuickPassVisitorList(refresher, showLoading){

		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    if(hostData){
      var MAppDevSeqId = JSON.parse(hostData).MAppDevSeqId;
			var params = {
      "MAppDevSeqId":MAppDevSeqId,
			"OffSet": ""+ this.OffSet,
			"Rows":"10"
		};
			// this.VM.host_search_id = "adam";
			this.apiProvider.GetQuickPassVisitorList(params, showLoading).then(
				(val) => {
					var aList = JSON.parse(val.toString());
					if(refresher){
						this.appointments = aList;
						refresher.target.complete();
					}else {
            this.appointments = aList.concat(this.appointments);
					}
          this.appointments.sort((a, b) =>
            a.att_check_in_date <= b.att_check_in_date ? -1 : 1
          );
          this.appointments.reverse();
					this.OffSet = this.OffSet + aList.length;
          this.appointmentsClone = this.appointments;
				},
				async (err) => {
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
						let alert = this.alertCtrl.create({
							header: 'Error !',
							cssClass:'alert-danger',
							message: message,
							buttons: ['Okay']
							});
							(await alert).present();
					}
				}
			);
		}
  }

  VimsAppGetCheckInVisitorList(refresher, showLoading){

		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    if(hostData){
      var MAppDevSeqId = JSON.parse(hostData).MAppDevSeqId;
			var params = {
      "MAppDevSeqId":MAppDevSeqId,
			"OffSet": ""+ this.OffSet,
			"Rows":"10"
		};
			// this.VM.host_search_id = "adam";
			this.apiProvider.VimsAppGetCheckInVisitorList(params, showLoading).then(
				(val) => {
					var aList = JSON.parse(val.toString());

					if(refresher){
						this.appointments = aList;
						refresher.target.complete();
					}else {
            this.appointments = aList.concat(this.appointments);
					}
          this.appointments.sort((a, b) =>
            a.att_check_in_date <= b.att_check_in_date ? -1 : 1
          );
          this.appointments.reverse();
					this.OffSet = this.OffSet + aList.length;
          this.appointmentsClone = this.appointments;
				},
				async (err) => {
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
						let alert = this.alertCtrl.create({
							header: 'Error !',
							cssClass:'alert-danger',
							message: message,
							buttons: ['Okay']
							});
							(await alert).present();
					}
				}
			);
		}
  }


  VimsAppGetStatesList(Type, refresher, showLoading){

		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    if(hostData){
      var MAppDevSeqId = JSON.parse(hostData).MAppDevSeqId;
			var params = {
        "Type": Type,
        "MAppDevSeqId":MAppDevSeqId,
        "OffSet": ""+ this.OffSet,
        "Rows":"10"
      };
			// this.VM.host_search_id = "adam";
			this.apiProvider.VimsAppGetSecurityStatsDetail(params, showLoading).then(
				(val) => {

          if(!val){
            return;
          }
					var aList = JSON.parse(val.toString());

					if(refresher){
            this.appointments = aList;
						refresher.target.complete();
					}else {
						this.appointments = aList.concat(this.appointments);
          }
          this.appointments.sort((a, b) =>
            a.att_check_in_date <= b.att_check_in_date ? -1 : 1
          );
          this.appointments.reverse();
					this.OffSet = this.OffSet + aList.length;
          this.appointmentsClone = this.appointments;
				},
				async (err) => {
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
						let alert = this.alertCtrl.create({
							header: 'Error !',
							cssClass:'alert-danger',
							message: message,
							buttons: ['Okay']
							});
							(await alert).present();
					}
				}
			);
		}
  }

  scanQR(){
    var loadinWeb = true;
    if(!this.platform.is('cordova')) {
      loadinWeb = true;
    } else {
      loadinWeb = false;
    }
    if (loadinWeb) {
      var data = "73" //"C4B9F365";
      this.checkoutVisitorByQR(data);
    }else{
      this.options = {
        prompt : "Scan your QR Code ",
        preferFrontCamera : false, // iOS and Android
        showFlipCameraButton : true, // iOS and Android
        showTorchButton : true, // iOS and Android
        torchOn: false, // Android, launch with the torch switched on (if available)
        resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
        disableAnimations : false, // iOS
        disableSuccessBeep: false // iOS and Android
      }
      this.barcodeScanner.scan(this.options).then(async (barcodeData) => {
        var data = barcodeData.text;
        console.log("barcodeScanner data: "+data);
        // console.log(scanData); D20A6A48
        if(data == ""){
          let invalidQRConfirm = this.alertCtrl.create({
            header: 'Error !',
            message:"<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>',
            cssClass:'alert-danger',
            buttons: [
              {
                text: this.T_SVC['COMMON.OK'],
                role: 'cancel',
                handler: () => {
                }
              }
            ]
          });
          (await invalidQRConfirm).present();
        }else{
          this.checkoutVisitorByQR(data);
        }



    }, async (err) => {
        console.log("Error occured : " + err);
        let invalidQRConfirm = this.alertCtrl.create({
          header: 'Error !',
          message:"<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>',
          cssClass:'alert-danger',
          buttons: [
            {
              text: this.T_SVC['COMMON.OK'],
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        (await invalidQRConfirm).present();
    });
    }
  }
  async checkoutVisitorByQR(HexCode: string) {

        let alert = this.alertCtrl.create({
          header: this.T_SVC['ALERT_TEXT.CONFIRMATION'],
          cssClass:"alert-danger",
          message: this.T_SVC['ALERT_TEXT.CHECKOUT_MESSAGE1'],
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
              handler: () => {
                console.log('Delete clicked');
                var params = {
                  "HexCode":HexCode,
                  "IsCheckIn": false,
                  "VisitorImg": ""
                };
                // this.VM.host_search_id = "adam";
                if(this.Type == '50') {
                  this.apiProvider.UpdateQPVisitorCheckOutTime(params).then(
                    async (val) => {
                      this.doRefresh(null);
                      let alert = this.alertCtrl.create({
                        header: 'Success',
                        cssClass:'alert-danger',
                        message: this.T_SVC['ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS'],
                        buttons: ['Okay']
                        });
                        (await alert).present();

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
                        let alert = this.alertCtrl.create({
                          header: 'Error !',
                          cssClass:'alert-danger',
                          message: message,
                          buttons: ['Okay']
                          });
                          (await alert).present();
                      }
                    }
                  );
                }else{
                  var params1 = {
                    "hexcode":HexCode,
                    "CheckOutCounter": "admin"
                  };
                  this.apiProvider.VimsAppUpdateVisitorQRCheckOut(params1).then(
                    async (val) => {
                      this.doRefresh(null);
                      let alert = this.alertCtrl.create({
                        header: 'Success',
                        cssClass:'alert-danger',
                        message: this.T_SVC['ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS'],
                        buttons: ['Okay']
                        });
                        (await alert).present();

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
                        let alert = this.alertCtrl.create({
                          header: 'Error !',
                          cssClass:'alert-danger',
                          message: message,
                          buttons: ['Okay']
                          });
                          (await alert).present();
                      }
                    }
                  );
                }
              }
            }
          ]
        });
        (await alert).present();
   }

  async checkoutVisitor(slideDOM, item){
    if(slideDOM){
      slideDOM.close();
    }

    if(this.Type == "50"){
      this.checkoutVisitorByQR(item.HexCode);
      return;
    }


    let alert = this.alertCtrl.create({
      header: this.T_SVC['ALERT_TEXT.CONFIRMATION'],
      cssClass:"alert-danger",
      message: "Do you wish to checkout "+(item.visitor_name? item.visitor_name : " this visitor")+" now?",
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
          handler: () => {
            console.log('Delete clicked');
            var params = {
              "att_id":item.att_id,
              "CheckOutCounter":"admin"
            };
            // this.VM.host_search_id = "adam";
            this.apiProvider.VimsAppUpdateVisitorCheckOut(params).then(
              async (val) => {
                this.OffSet = 0;
                this.appointments = [];
                this.appointmentsClone = [];
                switch(this.Type){
                case "10":
                case "20":
                case "30":
                case "40":
                  this.VimsAppGetStatesList(this.Type, null, false);
                break;
                case "50":
                  this.GetQuickPassVisitorList(null, false);
                break;
                default:
                  this.VimsAppGetCheckInVisitorList(null, false);
                break;
                }

                let alert = this.alertCtrl.create({
                  header: 'Success',
                  cssClass:'alert-danger',
                  message: this.T_SVC['ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS'],
                  buttons: ['Okay']
                  });
                  (await alert).present();

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
                  let alert = this.alertCtrl.create({
                    header: 'Error !',
                    cssClass:'alert-danger',
                    message: message,
                    buttons: ['Okay']
                    });
                    (await alert).present();
                }
              }
            );
          }
        }
      ]
    });
    (await alert).present();
  }

  ngOnInit() {
  }

}
