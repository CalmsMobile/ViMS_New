import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { WheelSelector } from '@ionic-native/wheel-selector/ngx';
import { NavController, Platform, ToastController, ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CustomVisitorPopupComponent } from 'src/app/components/custom-visitor-popup/custom-visitor-popup';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import * as CryptoJS from 'crypto-js';
import { CommonUtil } from 'src/app/services/util/CommonUtil';
import { QuestionDocPopupComponent } from 'src/app/components/question-doc-popup/question-doc-popup.component';
@Component({
  selector: 'app-appointment-details',
  templateUrl: './appointment-details.page.html',
  styleUrls: ['./appointment-details.page.scss'],
})
export class AppointmentDetailsPage implements OnInit {

  fromPage = '';
  appointment : any;
  facilityBooking : any ;
  notifyTime  = 0;
  notifyMin  = 0;
  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=',
    "hostlogo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'Handler/PortalImageHandler.ashx?RefSlno=',
    "coverImage":"assets/images/profile_bg.jpg"
  };
  myDate:any;

  isPastAppointment = false;
  Editable  = true;
  dummyJson = {
    days: [
      {description: 'Before 00 Hour', value:0},
      {description: 'Before 01 Hour', value:1},
      {description: 'Before 02 Hour', value:2},
      {description: 'Before 03 Hour', value:3},
      {description: 'Before 04 Hour', value:4},
      {description: 'Before 05 Hour', value:5},
      {description: 'Before 06 Hour', value:6},
      {description: 'Before 07 Hour', value:7},
      {description: 'Before 08 Hour', value:8},
      {description: 'Before 09 Hour', value:9},
      {description: 'Before 10 Hour', value:10},
      {description: 'Before 11 Hour', value:11},
      {description: 'Before 12 Hour', value:12},
      {description: 'Before 13 Hour', value:13},
      {description: 'Before 14 Hour', value:14},
      {description: 'Before 15 Hour', value:15},
      {description: 'Before 16 Hour', value:16},
      {description: 'Before 17 Hour', value:17},
      {description: 'Before 18 Hour', value:18},
      {description: 'Before 19 Hour', value:19},
      {description: 'Before 20 Hour', value:20},
      {description: 'Before 21 Hour', value:21},
      {description: 'Before 22 Hour', value:22},
      {description: 'Before 23 Hour', value:23},
      {description: 'Before 1 Day 00 Hour', value:24},
      {description: 'Before 1 Day 01 Hour', value:25},
      {description: 'Before 1 Day 02 Hour', value:26},
      {description: 'Before 1 Day 03 Hour', value:27},
      {description: 'Before 1 Day 04 Hour', value:28},
      {description: 'Before 1 Day 05 Hour', value:29},
      {description: 'Before 1 Day 06 Hour', value:30},
      {description: 'Before 1 Day 07 Hour', value:31},
      {description: 'Before 1 Day 08 Hour', value:32},
      {description: 'Before 1 Day 09 Hour', value:33},
      {description: 'Before 1 Day 10 Hour', value:34},
      {description: 'Before 1 Day 11 Hour', value:35},
      {description: 'Before 1 Day 12 Hour', value:36},
      {description: 'Before 1 Day 13 Hour', value:37},
      {description: 'Before 1 Day 14 Hour', value:38},
      {description: 'Before 1 Day 15 Hour', value:39},
      {description: 'Before 1 Day 16 Hour', value:40},
      {description: 'Before 1 Day 17 Hour', value:41},
      {description: 'Before 1 Day 18 Hour', value:42},
      {description: 'Before 1 Day 19 Hour', value:43},
      {description: 'Before 1 Day 20 Hour', value:44},
      {description: 'Before 1 Day 21 Hour', value:45},
      {description: 'Before 1 Day 22 Hour', value:46},
      {description: 'Before 1 Day 23 Hour', value:47}
    ],
    people: [
      {description: '00 Min', value:0},
      {description: '01 Min', value:1},
      {description: '02 Min', value:2},
      {description: '03 Min', value:3},
      {description: '04 Min', value:4},
      {description: '05 Min', value:5},
      {description: '06 Min', value:6},
      {description: '07 Min', value:7},
      {description: '08 Min', value:8},
      {description: '09 Min', value:9},
      {description: '10 Min', value:10},
      {description: '11 Min', value:11},
      {description: '12 Min', value:12},
      {description: '13 Min', value:13},
      {description: '14 Min', value:14},
      {description: '15 Min', value:15},
      {description: '16 Min', value:16},
      {description: '17 Min', value:17},
      {description: '18 Min', value:18},
      {description: '19 Min', value:19},
      {description: '20 Min', value:20},
      {description: '21 Min', value:21},
      {description: '22 Min', value:22},
      {description: '23 Min', value:23},
      {description: '24 Min', value:24},
      {description: '25 Min', value:25},
      {description: '26 Min', value:26},
      {description: '27 Min', value:27},
      {description: '28 Min', value:28},
      {description: '29 Min', value:29},
      {description: '30 Min', value:30},
      {description: '31 Min', value:31},
      {description: '32 Min', value:32},
      {description: '33 Min', value:33},
      {description: '34 Min', value:34},
      {description: '35 Min', value:35},
      {description: '36 Min', value:36},
      {description: '37 Min', value:37},
      {description: '38 Min', value:38},
      {description: '39 Min', value:39},
      {description: '40 Min', value:40},
      {description: '41 Min', value:41},
      {description: '42 Min', value:42},
      {description: '43 Min', value:43},
      {description: '44 Min', value:44},
      {description: '45 Min', value:45},
      {description: '46 Min', value:46},
      {description: '47 Min', value:47},
      {description: '48 Min', value:48},
      {description: '49 Min', value:49},
      {description: '50 Min', value:50},
      {description: '51 Min', value:51},
      {description: '52 Min', value:52},
      {description: '53 Min', value:53},
      {description: '54 Min', value:54},
      {description: '55 Min', value:55},
      {description: '56 Min', value:56},
      {description: '57 Min', value:57},
      {description: '58 Min', value:58},
      {description: '59 Min', value:59},
      {description: '60 Min', value:60},
    ]
  };
  T_SVC:any;
  hostSettings = {
    ShowExpiredSlot : true,
    AllowHostsToEndSession : true
  }
  showQuestion = false;
  showDocument = false;
  showDelaration = false;
  FACILITYSLOTLIST = [];
  appointmentSettingsDetails: any;
  imageURLType = '&RefType=VPB&Refresh='+ new Date().getTime();
  imageURLTypeHOST = '&ScreenType=30&Refresh='+ new Date().getTime();
  constructor(public navCtrl: NavController,
    public apiProvider: RestProvider,
    private plt: Platform,
    private events : EventsService,
    private toastCtrl: ToastController,
    private router: Router,
    private route: ActivatedRoute,
    public modalCtrl: ModalController,
    private selector: WheelSelector,
    private androidPermissions: AndroidPermissions,
    private transfer: FileTransfer,
    private file: File,
    commonUtil: CommonUtil,
    private dateformat : DateFormatPipe,
    private socialSharing: SocialSharing,
    private translate : TranslateService,
    private localNotifications: LocalNotifications, private alertCtrl: AlertController) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'ALERT_TEXT.APPOINTMENT_EXPIRED',
      'ALERT_TEXT.NOTIFICATION_SET_SUCCESS1',
      'ALERT_TEXT.NOTIFICATION_SET_SUCCESS2',
      'ALERT_TEXT.REMINDER_SUCCESS',
      'ALERT_TEXT.APPOINTMENT_DELETE_SUCCESS',
      'ALERT_TEXT.SESSION_ENDED',
      'ALERT_TEXT.SESSION_EXPIRED',
      'ALERT_TEXT.SEND_REMINDER',
      'ALERT_TEXT.SLOT_REMOVED',
      'ALERT_TEXT.SLOT_OCCUPIED',
      'ALERT_TEXT.BOOKING_EXPIRED_TO_EDIT',
      'ALERT_TEXT.BOOKING_EXPIRED_TO_DELETE',
      'ALERT_TEXT.WISH_TO_CANCEL_SLOT',
      'ALERT_TEXT.WISH_TO_END_BOOK',
      'ALERT_TEXT.ENTER_SLOT_PIN',
      'ALERT_TEXT.DELETE_APPOINTMENT',
      'ALERT_TEXT.QRSHARE_SUCCESS']).subscribe(t => {
        this.T_SVC = t;
    });
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        this.appointment = passData.appointment;
        this.fromPage = passData.fromPage;
        if (this.appointment && this.appointment[0] && this.appointment[0].REASON) {
          this.appointment[0].REASON_DESC = commonUtil.getPurposeName(this.appointment[0].REASON, false);
        }
        if (this.appointment && this.appointment[0] && this.appointment[0].Room) {
          this.appointment[0].Room_Name = commonUtil.getRoomName(this.appointment[0].Room, false);
        }

        if(this.appointment && this.appointment[0] && !this.appointment[0].isFacilityAlone){
          var fTime = new Date(this.appointment[0].START_DATE).getTime();
          var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
          var eTime = new Date(this.appointment[0].END_DATE).getTime();
          var cTime = new Date(cDate).getTime();
          if(fTime < cTime && eTime < cTime){
            this.isPastAppointment = true;
          }

          this.getRefVisitorCateg(this.appointment[0].VisitorCategory);
        }


    // this.plt.ready().then((readySource) => {
      // this.localNotifications.on('click', (notification, state) => {
      //   let json = JSON.parse(notification.data);
      //   this.appointment = json.mydata;
      //   let alert = alertCtrl.create({
      //     header: notification.title,
      //     message: json.mydata
      //   });
      //   alert.present();
      // })
    // });

    var qrInfo = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    var settings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    if(settings && JSON.parse(settings)){
      try{
        if(qrInfo && JSON.parse(qrInfo) && JSON.parse(qrInfo).MAppId){
          var QRObj = JSON.parse(qrInfo);
          if(QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.FACILITY) > -1){
            if(JSON.parse(settings).Table3 && JSON.parse(settings).Table3.length > 0){
              this.hostSettings = JSON.parse(settings).Table3[0];
            } else if(JSON.parse(settings).Table2 && JSON.parse(settings).Table2.length > 0){
              this.hostSettings = JSON.parse(settings).Table2[0];
            } else if(JSON.parse(settings).Table1 && JSON.parse(settings).Table1.length > 0){
              this.hostSettings = JSON.parse(settings).Table1[0];
            }
          }else{
            this.hostSettings = JSON.parse(settings).Table1[0];
          }
        }
        }catch(e){

      }
    }



    console.log(this.appointment);
      }
    });

  }

  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }

  getQREncryptedValue(appointment){
    var title  = '';
    if(this.facilityBooking && this.facilityBooking.length > 0){
      title = this.facilityBooking[0].BookingID;
      if(!appointment.HexCode){
        appointment.HexCode = this.facilityBooking[0].BookingID;
      }
    }else{
      title = this.appointment[0].appointment_group_id;
    }
    if(!appointment.HexCode){
      appointment.HexCode = "";
    }
    // var qrJsonString1 = "{\"aptid\":\""+appointment.VisitorBookingSeqId+ "\",\"aptgid\":\"" + title + "\",\"cid\":\"" + appointment.cid + "\"}";
    var qrJsonString1 = appointment.HexCode;
    var key = CryptoJS.enc.Utf8.parse('qweqweqweqweqweq');
    var iv = CryptoJS.enc.Utf8.parse('qweqweqweqweqweq');

    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(qrJsonString1), key,
    {
        keySize: 128,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    var qrCodeString = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=' + qrJsonString1 + '&RefType=QR&Refresh='+ new Date().getTime();
    console.log("New encrypt: "+ encrypted);
    return qrJsonString1;
  }

  shareQR(appointment){


    var title  = '';
    if(this.facilityBooking && this.facilityBooking.length > 0){
      title = this.facilityBooking[0].BookingID;
      if(!appointment.HexCode){
        appointment.HexCode = this.facilityBooking[0].BookingID;
      }
    }else{
      title = this.appointment[0].appointment_group_id;
    }
    if(!appointment.HexCode){
      appointment.HexCode = "";
    }
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    var hostName = "";
    if(hostData){
      hostName = JSON.parse(hostData).HOSTNAME;
    }
    var qrJsonString1 = appointment.HexCode;
    var qrCodeString = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=' + qrJsonString1 + '&RefType=QR&Refresh='+ new Date().getTime();
    const fileTransfer: FileTransferObject = this.transfer.create();
    // const fileURI = this.file.dataDirectory + encrypted + '.jpg';
    const url = qrCodeString;
    // var filename = url.split("/").pop();
    var path = this.file.externalRootDirectory;
    if(!path){
      path = (this.file.externalDataDirectory || this.file.dataDirectory);
    }
    var targetPath = path + '/Pictures/' + "shareQRCode.jpg";

    console.log("url: "+ url);

    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
      result =>{
        console.log('Has permission?',result.hasPermission)
        if(result.hasPermission){
          this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
            async result =>{
              this.apiProvider.presentLoading();

              console.log('Has permission?',result.hasPermission);
              fileTransfer.download(url, targetPath).then(async (entry) => {
                this.apiProvider.dismissLoading();
                console.log('download complete: ' + entry.toURL());
                var data = "Hi, I have shared the QR code for our appointment. Please use the QR code for your registration when you visit me."+
                "\n"+" Thanks,"+"\n"+"["+hostName+"]";
                this.socialSharing.share(data, 'Your appointment QR code', targetPath , "").then(async () => {
                }).catch(async (error) => {
                  // Error!
                  this.apiProvider.dismissLoading();
                  console.log(""+error);
                  this.apiProvider.showToast('Error');
                });
              }, async (error) => {
                // handle error
                this.apiProvider.dismissLoading();
                this.apiProvider.showToast('Download Error');
                console.log("Download Error: "+ error);
              });
            } ,
            err => {
              this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE);
            }
          );
        }else{
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
        }
      } ,
      err => {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE);
      }
    );

  }

  async openVisitorDetails(visitor) {
    console.log("VISITOR DETAILS");
    console.log(visitor)
    var title  = '';
    if(this.facilityBooking && this.facilityBooking.length > 0){
      title = this.facilityBooking[0].BookingID;
    }else{
      title = this.appointment[0].appointment_group_id;
    }
    const presentModel = await this.modalCtrl.create({
      component: CustomVisitorPopupComponent,
      componentProps: {
        data: {
          visitor: visitor,
          aptid: this.appointment[0].VisitorBookingSeqId,
          aptgid : title,
          cid: this.appointment[0].cid,
          HexCode: visitor.HexCode,
          appointmentSettingsDetails: this.appointmentSettingsDetails
        }
      },
      showBackdrop: true,
      mode: 'ios',
      cssClass: 'visitorPopupModal'
    });
    presentModel.onWillDismiss().then((data) => {
    });
    return await presentModel.present();

  }

  ionViewDidEnter() {
    this.events.publishDataCompany({
      action: "page",
      title: "AppointmentDetailsPage",
      message: ''
    });
    console.log('ionViewDidEnter AppointmentDetailsPage');
    this.VimsAppGetFacilityBookingDetails();
  }


  async selectNotifyAppointment() {

    if(this.isPastAppointment){
      let alert1 = this.alertCtrl.create({
        header: 'Appointment Reminder',
        cssClass:'',
        message: this.T_SVC['ALERT_TEXT.APPOINTMENT_EXPIRED'],
        buttons: ['OK']
      });
      (await alert1).present();
      return;
    }

    var date = '', time = '', title  = '';
    if(this.facilityBooking && this.facilityBooking.length > 0){
      date = this.facilityBooking[0].StartDateTime.split("T")[0];
      time = this.facilityBooking[0].StartDateTime.split("T")[1]
      title = this.facilityBooking[0].BookingID;
    }else{
      date = this.appointment[0].START_DATE.split("T")[0];
      time = this.appointment[0].START_DATE.split("T")[1]
      title = this.appointment[0].appointment_group_id;
    }
    var sday = this.dummyJson.days[1].description;
    if(this.notifyTime > 23){
      var hours = this.notifyTime - 24;
      var shours = "0" + shours;
      if(hours >= 10){
        shours = shours
      }
      sday = "Before 1 Day "+shours+" Hour";
    }else{
      shours = "0" + this.notifyTime;
      if(this.notifyTime >= 10){
        shours = this.notifyTime
      }
      sday = "Before "+shours+" Hour";
    }


     var smin = "0" + this.notifyMin;
      if(this.notifyMin >= 10){
        smin = ""+this.notifyTime
      }
      sday = smin+" Min";
    // for(var i = 0 ; i < this.dummyJson.days.length ; i++){
    //     if(this.dummyJson.days[i].description == sday){

    //     }
    // }


    this.selector.show({
      title: 'Notify Me',
      items: [
        this.dummyJson.days,
        this.dummyJson.people
      ],
      positiveButtonText: 'Ok',
      negativeButtonText: 'Cancel',
      defaultItems: [
        { index: 0, value: sday},
        { index: 1, value: smin}
      ]
    }).then(
      async result => {
        // let msg = `Selected ${result[0].description} with ${result[1].description}`;
        // let toast = this.toastCtrl.create({
        //   message: msg,
        //   duration: 4000
        // });
        // toast.present();
        if(result[0].description.includes('Day')){
          console.log(result[0].description.split("Before 1 Day ")[1].split(" Hour")[0]);
          this.notifyTime = 24 + parseInt(result[0].description.split("Before 1 Day ")[1].split(" Hour")[0]);
        }else{
          console.log(result[0].description.split("Before ")[1].split(" Hour")[0]);
          this.notifyTime = result[0].description.split("Before ")[1].split(" Hour")[0];
        }

        //alert(""+ result[0].description.split("Before ")[1].split(" Hour")[0]);
        var toMin = result[1].description.split(" Min")[0];
        this.notifyMin = toMin;
        var notifyTime = {
          "notifyTime": this.notifyTime,
          "notifyMin": this.notifyMin
        }
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.NOTIFY_TIME + "_" + title, JSON.stringify(notifyTime));
        //alert(this.notifyTime + ":"+ toMin);
        // let dateObject = new Date(date + " "+ time);
        var dateObject1 = "";
        if (this.plt.is('ios')) {
          dateObject1 = this.dateformat.transform(date + "T" + time, "yyyy-MM-ddTHH:mm:ss").concat('.000+08:00');
        }else{
          dateObject1 = this.dateformat.transform(date + "T"+ time, "yyyy-MM-dd HH:mm:ss");
        }
        let dateObject = new Date(dateObject1);
        var noti = new Date(dateObject.getTime() - ((this.notifyTime* 60 * 60 * 1000) + (toMin * 60 * 1000)));

        var schedule = {

        };
        if(this.facilityBooking && this.facilityBooking.length > 0){
          var cDate = this.dateformat.transform(this.facilityBooking[0].StartDateTime+"", "yyyy-MM-ddTHH:mm:ss");
          var cTime = new Date(cDate).getTime();
          this.localNotifications.cancel(cTime);
          schedule = {
            id: cTime,
            title: "ViMS",
            text: 'Reminder: You have 1 upcoming appointment on ' + this.dateformat.transform(noti+"", "dd MMMM yyyy hh:mm a"),
            trigger: {at: noti},
            led: 'FF0000',
            sound: null,
         }
        }else{
          this.localNotifications.cancel(title);
          schedule =  {
            id:this.appointment[0].appointment_group_id,
            title: "ViMS",
            text: 'Reminder: You have 1 upcoming appointment on ' + this.dateformat.transform(noti+"", "dd MMMM yyyy hh:mm a"),
            trigger: {at: noti},
            led: 'FF0000',
            sound: null,
         }
        }
        this.localNotifications.schedule(schedule);
        let alert1 = this.alertCtrl.create({
          header: 'Appointment Reminder',
          cssClass:'',
          message: this.T_SVC['ALERT_TEXT.NOTIFICATION_SET_SUCCESS1']+ this.dateformat.transform(noti+"", "dd MMMM yyyy hh:mm a"),
          buttons: ['OK']
        });
        (await alert1).present();
      },
      err =>{
        console.log('Error: ', err)
      }
      );
  }


  async remindAppintment(fab: any){
    fab.close();
    let alert = this.alertCtrl.create({
      header: 'Appointment Reminder',
      cssClass:'',
      message: this.T_SVC['ALERT_TEXT.SEND_REMINDER'],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Send',
          handler: () => {
            console.log('Reminder clicked');
            var params = {
              "STAFF_IC":this.appointment[0].STAFF_IC,
              "appointment_group_id":this.appointment[0].appointment_group_id
            }
            this.apiProvider.RemindAppointment(params).then(
              async (val) => {
                var result = JSON.parse(JSON.stringify(val));
                if(result){
                  this.localNotifications.cancel(this.appointment[0].appointment_group_id);
                  let toast = this.toastCtrl.create({
                    message: this.T_SVC['ALERT_TEXT.REMINDER_SUCCESS'],
                    duration: 3000,
                    color: 'primary',
                    position: 'bottom'
                  });
                  (await toast).present();
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
                if(!message){
                  try {
                    const errRes = JSON.parse(err);
                    if (errRes && errRes.Table1 && errRes.Table1.length > 0){
                      message = errRes.Table1[0].Description
                    }
                  } catch (error) {

                  }
                }
                if(message){
                  // message = " Unknown"
                  let alert = this.alertCtrl.create({
                    header: 'Error !',
                    message: message,
                    cssClass:'',
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

  async editAppintment(fab: any){
    fab.close();

    var allowEdit = false;
    if(this.facilityBooking && this.facilityBooking.length >0){
      for(var i = 0 ; i < this.facilityBooking.length ; i++){
        var facility = this.facilityBooking[i];
        var fDate = this.dateformat.transform(facility.StartDateTime+"", "yyyy-MM-ddTHH:mm:ss");
        var fTime = new Date(fDate).getTime();
        var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
        var cTime = new Date(cDate).getTime();
        if(fTime > cTime){
          allowEdit = true;
          break;
        }
      }
    }else{
      allowEdit = true;
    }

    if(allowEdit){

      if(this.appointment && this.appointment[0] && this.appointment[0].isFacilityAlone){
        const navigationExtras: NavigationExtras = {
          state: {
            passData: {
              appointment: this.appointment,
              facility: this.facilityBooking,
              edit: true
            }
          }
        };
        this.router.navigate(['facility-booking'], navigationExtras);
      }else{
        const navigationExtras: NavigationExtras = {
          state: {
            passData: {
              appointment: this.appointment,
              facility: this.facilityBooking,
              edit: true
            }
          }
        };
        this.router.navigate(['add-appointment'], navigationExtras);
      }
    }else{
      let alert = this.alertCtrl.create({
        header: 'Error !',
        message:this.T_SVC['ALERT_TEXT.BOOKING_EXPIRED_TO_EDIT'],
        cssClass:'',
        buttons: ['Okay']
        });
        (await alert).present();
        return;
    }

  }

  async deleteAppintment(fab: any, message){
    var css = "alert-warning-largemsg";
    if(fab){
      css = "";
      message = this.T_SVC['ALERT_TEXT.DELETE_APPOINTMENT'];
      fab.close();
    }

    var allowDelete = false;
    if(this.facilityBooking && this.facilityBooking.length >0){
      for(var i = 0 ; i < this.facilityBooking.length ; i++){
        var facility = this.facilityBooking[i];
        var fDate = this.dateformat.transform(facility.StartDateTime+"", "yyyy-MM-ddTHH:mm:ss");
        var fTime = new Date(fDate).getTime();
        var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
        var cTime = new Date(cDate).getTime();
        if(fTime > cTime){
          allowDelete = true;
          break;
        }
      }
    }else{
      allowDelete = true;
    }

    if(!allowDelete){
      let alert = this.alertCtrl.create({
        header: 'Error !',
        message: this.T_SVC['ALERT_TEXT.BOOKING_EXPIRED_TO_DELETE'],
        cssClass: '',
        buttons: ['Okay']
        });
        (await alert).present();
        return;
    }

    let alert = this.alertCtrl.create({
      header: 'Delete Appointment',
      cssClass:css,
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            console.log('Delete clicked');
            var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
            var hostId = '';
            if(hostData){
              hostId = JSON.parse(hostData).HOSTIC? JSON.parse(hostData).HOSTIC:JSON.parse(hostData).HOST_ID;
            }
            var bookingID= this.appointment[0].FacilityBookingID;
            if(!bookingID || bookingID === '0'){
              bookingID = "";
            }
            var params = {}
            if(this.appointment[0].isFacilityAlone){
              params = {
                "RefSchoolSeqId": "",
                "RefBranchSeqId": "",
                "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
                "BookingID": bookingID,
                "UpdatedBy":hostId
              }
              this.apiProvider.VimsAppDeleteFBFacilityBooking(params).then(
                async (val) => {
                  this.events.publishDataCompany({
                    action: "delete",
                    title: "AppointmentDetailsPage",
                    message: ''
                  });
                  var result = JSON.parse(JSON.stringify(val));
                  if(result){
                    var title  = '';
                    if(this.facilityBooking && this.facilityBooking.length > 0){
                      title = this.facilityBooking[0].BookingID;
                    }else{
                      title = this.appointment[0].appointment_group_id;
                    }
                    window.localStorage.removeItem(AppSettings.LOCAL_STORAGE.NOTIFY_TIME + "_" + title);
                    this.localNotifications.cancel(title);
                    let toast = this.toastCtrl.create({
                      message: this.T_SVC['ALERT_TEXT.APPOINTMENT_DELETE_SUCCESS'],
                      duration: 3000,
                    color: 'primary',
                      position: 'bottom'
                    });
                    (await toast).present();
                    this.navCtrl.pop();
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
                    let alert = this.alertCtrl.create({
                      header: 'Error !',
                      message: message,
                      cssClass:'',
                      buttons: ['Okay']
                      });
                      (await alert).present();
                  }
                }
              );
            }else{
              params = {
                "hostID":hostId,
                "STAFF_IC":this.appointment[0].STAFF_IC,
                "appointment_group_id":this.appointment[0].appointment_group_id,
                "FacilityBooking": {
                  "RefSchoolSeqId": "",
                  "RefBranchSeqId": "",
                  "ParentPortalRegKey": AppSettings.API_DATABASE_NAME,
                  "BookingID": bookingID,
                  "UpdatedBy":hostId
                }
              }
              this.apiProvider.RemoveAppointment(params).then(
                async (val) => {
                  var result = JSON.parse(JSON.stringify(val));
                  if(result){
                    this.events.publishDataCompany({
                      action: "delete",
                      title: "AppointmentDetailsPage",
                      message: ''
                    });
                    var title  = '';
                    if(this.facilityBooking && this.facilityBooking.length > 0){
                      title = this.facilityBooking[0].BookingID;
                    }else{
                      title = this.appointment[0].appointment_group_id;
                    }
                    window.localStorage.removeItem(AppSettings.LOCAL_STORAGE.NOTIFY_TIME + "_" + title);
                    this.localNotifications.cancel(title);
                    let toast = this.toastCtrl.create({
                      message: this.T_SVC['ALERT_TEXT.APPOINTMENT_DELETE_SUCCESS'],
                      duration: 3000,
                    color: 'primary',
                      position: 'bottom'
                    });
                    (await toast).present();
                    this.navCtrl.pop();
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
                    let alert = this.alertCtrl.create({
                      header: 'Error !',
                      message: message,
                      cssClass:'',
                      buttons: ['Okay']
                      });
                      (await alert).present();
                  }
                }
              );
            }

          }
        }
      ]
    });
    (await alert).present();
  }

  setSound() {
    if (this.plt.is('android')) {
      return 'file://assets/sounds/Rooster.mp3'
    } else {
      return 'file://assets/sounds/Rooster.caf'
    }
  }

  setNotifyTime(){
    var title  = '';
    if(this.facilityBooking && this.facilityBooking.length > 0){
      title = this.facilityBooking[0].BookingID;
    }else{
      title = this.appointment[0].appointment_group_id;
    }
    var savedNotyTime = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.NOTIFY_TIME + "_" + title);
    if(savedNotyTime && JSON.parse(savedNotyTime)){
      var sObj = JSON.parse(savedNotyTime);
      this.notifyTime = sObj.notifyTime;
      this.notifyMin = sObj.notifyMin;
    }
  }

  VimsAppGetFacilityBookingDetails(){
    if(!this.appointment[0].FacilityBookingID || this.appointment[0].FacilityBookingID === '0'){
      this.setNotifyTime();
      return;
    }
    var params = {
        "BookingID":this.appointment[0].FacilityBookingID,
        "ParentPortalRegKey": AppSettings.API_DATABASE_NAME
    };
		// this.VM.host_search_id = "adam";
		this.apiProvider.VimsAppGetFacilityBookingDetails(params).then(
			(val) => {
        var result = JSON.parse(val.toString());
        var facilityBooking = result.Table1;
        var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
        var hostIc = '';
        if(hostData){
          hostIc = JSON.parse(hostData).HOSTIC;
        }
        if(facilityBooking && facilityBooking.length >0){

          this.Editable = (facilityBooking[0].BookedBy == hostIc);
          this.isPastAppointment = true;;
          for(var i1 = 0 ; i1 < facilityBooking.length ; i1++){
            var facility = facilityBooking[i1];
            var fDate = this.dateformat.transform(facility.StartDateTime+"", "yyyy-MM-ddTHH:mm:ss");
            var fTime = new Date(fDate).getTime();
            var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
            var cTime = new Date(cDate).getTime();
            if(fTime > cTime){
              this.isPastAppointment = false;
              break;
            }
          }
        }

        if(facilityBooking && facilityBooking.length > 0){
          var data  = [];
          if(result.Table2){
            var hostId = "";
            if(hostData){
              hostId = JSON.parse(hostData).HOSTIC?JSON.parse(hostData).HOSTIC:JSON.parse(hostData).HOST_ID;
            }
            for(var i = 0 ; i< result.Table2.length ; i++){
              if(result.Table2[i].MemberID == hostId){
                result.Table2[i].Name = "You";
                result.Table2[i].SEQID = JSON.parse(hostData).SEQID;
              }else if(result.Table2[i].MemberID && result.Table2[i].Name){
                data[data.length] = result.Table2[i];
              }
            }
          }
          facilityBooking[0].visitors = data;
          this.facilityBooking = facilityBooking;
          this.loadVimsAppGetBookingSlot();
        }
        this.setNotifyTime();

       },
			(err) => {

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
          this.apiProvider.showAlert(message);
        }
			}
		);
  }

  loadVimsAppGetBookingSlot(){
    if(this.facilityBooking && this.facilityBooking.length > 0){
      var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
            var cTime = new Date(cDate).getTime();
            var FACILITYSLOTLIST = [];
            for(var i = 0; i < this.facilityBooking.length;){
              var slot = this.facilityBooking[i];
              slot.position = i;
              var sDTime = slot.EndDateTime;
              var date = slot.StartDateTime.split("T")[0];
              var stime = slot.StartDateTime.split("T")[1];
              stime = stime.slice(0,stime.lastIndexOf(":"));
              slot.filterDate = date;
              i = i+1;


                  slot.selected = 1;  //booked
                  for(var j = slot.position+1 ; j < this.facilityBooking.length; ){
                    var data = this.facilityBooking[j];

                    if(sDTime == data.StartDateTime){
                      j = j+1;
                      sDTime = data.EndDateTime;
                      i = j;
                    }else{
                      i = j;
                      break;
                    }
                  }

              slot.EndDateTime = sDTime;
              var etime = sDTime.split("T")[1];
              etime = etime.slice(0,etime.lastIndexOf(":"));
              var sSession = stime.split(":")[0] > 11 ? " ": "";
              var eSession = etime.split(":")[0] > 11 ? " ": "";
              slot.startDisplayTime = stime+sSession;
              slot.endDisplayTime = etime + eSession;
              var sDate =  this.dateformat.transform(slot.StartDateTime+"", "yyyy-MM-ddTHH:mm:ss");
              var eDate =  this.dateformat.transform(slot.EndDateTime+"", "yyyy-MM-ddTHH:mm:ss");
              if(slot.SessionEnd){
                slot.selected = 4; // SessionEnd
              }else if(new Date(sDate).getTime() < cTime && new Date(eDate).getTime() < cTime){
                slot.selected = 3; // expired
              }

              FACILITYSLOTLIST[FACILITYSLOTLIST.length] = slot;
              }
              this.FACILITYSLOTLIST = this.transform(FACILITYSLOTLIST, "filterDate");
          }
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
    a.value[0].startDisplayTime <= b.value[0].startDisplayTime ? -1 : 1
    );
    // resultArray.reverse();


    // this will return an array of objects, each object containing a group of objects
    return resultArray;
}

  async openSlotInfo(slot, key){

  if(!this.Editable && !this.hostSettings.AllowHostsToEndSession || slot.SessionEnd){
    return;
  }

  var cDate = this.dateformat.transform(new Date()+"", "yyyy-MM-ddTHH:mm:ss");
  var cTime = new Date(cDate).getTime();
  var sDate =  this.dateformat.transform(slot.StartDateTime+"", "yyyy-MM-ddTHH:mm:ss");
  var eDate =  this.dateformat.transform(slot.EndDateTime+"", "yyyy-MM-ddTHH:mm:ss");
    if(this.Editable && new Date(sDate).getTime() > cTime){

      if(this.FACILITYSLOTLIST && this.FACILITYSLOTLIST.length == 1 && this.FACILITYSLOTLIST[0].value.length == 1){
        this.deleteAppintment(null, "If you cancel this last booked slot, whole appointment will be deleted. Do you wish to proceed?");
        return;
      }

      var endDate = slot.EndDateTime;
      var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
      var StaffSeqId = JSON.parse(hostData).HOSTIC;
      var startDate = slot.StartDateTime;

      let loginConfirm = this.alertCtrl.create({
        header:"Cancel Slot",
        message: this.T_SVC['ALERT_TEXT.WISH_TO_CANCEL_SLOT'],
        cssClass:'',
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
      (await loginConfirm).present();
    }else if((new Date(sDate).getTime() <= cTime) && (new Date(eDate).getTime() >= cTime)){

      if(this.Editable){
        let loginConfirm = this.alertCtrl.create({
          header:'End Booking',
          message: this.T_SVC['ALERT_TEXT.WISH_TO_END_BOOK'],
          cssClass:'',
          buttons: [
            {
              text: "Cancel",
              role: 'cancel',
              handler: () => {
              }
            },
            {
              text: "End",
              handler: () => {
                var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
                var StaffSeqId = JSON.parse(hostData).HOSTIC;
                this.FBBookingEndSession(slot, slot.PinNumber, StaffSeqId);
              }
            }
          ]
        });
        (await loginConfirm).present();
      }else{
        const prompt = this.alertCtrl.create({
          header: this.T_SVC['ALERT_TEXT.WISH_TO_END_BOOK'],
          cssClass:'',
          // message: this.T_SVC['ALERT_TEXT.WISH_TO_END_BOOK'],
          inputs: [
            {
              name: 'pinnumber',
              placeholder: 'Code',
              type: 'number'
            },
          ],
          buttons: [
            {
              text: 'Cancel',
              handler: data => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'End',
              handler: async data => {
                console.log('Saved clicked');
                if(data.pinnumber == slot.PinNumber){
                  var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
                  var StaffSeqId = JSON.parse(hostData).HOSTIC;
                  this.FBBookingEndSession(slot, slot.PinNumber, StaffSeqId);
                }else{
                  let toast = this.toastCtrl.create({
                    message: this.T_SVC['ALERT_TEXT.ENTER_SLOT_PIN'],
                    duration: 3000,
                    color: 'primary',
                    position: 'bottom'
                  });
                  (await toast).present();
                }

              }
            }
          ]
        });
        (await prompt).present();
      }

    }else if(this.Editable){
      let loginConfirm = this.alertCtrl.create({
        header:"Cancel Booking",
        message: "You cannot cancel expired Booking",
        cssClass:'',
        buttons: [
          {
            text: "Okay",
            handler: () => {

            }
          }
        ]
      });
      (await loginConfirm).present();

      const prompt = this.alertCtrl.create({
        header: 'End Booking',
        cssClass:'',
        message: this.T_SVC['ALERT_TEXT.WISH_TO_END_BOOK'],
        inputs: [
          {
            name: 'pinnumber',
            placeholder: 'Code',
            type: 'number'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'End',
            handler: async data => {
              console.log('Saved clicked');
              if(data.pinnumber == slot.PinNumber){
                var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
                var StaffSeqId = JSON.parse(hostData).HOSTIC;
                this.FBBookingEndSession(slot, slot.PinNumber, StaffSeqId);
              }else{
                let toast = this.toastCtrl.create({
                  message: this.T_SVC['ALERT_TEXT.ENTER_SLOT_PIN'],
                  duration: 3000,
                  color: 'primary',
                  position: 'bottom'
                });
                (await toast).present();
              }

            }
          }
        ]
      });
      // prompt.present();
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
          let alert = this.alertCtrl.create({
            header: 'Success',
            message: this.T_SVC['ALERT_TEXT.SLOT_REMOVED'],
            cssClass:'',
            buttons: ['Okay']
          });
          (await alert).present();
          if(this.FACILITYSLOTLIST && this.FACILITYSLOTLIST.length > 0){
            for(var i = 0 ; i < this.FACILITYSLOTLIST.length ; i++){
              const index: number = this.FACILITYSLOTLIST[i].value.indexOf(slot);
              if (index !== -1) {
                this.FACILITYSLOTLIST[i].value.splice(index, 1);
                break;
              }
            }
          }

        }else{
          if(JSON.parse(val+"")[0].Status == "0"){
            message = this.T_SVC['ALERT_TEXT.SLOT_OCCUPIED'];
          }else if(JSON.parse(val+"")[0].Status == "2"){
            message = this.T_SVC['ALERT_TEXT.SESSION_EXPIRED'];
          }
          let alert = this.alertCtrl.create({
            header: 'Failed',
            message: message,
            cssClass:'',
            buttons: ['Okay']
          });
          (await alert).present();
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
          let alert = this.alertCtrl.create({
          header: 'Error !',
          message: message,
          cssClass:'',
          buttons: ['Okay']
          });
          (await alert).present();
      }
    }
  );
}

FBBookingEndSession(slot, PinNumber , StaffSeqId){
  var params = {
    "PinNumber": PinNumber,
    "StartTime":slot.StartDateTime,
    "EndTime":slot.EndDateTime,
    "BookingID": slot.BookingID,
    "UpdatedBy":StaffSeqId
  }
  this.apiProvider.FBBookingEndSession(params).then(
    async (val) => {
      if(val){
        var message = "Success"; // 0- used 1.success 2.Expired
        if(JSON.parse(val+"")[0].code == 10){
          let alert = this.alertCtrl.create({
            header: 'Success',
            message: this.T_SVC['ALERT_TEXT.SESSION_ENDED'],
            cssClass:'',
            buttons: ['Okay']
          });
          (await alert).present();
          if(this.FACILITYSLOTLIST && this.FACILITYSLOTLIST.length > 0){
            for(var i = 0 ; i < this.FACILITYSLOTLIST.length ; i++){
              const index: number = this.FACILITYSLOTLIST[i].value.indexOf(slot);
              if (index !== -1) {
                this.FACILITYSLOTLIST[i].value[index].SessionEnd = true;
                break;
              }
            }
          }

        }else{
          if(JSON.parse(val+"")[0].Status == "0"){
            message = this.T_SVC['ALERT_TEXT.SLOT_OCCUPIED'];
          }else if(JSON.parse(val+"")[0].Status == "2"){
            message = this.T_SVC['ALERT_TEXT.SESSION_EXPIRED'];
          }
          let alert = this.alertCtrl.create({
            header: 'Failed',
            message: message,
            cssClass:'',
            buttons: ['Okay']
          });
          (await alert).present();
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
          let alert = this.alertCtrl.create({
          header: 'Error !',
          message: message,
          cssClass:'',
          buttons: ['Okay']
          });
          (await alert).present();
      }
    }
  );
}

getRefVisitorCateg(visitor_ctg_id) {
  if (!visitor_ctg_id) {
    return;
  }
  this.apiProvider.GetAddVisitorSettings({"RefVisitorCateg": visitor_ctg_id}).then(
    (val) => {
      var result = JSON.parse(JSON.stringify(val));
      if(result){
        if (result.Table.length > 0) {
          if (result.Table[0].Code === 10 && result.Table1 && result.Table1[0]) {
            const SettingsDetails = JSON.parse(result.Table1[0].SettingDetail);
            this.showQuestion = SettingsDetails.QuestionnaireEnabled;
            this.showDelaration = SettingsDetails.MaterialDeclareEnabled;
            this.showDocument = SettingsDetails.AttachmentUploadEnabled;
            this.appointmentSettingsDetails = result.Table1[0].HostSettingDetail;
          }
        }

      }
    },
    (err) => {
    }
  );
}

async openCustomDialog(action, visitor) {
  let api = '/api/Vims/GetVisitorQuestionariesByAppointmentId';
  if (action === 'doc') {
    api = '/api/Vims/GetVisitorDocsBySeqId';
  } else if (action === 'declaration'){
    api = '/api/vims/GetVisitorItemChecklistBySeqId';
  }

  var params = {
    "SEQ_ID": visitor.VisitorBookingSeqId,
    "STAFF_IC": visitor.STAFF_IC
};
// this.VM.host_search_id = "adam";
this.apiProvider.requestApi(params, api, true, '', '').then(
  async (val) => {
    var result = JSON.parse(val.toString());
    if (result.Table && result.Table.length > 0) {
      const presentModel = await this.modalCtrl.create({
        component: QuestionDocPopupComponent,
        componentProps: {
          data: {
            seqId: visitor.VisitorBookingSeqId,
            result: result.Table,
            type: action
          }
        },
        showBackdrop: true,
        mode: 'ios',
        cssClass: 'visitorPopupModal'
      });
      presentModel.onWillDismiss().then((data) => {
      });
      return await presentModel.present();

    } else {
      let msg = 'Visitor yet to submit the questionaries';
      if (visitor.Approval_Status === 'Approved') {
        msg = 'There is no questionaries for this Visitor';
        if (action === 'doc') {
          msg = 'There is no documents for this Visitor';
        } else if (action === 'declaration'){
          msg = 'There is no self declaration answers for this Visitor';
        }
      } else {
        if (action === 'doc') {
          msg = 'Visitor yet to submit the documents';
        } else if (action === 'declaration'){
          msg = 'Visitor yet to submit the  declaration';
        }
      }

      this.apiProvider.showAlert(msg);
    }
    },
  async (err) => {

    if(err && err.message == "No Internet"){
      return;
    }
    var message = "";
    if (err.status) {
      message = 'Api Not Found';
    } else if(err && err.message == "Http failure response for (unknown url): 0 Unknown Error"){
      message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
    } else if(err && JSON.parse(err) && JSON.parse(err).message){
      message =JSON.parse(err).message;
    }
    if(message){
      // message = " Unknown"
      let alert = this.alertCtrl.create({
        header: 'Error !',
        message: message,
        cssClass:'',
        buttons: ['Okay']
        });
        (await alert).present();
    }
  }
);
}

  ngOnInit() {
  }

}
