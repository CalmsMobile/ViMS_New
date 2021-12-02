import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BarcodeScannerOptions, BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NavController, AlertController, Platform, IonContent, ModalController, IonItemSliding } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { QuickPassVisitorPopupComponent } from 'src/app/components/quickpass-visitor-popup/quickpass-visitor-popup';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-security-check-out-page',
  templateUrl: './security-check-out-page.page.html',
  styleUrls: ['./security-check-out-page.page.scss'],
})
export class SecurityCheckOutPagePage implements OnInit {

  @ViewChild(IonContent)	content:IonContent;
  isLoadingFinished = false;
  isFetching = false;
  appointments = [];
  appointmentsClone = [];
  T_SVC:any;
  Type : any = 0;
  showDelete = false;
  title = "Visitor Check-Out";
  appSettings: any = {};
  visitorImagePath = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=';
  imageURLType = '&RefType=VPB&Refresh='+ new Date().getTime();
  options :BarcodeScannerOptions;
  constructor(public navCtrl: NavController,
    private translate: TranslateService,
     private alertCtrl: AlertController,
     public apiProvider: RestProvider,
     private barcodeScanner: BarcodeScanner,
     private platform: Platform,
     private modalCtrl: ModalController,
     private dateformat: DateFormatPipe,
     private router: Router,
     private route: ActivatedRoute) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'ACC_MAPPING.INVALID_QR', 'COMMON.OK', 'ALERT_TEXT.INVALID_QR',
      'ALERT_TEXT.CHECKOUT_MESSAGE1', 'ALERT_TEXT.CONFIRMATION', 'ALERT_TEXT.QR_EXPIRED',
      'ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS']).subscribe(t => {
        this.T_SVC = t;
    });
    const ackSeettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_SECURITY_SETTINGS);
    if (ackSeettings) {
      this.appSettings = JSON.parse(ackSeettings);
    }
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
              this.title = "Quick Pass"
            case '60':
              this.title = "Total Check-In"
            break;
          }
        }
      }
    });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter SecurityCheckOutPage');
    switch(this.Type){
      case "10":
      case "20":
      case "30":
      case "40":
      case "60":
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

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
   }

   moveToDetailsPage(item) {
    const navigationExtras: NavigationExtras = {
      state: {
        passData: item,
        fromAppointment: false
      }
    };
    this.router.navigate(['visitor-information'], navigationExtras);
  }

  ondrag(event, slideDOM:IonItemSliding, item: any) {
    let percent = event.detail.ratio;
    if (percent > 0) {
      this.closeSlide(slideDOM);
      if(this.showDelete){
        return;
        }
        this.showDelete = true;
        this.checkoutVisitor(item);
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

  getDayofDate(dateString){
		let dateObject = new Date(dateString);
		let weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
		return weekdays[dateObject.getDay()];
	}

	doRefresh(refresher) {
    this.appointments = [];
    this.appointmentsClone = [];
    switch(this.Type){
      case "10":
      case "20":
      case "30":
      case "40":
      case "60":
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
            case "60":
              currentClass.VimsAppGetStatesList(currentClass.Type, null, false);
            break;
            case "50":
              currentClass.GetQuickPassVisitorList(null, true);
            break;
            break;
          }
      //  },1000)
      }
    }, 500);
  }

  ngAfterViewInit() {
	}

  getVisitorsBySearch(event){
    const queryText = event?event.target.value: '';
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

    this.isLoadingFinished = false;
		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    if(hostData){
      var MAppDevSeqId = JSON.parse(hostData).MAppDevSeqId;
			var params = {
      "MAppDevSeqId":MAppDevSeqId,
			"OffSet": ""+ this.appointments.length,
			"Rows":"20000"
		};
			// this.VM.host_search_id = "adam";
			this.apiProvider.GetQuickPassVisitorList(params, showLoading).then(
				(val) => {
          this.isLoadingFinished = true;
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
          this.appointmentsClone = this.appointments;
				},
				(err) => {

          this.isLoadingFinished = true;
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
						this.apiProvider.showAlert(message);
					}
				}
			);
		}
  }

  VimsAppGetCheckInVisitorList(refresher, showLoading){
    this.isLoadingFinished = false;
		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    if(hostData){
      var MAppDevSeqId = JSON.parse(hostData).MAppDevSeqId;
			var params = {
      "MAppDevSeqId":MAppDevSeqId,
			"OffSet": ""+ this.appointments.length,
			"Rows":"20000"
		};
			// this.VM.host_search_id = "adam";
			this.apiProvider.VimsAppGetCheckInVisitorList(params, showLoading).then(
				(val) => {
          this.isLoadingFinished = true;
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
          this.appointmentsClone = this.appointments;
				},
				(err) => {
          this.isLoadingFinished = true;
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
						this.apiProvider.showAlert(message);
					}
				}
			);
		}
  }


  VimsAppGetStatesList(Type, refresher, showLoading){

    this.isLoadingFinished = false;
		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.SECURITY_DETAILS);
    if(hostData){
      var MAppDevSeqId = JSON.parse(hostData).MAppDevSeqId;
			var params = {
        "Type": Type,
        "MAppDevSeqId":MAppDevSeqId,
        "OffSet": ""+ this.appointments.length,
        "Rows":"12"
      };
			// this.VM.host_search_id = "adam";
			this.apiProvider.VimsAppGetSecurityStatsDetail(params, showLoading).then(
				(val) => {
          this.isLoadingFinished = true;
          this.isFetching = false;
          if(!val){
            return;
          }
					var aList = JSON.parse(val.toString());
          aList.Table2.forEach(element => {
            element.START_TIME = element.att_check_in_time;
            element.STAFF_NAME = element.HostName;
            element.VISITOR_NAME = element.visitor_name;
            element.WorkPermitExpiry = element.att_ExpiryTime;
            element.TELEPHONE_NO = element.visitor_mobile_no ? element.visitor_mobile_no: element.visitor_tel_no;
            element.visitor_email = element.visitor_email;
            element.PLATE_NUM = element.att_car_no ? element.att_car_no: element.PLATE_NUM;

            if (element.WorkPermitExpiry) {
              let expireTime;
              try {
                element.WorkPermitExpiry = element.WorkPermitExpiry.replace('-', '/');
                element.WorkPermitExpiry = element.WorkPermitExpiry.replace('-', '/');
                expireTime =  this.dateformat.transform(element.WorkPermitExpiry, 'yyyy/MM/dd HH:mm:ss');
              } catch (error) {
                element.WorkPermitExpiry = element.WorkPermitExpiry.replace('/', '-');
                element.WorkPermitExpiry = element.WorkPermitExpiry.replace('/', '-');
                expireTime =  this.dateformat.transform(element.WorkPermitExpiry, 'yyyy-MM-dd HH:mm:ss');
              }
              let currentDate;

              if (element.att_check_out_time) {
                try {
                  element.att_check_out_time = element.att_check_out_time.replace('-', '/');
                  element.att_check_out_time = element.att_check_out_time.replace('-', '/');
                  currentDate =  this.dateformat.transform(element.att_check_out_time, 'yyyy/MM/dd HH:mm:ss');
                } catch (error) {
                  element.att_check_out_time = element.att_check_out_time.replace('/', '-');
                  element.att_check_out_time = element.att_check_out_time.replace('/', '-');
                  currentDate =  this.dateformat.transform(element.att_check_out_time, 'yyyy-MM-dd HH:mm:ss');
                }
              } else {
                currentDate =  this.dateformat.transform(new Date() + '', 'yyyy-MM-dd HH:mm:ss');
              }
              element.isExpired = (new Date(currentDate).getTime() > new Date(expireTime).getTime());

              if (element.isExpired) {
                let difference = new Date(currentDate).getTime() - new Date(expireTime).getTime();
                const dDays = this.apiProvider.twoDecimals(parseInt('' +difference/(24*60*60*1000)));
                const dHours = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*60*1000)) % 24)) ;
                const dMin = this.apiProvider.twoDecimals(parseInt('' +(difference/(60*1000)) % 60));
                element.overStayTime = dDays +' day, '+dHours+' hour, '+dMin+' min';
              }

            }
          });
					if(refresher){
            this.appointments = aList.Table2;
						refresher.target.complete();
					}else {
            if (aList.Table2) {
              this.appointments = this.appointments.concat(aList.Table2);
            } else {
              this.appointments = this.appointments;
            }

          }

          this.appointmentsClone = this.appointments;
				},
				async (err) => {
          this.isLoadingFinished = true;
          this.isFetching = false;
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
						this.apiProvider.showAlert(message);
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
            cssClass:'',
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
          cssClass:'',
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
      cssClass:"",
      message: "Visitor already checked-in. do you like to check-out?",
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
                  this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS']);
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
                    this.apiProvider.showAlert(message);
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
                  this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS']);

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
                    this.apiProvider.showAlert(message);
                  }
                }
              );
            }
          }
        }
      ]
    });
    (await alert).present();
    (await alert).onDidDismiss().then(() => {
      this.showDelete = false;
    })
   }

  async checkoutVisitor(item){
    if(this.Type == "50"){
      this.checkoutVisitorByQR(item.HexCode);
      return;
    }
    if (item.att_check_in === 1 && item.att_check_out === 1) {
      this.showDelete = false;
      return;
    }
    let message1 = "";
    if (item.att_check_in === 1 && (!item.att_check_out || item.att_check_out === 0)) {
      message1 = "Visitor( "+item.VISITOR_NAME+") already checked-in. do you like to check-out?";
    } else {
      this.showDelete = false;
      return;
    }

    let inputsShow = [];

    if (item.overStayTime) {
      inputsShow = [
        {
          name: 'remarks',
          type: 'text',
          placeholder: 'Enter Check-out Remarks'
        }]
    }
    let alert = this.alertCtrl.create({
      header: this.T_SVC['ALERT_TEXT.CONFIRMATION'],
      cssClass:"",
      message: message1,
      inputs: inputsShow,
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
            console.log('Delete clicked');
            var params = {
              "att_id":item.att_id,
              "remarks": (result && result.remarks)? result.remarks: '',
              "CheckOutCounter":"admin"
            };
            // this.VM.host_search_id = "adam";
            this.apiProvider.VimsAppUpdateVisitorCheckOut(params).then(
              async (val) => {
                this.appointments = [];
                this.appointmentsClone = [];
                switch(this.Type){
                case "10":
                case "20":
                case "30":
                case "40":
                case "60":
                  this.VimsAppGetStatesList(this.Type, null, false);
                break;
                case "50":
                  this.GetQuickPassVisitorList(null, false);
                break;
                default:
                  this.VimsAppGetCheckInVisitorList(null, false);
                break;
                }

                this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS']);

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
      this.showDelete = false;
    })
  }

  ngOnInit() {
  }

  scanQuickPassQR(){
    var loadinWeb = true;
    if(!this.platform.is('cordova')) {
      loadinWeb = true;
    } else {
      loadinWeb = false;
    }
    if (loadinWeb) {
      var data = "5350218102";
      var params = {"HexCode":""+ data};
      this.processQuickPassQR(params);
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
        if(data){
            var params = {"HexCode":""+ data};
            this.processQuickPassQR(params);
        } else{
          this.apiProvider.showAlert("<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>');
        }
    }, async (err) => {
        console.log("Error occured : " + err);
        this.apiProvider.showAlert("<span class='failed'>" + this.T_SVC['ACC_MAPPING.INVALID_QR'] + '</span>');
    });
    }
  }

  processQuickPassQR(params) {
    this.apiProvider.GetQuickPassVisitorDetail(params).then(
      async (val) => {
       console.log("val : "+JSON.stringify(val));
       var visitorDetail = val+"";
       var vOb = JSON.parse(visitorDetail);
        if(vOb){
          var eDateTime = this.dateformat.transform(vOb.ExpiryTime+"", "yyyy-MM-ddTHH:mm:ss");
          var eDTime = new Date(eDateTime).getTime();

          var cDateTime = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
          var cDTime = new Date(cDateTime).getTime();
          if(eDTime > cDTime){
            this.showPassDetails(vOb);
          }else{
            this.apiProvider.showAlert(this.T_SVC['ALERT_TEXT.QR_EXPIRED']);
          }

        }


      },
      async (err) => {
        console.log("error : "+JSON.stringify(err));
        if(err && err.message == "No Internet"){
          return;
        }

        if(err.Table1 && err.Table1.length == 0){
          var message  = this.T_SVC['ALERT_TEXT.INVALID_QR'];
          this.apiProvider.showAlert(message);
            return;
        }

        if(err && err.message.indexOf("Http failure response for") > -1){
          message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          this.apiProvider.showAlert(message);
            return;
        }
        message = this.T_SVC['ACC_MAPPING.INVALID_QR'];

        if(err && JSON.parse(err) && JSON.parse(err).Table && JSON.parse(err).Table[0].description){
          message = JSON.parse(err).Table[0].description;
        }
        this.apiProvider.showAlert(message);
      }
    );
  }

  async showPassDetails(item) {

    if (!item.CheckInTime || (item.CheckInTime && item.CheckOutTime)) {
      const presentModel = await this.modalCtrl.create({
        component: QuickPassVisitorPopupComponent,
        componentProps: {
          data: {
            QPAppointment : JSON.stringify(item),
            CheckIn: true
          }
        },
        showBackdrop: true,
        mode: 'ios',
        cssClass: 'visitorPopupModal1'
      });
      presentModel.onWillDismiss().then((data) => {
        this.GetQuickPassVisitorList(null, true);
      });
      return await presentModel.present();
    } else {
      this.checkoutVisitorByQR(item.HexCode);
    }

  }

}
