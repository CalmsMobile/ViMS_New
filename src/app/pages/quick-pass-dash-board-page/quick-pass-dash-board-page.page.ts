import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-quick-pass-dash-board-page',
  templateUrl: './quick-pass-dash-board-page.page.html',
  styleUrls: ['./quick-pass-dash-board-page.page.scss'],
})
export class QuickPassDashBoardPagePage implements OnInit {

  title = "QuickPass";
  sub_title = "QuickPass Dashboard";
  TotalGuestInside = 0;
  TotalUnusedExpiredPass = 0;
  TotalUsedPass = 0;
  TotalUnusedPass = 0;
  TotalFinishedOverstayPass = 0;
  // TotalCheckOut = 0;
  TotalCurrentOverStayPass = 0;
  T_SVC:any;
  OffSet = 0;
  appointments = [];
  notificationCount = 0;
  isAdmin = true;

  TotalGuestInsideAppointments = [];
  TotalUnusedExpiredPassAppointments = [];
  TotalUsedPassAppointments = [];
  TotalUnusedPassAppointments = [];
  TotalFinisedOverstayAppointments = [];
  TotalCurrentOverStayAppointments = [];

  constructor(public navCtrl: NavController,
    private translate: TranslateService,
    private router: Router,
    private alertCtrl: AlertController,
    public apiProvider: RestProvider,
    private dateformat : DateFormatPipe,
    private events : EventsService) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL']).subscribe(t => {
        this.T_SVC = t;
    });

    this.events.observeDataCompany().subscribe((data1: any) => {
      // "refreshQuickPass", data=>{
        if (data1.action === 'refreshQuickPass') {
          this.ionViewWillEnter();
        }
    });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter quick-pass-dash-board-page');

  }

  ionViewWillEnter(){
    this.events.publishDataCompany({
      action: "page",
      title: "quick-pass-dash-board-page",
      message: ''
    });
    this.GetAllQuickPassVisitorsHistory(null, true);
  }

  ionViewWillLeave(){
    this.events.publishDataCompany({
      action: "page",
      title: "quick-pass-dash-board-page",
      message: ''
    });
  }

  gotoAdminPage(){
    this.router.navigateByUrl("admin-home");
  }

  showNotificationCount(){
    var count = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
    if(count){
      this.notificationCount = parseInt(count);
    }
  }

  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

  statesClicked(type){
    switch(type){
      case AppSettings.QUICKPASS_TYPES.TotalGuestInside:
        const navigationExtras: NavigationExtras = {
          state: {
            passData: {
              list : this.TotalGuestInsideAppointments,
              type : type
            }
          }
        };
        this.router.navigate(['quick-pass-history-page'], navigationExtras);
        break;
      case AppSettings.QUICKPASS_TYPES.TotalUnusedExpiredPass:
        const navigationExtras1 = {
            state: {
              passData: {
                list : this.TotalUnusedExpiredPassAppointments,
                type : type
              }
            }
          };
          this.router.navigate(['quick-pass-history-page'], navigationExtras1);
        break;
      case AppSettings.QUICKPASS_TYPES.TotalUsedPass:
          const navigationExtras3 = {
            state: {
              passData: {
                list : this.TotalUsedPassAppointments,
                type : type
              }
            }
          };
          this.router.navigate(['quick-pass-history-page'], navigationExtras3);
        break;
      case AppSettings.QUICKPASS_TYPES.TotalUnusedPass:
         const navigationExtras4 = {
            state: {
              passData: {
                list : this.TotalUnusedPassAppointments,
                type : type
              }
            }
          };
          this.router.navigate(['quick-pass-history-page'], navigationExtras4);
        break;
      case AppSettings.QUICKPASS_TYPES.TotalFinishedOverstayPass:
          const navigationExtras5 = {
            state: {
              passData: {
                list : this.TotalFinisedOverstayAppointments,
                type : type
              }
            }
          };
          this.router.navigate(['quick-pass-history-page'], navigationExtras5);
        break;
        case AppSettings.QUICKPASS_TYPES.TotalCurrentOverStayPass:
          const navigationExtras6 = {
            state: {
              passData: {
                list : this.TotalCurrentOverStayAppointments,
                type : type
              }
            }
          };
          this.router.navigate(['quick-pass-history-page'], navigationExtras6);
        break;
    }
  }

  doRefresh(refresher){
    this.OffSet = 0;
    this.GetAllQuickPassVisitorsHistory(refresher, true);
  }

  GetAllQuickPassVisitorsHistory(refresher, showLoading){
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var HOST_ID = JSON.parse(hostData).HOST_ID;
      var params = {
      "HostIC": HOST_ID,
      "OffSet": ""+ this.OffSet,
      "Rows":"1000"
    };
      // this.VM.host_search_id = "adam";
      this.apiProvider.GetAllQuickPassVisitorsHistory(params, showLoading).then(
        (val) => {
          var aList = JSON.parse(val.toString());

          if(refresher){
          //   this.appointments = aList.concat(this.appointments);
            refresher.target.complete();
          }
          // else {
            this.appointments = aList;
          // }
          // this.appointments = aList.concat(this.appointments);
          this.appointments.sort((a, b) =>
            a.att_check_in_date <= b.att_check_in_date ? -1 : 1
          );
          this.appointments.reverse();
          this.OffSet = this.OffSet + aList.length;
          this.setStatsValue();

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

  setStatsValue(){
    this.TotalGuestInside = 0;
    this.TotalUnusedExpiredPass = 0;
    this.TotalUsedPass = 0;
    this.TotalUnusedPass = 0;
    this.TotalFinishedOverstayPass = 0;
    this.TotalCurrentOverStayPass = 0;
    this.TotalGuestInsideAppointments = [];
    this.TotalUnusedExpiredPassAppointments = [];
    this.TotalUsedPassAppointments = [];
    this.TotalUnusedPassAppointments = [];
    this.TotalFinisedOverstayAppointments = [];
    this.TotalCurrentOverStayAppointments = [];

    for(var i = 0 ; i < this.appointments.length ; i++){
      var item = this.appointments[i];
      var ExpiryTime = item.ExpiryTime;
      var ftDate = this.dateformat.transform(ExpiryTime+"", "yyyy-MM-ddTHH:mm:ss");
      if(item.CheckInTime && !item.CheckOutTime){

        //Active
        this.TotalGuestInside = this.TotalGuestInside+1;
        this.TotalGuestInsideAppointments[this.TotalGuestInsideAppointments.length] = item;

        // //Used
        // this.TotalUsedPass  = this.TotalUsedPass +1;
        // this.TotalUsedPassAppointments[this.TotalUsedPassAppointments.length] = item;

        //OverStay
        if(new Date(ftDate).getTime() < new Date().getTime()){
          //CheckOut
          this.TotalCurrentOverStayPass  = this.TotalCurrentOverStayPass +1;
          this.TotalCurrentOverStayAppointments[this.TotalCurrentOverStayAppointments.length] = item;


        }
      }else if(!item.CheckInTime && !item.CheckOutTime && new Date(ftDate).getTime() < new Date().getTime()){
        //Expired
        this.TotalUnusedExpiredPass = this.TotalUnusedExpiredPass + 1;
        this.TotalUnusedExpiredPassAppointments[this.TotalUnusedExpiredPassAppointments.length] = item;

        //Unused
        this.TotalUnusedPass = this.TotalUnusedPass + 1;
        this.TotalUnusedPassAppointments[this.TotalUnusedPassAppointments.length] = item;

      }else if(item.CheckInTime && item.CheckOutTime){
        //Used
        this.TotalUsedPass  = this.TotalUsedPass +1;
        this.TotalUsedPassAppointments[this.TotalUsedPassAppointments.length] = item;

        var CheckOutTime = item.CheckOutTime;
        var ctDate = this.dateformat.transform(CheckOutTime+"", "yyyy-MM-ddTHH:mm:ss");
        if(new Date(ftDate).getTime() < new Date(ctDate).getTime()){
          this.TotalFinishedOverstayPass = this.TotalFinishedOverstayPass + 1;
          this.TotalFinisedOverstayAppointments[this.TotalFinisedOverstayAppointments.length] = item;
        }

      }else if(!item.CheckInTime && !item.CheckOutTime){
        //Unused
        this.TotalUnusedPass = this.TotalUnusedPass + 1;
        this.TotalUnusedPassAppointments[this.TotalUnusedPassAppointments.length] = item;
      }

    }
  }

  ngOnInit() {
  }

}
