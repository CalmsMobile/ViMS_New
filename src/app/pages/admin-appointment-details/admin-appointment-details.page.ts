import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { File } from '@ionic-native/file/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { WheelSelector } from '@ionic-native/wheel-selector/ngx';
import { NavController, Platform, ToastController, ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CustomVisitorPopupComponent } from 'src/app/components/custom-visitor-popup/custom-visitor-popup';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { FileTransferObject,  FileTransfer } from '@ionic-native/file-transfer/ngx';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { QuestionDocPopupComponent } from 'src/app/components/question-doc-popup/question-doc-popup.component';
import { CommonUtil } from 'src/app/services/util/CommonUtil';
@Component({
  selector: 'app-admin-appointment-details',
  templateUrl: './admin-appointment-details.page.html',
  styleUrls: ['./admin-appointment-details.page.scss'],
})
export class AdminAppointmentDetailsPage implements OnInit {


  appointment : any;
  appointmentSettingsDetails: any;
  notifyTime  = 0;
  notifyMin  = 0;
  autoApproval: any = false;
  showOption = false;
  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage":"assets/images/profile_bg.jpg"
  };
  myDate:any;

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

  isPastAppointment = false;

  FACILITYSLOTLIST = [];
  facilityBooking : any;
  T_SVC:any;
  imageURLType = '&RefType=VPB&Refresh='+ new Date().getTime();
  constructor(public navCtrl: NavController,
    public apiProvider: RestProvider,
    private plt: Platform,
    private events: EventsService,
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private selector: WheelSelector,
    private androidPermissions: AndroidPermissions,
    private transfer: FileTransfer,
    private file: File,
    private dateformat : DateFormatPipe,
    private socialSharing: SocialSharing,
    private router: Router,
    commonUtil: CommonUtil,
    private route: ActivatedRoute,
    private translate : TranslateService,
    private localNotifications: LocalNotifications, private alertCtrl: AlertController) {

    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'ALERT_TEXT.QRSHARE_SUCCESS',
      'ALERT_TEXT.APPOINTMENT_EXPIRED',
      'ALERT_TEXT.NOTIFICATION_SET_SUCCESS1',
      'ALERT_TEXT.NOTIFICATION_SET_SUCCESS2',
      'ALERT_TEXT.REMINDER_SUCCESS',
      'ALERT_TEXT.APPOINTMENT_DELETE_SUCCESS',
      'ALERT_TEXT.APPROVE_APPOINTMENT',
      'ALERT_TEXT.APPROVE_APPOINTMENT_ALL',
      'ALERT_TEXT.SEND_REMINDER',
      'ALERT_TEXT.DELETE_APPOINTMENT'
    ]).subscribe(t => {
        this.T_SVC = t;
    });
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        this.appointment = passData.appointment;
        this.autoApproval = passData.autoApproval;
        this.showOption = passData.showOption;
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
        }
        this.getRefVisitorCateg(this.appointment[0].VisitorCategory);
      // this.plt.ready().then((readySource) => {
        // this.localNotifications.on('click', (notification, state) => {
        //   let json = JSON.parse(notification.data);
        //   this.appointment = json.mydata;
        //   let alert = alertCtrl.create({
        //     title: notification.title,
        //     message: json.mydata
        //   });
        //   alert.present();
        // })
      // });

      console.log(this.appointment);
      }
    });
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
              const settingsDetails = JSON.parse(result.Table1[0].SettingDetail);
              this.appointment.showQuestion = settingsDetails.QuestionnaireEnabled;
              this.appointment.showDelaration = settingsDetails.MaterialDeclareEnabled;
              this.appointment.showDocument = settingsDetails.AttachmentUploadEnabled;
              this.appointmentSettingsDetails = result.Table1[0].HostSettingDetail;
            }
          }

        }
      },
      (err) => {
      }
    );
  }

  getQREncryptedValue(appointment){

    if(!appointment.HexCode){
      appointment.HexCode = "";
    }
    // var qrJsonString1 = "{\"aptid\":\""+appointment.VisitorBookingSeqId+ "\",\"aptgid\":\"" + appointment.appointment_group_id + "\",\"cid\":\"" + appointment.cid + "\"}";
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
    return qrCodeString;
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
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    var hostName = "";
    if(hostData){
      hostName = JSON.parse(hostData).HOSTNAME;
    }
    var qrCodeString = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl+'/Handler/ImageHandler.ashx?RefSlno=' + qrJsonString1 + '&RefType=QR&Refresh='+ new Date().getTime();
    const fileTransfer: FileTransferObject = this.transfer.create();
    // const fileURI = this.file.dataDirectory + encrypted + '.jpg';
    const url = qrCodeString;
    // var filename = url.split("/").pop();
    var path = this.file.externalRootDirectory;
    if(!path){
      path = (this.file.externalDataDirectory || this.file.dataDirectory);
    }
    var targetPath = path + 'Pictures/' + "shareQRCode.jpg";

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
                console.log("New encrypt: "+ encrypted);
                var data = "Hi, I have shared the QR code for our appointment. Please use the QR code for your registration when you visit me."+
                "\n"+" Thanks,"+"\n"+"["+hostName+"]";
                this.socialSharing.share(data, 'Your appointment QR code', targetPath , "").then(() => {
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
    visitor.Visitor_category = this.appointment[0].Visitor_category;
    visitor.Country = this.appointment[0].Country;
    visitor.Address = this.appointment[0].Address;
      const presentModel = await this.modalCtrl.create({
        component: CustomVisitorPopupComponent,
        componentProps: {
          data: {
            visitor: visitor,
            aptid: this.appointment[0].VisitorBookingSeqId,
            aptgid : this.appointment[0].appointment_group_id,
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

  goBack() {
    this.router.navigateByUrl('admin-home');
    console.log('goBack ');
  }

  ionViewDidEnter() {
    this.events.publishDataCompany({
      action: "page",
      title: "AdminAppointmentDetailsPage",
      message: ""
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
              text: 'Reminder' + "\n" + "Facility Name : " +  this.facilityBooking[0].FacilityName + "\n" + "Purpose :" + this.facilityBooking[0].PurposeName,
              trigger: {at: noti},
              led: 'FF0000',
              sound: null,
           }
          }else{
            this.localNotifications.cancel(title);
            schedule =  {
              id:this.appointment[0].appointment_group_id,
              title: "ViMS",
              text: 'Reminder :' + "\n" + "Purpose :" + this.appointment[0].REASON,
              trigger: {at: noti},
              led: 'FF0000',
              sound: null,
           }
          }
          this.localNotifications.schedule(schedule);
          let alert1 = this.alertCtrl.create({
            header: 'Appointment Reminder',
            cssClass:'',
            message: this.T_SVC['ALERT_TEXT.NOTIFICATION_SET_SUCCESS1']+ this.dateformat.transform(noti+"", "dd-MM-yyyy hh:mm tt") + this.T_SVC['ALERT_TEXT.NOTIFICATION_SET_SUCCESS2'],
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
                if(err && err.message && err.message.indexOf("Http failure response for") > -1){
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

  editAppintment(fab: any){
    fab.close();
    const navigationExtras: NavigationExtras = {
      state: {
        passData: {
          appointment: this.appointment,
          edit: true
        }
      }
    };
    this.router.navigate(['add-appointment'], navigationExtras);
  }

  async deleteAppintment(fab: any){
    fab.close();

    let alert = this.alertCtrl.create({
      header: 'Delete Appointment',
      cssClass:'',
      message: this.T_SVC['ALERT_TEXT.DELETE_APPOINTMENT'],
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
              hostId = JSON.parse(hostData).HOSTIC? JSON.parse(hostData).HOSTIC: JSON.parse(hostData).HOST_ID;
            }
            var params = {
              "hostID":hostId,
              "STAFF_IC":this.appointment[0].STAFF_IC,
              "appointment_group_id":this.appointment[0].appointment_group_id
            }
            this.apiProvider.RemoveAppointment(params).then(
              async (val) => {
                var result = JSON.parse(JSON.stringify(val));
                if(result){
                  this.localNotifications.cancel(this.appointment[0].appointment_group_id);
                  let toast = this.toastCtrl.create({
                    message:this.T_SVC['ALERT_TEXT.APPOINTMENT_DELETE_SUCCESS'],
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
                if(err && err.message && err.message.indexOf("Http failure response for") > -1){
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

  async showChangeAppointmentStatusAlert(type, appointment_group_id, seqId){
    var status = "Cancel this appointment?";
    let inputsShow = [];
    if(type == "Approved"){
      status = this.T_SVC['ALERT_TEXT.APPROVE_APPOINTMENT'];
    }else if(type == "All"){
      status = this.T_SVC['ALERT_TEXT.APPROVE_APPOINTMENT_ALL'];
    } else {
      inputsShow = [
        {
          name: 'remarks',
          type: 'text',
          placeholder: 'Enter Cancellation Remarks'
        }]
    }
    let alert = this.alertCtrl.create({
      header: 'Change Appointment Status',
      inputs: inputsShow,
      cssClass:'',
      message: status,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Proceed',
          handler: (result) => {
            if (seqId) {
              if(type !== "Approved"){
                if (result && result.remarks) {
                  this.AppointmentApprovalByVisitor(type, seqId, (result && result.remarks)? result.remarks: '');
                } else {
                  return false;
                }

              } else {
                this.AppointmentApprovalByVisitor(type, seqId, (result && result.remarks)? result.remarks: '');
              }

            } else{
              this.ChangeAppointmentStatus(type, appointment_group_id);
            }

          }
        }
      ]
    });
    (await alert).present();
  }

  showControls(visitors){
    return visitors.Approval_Status === 'Pending' && ((visitors.FirstLvlApproval === 10 && !visitors.ApprovedBy1) || (visitors.FirstLvlApproval === 20 && visitors.ApprovedBy1 && visitors.SecondLvlApproval === 10 && !visitors.ApprovedBy2));
  }

  ChangeAppointmentStatus(type, appointment_group_id){
    var hostDetails = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS));
    var params = {
      "appointment_group_id":appointment_group_id,
      "Status": type,
      "HOSTIC" : hostDetails.HOSTIC
    }

    this.apiProvider.ChangeAppointmentStatus(params).then(
      (val) => {
        this.navCtrl.pop();
      },
      async (err) => {
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

  AppointmentApprovalByVisitor(type, seqId, remarks){
    var hostDetails = JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS));
    var params = {
      "SEQ_ID": + seqId,
      "Status": type,
      "HOSTIC" : hostDetails.HOSTIC,
      "CancelRemarks": remarks
    }

    this.apiProvider.AppointmentApprovalByVisitor(params).then(
      (val) => {
        // this.navCtrl.pop();
        var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
        if (qrData) {
          const QRObj = JSON.parse(qrData);
          if (QRObj.MAppId.split(",").length > 1 || QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1) {
            this.router.navigateByUrl('home-tams');
            return;
          }
        }
        this.navCtrl.navigateRoot('');
        setTimeout(() => {
          this.events.publishDataCompany({
            action: 'refreshApproveList',
            title: 'refreshApproveList',
            message: 'refreshApproveList'
          })
        }, 1000);
      },
      async (err) => {
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
              seqId: this.appointment[0].VisitorBookingSeqId,
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
        let msg = 'There is no questionaries for this Visitor';
        if (action === 'doc') {
          msg = 'There is no documents for this Visitor';
        } else if (action === 'declaration'){
          msg = 'There is no self declaration answers for this Visitor';
        }
        this.showAlert(msg);
      }
      },
    async (err) => {

      if(err && err.message == "No Internet"){
        return;
      }
      var message = "";
      if (err.status) {
        message = 'Api Not Found';
      } else if(err && err.message && err.message.indexOf("Http failure response for") > -1){
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

  async showAlert(msg) {
    let alert = this.alertCtrl.create({
      header: 'Notification',
      message: msg,
      cssClass:'',
      buttons: ['Okay']
      });
      (await alert).present();
  }

  GetAppointmentDetailBySeqId(seqId) {
    var params = {
      "SEQ_ID": seqId,
      "STAFF_IC": this.appointment[0].STAFF_IC
  };
  // this.VM.host_search_id = "adam";
  this.apiProvider.GetAppointmentDetailBySeqId(params).then(
    (val) => {
      var result = JSON.parse(val.toString());
      if (result.Table1 && result.Table1.length > 0) {
        this.appointment[0].Address = result.Table1[0].Address;
        this.appointment[0].Country = result.Table1[0].Country;
        this.appointment[0].Purpose_Visit = result.Table1[0].Purpose_Visit;
        this.appointment[0].Visitor_category = result.Table1[0].Visitor_category;
        this.appointment[0].Room_Name = result.Table1[0].Room_Name;
        this.appointment[0].START_TIME = result.Table1[0].START_TIME;
        this.appointment[0].END_TIME = result.Table1[0].END_TIME;
        this.appointment[0].approaver.FirstLvlApproval = result.Table1[0].FirstLvlApproval;
        this.appointment[0].approaver.SecondLvlApproval = result.Table1[0].SecondLvlApproval;
        this.appointment[0].approaver.ApprovedOn1 = result.Table1[0].ApprovedOn1;
        this.appointment[0].approaver.ApprovedOn2 = result.Table1[0].ApprovedOn2;
        this.appointment[0].approaver.Approvar2Reject = result.Table1[0].Approvar2Reject;
      }
      },
    (err) => {

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
        this.apiProvider.showAlert(message);
      }
    }
  );
  }

  VimsAppGetFacilityBookingDetails(){
    if (this.appointment[0].VisitorBookingSeqId) {
      this.GetAppointmentDetailBySeqId(this.appointment[0].VisitorBookingSeqId);
    }
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
        this.facilityBooking = result.Table1;


        if(this.facilityBooking && this.facilityBooking.length >0){
          this.isPastAppointment = true;;
          for(var i1 = 0 ; i1 < this.facilityBooking.length ; i1++){
            var facility = this.facilityBooking[i1];
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

        if(this.facilityBooking && this.facilityBooking.length > 0){
          var data  = [];
          if(result.Table2){
            var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
            var hostId = "";
            if(hostData){
              hostId = JSON.parse(hostData).HOSTIC? JSON.parse(hostData).HOSTIC:JSON.parse(hostData).HOST_ID;
            }
            for(var i = 0 ; i< result.Table2.length ; i++){
              if(result.Table2[i].MemberID != hostId){
                data[data.length] = result.Table2[i];
              }
            }
          }
          this.facilityBooking[0].visitors = data;
          this.loadVimsAppGetBookingSlot();
        }

        // this.facilityBooking[0].visitors = result.Table2;
        this.setNotifyTime();
				},
			(err) => {

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
              var sDate =  this.dateformat.transform(slot.StartDateTime+"", "yyyy-MM-ddTHH:mm:ss");
                if(new Date(sDate).getTime() < cTime){
                  slot.selected = 3; // expired
                } else {
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
                }
              slot.EndDateTime = sDTime;
              var etime = sDTime.split("T")[1];
              etime = etime.slice(0,etime.lastIndexOf(":"));
              var sSession = stime.split(":")[0] > 11 ? " ": "";
              var eSession = etime.split(":")[0] > 11 ? " ": "";
              slot.startDisplayTime = stime+sSession;
              slot.endDisplayTime = etime + eSession;

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

openSlotInfo(slot){

}

  ngOnInit() {
  }

}
