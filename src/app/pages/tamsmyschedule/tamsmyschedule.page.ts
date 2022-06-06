import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonItemSliding } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { AppSettings } from 'src/app/services/app-settings';

@Component({
  selector: 'app-tamsmyschedule',
  templateUrl: './tamsmyschedule.page.html',
  styleUrls: ['./tamsmyschedule.page.scss'],
})
export class TamsmyschedulePage implements OnInit {
  @ViewChild(IonContent, {static: true}) content: IonContent;
  T_SVC: any;
  myScheduleList = [];
  myScheduleListCone = [];
  loadingFinished = false;
  showAlert = false;
  startDateMain = '';
  startDate = '';
  selectedTab = 'tab1';
  searchText = '';
  showMenu = false;
  pickerOptions = {
    mode: 'md',
    backdropDismiss:true
  };
  constructor(private router: Router,
    private dateformat : DateFormatPipe,
    private translate:TranslateService) {
      this.translate.get([ 'ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS', 'ALERT_TEXT.CONFIRMATION',
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL', 'SETTINGS.SELECT_LANGUAGE']).subscribe(t => {
        this.T_SVC = t;
    });
    }

  ngOnInit() {
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      const QRObj = JSON.parse(qrData);
      if (QRObj.MAppId === AppSettings.LOGINTYPES.TAMS) {
        this.showMenu = true;
      }
    }
    this.getMySchedules('');
  }

  goBack() {
    this.router.navigateByUrl('home-tams');
    console.log('goBack ');
  }

  changeTab(tab) {
    this.selectedTab = tab;
    this.searchText = '';
    this.filterTechnologies('');
  }

  showCalender(picker) {
    this.searchText = '';
    picker.open();
  }

  changeCalendar($event){
    this.startDate = this.dateformat.transform($event.detail.value + "", "yyyy-MM-dd");
    console.log("OpenCalender:Start:"+ this.startDate);
    if (this.startDate) {
      this.filterTechnologiesByDate();
    }
  }

  getDay(date) {
    let day = '';
    switch (new Date(date).getDay()) {
      case 0:
        day = 'SUN';
        break;
      case 1:
        day = 'MON';
        break;
      case 2:
        day = 'TUE';
        break;
      case 3:
        day = 'WED';
        break;
      case 4:
        day = 'THU';
        break;
      case 5:
        day = 'FRI';
        break;
      case 6:
        day = 'SAT';
        break;
      default:
        break;
    }
    return day;
  }

  doRefresh(refresher) {
    // this.myScheduleList = [];
    // this.myScheduleListCone = [];
    this.startDateMain = "";
    setTimeout(() => {
      this.getMySchedules(refresher);
    }, 1000);
  }

  moveToDetailsPage(item){

  }

  getMySchedules(refresher) {
    this.loadingFinished = false;
    if(refresher){
      refresher.target.complete();
    }
    const scheduleList = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_SCHEDULE);
    if (scheduleList) {
      this.myScheduleList = JSON.parse(scheduleList);
    }



    if(!this.startDate || refresher){
      this.startDate = this.dateformat.transform(new Date() + "", "yyyy-MM-dd");
      this.startDateMain = this.dateformat.transform(new Date() + "", "yyyy-MM-dd");
    }
    this.filterTechnologiesByDate();
  }

  ondrag(event, slideDOM:IonItemSliding, item: any) {
    let percent = event.detail.ratio;
    if (percent > 0) {
      this.closeSlide(slideDOM);
      if(this.showAlert){
        return;
        }
        this.showAlert = true;
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



  onCancel(){
    this.myScheduleListCone = this.myScheduleList;
  }

  loadData(event) {
    var currentClass = this;
    setTimeout(() => {
      console.log('Done');
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if(!currentClass.loadingFinished){
        // currentClass.isFetching = true;
        // setTimeout(()=>{
          // currentClass.getMySchedules(null, true);
      //  },1000)
      }
      // }
    }, 500);
  }

  filterTechnologiesByDate() {
    const myScheduleListtoShow = [];
    const sortList = this.myScheduleList.sort((a, b) => {
      return <any>new Date(b.scheduleDate) - <any>new Date(a.scheduleDate);
    });
    sortList.reverse();
    sortList.forEach(element => {
      const startDate = this.dateformat.transform(element.scheduleDate, "yyyy-MM-dd");
      if (new Date(startDate).getTime() >= new Date(this.startDate).getTime()) {
        myScheduleListtoShow.push(element);
      }
    });
    this.loadingFinished = true;
    this.myScheduleListCone = myScheduleListtoShow;
    if (this.content) {
      this.content.scrollToTop(400);
    }

  }

  filterTechnologies(event) {
    const searchtext = event? event.target.value: "";
		 let val : string 	= searchtext;
		 // DON'T filter the technologies IF the supplied input is an empty string
      this.startDate = '';
		 if (val){
      if (this.selectedTab === 'tab1') {
        this.myScheduleListCone =  this.myScheduleList.filter((item) =>{
          return (item.shiftName.toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      } else if (this.selectedTab === 'tab2') {
        let datfor = 'dd-MM-yyyy';
        if (this.myScheduleList.length > 0 && this.myScheduleList[0].scheduleDate.indexOf('/') > -1) {
          val = val.replace('-', '/');
          val = val.replace('-', '/');
          datfor = 'dd/MM/yyyy';
        }

        this.myScheduleListCone =  this.myScheduleList.filter((item) =>{
          return (this.dateformat.transform(item.scheduleDate + "", datfor).toLowerCase().indexOf(val.toLowerCase()) > -1);
        })
      } else if (this.selectedTab === 'tab3') {
        this.myScheduleListCone =  this.myScheduleList.filter((item) =>{
          return ((item.fromTime && item.fromTime.toLowerCase().indexOf(val.toLowerCase()) > -1) ||  (item.toTime && item.toTime.toLowerCase().indexOf(val.toLowerCase()) > -1));
        })
      }

     } else {
      this.myScheduleListCone = this.myScheduleList;
     }
  }
}
