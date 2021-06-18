import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { QuickPassVisitorPopupComponent } from 'src/app/components/quickpass-visitor-popup/quickpass-visitor-popup';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-quick-pass-history-page',
  templateUrl: './quick-pass-history-page.page.html',
  styleUrls: ['./quick-pass-history-page.page.scss'],
})
export class QuickPassHistoryPagePage implements OnInit {

  OffSet = 0;

  appointments = [];
  appointmentsClone = [];
  T_SVC:any;
  Type  = "";
  title = "Quick Pass History";
  queryText = "";
  constructor(public navCtrl: NavController,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    public apiProvider: RestProvider,
    private dateformat : DateFormatPipe,
    private events: EventsService,
    private router: Router,
    private route: ActivatedRoute,
    private modalCtrl : ModalController) {
    this.translate.get([
    'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
    'ALERT_TEXT.DELETE_QUICK_PASS',
    'ALERT_TEXT.VISITOR_CHECKOUT_SUCCESS',
    'ALERT_TEXT.QUIK_PASS_DELETE_SUCCESS',
    'ALERT_TEXT.CHECKOUT_MESSAGE',
    'ALERT_TEXT.CONFIRMATION',
    'ALERT_TEXT.DELETE_QUICK_PASS1']).subscribe(t => {
        this.T_SVC = t;
    });
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        var type = passData.type;
        this.appointments = passData.list;
        this.appointmentsClone = this.appointments;
        this.sortByDate();
        if(type){
          this.Type = type;
          switch(type){
            case AppSettings.QUICKPASS_TYPES.TotalGuestInside:
              this.title = "Total Guest Inside";
              break
            case AppSettings.QUICKPASS_TYPES.TotalUnusedExpiredPass:
              this.title = "Total Unused Expired Pass"
              break;
            case AppSettings.QUICKPASS_TYPES.TotalUsedPass:
              this.title = "Total Utilized Pass"
              break;
            case AppSettings.QUICKPASS_TYPES.TotalUnusedPass:
              this.title = "Total Unutilized Pass"
              break;
            case AppSettings.QUICKPASS_TYPES.TotalFinishedOverstayPass:
              this.title = "Total Finished Overstay Pass"
              break;
            case AppSettings.QUICKPASS_TYPES.TotalCurrentOverStayPass:
              this.title = "Total Current Overstay Pass";
              break;
          }
        }
      }
    });

  }

  sortByDate() {
    this.appointmentsClone.sort((a, b) => a.ExpiryTime <= b.ExpiryTime ? -1 : 1);
    this.appointmentsClone.reverse();
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter QuickPassHistoryPage');
    this.OffSet = 0;
    this.events.publishDataCompany({
      action: "page",
      title: "quick-pass-dash-board-page",
      message: ''
    });
  }

  getDayofDate(dateString){
    let dateObject = new Date(dateString);
    let weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return weekdays[dateObject.getDay()];
  }

  doRefresh(refresher) {
    this.OffSet = 0;
    this.GetAllQuickPassVisitorsHistory(refresher, true);
    //setTimeout(()=>{refresher.target.complete();},2000)
  }

  getVisitorsBySearch(queryText){
    if(queryText){
      var showList = [];
      for(var i= 0 ; i < this.appointments.length ; i++){
        var item = this.appointments[i];
        if(item.VisitorName.toLowerCase().search(queryText.toLowerCase()) >= 0){
          showList[showList.length] = item;
        }
      }
      this.appointmentsClone = showList;
    }else{
      this.appointmentsClone = this.appointments;
    }
    this.sortByDate();
  }

  onCancel(){
    this.appointmentsClone = this.appointments;
    this.sortByDate();
  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }


  GetAllQuickPassVisitorsHistory(refresher, showLoading){
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var HOST_ID = JSON.parse(hostData).HOST_ID;
      var params = {
      "HostIC": HOST_ID,
      "OffSet": ""+ this.OffSet,
      "Rows":"20000"
    };
      // this.VM.host_search_id = "adam";
      this.apiProvider.GetAllQuickPassVisitorsHistory(params, showLoading).then(
        (val) => {
          var aList = JSON.parse(val.toString());

          if(refresher){
          //   this.appointments = aList.concat(this.appointments);
            refresher.target.complete();
          }

          var appointments = aList;

          appointments.sort((a, b) =>
            a.att_check_in_date <= b.att_check_in_date ? -1 : 1
          );
          appointments.reverse();
          this.OffSet = this.OffSet + aList.length;
          this.appointments = [];
          for(var i = 0 ; i < appointments.length ; i++){
            var item = appointments[i];

            switch(this.Type){
              case AppSettings.QUICKPASS_TYPES.TotalGuestInside:
                  if(item.CheckInTime && !item.CheckOutTime){
                    this.appointments[this.appointments.length] = item;
                  }
                break
              case AppSettings.QUICKPASS_TYPES.TotalUnusedExpiredPass:
                  var ExpiryTime = item.ExpiryTime;
                  var ftDate = this.dateformat.transform(ExpiryTime+"", "yyyy-MM-ddTHH:mm:ss");
                  if(!item.CheckInTime && !item.CheckOutTime && new Date(ftDate).getTime() < new Date().getTime()){
                    this.appointments[this.appointments.length] = item;
                  }
                break;
              case AppSettings.QUICKPASS_TYPES.TotalUsedPass:
                  if(item.CheckInTime  && item.CheckOutTime){
                    this.appointments[this.appointments.length] = item;
                  }
                break;
              case AppSettings.QUICKPASS_TYPES.TotalUnusedPass:
                  if(!item.CheckInTime && !item.CheckOutTime){
                    this.appointments[this.appointments.length] = item;
                  }
                break;
              case AppSettings.QUICKPASS_TYPES.TotalFinishedOverstayPass:
                  if(item.CheckInTime && item.CheckOutTime){
                    ExpiryTime = item.ExpiryTime;
                    ftDate = this.dateformat.transform(ExpiryTime+"", "yyyy-MM-ddTHH:mm:ss");
                    var CheckOutTime = item.CheckOutTime;
                    var ctDate = this.dateformat.transform(CheckOutTime+"", "yyyy-MM-ddTHH:mm:ss");
                    if(new Date(ftDate).getTime() < new Date(ctDate).getTime()){
                      this.appointments[this.appointments.length] = item;
                    }
                  }
                break;
                case AppSettings.QUICKPASS_TYPES.TotalCurrentOverStayPass:
                  if(item.CheckInTime && !item.CheckOutTime){
                    ExpiryTime = item.ExpiryTime;
                    ftDate = this.dateformat.transform(ExpiryTime+"", "yyyy-MM-ddTHH:mm:ss");
                    if(new Date(ftDate).getTime() < new Date().getTime()){
                      this.appointments[this.appointments.length] = item;
                    }
                  }
                break;
            }

          }

          this.appointmentsClone = this.appointments;
          this.sortByDate();
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

  async checkoutVisitor(slideDOM, item){
    slideDOM.close();

    var ableToDelete = false;
    var expiryTime = this.dateformat.transform(item.ExpiryTime , "yyyy-MM-ddTHH:mm:ss");
    var eTime = new Date(expiryTime).getTime();
    var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
    var cTime = new Date(cDate).getTime();
    if(eTime > cTime){
      if(!item.IsCheckedIn){
        ableToDelete = true;
      }else if(item.IsCheckedOut){
        ableToDelete = true;
      } else{
        ableToDelete = false;
      }

    }else{
      if(item.IsCheckedIn && !item.IsCheckedOut){
        ableToDelete = false;
      }else{
        ableToDelete = true;
      }

    }

    if(ableToDelete){
      let alert = this.alertCtrl.create({
        header: this.T_SVC['ALERT_TEXT.CONFIRMATION'],
        cssClass:"alert-danger",
        message: this.T_SVC['ALERT_TEXT.DELETE_QUICK_PASS']+(item.VisitorName? item.VisitorName : " this visitor")+ this.T_SVC['ALERT_TEXT.DELETE_QUICK_PASS1'],
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
                "HexCode":item.HexCode
              };
              // this.VM.host_search_id = "adam";
              this.apiProvider.DeleteQuickPassVisitor(params).then(
                async (val) => {
                  this.OffSet = 0;
                  this.doRefresh(null);

                  let alert = this.alertCtrl.create({
                    header: 'Success',
                    cssClass:'alert-danger',
                    message: this.T_SVC['ALERT_TEXT.QUIK_PASS_DELETE_SUCCESS'],
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
    }else{
      let alert = this.alertCtrl.create({
        header: this.T_SVC['ALERT_TEXT.CONFIRMATION'],
        cssClass:"alert-danger",
        message: (item.VisitorName? item.VisitorName : " This visitor") + this.T_SVC['ALERT_TEXT.CHECKOUT_MESSAGE'],
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
                "HexCode":item.HexCode,
                "IsCheckIn": false,
                "VisitorImg": ""
              };
              // this.VM.host_search_id = "adam";
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
            }
          }
        ]
      });
      (await alert).present();
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

  async showDetails(item){

   const presentModel = await this.modalCtrl.create({
    component: QuickPassVisitorPopupComponent,
    componentProps: {
      data: {
        QPAppointment : JSON.stringify(item),
        CheckIn : false
      }
    },
    showBackdrop: true,
    mode: 'ios',
    cssClass: 'visitorPopupModal1'
  });
  presentModel.onWillDismiss().then((data) => {
  });
  return await presentModel.present();

  // const navigationExtras: NavigationExtras = {
  //   state: {
  //     passData: {
  //       QPAppointment : JSON.stringify(item),
  //       CheckIn : false
  //     }
  //   }
  // };
  // this.router.navigate(['quick-pass-details-page'], navigationExtras);
  }

  ngOnInit() {
  }

}
