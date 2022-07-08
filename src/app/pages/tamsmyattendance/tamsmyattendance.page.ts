import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CalendarComponent } from 'ionic2-calendar';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-tamsmyattendance',
  templateUrl: './tamsmyattendance.page.html',
  styleUrls: ['./tamsmyattendance.page.scss'],
})
export class TamsmyattendancePage implements OnInit {
  @ViewChild(IonContent, {static: true}) content: IonContent;
  myAttendanceList = [];
  myAttendanceListClone = [];
  AppTheme = 'var(--ion-color-primary) !important';
  startDateMain = '';
  startDate = '';
  isFetching = false;
  T_SVC:any;
  loadingFinished = false;
  showMenu = false;
  pickerOptions = {
    mode: 'md',
    backdropDismiss:true
  };
  @ViewChild(CalendarComponent) myCal: CalendarComponent;
  constructor(private router: Router,
    private apiProvider: RestProvider,
    private translate : TranslateService,
    private dateformat : DateFormatPipe,
    private modalCtrl: ModalController) { }

  ngOnInit() {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL']).subscribe(t => {
        this.T_SVC = t;
    });
    this.isFetching = false;
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      const QRObj = JSON.parse(qrData);
      if (QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
        this.showMenu = true;
      }
    }
    this.getMyAttendances(null);
  }

  doRefresh(refresher) {
    this.myAttendanceList = [];
    this.isFetching = false;
    this.startDateMain = "";
    this.startDate = this.dateformat.transform(new Date() + "", "yyyy-MM-dd");
    setTimeout(() => {
      this.startDateMain = this.dateformat.transform(new Date() + "", "yyyy-MM-dd");
      this.getMyAttendances(refresher);
    }, 1000);
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
          currentClass.getMyAttendances(null);
      //  },1000)
      }
      // }
    }, 500);
  }

  getMyAttendances(refresher){
    this.loadingFinished = false;
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).HOSTIC) {
      return;
    }
    var hostId = JSON.parse(hostData).HOSTIC;
    var data = {
      "MAppId": "TAMS",
      "HostIc": "119632",
      "START": this.myAttendanceList.length === 0? 0: this.myAttendanceList.length + 1,
      "LIMIT": 5000,
    };
    console.log(JSON.stringify(data));
    this.apiProvider.requestApi(data, '/api/TAMS/getMyAttendance', this.isFetching? false: true, true, '').then(
      (val: any) => {
        this.loadingFinished = true;
        const response = JSON.parse(val);
        if (response.Table && response.Table.length > 0 && (response.Table[0].Code === 10 || response.Table[0].code === 10)) {
          if (this.isFetching) {
            this.myAttendanceList = this.myAttendanceList.concat(response.Table1);
          } else {
            this.myAttendanceList = response.Table1;
          }
        }
        if(refresher){
          refresher.target.complete();
        }
        this.isFetching = false;
        this.myAttendanceList.forEach(item => {
          // if (item.TotalRequiredHours < 10) {
          //   item.TotalRequiredHours = '0'+ item.TotalRequiredHours;
          // }
          // if (item.TotalWorkHours < 10) {
          //   item.TotalRequiredHours = '0'+ item.TotalWorkHours;
          // }
          const schduleDate = this.dateformat.transform(item.ScheduleDate, "yyyy-MM-dd");
          if (item.actualClockinTime && item.fromTime) {
            let fromTime;
            try{
              fromTime = this.dateformat.transform(item.fromTime+ '', "yyyy-MM-dd HH:mm");
            }catch(e){
              item.fromTime = item.fromTime.replace(" ", "T");
              fromTime = this.dateformat.transform(item.fromTime+ '', "yyyy-MM-dd HH:mm");
            }
            
            if (item.actualClockinTime.indexOf('T') > -1){
              item.actualClockinTime = schduleDate + ' ' +item.actualClockinTime.split('T')[1];
            }
            let outTime;
            try {
              outTime = this.dateformat.transform(item.actualClockinTime, "yyyy-MM-dd HH:mm");
            } catch (error) {
              item.actualClockinTime = item.actualClockinTime.replace(" ", "T");
              outTime = this.dateformat.transform(item.actualClockinTime, "yyyy-MM-dd HH:mm");
            }
            if (new Date(fromTime) < new Date(outTime)) {
              item.InTimeExpired = true;
            } else {
              item.InTimeExpired = false;
            }
          }

          if (item.actualClockoutTime && item.toTime) {
            let toTime;
            try {
              toTime = this.dateformat.transform(item.toTime+ '', "yyyy-MM-dd HH:mm");
            } catch (error) {
              item.toTime = item.toTime.replace(" ", "T");
              toTime = this.dateformat.transform(item.toTime+ '', "yyyy-MM-dd HH:mm");
            }
            if (item.actualClockoutTime.indexOf('T') > -1){
              item.actualClockoutTime = schduleDate + ' ' + item.actualClockoutTime.split('T')[1];
            }
            let outTime;
            try {
              outTime = this.dateformat.transform(item.actualClockoutTime, "yyyy-MM-dd HH:mm");
            } catch (error) {
              item.actualClockoutTime = item.actualClockoutTime.replace(" ", "T");
              outTime = this.dateformat.transform(item.actualClockoutTime, "yyyy-MM-dd HH:mm");
              
            }
            if (new Date(toTime) > new Date(outTime)) {
              item.outTimeExpired = true;
            } else {
              item.outTimeExpired = false;
            }
          }
        });

        if (!this.startDate){
          this.startDateMain = this.dateformat.transform(new Date() + "", "yyyy-MM-dd");
          this.startDate = this.dateformat.transform(new Date() + "", "yyyy-MM-dd");
        }
        if (this.startDate && response.Table1.length > 0) {
          this.filterTechnologiesByDate();
        }
      },
      (err) => {
        this.loadingFinished = true;
        this.isFetching = false;
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

  goBack() {
    this.router.navigateByUrl('home-tams');
    console.log('goBack ');
  }

  filterTechnologiesByDate() {
   this.myAttendanceListClone = [];
   const sortList = this.myAttendanceList.sort((a, b) => {
     return <any>new Date(b.fromTime) - <any>new Date(a.fromTime);
   });
   sortList.reverse();
   sortList.forEach(element => {
    let startDate;
    try {
      startDate = this.dateformat.transform(element.fromTime, "yyyy-MM-dd");
    } catch (error) {
      element.fromTime = element.fromTime.replace(" ", "T");
      startDate = this.dateformat.transform(element.fromTime+ '', "yyyy-MM-dd");
    }
     if (new Date(startDate).getTime() >= new Date(this.startDate).getTime()) {
      this.myAttendanceListClone.push(element);
     }
   });
   if (this.content) {
     this.content.scrollToTop(400);
   }

 }

}
