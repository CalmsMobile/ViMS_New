import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-facility-time-slot',
  templateUrl: './facility-time-slot.page.html',
  styleUrls: ['./facility-time-slot.page.scss'],
})
export class FacilityTimeSlotPage implements OnInit {

  FACILITYSLOTLIST = [];
  // facility = [];
  isEdit = false;
  availability = false;
  FacilityCode = 0;
  START_DATE = "";
  END_DATE = "";
  BookFromDate = "";
  BookToDate = "";
  showDone = false;
  selectedTap = "";
  currentTab = 0 ;
  showLeftArrow = false;
  showRightArrow = false;
  T_SVC:any;
  SHOWFACILITYSLOTLIST = [];
  hostSettings = {
    ShowExpiredSlot : true,
    AllowHostsToEndSession : true
  }
  constructor(public navCtrl: NavController,
    public apiProvider: RestProvider,
    private alertController : AlertController,
    private dateformat : DateFormatPipe,
    private events: EventsService,
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl : ToastController,
    private translate : TranslateService) {
      this.translate.get([
        'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
        'ALERT_TEXT.SESSION_EXPIRED',
        'ALERT_TEXT.SLOT_REMOVED',
        'ALERT_TEXT.SLOT_OCCUPIED',
        'ALERT_TEXT.WISH_TO_CANCEL_SLOT',
        'ALERT_TEXT.SETTINGS_NOT_FOUND']).subscribe(t => {
          this.T_SVC = t;
      });
      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          const passData = this.router.getCurrentNavigation().extras.state.passData;
          console.log('passData : ' + passData);
          this.FacilityCode = passData.FacilityCode;
          this.START_DATE = passData.START_DATE;
          this.END_DATE = passData.END_DATE;
          if(this.START_DATE){
            this.BookFromDate = dateformat.transform(this.START_DATE+"", "dd/MM/yyyy");
            this.BookToDate = dateformat.transform(this.END_DATE+"", "dd/MM/yyyy");
          }
          this.isEdit = passData.edit;
          this.availability = passData.availability;
        }
      });

  }

  async ionViewDidEnter() {
    console.log('ionViewDidEnter FacilityTimeSlotPage');
    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    if(settings && JSON.parse(settings)){
      try{
        if(qrInfo && JSON.parse(qrInfo) && JSON.parse(qrInfo).MAppId){
          var QRObj = JSON.parse(qrInfo);
          if(QRObj.MAppId == AppSettings.LOGINTYPES.HOSTAPPT_FACILITYAPP){
            if(JSON.parse(settings).Table1 && JSON.parse(settings).Table1.length > 0){
              this.hostSettings = JSON.parse(settings).Table1[0];
            }else{
              let toast = await this.toastCtrl.create({
                message: this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND'],
                duration: 3000,
                color: 'primary',
                position: 'bottom'
              });
              toast.present();
              this.hostSettings.ShowExpiredSlot = false;
            }

          }else{
            var sett = JSON.parse(settings).Table1;
            if(sett && sett.length > 0){
              this.hostSettings = sett[0];
            }else{
              this.hostSettings.ShowExpiredSlot = false;
              let toast = await this.toastCtrl.create({
                message: this.T_SVC['ALERT_TEXT.SETTINGS_NOT_FOUND'],
                duration: 3000,
                color: 'primary',
                position: 'bottom'
              });
              toast.present();
            }

          }
        }
        }catch(e){

      }
    }

    if(this.availability){
      this.hostSettings.ShowExpiredSlot = false;
    }

    this.loadVimsAppGetBookingSlot();
  }

  selectDate(currentTab){
    this.currentTab = currentTab;

    console.log(""+ this.selectedTap);
    if(this.FACILITYSLOTLIST.length > 0){
      if(currentTab == -1){
        this.selectedTap = this.FACILITYSLOTLIST[currentTab].key;
      }else if(currentTab > -1 && currentTab  < this.FACILITYSLOTLIST.length -1){
        this.selectedTap = this.FACILITYSLOTLIST[currentTab].key;
      }else{
        this.selectedTap = this.FACILITYSLOTLIST[this.FACILITYSLOTLIST.length -1].key;
      }
      if(currentTab > 0){
        this.showLeftArrow = true;
      }else{
        this.showLeftArrow = false;
      }
      if(currentTab < this.FACILITYSLOTLIST.length- 1){
        this.showRightArrow = true;
      }else{
        this.showRightArrow = false;
      }

    }

    this.SHOWFACILITYSLOTLIST = [];
    for(var i = 0 ; i < this.FACILITYSLOTLIST.length ; i++){
      var data = this.FACILITYSLOTLIST[i];
      if(data.key == this.selectedTap){
        this.SHOWFACILITYSLOTLIST[this.SHOWFACILITYSLOTLIST.length] = data;
      }
    }
  }

  applyClass(list){
    if(list.key == this.selectedTap){
      return 0;
    }else{
      return 1;
    }

  }

  async openSlotInfo(slot){
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    var StaffSeqId = JSON.parse(hostData).HOSTIC;
    // slot.StaffID = StaffSeqId;
    if(slot.MemberID == StaffSeqId){

      var endDate = slot.EndTime;
      for(var i = 0 ; i < this.FACILITYSLOTLIST.length ; i++){
        if(this.FACILITYSLOTLIST[i].key == this.selectedTap){
          for(var j = slot.position ; j < this.FACILITYSLOTLIST[i].value.length ; j++){
              var data = this.FACILITYSLOTLIST[i].value[j];
              if(data.MemberID == StaffSeqId){
                endDate = data.EndTime;
              }else{
                break;
              }
          }
          break;
        }
      }
      var startDate = slot.StartTime;
      for(var i1 = 0 ; i1 < this.FACILITYSLOTLIST.length ; i1++){
        if(this.FACILITYSLOTLIST[i1].key == this.selectedTap){
          for(var j1 = slot.position ; j1 < this.FACILITYSLOTLIST[i1].value.length ; j1--){
              data = this.FACILITYSLOTLIST[i1].value[j1];
              if(data.MemberID == StaffSeqId){
                startDate = data.StartTime;
              }else{
                break;
              }
          }
          break;
        }
      }

      let loginConfirm = this.alertController.create({
        header:"<span class='failed'>" + "Cancel Slot" + '</span>',
        message: this.T_SVC['ALERT_TEXT.WISH_TO_CANCEL_SLOT'],
        cssClass:'alert-warning',
        buttons: [
          {
            text: "Cancel",
            role: 'cancel',
            handler: () => {
            }
          },
          {
            text: "Okay",
            handler: () => {
              this.cancelSlot(slot, startDate, endDate,StaffSeqId);
            }
          }
        ]
      });
      // loginConfirm.present();

      const alert = await this.alertController.create({
        header: 'Slot Booked',
        subHeader: '',
        message: '<b>Booked by : </b>You' + (slot.PurposeName ? (' <br> <b>Purpose : </b>' + slot.PurposeName) : ''),
        cssClass: 'alert-danger',
        buttons: ['OK']
      });
      alert.present();

    }else{
      const alert = await this.alertController.create({
        header: 'Slot Booked',
        subHeader: '',
        message: (slot.StaffID ? ('<b>Booked By : </b>' + slot.StaffID) : '') + (slot.PurposeName ? (' <br> <b>Purpose : </b>' + slot.PurposeName) : ''),
        cssClass: 'alert-danger',
        buttons: ['OK']
      });
      alert.present();
    }

    return;
  }

  cancelSlot(slot, startDate, endDate, StaffSeqId){
    var params = {
      "RefSchoolSeqId": "",
      "RefBranchSeqId": "",
      "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
      "StartTime":startDate,
      "EndTime":endDate,
      "BookingID": slot.BookingID,
      "UpdatedBy":StaffSeqId
    }
    this.apiProvider.VimsAppFBBookingCancel(params).then(
      async (val) => {
        if(val){
          var message = "Success"; // 0- used 1.success 2.Expired
          if(JSON.parse(val+"")[0].Status == "1"){
            let alert = await this.alertController.create({
              header: 'Success',
              message: this.T_SVC['ALERT_TEXT.SLOT_REMOVED'],
              cssClass: 'alert-danger',
              buttons: ['Okay']
            });
            alert.present();
            this.loadVimsAppGetBookingSlot();
          }else{
            if(JSON.parse(val+"")[0].Status == "0"){
              message = this.T_SVC['ALERT_TEXT.SLOT_OCCUPIED'];
            }else if(JSON.parse(val+"")[0].Status == "2"){
              message = this.T_SVC['ALERT_TEXT.SESSION_EXPIRED'];
            }
            let alert = await this.alertController.create({
              header: 'Failed',
              message: message,
              cssClass: 'alert-danger',
              buttons: ['Okay']
            });
            alert.present();
          }

        }
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
            let alert = await this.alertController.create({
              header: 'Error !',
              message: message,
              cssClass: 'alert-danger',
              buttons: ['Okay']
            });
            alert.present();
        }
      }
    );
  }

  loadVimsAppGetBookingSlot(){
    var params = {
      "RefSchoolSeqId": "",
      "RefBranchSeqId": "",
      "FacilityCode": this.FacilityCode,
      "Recurring": "10",
      // "ToDate":"2019-03-15",
      // "BookToDate":"15/03/2019",
      // "FromDate":"2019-02-13",
      // "BookFromDate":"13/02/2019",
      "FromDate": this.START_DATE.split("T")[0],
      "ToDate": this.END_DATE.split("T")[0],
      "BookFromDate": this.BookFromDate,
      "BookToDate": this.BookToDate,
      "ParentPortalRegKey": AppSettings.API_DATABASE_NAME
     }
    this.apiProvider.VimsAppGetBookingSlot(params).then(
      (val) => {
        var result = JSON.parse(JSON.stringify(val));
        var slotsArray = [];
        var showWxpired = this.hostSettings ? this.hostSettings.ShowExpiredSlot : false;
        if(result){
          var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
          var cTime = new Date(cDate).getTime();

            if(showWxpired){
              for(var i = 0; i < result.length; i++){
                var slot = result[i];
                slot.position = i;
                var date = slot.StartTime.split("T")[0];
                var stime = slot.StartTime.split("T")[1];
                stime = stime.slice(0,stime.lastIndexOf(":"));
                var etime = slot.EndTime.split("T")[1];
                etime = etime.slice(0,etime.lastIndexOf(":"));
                slot.filterDate = date;
                var sSession = stime.split(":")[0] > 11 ? " ": "";
                var eSession = etime.split(":")[0] > 11 ? " ": "";
                slot.startDisplayTime = stime+sSession;
                slot.endDisplayTime = etime + eSession;
                if(slot.StaffID || slot.StaffID == null){
                  slot.selected = 2;  //booked
                }else{
                  var sDate =  this.dateformat.transform(slot.StartTime+"", "yyyy-MM-ddTHH:mm:ss");
                  if(new Date(sDate).getTime() < cTime){
                    slot.selected = 3; // expired
                  }else{
                    slot.selected = 0; // unselected
                  }
                }
                if(!this.selectedTap){
                  this.selectedTap = date;
                }
                slotsArray[slotsArray.length] = slot;
              }
            }else{
              for(var i1 = 0; i1 < result.length; i1++){
                slot = result[i1];
                slot.position = i1;
                date = slot.StartTime.split("T")[0];
                stime = slot.StartTime.split("T")[1];
                stime = stime.slice(0,stime.lastIndexOf(":"));
                etime = slot.EndTime.split("T")[1];
                etime = etime.slice(0,etime.lastIndexOf(":"));
                slot.filterDate = date;
                sSession = stime.split(":")[0] > 11 ? " ": "";
                eSession = etime.split(":")[0] > 11 ? " ": "";
                slot.startDisplayTime = stime+sSession;
                slot.endDisplayTime = etime + eSession;
                sDate =  this.dateformat.transform(slot.StartTime+"", "yyyy-MM-ddTHH:mm:ss");
                if(new Date(sDate).getTime() < cTime){
                  // slot.selected = 3; // expired

                }else if(slot.StaffID || slot.StaffID == null){
                  slot.selected = 2;  //booked
                  slotsArray[slotsArray.length] = slot;
                }else{
                  slot.selected = 0; // unselected
                  slotsArray[slotsArray.length] = slot;
                }
              }
            }
            this.FACILITYSLOTLIST = this.transform(slotsArray, "filterDate");
            if(this.FACILITYSLOTLIST){
              this.selectDate(0);
            }

        }
      },
      (err) => {
      }
    );
  }

  selectSlot(slot){
    if(this.availability){
      return;
    }
    if(slot.selected == 0){
      slot.selected = 1;
    }else if(slot.selected == 1){
      slot.selected = 0;
    }else if(slot.selected == 2){
      this.openSlotInfo(slot);
      return;
    }else{
      return;
    }
    this.showDone = false;
    for(var i = 0 ; i < this.FACILITYSLOTLIST.length; i++){
      for(var j = 0 ; j < this.FACILITYSLOTLIST[i].value.length ; j++){
        if(this.FACILITYSLOTLIST[i].value[j].selected == 1){
          this.showDone = true;
          break;
        }
      }
    }

  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  moveToNextStep(){
    var selectedSlots = [];
    for(var i = 0 ; i < this.FACILITYSLOTLIST.length; i++){
      for(var j = 0 ; j < this.FACILITYSLOTLIST[i].value.length ; j++){
        if(this.FACILITYSLOTLIST[i].value[j].selected == 1){
          selectedSlots[selectedSlots.length] = this.FACILITYSLOTLIST[i].value[j];
        }
      }
    }
    this.events.publishDataCompany({
      action: "facility:done",
      title: JSON.stringify(selectedSlots),
      message: ''
    });
    this.navCtrl.pop();

  }

  transform(collection: Array<any>, property: string): Array<any> {
    // prevents the application from breaking if the array of objects doesn't exist yet
    if(!collection) {
        return null;
    }

    const groupedCollection = collection.reduce((previous, current)=> {
        if(!previous[current[property]]) {
            previous[current[property]] = [current];
        } else {
            previous[current[property]].push(current);
        }

        return previous;
    }, {});


    var resultArray = Object.keys(groupedCollection).map(key => ({ key, value: groupedCollection[key] }));

    resultArray.sort((a, b) =>
    a.value[0].StartTime <= b.value[0].StartTime ? -1 : 1
    );
    // resultArray.reverse();


    // this will return an array of objects, each object containing a group of objects
    return resultArray;
}

  ngOnInit() {
  }

}
