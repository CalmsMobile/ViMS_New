import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-tamsmyattendancelogs',
  templateUrl: './tamsmyattendancelogs.page.html',
  styleUrls: ['./tamsmyattendancelogs.page.scss'],
})
export class TamsmyattendancelogsPage implements OnInit {
  @ViewChild(IonContent, {static: true}) content: IonContent;
  myAttendanceLogsListClone = [];
  myAttendanceLogsList = [];
  T_SVC:any;
  isFetching = false;
  loadingFinished = false;
  startDate = '';
  showMenu = false;
  constructor(private router: Router,
    private apiProvider: RestProvider,
    private iab: InAppBrowser,
    private translate : TranslateService,
    private dateformat : DateFormatPipe) { }

  ngOnInit() {
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      const QRObj = JSON.parse(qrData);
      if (QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
        this.showMenu = true;
      }
    }
    this.startDate = this.dateformat.transform(new Date() + "", "yyyy-MM-dd");
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL']).subscribe(t => {
        this.T_SVC = t;
    });
    this.isFetching = false;
    this.getMyAttendanceLogs(null);
  }

  goBack() {
    this.router.navigateByUrl('home-tams');
    console.log('goBack ');
  }

  doRefresh(refresher) {
    this.myAttendanceLogsList = [];
    this.myAttendanceLogsListClone = [];
    this.isFetching = false;
    this.getMyAttendanceLogs(refresher);
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
          currentClass.getMyAttendanceLogs(null);
      //  },1000)
      }
      // }
    }, 500);
  }

  getDayofDate(dateString){
		let dateObject = new Date(dateString);
		let weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
		return weekdays[dateObject.getDay()];
	}

  showCalender(picker) {
    picker.open();
  }

  changeCalendar($event){
    this.startDate = this.dateformat.transform($event.detail.value + "", "yyyy-MM-dd");
    console.log("OpenCalender:Start:"+ this.startDate);
    if (this.startDate) {
      this.filterTechnologiesByDate();
    }
  }

  filterTechnologiesByDate() {
    this.myAttendanceLogsListClone = [];
    const sortList = this.myAttendanceLogsList.sort((a, b) => {
      return <any>new Date(b.DateTime) - <any>new Date(a.DateTime);
    });
    sortList.reverse();
    sortList.forEach(element => {
      const startDate = this.dateformat.transform(element.DateTime, "yyyy-MM-dd");
      if (new Date(startDate).getTime() >= new Date(this.startDate).getTime()) {
        this.myAttendanceLogsListClone.push(element);
      }
    });
    if (this.content) {
      this.content.scrollToTop(400);
    }

  }

  openMap(item) {

    if (item.DeviceCode !== 'MA') {
      return;
    }
    const options: InAppBrowserOptions = {
      zoom: 'no'
    }
    if (!item.latitute) {
      this.apiProvider.showAlert("Location not detected.");
      return;
    }

    if (!item.longitute) {
      this.apiProvider.showAlert("Location not detected.");
      return;
    }
    this.iab.create("https://maps.google.com/?q="+item.latitute+","+item.longitute, '_blank', options);
    // if( (navigator.platform.indexOf("iPhone") != -1)
    //     || (navigator.platform.indexOf("iPod") != -1)
    //     || (navigator.platform.indexOf("iPad") != -1)) {
    //     this.iab.create("https://maps.google.com/?q="+ item.latitute+","+item.longitute, '_blank', options);
    //   } else {
    //     this.iab.create("https://maps.google.com/?q="+item.latitute+","+item.longitute, '_blank', options);
    //   }
  }

  getMyAttendanceLogs(refresher){
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).HOSTIC) {
      return;
    }
    this.loadingFinished = false;
    var hostId = JSON.parse(hostData).HOSTIC;
    var data = {
      "MAppId": "TAMS",
      "HostIc": hostId,
      "START": this.myAttendanceLogsList.length === 0? 0: this.myAttendanceLogsList.length + 1,
      "LIMIT": 500,
    };
    this.apiProvider.requestApi(data, '/api/TAMS/getMyAttendanceLogs', this.isFetching? false: true, false, '').then(
      (val: any) => {
        this.loadingFinished = true;
        const response = JSON.parse(val);
        if (response.Table && response.Table.length > 0 && (response.Table[0].Code === 10 || response.Table[0].code === 10)) {
          if (this.isFetching) {
            this.myAttendanceLogsList = this.myAttendanceLogsList.concat(response.Table1);
          } else {
            this.myAttendanceLogsList = response.Table1;
          }

        }
        if(refresher){
          refresher.target.complete();
        }
        if (this.startDate && response.Table1.length > 0) {
          this.filterTechnologiesByDate();
        }
        this.isFetching = false;
      },
      async (err) => {
        this.loadingFinished = true;
        this.isFetching = false;
        if(refresher){
          refresher.target.complete();
        }
        if(err && err.message == "No Internet"){
          return;
        }
        var message = "";
        if(err && err.message && err.message.indexOf("Http failure response for") > -1){
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

  onCancel(){
    this.myAttendanceLogsListClone = this.myAttendanceLogsList;
  }
}
