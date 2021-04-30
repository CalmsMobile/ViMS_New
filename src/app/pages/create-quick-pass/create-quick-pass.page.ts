import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Camera } from '@ionic-native/camera/ngx';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { NavController, AlertController, ActionSheetController, ToastController, Platform, LoadingController, IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { VisitorInfoModal } from 'src/app/model/visitorInfoModal';
import { DateFormatPipe } from 'src/app/pipes/custom/DateFormat';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';
import { ToastService } from 'src/app/services/util/Toast.service';

@Component({
  selector: 'app-create-quick-pass',
  templateUrl: './create-quick-pass.page.html',
  styleUrls: ['./create-quick-pass.page.scss'],
})
export class CreateQuickPassPage implements OnInit {


  @ViewChild(IonContent) content: IonContent;
  active: boolean;

  lastImage: string = null;
  loading: any;
  visitor_RemoveImg = false;
  data: any = {
    "logo": JSON.parse(window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO)).ApiUrl + '/Handler/ImageHandler.ashx?RefSlno=',
    "coverImage": "assets/images/profile_bg.jpg",
    "profile": "",
  };
  imageType = "&RefType=VP&Refresh=" + new Date().getTime();
  preAppointment = "";
  visitorInfoModal = new VisitorInfoModal();
  public error: string;
  visitorProfile: FormGroup;
  base64Image: any = "";
  hostSettings: any = "";
  T_SVC: any;
  expiryTime: any;
  constructor(public navCtrl: NavController,

    public toastService: ToastService,
    private translate: TranslateService,
    public apiProvider: RestProvider,
    private alertCtrl: AlertController,
    private camera: Camera,
    private dateformat: DateFormatPipe,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public platform: Platform,
    public events: EventsService,
    private router: Router,
    private route: ActivatedRoute,
    private datePicker: DatePicker,
    public loadingCtrl: LoadingController) {
    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'ALERT_TEXT.QUICKPASS_CREATE_SUCCESS',
      'ALERT_TEXT.SELECT_EXPIRY_TIME'
    ]).subscribe(t => {
      this.T_SVC = t;
    });
    this.visitorProfile = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      notes: new FormControl('', (this.hostSettings && this.hostSettings.notesEnabled && this.hostSettings.notesRequired) ? ([Validators.required]) : []),
      vechile: new FormControl('', (this.hostSettings && this.hostSettings.VehicleNumberEnabled && this.hostSettings.VehicleNumberRequired) ? ([Validators.required]) : [])
    });
    var hostSettings = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.APPLICATION_HOST_SETTINGS);
    if (hostSettings && JSON.parse(hostSettings)) {
      var result1 = JSON.parse(hostSettings).Table1[0];
      if (result1 && JSON.parse(result1.QuickPassSettings)) {
        this.hostSettings = JSON.parse(result1.QuickPassSettings).CreatePass;
      }
    }
    if (!this.hostSettings) {
      this.hostSettings = {
        "VisitorExpiryTimeEnabled": true,
        "VisitorExpiryTimeRequirred": true,
        "VehicleNoEnabled": true,
        "VehicleNoRequired": false,
        "RemarksEnabled": false,
        "RemarksRequired": false
      }
    }
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const passData = this.router.getCurrentNavigation().extras.state.passData;
        console.log('passData : ' + passData);
        this.preAppointment = passData.PreAppointment;
        if (this.preAppointment) {
          var preVisitor = JSON.parse(this.preAppointment);
          this.visitorInfoModal.visitor_ic = preVisitor.VISITOR_IC;
          this.visitorInfoModal.visitor_id = preVisitor.VISITOR_IC;
          this.visitorInfoModal.visitor_ctg_name = preVisitor.VisitorCategory;
          this.visitorInfoModal.visitor_ctg_id = preVisitor.VisitorCategory;
          this.visitorInfoModal.visitor_comp_id = preVisitor.visitor_comp_code;
          this.visitorInfoModal.visitor_comp_name = preVisitor.VISITOR_COMPANY;
          this.visitorInfoModal.visitor_name = preVisitor.VISITOR_NAME;
          this.visitorInfoModal.visitor_gender = preVisitor.VISITOR_GENDER;
          this.visitorInfoModal.vehicle_no = preVisitor.PLATE_NUM;
          this.visitorInfoModal.visitor_mobile_no = preVisitor.TELEPHONE_NO;
          this.visitorInfoModal.visitor_email = preVisitor.EMAIL;
          this.visitorInfoModal.visitor_id = preVisitor.VISITOR_IC;
          this.visitorInfoModal.VisitorBookingSeqId = preVisitor.VisitorBookingSeqId;
          if (preVisitor.VisitorBookingSeqId) {
            this.imageType = "&RefType=VPB&Refresh=" + new Date().getTime();
          }
          this.data.profile = preVisitor.VISITOR_IMG ? preVisitor.VISITOR_IMG : "";
          if (preVisitor.VISITOR_IMG) {
            this.base64Image = 'data:image/jpeg;base64,' + this.data.profile;
          }
        }

        events.observeDataCompany().subscribe((data1: any) => {
          if (data1.action === 'user:created') {
            const user = data1.title;
            const data = data1.message;
            // user and time are the same arguments passed in `events.publish(user, time)`
            console.log('Welcome', user, 'at', data);
            // this.params.hostImage = "assets/images/logo/2.png";
            // alert(this.params.hostImage);
            if (user == "visitorCompany") {
              var cData = JSON.parse(data);
              this.visitorInfoModal.visitor_comp_name = cData.visitor_comp_name;
              this.visitorInfoModal.visitor_comp_id = cData.visitor_comp_code;
            }
          }
        });
      }
    });


    var showwTime = new Date();
    showwTime.setTime(showwTime.getTime() + (AppSettings.APPOINTMENT_BufferTime * 60 * 1000));
    this.expiryTime = this.dateformat.transform(showwTime + "", "yyyy-MM-ddTHH:mm:ss");
  }

  ionViewWillLeave() {
    //   this.events.unsubscribe("user:created");
  }

  scanQrCode() {

  }

  scanOcr() {

  }

  openCalendar() {

    var showDate = new Date();
    showDate.setTime(showDate.getTime() + (AppSettings.APPOINTMENT_BufferTime * 60 * 1000));

    console.log("OpenCalender:" + showDate);
    this.datePicker.show({
      date: showDate,
      mode: 'datetime',
      minDate: showDate,
      popoverArrowDirection: "down",
      // androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
    }).then(
      date => {

        this.expiryTime = this.dateformat.transform(date + "", "yyyy-MM-ddTHH:mm:ss");
        console.log("OpenCalender:" + this.expiryTime);

      },
      err => console.log('Error occurred while getting date: ', err)
    );


  }



  ionViewDidEnter() {
  }




  goBack() {
    this.navCtrl.pop();
    console.log('goBack ');
  }


  async addVisitors() {

    if (this.hostSettings.VisitorExpiryTimeEnabled && this.hostSettings.VisitorExpiryTimeRequirred && !this.expiryTime) {
      let toast = await this.toastCtrl.create({
        message: this.T_SVC['ALERT_TEXT.SELECT_EXPIRY_TIME'],
        duration: 3000,
        color: 'primary',
        cssClass: 'alert-danger',
        position: 'bottom'
      });
      toast.present();
      return;
    }

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if (hostData) {
      var hostId = JSON.parse(hostData).HOST_ID;
      var visitorObj = {
        HostIC: hostId,
        ExpiryTime: this.expiryTime,
        VisitorName: this.visitorInfoModal.visitor_name,
        VehicleNo: this.visitorInfoModal.vehicle_no,
        Purpose: this.visitorInfoModal.notes
      }

      this.apiProvider.CreateQuickPassVisitor(visitorObj).then(
        async (val) => {
          var result = JSON.parse(val.toString());
          if (result && result.Table && result.Table[0] && result.Table[0].Code == 10) {
            let toast = await this.toastCtrl.create({
              message: this.T_SVC['ALERT_TEXT.QUICKPASS_CREATE_SUCCESS'],
              duration: 3000,
              color: 'primary',
              position: 'bottom'
            });
            toast.present();
            this.navCtrl.pop();
            var page = {
              component: "quick-pass-dash-board-page"
            }
            this.events.publishDataCompany({
              action: 'ChangeTab',
              title: page,
              message: 0
            });
            var item = {
              "HexCode": result.Table[0].Hexcode,
              "ExpiryTime": visitorObj.ExpiryTime,
              "VisitorName": visitorObj.VisitorName,
              "Purpose": visitorObj.Purpose,
              "VehicleNo": visitorObj.VehicleNo,
              "IsCheckedIn": false,
              "IsCheckedOut": false,
              "CheckInTime": "",
              "CheckOutTime": null
            };
            const navigationExtras: NavigationExtras = {
              state: {
                passData: {
                  QPAppointment: JSON.stringify(item),
                  CheckIn: false,
                  fromCreate: true
                }
              }
            };
            this.router.navigate(['quick-pass-details-page'], navigationExtras);
            return;
          }
          let toast = await this.toastCtrl.create({
            message: 'Server Error',
            duration: 3000,
            color: 'primary',
            position: 'bottom'
          });
          toast.present();

        },
        async (err) => {
          if (err && err.message == "No Internet") {
            return;
          }
          var message = "";
          if (err && err.message == "Http failure response for (unknown url): 0 Unknown Error") {
            message = this.T_SVC['COMMON.MSG.ERR_SERVER_CONCTN_DETAIL'];
          } else {
            var result = JSON.parse(err.toString());
            if (result && result["Table1"] != undefined) {
              message = result["Table1"][0].description;
            } else if (err && !err.message) {
              message = " Unknown"
            } else if (result.message) {
              message = result.message;
            }
          }
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: 'alert-danger',
            buttons: ['Okay']
          });
          alert.present();
        }
      );
    }



  }

  isClassActive() {
    return this.active;
  }



  ionViewWillEnter() {

  }



  subscribeToIonScroll() {
    if (this.content && this.content['ionScroll']) {
      this.content['ionScroll'].subscribe((d) => {
        if (d && d['scrollTop'] < 80) {
          this.active = false;
          return;
        }
        this.active = true;
      });
    }
  }

  ngOnInit() {
  }

}
