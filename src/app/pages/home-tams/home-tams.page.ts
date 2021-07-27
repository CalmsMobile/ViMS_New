import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-home-tams',
  templateUrl: './home-tams.page.html',
  styleUrls: ['./home-tams.page.scss'],
})
export class HomeTAMSPage implements OnInit {
  hostObj: any = {

  };
  notificationCount = 0;
  constructor(public navCtrl: NavController,
    private events : EventsService,
    private router: Router,
    public menu: MenuController,
    private translate : TranslateService,
    private dateformat: DateFormatPipe,
    private statusBar: StatusBar,
    private alertCtrl: AlertController, public apiProvider: RestProvider) {
    events.observeDataCompany().subscribe((data1:any) => {
      if (data1.action === "NotificationReceived") {
        console.log("Notification Received: " + data1.title);
        this.showNotificationCount();
      }
    });
   }

  ngOnInit() {
    this.GetHostAppSettings();
    this.getSettingsForTams();
    this.menu.enable(true, "myLeftMenu");
    this.statusBar.backgroundColorByHexString(AppSettings.STATUS_BAR_COLOR);
    this.getMySchedules();
    this.getMyAttendanceWhitelistedLocations();
  }


  GetHostAppSettings() {
    const settings = localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    if (!settings) {
      var params = {
        "MAppId": AppSettings.LOGINTYPES.HOSTAPPT,
        "HostIc": ""
      }
      var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
        return;
      }
      params.HostIc = JSON.parse(hostData).HOSTIC;
      this.apiProvider.GetHostAppSettings(params, false).then(
        (val) => {
          try {
            var result = JSON.parse(JSON.stringify(val));
            if (result) {
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS, JSON.stringify(val));
              this.events.publishDataCompany({
                action: 'user:created',
                title: "ReloadMenu",
                message: "ReloadMenu"
              });
            }
          } catch (e) {

          }

        },
        (err) => {
        }
      );
    }

  }

  getSettingsForTams() {
    const settings = localStorage.getItem(AppSettings.LOCAL_STORAGE.TAMS_SETTINGS);
    if (!settings) {
      var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).HOSTIC) {
        return;
      }
      var hostId = JSON.parse(hostData).HOSTIC;
      var data = {
        "MAppId": "TAMS",
        "HostIc": hostId
      };
      this.apiProvider.requestApi(data, '/api/TAMS/getTAMSsettings', false, false, '').then(
        (val: any) => {
          const response = JSON.parse(val);
          if (response.Table && response.Table.length > 0 ) {
            if(response.Table[0].Code === 10 || response.Table[0].code === 10) {
              localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_SETTINGS, JSON.stringify(response.Table1[0]));
            }
          }
        },
        async (err) => {
          if(err && err.message == "No Internet"){
            return;
          }
        }
      );
    }

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
        }
      },
      async (err) => {
        if(err && err.message == "No Internet"){
          return;
        }
      }
    );
  }

  getMySchedules() {
    const data = {
    "MAppId": "TAMS",
    "HostIc": "",
    };
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (!hostData || !JSON.parse(hostData) || !JSON.parse(hostData).SEQID) {
      return;
    }
    data.HostIc = JSON.parse(hostData).HOSTIC;
    this.apiProvider.requestApi(data, '/api/TAMS/getMySchedule', false, false, '').then(
      (val: any) => {
        let myScheduleList = [];
        const response = JSON.parse(val);
        if (response.Table && response.Table.length > 0 && (response.Table[0].Code === 10 || response.Table[0].code === 10)) {
          myScheduleList = response.Table1
        }
        myScheduleList.forEach(element => {
          const currentDate = this.dateformat.transform(new Date() + "", "yyyy-MM-dd");
          if (new Date(currentDate) > new Date(element.scheduleDate)) {
            element.isAvailable = false;
          } else {
            element.isAvailable = true;
          }
          element.shiftName = element.shiftName.trim();
          element.fromTime1 = element.fromTime;
          element.toTime1 = element.toTime;
          if (element.fromTime) {
            if (element.fromTime.split(":")[0] > 11) {
              let hours: any = (element.fromTime.split(":")[0] % 12);
              if (element.fromTime.split(":")[0] === '12') {
                hours = 12;
              } else if (hours < 10) {
                hours = '0' + hours;
              }
              element.fromTime = hours + ':' + element.fromTime.split(":")[1] + 'pm ';
            } else {
              element.fromTime = element.fromTime + 'am';
            }
          }
          if (element.toTime) {
            if (element.toTime.split(":")[0] > 11) {
              let hours: any = (element.toTime.split(":")[0] % 12);
              if (element.toTime.split(":")[0] === '12') {
                hours = 12;
              } else if (hours < 10) {
                hours = '0' + hours;
              }
              element.toTime = hours + ':' + element.toTime.split(":")[1] + 'pm ';
            } else {
              element.toTime = element.toTime + 'am';
            }
          }
        });
        localStorage.setItem(AppSettings.LOCAL_STORAGE.TAMS_SCHEDULE, JSON.stringify(myScheduleList));
      },
      async (err) => {
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
      }
    );
  }

  showNotificationCount(){
    var count = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFICATION_COUNT);
    if(count){
      this.notificationCount = parseInt(count);
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter UpcomingAppointmentPage');
    this.events.publishDataCompany({
      action: "page",
      title:   "home-view",
      message: ''
    });
    this.showNotificationCount();
    this.resetData();
  }

  resetData() {
    const hostData = localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    const cmpnyData = localStorage.getItem(AppSettings.LOCAL_STORAGE.COMPANY_DETAILS);
    if (hostData) {
      var tempImage = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/ImageHandler.ashx?RefSlno='
      + JSON.parse(hostData).SEQID + "&RefType=HP&Refresh=" + new Date().getTime();
      this.hostObj.hostImage = tempImage;
      this.hostObj.HOSTNAME = JSON.parse(hostData).HOSTNAME;
      this.hostObj.HOST_EMAIL = JSON.parse(hostData).HOST_EMAIL;
      this.hostObj.comp_name = JSON.parse(cmpnyData).comp_name;;
    }

  }

  gotoAdminPage(){
    this.router.navigateByUrl('admin-home');
  }

  gotoNotification(){
    this.router.navigateByUrl('notifications');
  }

  statesClicked(page) {
    console.log(page);
    this.router.navigateByUrl(page);
  }

}
