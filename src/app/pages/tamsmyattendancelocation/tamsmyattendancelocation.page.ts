import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowserOptions,InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-tamsmyattendancelocation',
  templateUrl: './tamsmyattendancelocation.page.html',
  styleUrls: ['./tamsmyattendancelocation.page.scss'],
})
export class TamsmyattendancelocationPage implements OnInit {
  myAttendanceLocationList = [];
  myAttendanceLocationListCone = [];
  T_SVC:any;
  startDate = '';
  showMenu = false;
  loadingFinished = false;
  constructor(private router: Router,
    private apiProvider: RestProvider,
    private translate : TranslateService,
    private iab: InAppBrowser,
    private dateformat : DateFormatPipe) { }
  ngOnInit() {
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      const QRObj = JSON.parse(qrData);
      if (QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
        this.showMenu = true;
      }
    }
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL']).subscribe(t => {
        this.T_SVC = t;
    });
    this.getMyAttendanceWhitelistedLocations(null);
  }
  goBack() {
    this.router.navigateByUrl('home-tams');
    console.log('goBack ');
  }

  doRefresh(refresher) {
    this.myAttendanceLocationList = [];
    this.myAttendanceLocationListCone = [];
    this.getMyAttendanceWhitelistedLocations(refresher);
  }

  openMap(item) {
    const options: InAppBrowserOptions = {
      zoom: 'no'
    }
    if (!item.Latitude) {
      this.apiProvider.showAlert("Location not detected.")
    }

    if (!item.Longitude) {
      this.apiProvider.showAlert("Location not detected.")
    }
    this.iab.create("https://maps.google.com/?q="+ item.Latitude+","+item.Longitude, '_blank', options);
    // if( (navigator.platform.indexOf("iPhone") != -1)
    //     || (navigator.platform.indexOf("iPod") != -1)
    //     || (navigator.platform.indexOf("iPad") != -1)) {
    //     this.iab.create("https://maps.google.com/?q="+ item.Latitude+","+item.Longitude, '_blank', options);
    //   } else {
    //     this.iab.create("https://maps.google.com/?q="+item.Latitude+","+item.Longitude, '_blank', options);
    //   }
  }

  getMyAttendanceWhitelistedLocations(refresher){
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).HOSTIC) {
      return;
    }
    this.loadingFinished = false;
    var hostId = JSON.parse(hostData).HOSTIC;
    var data = {
      "MAppId": "TAMS",
      "HostIc": hostId
    };
    this.apiProvider.requestApi(data, '/api/TAMS/getMyWhitelistedLocation', true, false, '').then(
      (val: any) => {
        this.loadingFinished = true;
        const response = JSON.parse(val);
        if (response.Table && response.Table.length > 0 && (response.Table[0].Code === 10 || response.Table[0].code === 10)) {

          const locationUpdatedDate = this.dateformat.transform(new Date()+"", 'yyyy-MM-dd');
          response.Table1[0].locationUpdatedDate = locationUpdatedDate;
          localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_WHITELISTED_LOCATION, JSON.stringify(response.Table1));
          this.myAttendanceLocationList = response.Table1;
          this.myAttendanceLocationListCone = response.Table1;
        }
        if(refresher){
          refresher.target.complete();
        }
      },
      async (err) => {
        this.loadingFinished = true;
        if(err && err.message == "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message == "Http failure response for"){
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

  filterTechnologies(event) {
    const searchtext = event? event.target.value: "";
		 let val : string 	= searchtext;
		 // DON'T filter the technologies IF the supplied input is an empty string
		 if (val){
      this.myAttendanceLocationListCone =  this.myAttendanceLocationList.filter((item) =>{
        return (item.LocationName.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
     } else {
      this.myAttendanceLocationListCone = this.myAttendanceLocationList;
     }
  }


  onCancel(){
    this.myAttendanceLocationListCone = this.myAttendanceLocationList;
  }
}
