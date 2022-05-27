import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Camera } from '@ionic-native/camera/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
declare var google;

@Component({
  selector: 'app-tamsregisterattendance',
  templateUrl: './tamsregisterattendance.page.html',
  styleUrls: ['./tamsregisterattendance.page.scss'],
})
export class TamsregisterattendancePage implements OnInit {

  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: any;
  address = '';
  INTERVAL: any;
  T_SVC: any;
  loadingDismissedAlready = false;
  base64Image = '';
  CheckInFlag = 'in';
  toogleModel = true;
  myTodaySchedule;
  TAMS_MODULE;
  tamsSettings: any = {};
  timeExpired = false;
  clockDateObj: any = {};
  currentTime = this.dateformat.transform(new Date() + '', "yyyy/MM/dd HH:mm:ss");
  constructor(
    private dateformat : DateFormatPipe,
    private apiProvider: RestProvider,
    private platform: Platform,
    private iab: InAppBrowser,
    private translate:TranslateService,
    private events: EventsService,
    private nativeGeocoder: NativeGeocoder,
    private alertCtrl: AlertController,
    private camera: Camera,
    private router: Router) {
      this.translate.get([ 'ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS', 'ALERT_TEXT.CONFIRMATION', 'ALERT_TEXT.CAMEARA_IMAGE_SELECT_ERROR',
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'SETTINGS.SELECT_LANGUAGE', 'ACC_MAPPING.CANT_FIND_LICENSE']).subscribe(t => {
        this.T_SVC = t;
      });
     }

  ngOnInit() {
    const mySchedule = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_SCHEDULE);
    const settings = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_SETTINGS);

    if (settings) {
      this.tamsSettings = JSON.parse(settings);
    }
    this.CheckInFlag = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_CLOCK_TYPE);
    if (this.CheckInFlag === null) {
      this.CheckInFlag = 'out';
    }

    if (mySchedule) {
      const today = this.dateformat.transform(new Date() + '', "yyyy-MM-dd");
      const myScheduleObj = JSON.parse(mySchedule);
      this.myTodaySchedule = myScheduleObj.find(item => item.scheduleDate === today);
    }

  }

  callSetInterval() {
    const alreadyClockData = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_CLOCK_IN_ALREADY);
    this.INTERVAL = setInterval(()=> {
      console.log("time");
      this.currentTime = this.dateformat.transform(new Date() + '', "yyyy/MM/dd HH:mm:ss");
      const lat = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_LATITUDE);
      const long = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_LONGITUDE);
      if (!this.loadingDismissedAlready && lat && long) {
        this.loadingDismissedAlready = true;
        // this.loadMap(lat, long);
        this.apiProvider.dismissLoading();
        let allowToProceed = false;
        if (this.tamsSettings.AllowedRadius) {
          const wl_locations = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_WHITELISTED_LOCATION);
          if (wl_locations) {
            const wlLocationsObj = JSON.parse(wl_locations);
            wlLocationsObj.forEach(element => {
                if (element.Latitude && element.Longitude) {
                  const distance = this.apiProvider.getDistanceFromLatLonInKm(lat, long, element.Latitude, element.Longitude);
                  console.log("distance --> " + distance + " || AllowedRadius -->" + this.tamsSettings.AllowedRadius);
                  if (distance <= this.tamsSettings.AllowedRadius) {
                    allowToProceed = true;
                  }
                }
            });
          } else {
            allowToProceed = true;
          }
        } else {
          allowToProceed = true;
        }
        if (!allowToProceed) {
          this.showAlertForLocation(" You are not authorized in location to register attendance.");
          return;
        }
      }

        if (this.CheckInFlag === 'out') {
          let alreadyClockout = false;
          if (alreadyClockData) {
            this.clockDateObj = JSON.parse(alreadyClockData);
            this.clockDateObj.Date = this.clockDateObj.Date.replace('-','/');
            this.clockDateObj.Date = this.clockDateObj.Date.replace('-','/');
            this.clockDateObj.Date = this.clockDateObj.Date.replace('T',' ');
            const clockDate = this.dateformat.transform(this.clockDateObj.Date, "yyyy/MM/dd");
            const currentDate = this.dateformat.transform(new Date() + '', "yyyy/MM/dd");
            if (clockDate == currentDate && this.clockDateObj.OutClockType === 'out') {
              alreadyClockout = true;
            }
          }
          if (this.myTodaySchedule.toTime1) {
            this.myTodaySchedule.scheduleDate = this.myTodaySchedule.scheduleDate.replace('-','/');
            this.myTodaySchedule.scheduleDate = this.myTodaySchedule.scheduleDate.replace('-','/');
            this.myTodaySchedule.scheduleDate = this.myTodaySchedule.scheduleDate.replace('T',' ');
            const outTime = this.dateformat.transform(this.myTodaySchedule.scheduleDate + " "+ this.myTodaySchedule.toTime1, "yyyy/MM/dd HH:mm a");
            if (new Date(this.currentTime) < new Date(outTime) && !alreadyClockout) {
              this.timeExpired = true;
            } else {
              this.timeExpired = false;
            }
          }

        } else {
          let alreadyClockin = false;
          if (alreadyClockData) {
            this.clockDateObj = JSON.parse(alreadyClockData);
            this.clockDateObj.Date = this.clockDateObj.Date.replace('-','/');
            this.clockDateObj.Date = this.clockDateObj.Date.replace('-','/');
            this.clockDateObj.Date = this.clockDateObj.Date.replace('T',' ');
            const clockDate = this.dateformat.transform(this.clockDateObj.Date, "yyyy/MM/dd");
            const currentDate = this.dateformat.transform(new Date() + '', "yyyy/MM/dd");
            if (clockDate == currentDate && this.clockDateObj.InClockType !== 'out') {
              alreadyClockin = true;
            }
          }
          if (this.myTodaySchedule.fromTime1) {
            this.myTodaySchedule.scheduleDate = this.myTodaySchedule.scheduleDate.replace('-','/');
            this.myTodaySchedule.scheduleDate = this.myTodaySchedule.scheduleDate.replace('-','/');
            this.myTodaySchedule.scheduleDate = this.myTodaySchedule.scheduleDate.replace('T',' ');
            const inTime = this.dateformat.transform(this.myTodaySchedule.scheduleDate + " "+ this.myTodaySchedule.fromTime1, "yyyy/MM/dd HH:mm a");
            if (new Date(this.currentTime) > new Date(inTime)  && !alreadyClockin) {
              this.timeExpired = true;
            } else {
              this.timeExpired = false;
            }
          }
        }
    }, 1000);

    this.events.publishDataCompany({
      action: 'GetLocationForTAMS',
      title: "GetLocationForTAMS",
      message: ""
    });
  }

  loadMap(lat, long) {

      let latLng = new google.maps.LatLng(lat, long);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.getAddressFromCoords(lat, long);

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }


  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords " + lattitude + " " + longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if (value.length > 0)
            responseAddress.push(value);

        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value + ", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) => {
        this.address = "Address Not Available!";
      });

  }



  async showAlertForLocation(errorMsg) {
    let alert = this.alertCtrl.create({
      header: 'Notification',
      message: errorMsg,
      mode:'ios',
      buttons: [{
          text: 'Okay',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
      });
      (await alert).present();
      (await alert).onDidDismiss().then(() => {
        this.goBack();
      });

  }

  getMyAttendanceWhitelistedLocations(){
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).HOSTIC) {
      return;
    }
    var hostId = JSON.parse(hostData).HOSTIC;
    var data = {
      "MAppId": "TAMS",
      "HostIc": hostId
    };
    this.apiProvider.requestApi(data, '/api/TAMS/getMyWhitelistedLocation', false, false, '').then(
      (val: any) => {
        const response = JSON.parse(val);
        if (response.Table && response.Table.length > 0 && (response.Table[0].Code === 10 || response.Table[0].code === 10)) {
          const locationUpdatedDate = this.dateformat.transform(new Date()+"", 'yyyy-MM-dd');
          response.Table1[0].locationUpdatedDate = locationUpdatedDate;
          localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_WHITELISTED_LOCATION, JSON.stringify(response.Table1));
          this.callSetInterval();
        }
      },
      async (err) => {
        this.goBack();
        if(err && err.message == "No Internet"){
          return;
        }
      }
    );
  }


  segmentChanged(event) {

  }

  ionViewWillLeave(){
    if(this.INTERVAL){
      clearInterval(this.INTERVAL);
    }
  }

  ionViewDidEnter() {
    const tamsSettings = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_SETTINGS);
    if (tamsSettings){
      this.TAMS_MODULE = JSON.parse(tamsSettings).modules;
    }
    if (!this.myTodaySchedule) {
      // this.showAlertForLocation(" You dont have schedule for today. please contact your administrator");
       return;
    }
    this.apiProvider.presentLoadingWithText('Please wait fetching location...');
    localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_LATITUDE, '');
    localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_LONGITUDE, '');
    if (this.CheckInFlag === 'out') {
      this.toogleModel = true;
    }else {
      this.toogleModel = false;
    }

    const location = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_WHITELISTED_LOCATION);
    if (location) {
      const locationObj = JSON.parse(location);
      const locationUpdatedDate = this.dateformat.transform(new Date()+"", 'yyyy-MM-dd');
      if (locationObj && locationObj.length >0 && locationObj[0].locationUpdatedDate  !== locationUpdatedDate) {
        this.getMyAttendanceWhitelistedLocations();
      } else {
        this.callSetInterval();
      }
    } else {
      this.callSetInterval();
    }


    this.events.observeDataCompany().subscribe(async (data: any) => {
      if (data.title === "hideLoading") {
        this.apiProvider.dismissLoading();
      } else if (data.title === "showLoading") {
        this.apiProvider.presentLoadingWithText('Please wait fetching location...');
      }
    })
  }

  toggleChange() {
    console.log("toggleChange --->" + this.toogleModel);
  }


  registerMyAttendance() {
    const latitude = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_LATITUDE);
    const longitude = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_LONGITUDE);
    if (!latitude || !longitude) {
      this.apiProvider.showAlert("Location not found. please try again later.");
      this.events.publishDataCompany({
        action: 'GetLocationForTAMS',
        title: "GetLocationForTAMS",
        message: ""
      });
      return;
    }
    if (this.tamsSettings.RequiredImage && !this.base64Image) {
      this.apiProvider.showAlert(" * Image is required to proceed.");
      return;
    }

    const data = {
      "MAppId": "TAMS",
      "HostIc": "",
      "latitute": latitude,
      "longitute": longitude,
      "accessTime": this.dateformat.transform(new Date() + '', "yyyy-MM-dd HH:mm:ss"),
      "accessType": (this.toogleModel) ? 10: 20,
      "image": this.base64Image ? this.base64Image: ''
    };
   var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
        return;
      }
      data.HostIc = JSON.parse(hostData).HOSTIC;
      this.apiProvider.requestApi(data, '/api/TAMS/registerMyAttendance', true, false, '').then(
        (val: any) => {
          const response = JSON.parse(val);
          if (response.Table && response.Table.length > 0 ) {
            if(response.Table[0].Code === 10 || response.Table[0].code === 10) {
              let saveData:any ;
              const currentDate = this.dateformat.transform(new Date() + '', "yyyy-MM-dd")
              if (this.clockDateObj && this.clockDateObj.Date && (currentDate === this.clockDateObj.Date)) {
                saveData = this.clockDateObj;
              } else {
                saveData = {
                  "Date": currentDate,
                  "InClockType":'',
                  "OutClockType":'',
                }
              }
              if (this.toogleModel) {
                saveData.OutClockType =  'in';
              } else {
                saveData.InClockType =  'out';
              }
              localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_CLOCK_IN_ALREADY, JSON.stringify(saveData));
              localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_CLOCK_TYPE, this.toogleModel ? 'in': 'out');
              this.apiProvider.showAlert("Attendance captured successfully");
              this.goBack();
            } else {
              this.apiProvider.showAlert(response.Table[0].description? response.Table[0].description: (response.Table[0].Description? response.Table[0].Description: 'Oops..Something went wrong. please contact admin.') );
            }
          }
        },
        (err) => {
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

          if(err && err.message && err.message.indexOf("Http failure response for") > -1){
            var message  = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
            this.apiProvider.showAlert(message);
            return;
          }

          if(err && err.Table && err.Table[0].Code !== 10 && err.Table1 && err.Table1[0].Description){
            this.apiProvider.showAlert(err.Table1[0].Description);
            return;
          }
          this.apiProvider.showAlert("Error in response");
        }
      );
  }

  openMap() {
    const options: InAppBrowserOptions = {
      zoom: 'no'
    }
    // Opening a URL and returning an InAppBrowserObject

    //2.984625, 101.718151
    // const browser = this.iab.create('https://ionicframework.com/');

    const latitude = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_LATITUDE);
    if (!latitude) {
      this.apiProvider.showAlert("Location not detected.")
    }

    const longitude = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_LONGITUDE);
    if (!longitude) {
      this.apiProvider.showAlert("Location not detected.")
    }
    this.iab.create("https://maps.google.com/?q="+ latitude+","+longitude, '_blank', options);
    // if( (navigator.platform.indexOf("iPhone") != -1)
    //     || (navigator.platform.indexOf("iPod") != -1)
    //     || (navigator.platform.indexOf("iPad") != -1)) {
    //       this.iab.create("https://maps.google.com/?q="+ latitude+","+longitude, '_blank', options);
    // } else {
    //       this.iab.create("https://maps.google.com/?q="+latitude+","+longitude, '_blank', options);
    // }



  }

  calculateDistance(lat1:number,lat2:number,long1:number,long2:number){
    let p = 0.017453292519943295;    // Math.PI / 180
    let c = Math.cos;
    let a = 0.5 - c((lat1-lat2) * p) / 2 + c(lat2 * p) *c((lat1) * p) * (1 - c(((long1- long2) * p))) / 2;
    let dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
    return dis/1000;
  }

  goBack() {
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      const QRObj = JSON.parse(qrData);
      if (QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
        this.router.navigateByUrl('tamshome');
        return;
      }
    }
    this.router.navigateByUrl('home-tams');
    console.log('goBack ');
  }


  public presentActionSheet() {
    if (this.apiProvider.isRunningOnMobile()) {
      this.apiProvider.presentLoading();
      this.takePicture(this.camera.PictureSourceType.CAMERA);
    } else {
      this.base64Image = AppSettings.SAMPLE_PHOTO;
    }

  }

  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 80,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      // destinationType: this.camera.DestinationType.FILE_URI,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      allowEdit: true,
      targetWidth: 400,
      targetHeight: 400
    };

    // Get the data of an image
    this.camera.getPicture(options).then((imageData) => {

      this.base64Image = imageData;
      this.apiProvider.dismissLoading();

    }, (err) => {
      this.presentToast(this.T_SVC['ALERT_TEXT.CAMEARA_IMAGE_SELECT_ERROR']);
      this.apiProvider.dismissLoading();
    });
  }

  private async presentToast(text) {
    this.apiProvider.showAlert(text);
  }
}
