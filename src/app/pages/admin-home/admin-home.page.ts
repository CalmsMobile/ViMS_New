import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, ToastController, AlertController, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { RestProvider } from 'src/app/providers/rest/rest';
import { AppSettings } from 'src/app/services/app-settings';
import { EventsService } from 'src/app/services/EventsService';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
})
export class AdminHomePage implements OnInit {

  selectedTap = "pending";
  pendingList : any = [];
  approvedList : any = [];
  cancelledList : any = [];
  appointments = [];
  checkAll = false;
  enableApproval = false;
  adminName = "VIMS Admin";
  T_SVC:any;
  showFab = true;
  loadingFinished = false;
  branchList = [];
  branch_id = '';
  constructor(public navCtrl: NavController,
    private toastCtrl:ToastController,
    private router: Router,
    private datePipe: DatePipe,
    private eventService: EventsService,
    private translate:TranslateService,
    private alertCtrl: AlertController, public apiProvider: RestProvider, private menuCtrl: MenuController) {

    this.translate.get([
      'COMMON.MSG.ERR_SERVER_CONCTN_DETAIL',
      'ALERT_TEXT.APPROVE_APPOINTMENT',
      'ALERT_TEXT.APPROVE_APPOINTMENT_ALL',
      'ALERT_TEXT.ENABLE_AUTO_APPROVE', 'NOTIFICATION.TITLE',
      'ALERT_TEXT.DISABLE_AUTO_APPROVE',
      'SETTINGS.ARE_U_SURE_ADMIN_LOGOUT']).subscribe(t => {
        this.T_SVC = t;
    });
    // this.menuCtrl.enable(false, 'myLeftMenu');
    eventService.observeDataCompany().subscribe(async (data: any) => {
      // if (data.action === 'refreshApproveList') {
      //   this.OffSet = 0;
      //   this.appointments = [];
      //   this.getAppointmentHistory(null);
      // }
    });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter AdminHomePage');
    this.appointments = [];
    // this.getPreAppointmentenableApprovalSettings();
    this.getMyBranches();
  }

  onSegmentChange(){
    console.log(this.selectedTap);
    this.appointments = [];
    this.getAppointmentHistory(null);
  }

  getShowRejectButton(appointment) {
    let result = true;
    if (appointment && appointment.FirstLvlApproval !== null && appointment.SecondLvlApproval !== null && appointment.ApprovedOn1 !== null
      && appointment.ApprovedOn2 === null && appointment.Approvar2Reject === false) {
      result = false;
    }
    return result;
  }

  getMyBranches() {
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var HOSTIC = JSON.parse(hostData).HOSTIC;
			var params = {
			"SEQ_ID":HOSTIC
		  };
      this.apiProvider.requestApi(params, '/api/vims/GetUserBranchData', false, '', '').then(
        (val) => {
        },
        async (err) => {

          try {
            const list = JSON.parse(err);
            if (list && list.length > 1) {
              this.branchList.push({
                BranchSeqId: 'All',
                Name: 'All'
              });
              list.forEach(element => {
                this.branchList.push(element);
              });
              this.branch_id = 'All'
            } else {
              this.getAppointmentHistory(null);
            }
          } catch (error) {

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
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: message,
              cssClass: '',
              buttons: ['Okay']
            });
              alert.present();
          }
        }
      );
    }
  }

  onChangeBranch(event : any){
    this.branch_id = event.detail.value;
    this.appointments = [];
    this.getAppointmentHistory(null);
  }

  getDayofDate(dateString){
		let dateObject = new Date(dateString);
		let weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
		return weekdays[dateObject.getDay()];
  }

  checkIsToday(fromDate, toDate, dateCondition){
    if(fromDate && toDate){
      let fromdateObject = new Date(fromDate.split("T")[0]).getTime();
      // let todateObject = new Date(toDate.split("T")[0]).getTime();
      let cDatee = new Date();

      if(dateCondition == "Today"){
        var month = ""+ (cDatee.getMonth()+1);
        if(cDatee.getMonth()+1 < 10){
          month = "0"+ (cDatee.getMonth()+1);
        }
        var date = ""+ cDatee.getDate();
        if(cDatee.getDate()+1 < 10){
          date = "0"+ cDatee.getDate();
        }
        let todayObject = new Date(cDatee.getFullYear()+"-"+month+"-"+ date).getTime();
        if(todayObject == fromdateObject){
          return true;
        }else{
          return false;
        }
      }else if(dateCondition == "Tomorrow"){
        cDatee.setDate(cDatee.getDate() + 1);
        month = ""+ (cDatee.getMonth()+1);
        if(cDatee.getMonth()+1 < 10){
          month = "0"+ (cDatee.getMonth()+1);
        }
        date = ""+ cDatee.getDate();
        if(cDatee.getDate()+1 < 10){
          date = "0"+ cDatee.getDate();
        }
        let todayObject = new Date(cDatee.getFullYear()+"-"+month+"-"+ date).getTime();
        if(todayObject == fromdateObject){
          return true;
        }else{
          return false;
        }
      }else if(dateCondition == "Future"){
        cDatee.setDate(cDatee.getDate() + 2);
        month = ""+ (cDatee.getMonth()+1);
        if(cDatee.getMonth()+1 < 10){
          month = "0"+ (cDatee.getMonth()+1);
        }
        date = ""+ cDatee.getDate();
        if(cDatee.getDate()+1 < 10){
          date = "0"+ cDatee.getDate();
        }
        let todayObject = new Date(cDatee.getFullYear()+"-"+month+"-"+ date).getTime();
        if(todayObject <= fromdateObject){
          return true;
        }else{
          return false;
        }
      }

    }else{
      return false;
    }

  }


	doRefresh(refresher) {
    // this.OffSet = this.OffSet + 20;
    this.getAppointmentHistory(refresher);
    //setTimeout(()=>{refresher.target.complete();},2000)
	}

  editVisitors(slideDOM, action, item){

  }

	getAppointmentHistory(refresher){
    this.loadingFinished = false;
		var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var hostId = JSON.parse(hostData).HOSTIC? JSON.parse(hostData).HOSTIC:JSON.parse(hostData).HOST_ID;
			var params = {
      "hostID":hostId,
			"OffSet": ""+ this.appointments.length,
      "Rows":"20",
      "StatusType":"0"
    };

    if(this.selectedTap == 'approved'){
      params.StatusType ="10";
    }else if(this.selectedTap == 'canceled'){
      params.StatusType ="20";
    }
			// this.VM.host_search_id = "adam";
      this.apiProvider.requestApi(params, '/api/Vims/AppointmentApprovalList', refresher? false : true, '', this.branch_id).then(
				(val) => {
          this.loadingFinished = true;
					var aList = JSON.parse(val.toString()).Table;
					if(refresher){
            this.appointments = aList;
            refresher.target.complete();
					}else{
            if (this.appointments.length === 0) {
              this.appointments = aList;
            } else {
              this.appointments = aList.concat(this.appointments);
            }

					}
          if(this.selectedTap == 'approved'){
            this.approvedList = this.appointments;
          }else if(this.selectedTap == 'canceled'){
            this.cancelledList = this.appointments;
          }else{
            this.pendingList = this.appointments;
          }
          // for(let items in this.appointments){
          //   var cObj = this.appointments[items];
          //   if(cObj.Approval_Status ==  "Pending"){
          //     this.pendingList.push(cObj);
          //   }else if(cObj.Approval_Status ==  "Approved"){
          //     this.approvedList.push(cObj);
          //   }else if(cObj.Approval_Status ==  "Canceled"){
          //     this.cancelledList.push(cObj);
          //   }
          // }
				},
				async (err) => {
          this.loadingFinished = true;
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
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
        }
				}
			);
		}
  }

  selectAll(){
    if(this.checkAll){
      for(var i = 0; i < this.pendingList.length; i++){
        this.pendingList[i].isChecked = true;
      }
    }else{
      for(i = 0; i < this.pendingList.length; i++){
        this.pendingList[i].isChecked = false;
      }
    }

  }


  checkSelectAll(){
    this.checkAll = true;
    for(var i = 0; i < this.pendingList.length; i++){
      if(!this.pendingList[i].isChecked){
        this.checkAll = false;
        break;
      }
    }
  }

  async showChangeAppointmentStatusAlert(type, appointment){
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
      header: this.T_SVC['NOTIFICATION.TITLE'],
      cssClass:'',
      message: status,
      inputs: inputsShow,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: (result) => {
            if(type !== "Approved" && type !== "All") {
              if(result && result.remarks){
                this.ChangeAppointmentStatus(type, appointment, (result && result.remarks)? result.remarks: '')
              } else{
                return false;
              }
            }else if(type !== "All"){
              this.ChangeAppointmentStatus(type, appointment, (result && result.remarks)? result.remarks: '')
            }

          }
        }
      ]
    });
    (await alert).present();
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
        this.appointments = [];
        this.approvedList = [];
        this.pendingList = [];
        this.cancelledList = [];
        this.getAppointmentHistory('')
        setTimeout(() => {
          this.eventService.publishDataCompany({
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

  ChangeAppointmentStatus(type, appointment, remarks){

    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var HOSTIC = JSON.parse(hostData).HOSTIC;
			var params = {
			"STAFF_IC":HOSTIC,
			"appointment_group_id": appointment.appointment_group_id,
      "CurrentDate": this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')
		  };
      this.apiProvider.requestApi(params, '/api/vims/GetApprovalVisitorsByGroupId', false, '', '').then(
        (val) => {
          var aList1 = JSON.parse(val.toString()).Table;
          for (let pos = 0; pos < aList1.length; pos++) {
            const element = aList1[pos];
            if (appointment.VISITOR_NAME === element.VISITOR_NAME) {
              this.AppointmentApprovalByVisitor(type, element.SEQ_ID, remarks);
              break;
            }
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
            let alert = await this.alertCtrl.create({
              header: 'Error !',
              message: message,
              cssClass: '',
              buttons: ['Okay']
            });
              alert.present();
          }
        }
      );
    }
  }


  goBack() {
    var qrData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.QRCODE_INFO);
    if (qrData) {
      const QRObj = JSON.parse(qrData);
      if (QRObj.MAppId.split(",").length > 1 || QRObj.MAppId.indexOf(AppSettings.LOGINTYPES.HOSTWITHFB) > -1) {
        this.router.navigateByUrl('home-tams');
      } else {
        this.router.navigateByUrl('home-view');
      }

    } else {
      this.navCtrl.pop();
    }

  }

  getPreAppointmentenableApprovalSettings(){
    this.apiProvider.GetPreAppointmentSettings({}).then(
			(val) => {
				var aList = JSON.parse(val.toString());
        window.localStorage.setItem(AppSettings.LOCAL_STORAGE.PREAPPOINTMENTAUTOAPPROVE, aList[0].maint_prefix);
        this.enableApproval = (aList[0].maint_prefix == "1");
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
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
        }
			}
		);
  }

  viewBooking(list){
    list = [list];
    if(list[0].isFacilityAlone){
      const navigationExtras: NavigationExtras = {
        state: {
          passData: {
            appointment: list
          }
        }
      };
      this.router.navigate(['admin-appointment-details'], navigationExtras);
      return;
    }
    var hostData = window.localStorage.getItem(AppSettings.LOCAL_STORAGE.HOST_DETAILS);
    if(hostData){
      var HOSTIC = JSON.parse(hostData).HOSTIC;
			var params = {
			"STAFF_IC":HOSTIC,
			"appointment_group_id": list[0].appointment_group_id,
      "CurrentDate": this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')
		};
		// this.VM.host_search_id = "adam";
		this.apiProvider.GetAppointmentByGroupId(params).then(
			(val) => {
				var aList = JSON.parse(val.toString());
        this.apiProvider.requestApi(params, '/api/vims/GetApprovalVisitorsByGroupId', false, '', '').then(
          (val) => {
            var aList1 = JSON.parse(val.toString()).Table1;
            for (let pos = 0; pos < aList1.length; pos++) {
              const element = aList1[pos];
              element.SEQ_ID= aList[pos].SEQ_ID;
              element.Applied_Date= aList[pos].Applied_Date;
              element.Approval_Status= aList[pos].Approval_Status;
              element.Booked_by= aList[pos].Booked_by;
              element.Category= aList[pos].Category;
              element.EMAIL= element.EMAIL;
              element.END_DATE= aList[pos].END_DATE;
              element.FacilityBookingID= element.FacilityBookingID;
              element.FacilityBookingID1= aList[pos].FacilityBookingID1;
              element.Floor= aList[pos].Floor;
              element.HexCode= element.HexCode;
              element.ImageChanged= aList[pos].ImageChanged;
              element.IsNewAppointment= aList[pos].IsNewAppointment;
              element.REASON= aList[pos].REASON;
              element.Remarks= aList[pos].Remarks;
              element.Room= aList[pos].Room;
              element.STAFF_IC= element.STAFF_IC;
              element.STAFF_NAME= aList[pos].STAFF_NAME;
              element.START_DATE= aList[pos].START_DATE;
              element.STATUS= aList[pos].STATUS;
              element.TELEPHONE_NO= element.TELEPHONE_NO;
              element.VISITOR_COMPANY= element.VISITOR_COMPANY;
              element.VISITOR_COMPANY_ID= aList[pos].VISITOR_COMPANY_ID;
              element.VISITOR_GENDER= aList[pos].VISITOR_GENDER;
              element.VISITOR_IMG= aList[pos].VISITOR_IMG;
              element.VisitorCategory= element.VisitorCategory;
              element.VisitorDesignation= element.VisitorDesignation;
              element.VisitorDesignation1= element.VisitorDesignation1;
              element.appointment_group_id= aList[pos].appointment_group_id;
              element.bookedby_id= aList[pos].bookedby_id;
              element.cid= aList[pos].cid;
              element.approaver = list[0];
            }
            const navigationExtras: NavigationExtras = {
              state: {
                passData: {
                  appointment: aList1,
                  enableApproval: this.enableApproval,
                  showOption : (this.selectedTap == 'pending')
                }
              }
            };
            this.router.navigate(['admin-appointment-details'], navigationExtras);
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
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                message: message,
                cssClass: '',
                buttons: ['Okay']
              });
                alert.present();
            }
          }
        );

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
          let alert = await this.alertCtrl.create({
            header: 'Error !',
            message: message,
            cssClass: '',
            buttons: ['Okay']
          });
            alert.present();
        }
			}
		);
	}
  }

  async changeAppointmentGlobalSettings(){

    const btns = [{
      text: 'Cancel',
      role: 'cancel',
      cssClass: 'secondary',
      handler: (blah) => {
        console.log('Confirm Cancel: blah');
      }
    },
    {
      text: 'Proceed',
      handler: data => {
        console.log('Checkbox data:', data);
        var enableApproval = "0"
        var message = this.T_SVC['ALERT_TEXT.DISABLE_AUTO_APPROVE'];
        if(data.length > 0) {
          enableApproval = "1";
          message = this.T_SVC['ALERT_TEXT.ENABLE_AUTO_APPROVE'];
        }
        var params = {
          "AutoApproval": enableApproval
        }

        this.apiProvider.ChangeApppointmentApprovalSettings(params).then(
          async (val) => {
            let toast = await this.toastCtrl.create({
              message: message,
              duration: 3000
            });
            toast.present();
            if(enableApproval == "0"){
              this.enableApproval = false;
            }else{
              this.enableApproval = true;
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
              let alert = await this.alertCtrl.create({
                header: 'Error !',
                cssClass: '',
                message: message,
                buttons: ['Okay']
              });
                alert.present();
            }
          }
        );

      }
    }];
    // fab.close();
    let alert = await this.alertCtrl.create({ cssClass: '',
    header: 'Preappointment Approval',
    message: "(Note: If checked, preAppointment will be approved automatically)",
    inputs: [{
      name: 'autoApprove',
      type: 'checkbox',
      value: 'autoApprove',
      placeholder: 'Auto Approval',
      checked: this.enableApproval
      }],
    buttons: btns
    });

    alert.present();
  }


  logoutMe(){
    // fab.close();
    this.translate.get(['SETTINGS.ARE_U_SURE_LOGOUT_TITLE','SETTINGS.ARE_U_SURE_LOGOUT',
     'SETTINGS.EXIT_ACCOUNT_SCUSS','SETTINGS.EXIT_ACCOUNT_FAILED', 'SETTINGS.ARE_U_SURE_ADMIN_LOGOUT'
    ,'COMMON.OK','COMMON.CANCEL','COMMON.EXIT1']).subscribe(async t => {
      let loginConfirm = await this.alertCtrl.create({
        header: t['SETTINGS.ARE_U_SURE_LOGOUT_TITLE'],
        message: t['SETTINGS.ARE_U_SURE_ADMIN_LOGOUT'],
        cssClass: '',
        buttons: [
          {
            text: t['COMMON.EXIT1'],
            handler: () => {
              //this._app.getRootNav().setRoot(LoginPage);
              // this.toastCtrl.create(t['SETTINGS.EXIT_ACCOUNT_SCUSS']);
              window.localStorage.setItem(AppSettings.LOCAL_STORAGE.LOGIN_TYPE, "");
              this.menuCtrl.enable(true, 'myLeftMenu');
              this.navCtrl.navigateRoot("home-view");

            }
          }, {
            text: t['COMMON.CANCEL'],
            role: 'cancel',
            handler: () => {
            }
          }
        ]
      });
      loginConfirm.present();
    });
  }

  ngOnInit() {
  }

}
